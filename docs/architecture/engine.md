# Compiler 与 Execution Plan 系统设计

> 文档版本：2.0（2026-09-14 重写）
> 依据提交：`90d3afd`
> 代码位置：`packages/engine/src/compiler/`

---

## 1. 为什么需要 Compiler

用户在画布上画的不是代码，而是 Workflow。Workflow 只表达"谁连谁、参数是什么"，平台需要把它翻译成"按什么顺序、在哪个领域、用什么生成器、产出到哪个目录"的**可执行计划**。这就是 Compiler 的职责：

> **Compiler 不生成代码，它理解工作流。** 它分析、验证、优化工作流，并产出标准化的 `ExecutionPlan`；代码由 Generator 依据计划生成。

---

## 2. 编译流水线（8 个阶段）

代码入口：`packages/engine/src/compiler/Compiler.ts`

```text
Workflow JSON
  │
  ├─ ① WorkflowParser        读取并结构化校验工作流 JSON
  ├─ ② EWIRBuilder           拆分为「UI 状态」与「执行逻辑」两部分中间表示
  ├─ ③ GraphOptimizer        结构优化：去死节点、合并重复节点
  ├─ ④ NodeValidator         Schema 驱动校验节点（87 种节点 + 32 个手工 Schema）
  ├─ ⑤ ParameterValidator    必填项、类型、数值范围
  ├─ ⑥ DependencyAnalyzer    依赖关系分析
  ├─ ⑦ TopologicalSorter     拓扑排序，产出执行顺序（含环路检测）
  ├─ ⑧ ExecutionPlanBuilder  生成最终 ExecutionPlan
  └─    DomainDispatcher     按领域分派到对应 Generator / Adapter
```

| 阶段 | 文件 | 关键输出 / 失败语义 |
|---|---|---|
| ① | `WorkflowParser.ts` | 结构合法性；JSON 缺字段即失败 |
| ② | `EWIRBuilder.ts` | `EWIRDocument`：UI 状态 + 执行逻辑分离 |
| ③ | `GraphOptimizer.ts` | 优化后的节点集；删除孤立/死节点 |
| ④ | `NodeValidator.ts` | 节点级 `errors` / `warnings`（带 `nodeId`） |
| ⑤ | `ParameterValidator.ts` | 参数级错误；未覆盖的节点从 `properties` 自动生成规则 |
| ⑥ | `DependencyAnalyzer.ts` | 依赖图；跨领域连线记为 warning |
| ⑦ | `TopologicalSorter.ts` | `executionOrder`；存在环路时编译失败 |
| ⑧ | `ExecutionPlanBuilder.ts` | `ExecutionPlan`（结构见 §4） |
| 分派 | `DomainDispatcher.ts` | 领域 → Generator / Adapter 的映射 |

`Compiler` 通过构造函数注入上述子模块，便于单测中替换 mock；日志通过 `LogCallback` 回调外抛，供客户端显示编译进度。

---

## 3. 优化器

| 优化器 | 文件 | 说明 |
|---|---|---|
| 结构优化 | `GraphOptimizer.ts` | 常规规则：去死节点、合并重复节点等 |
| 高级优化 | `optimizer/AdvancedOptimizer.ts` | GA / PSO / ACO 等启发式搜索 |
| 模拟退火 | `optimizer/SimulatedAnnealingOptimizer.ts` | 组合优化场景 |
| AI 优化建议 | `AiOptimizer.ts` | 接入 LLM 给出优化建议（`AiSuggestion`），不静默改写工作流 |
| 调度 | `scheduler/WorkflowScheduler.ts` | 任务排期；CPM 关键路径、HEFT 异构调度 |

> 优化只在不改变语义的前提下进行；AI 建议必须经用户确认后才应用（见 `Docs/planning/next-steps.md` §6 边界）。

---

## 4. ExecutionPlan 结构

定义：`packages/shared/src/types/execution-plan.ts`

```ts
export interface ExecutionPlan {
  id: string;                          // Plan ID
  projectId: string;                   // Project ID
  createdAt: string;                   // 生成时间
  workflowVersion: string;             // 对应的工作流版本
  nodes: ExecutionNode[];              // 所有执行节点
  executionOrder: string[];            // 执行顺序（节点 ID 列表）
  totalNodes: number;                  // 节点总数
  domains: string[];                   // 涉及的领域
  pluginInfo: Record<string, string>;  // 依赖的插件
  templatePaths: Record<string, string>;// 命中的模板路径
  outputDir: string;                   // 输出目录
}
```

校验结果 `PlanValidation` 区分 `errors`（阻断）与 `warnings`（可继续），每条 `PlanError` 携带节点定位信息，供诊断中心与客户端高亮使用。

生成的工程目录中同时落盘 `execution_plan.json`，使"生成物"与"计划"同源可追溯。

---

## 5. 领域适配器与分派

`compiler/adapters/` 下按领域实现适配器，统一实现 `IDomainAdapter`：

| 适配器 | 领域 |
|---|---|
| `AIAdapter.ts` | AI / Python |
| `MATLABAdapter.ts` | MATLAB / Simulink |
| `STM32Adapter.ts` | STM32 嵌入式 |
| `ANSYSAdapter.ts` | ANSYS 仿真 |
| `TemplateAdapter.ts` | 模板实例化（通用路径，ROS2/PX4 走此路径） |

> 坑位记录：`DomainDispatcher` 只认规范大写域名（`MATLAB` / `ROS2` / `STM32` …），而桌面端与模板产出的是小写（`matlab` / `ros2`）。不做归一化会直接抛 `Domain xxx is not supported`，因此分派前统一归一化（见 `routes/engine.ts` 与 Dispatcher 中的归一化处理）。

---

## 6. 错误模型

- `CompilerError.ts` 定义编译期异常类型，携带失败阶段。
- 校验结果统一为 `errors` / `warnings` 两级：
  - **error**：环路、孤立节点、必填参数缺失、类型不匹配、重复输出连接等，阻断编译。
  - **warning**：跨领域连线、必填输入端口未连接等，允许继续但需用户确认。
- 所有问题都带 `nodeId`（可选 `edgeId`），客户端据此在画布上高亮定位。

---

## 7. 测试与验收

| 层次 | 位置 | 覆盖 |
|---|---|---|
| 单测 | `compiler/__tests__/` | Parser、Graph、NodeValidator、ParameterValidator、DependencyAnalyzer、TopologicalSorter、ExecutionPlanBuilder、DomainDispatcher |
| 端到端（编译层） | `compiler/__tests__/EndToEnd.test.ts` | Workflow → Compiler → Generator → Templates，7 个用例（含环路失败、菱形 DAG、MCP 节点） |
| 集成 | `../__tests__/Integration.test.ts` | Compiler → Generator、Runtime 环境探测、节点库解析、Provider |
| 案例 | `../__tests__/CaseStudies.test.ts` | 5 个跨领域案例的结构与排期断言 |

**当前缺口**：从 `generate` 之后到"真实运行并断言退出码"这一段没有自动化覆盖，见 `Docs/planning/next-steps.md` S1-1。

---

## 8. 扩展方式

1. 新增节点：在 `node-library/nodes/index.ts` 注册节点定义（`type` 需与 shared / server / qtclient 三方一致，数量会同步变为 88）。
2. 新增领域：实现 `IGenerator`（`generator/`）+ `IDomainAdapter`（`compiler/adapters/`）+ Runtime（`runtime/`），并在 `DomainDispatcher` 注册。
3. 新增优化策略：在 `compiler/optimizer/` 增加实现，由 `GraphOptimizer` 按需调用，默认关闭以免影响可预测性。
