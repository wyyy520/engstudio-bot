# EngStudio 总体架构概览

> 文档版本：2.0（2026-09-14 重写）
> 依据提交：`90d3afd`。本文档按**当前代码**撰写；早期基于 React + Tauri 的架构描述已作废，桌面端现为 Qt 6 Widgets 原生客户端（`packages/frontend`、`packages/electron` 已移除）。

---

## 1. 系统定位

EngStudio 是**工作流驱动的多领域工程开发平台**：用户在可视化画布上拖拽节点、连线，得到一张 Workflow JSON；平台把它编译为统一中间表示 EWIR 与执行计划 ExecutionPlan，再由模板引擎生成真实可运行的工程目录，最后由 Runtime 调度执行并采集日志、诊断错误。

```text
拖拽搭建  →  校验 / 编译  →  生成工程  →  运行  →  日志 / 诊断
 (Qt UI)     (Compiler)     (Generator)   (Runtime)   (DiagnoseCenter)
```

覆盖领域：AI / Python、MATLAB / Simulink、STM32、ANSYS、ROS2 / PX4、数据处理、逻辑控制、通用工具、MCP 工具链、AI Skill。

---

## 2. 分层与代码组织

| 层 | 包 / 目录 | 技术 | 职责 |
|---|---|---|---|
| 桌面端 | `packages/qtclient` | Qt 6 Widgets、C++17、CMake | 工作流画布、参数编辑、项目管理、编译/运行/日志/诊断页面、模板库、AI 对话 |
| 服务端 | `packages/server` | Express 4、sql.js、JWT、Zod、Winston | REST API、认证、工程与 AI 对话持久化、引擎调用编排 |
| 引擎 | `packages/engine` | TypeScript 5.7（严格模式） | 编译、优化、生成、模板、Runtime、诊断、AI/RAG、插件 |
| 共享层 | `packages/shared` | TypeScript 类型与校验器 | 跨端数据模型（Workflow / EWIR / ExecutionPlan / 节点 Schema） |
| 模板资产 | `packages/engine/templates` | YAML / JSON + 代码文件 | 736 个可实例化工程模板 |
| 构建 | 仓库根 | pnpm workspace + CMake | 多包管理与桌面端构建 |

引擎内部 18 个子系统的职责见 `Docs/architecture/engine.md` 与 `README.md` §引擎子系统。

### 2.1 三端一致的口径

节点类型、模板、执行计划等模型以 `packages/shared` 为唯一事实来源，引擎、服务端、桌面端三方共用：

| 概念 | 数量 | 事实来源 |
|---|---|---|
| 节点类型（Node Type） | 87 | `packages/engine/src/node-library/nodes/index.ts`（`builtinNodes`） |
| 客户端节点面板 | 87 | `GET /api/nodes` + `packages/qtclient/src/core/Taxonomy.cpp`（分类元数据） |
| 服务端节点清单 | 87 | `packages/server/src/routes/nodes.ts` |
| 工程模板（Template） | 736 | `packages/engine/templates/` + `TemplateRegistry.scan()` |

数量口径的完整说明见 `Docs/planning/project-delivery-plan.md` §2.5。

---

## 3. 部署形态

| 形态 | 说明 | 状态 |
|---|---|---|
| 桌面单机 | Qt 客户端直连本机或局域网服务端；工程文件、模板、日志在本机 | V1 主推 |
| 局域网 / 云主机服务端 | Express REST 服务 + SQLite(sql.js) 持久化，按账号隔离工程与 AI 对话 | V1 支持**单实例** |
| Docker | `Dockerfile` + `docker-compose.yml`，数据卷 `engstudio-data` | 可用，备份纳入运维流程 |

> V1 明确**不承诺**多用户实时协同、企业级高可用与大规模分布式调度；服务端为单实例设计（sql.js 单写者模型）。

---

## 4. 核心数据流

```text
Qt 客户端
  │  ① Workflow JSON（画布状态）
  ▼
服务端 POST /api/engine/validate → /compile → /generate → /run
  │
  ├─ WorkflowParser      解析与结构校验
  ├─ EWIRBuilder         生成统一中间表示 EWIR
  ├─ GraphOptimizer      结构优化（去死节点、合并重复）
  ├─ NodeValidator       节点 Schema 校验
  ├─ ParameterValidator  必填项 / 类型 / 数值范围
  ├─ DependencyAnalyzer  依赖分析
  ├─ TopologicalSorter   拓扑排序（含环路检测）
  ├─ ExecutionPlanBuilder生成执行计划
  └─ DomainDispatcher    按领域分派 Generator
        │
        ├─ Generator + TemplateEngine → 工程目录 + execution_plan.json
        └─ Runtime / ProcessManager → 进程执行
              │
              ├─ LogCenter：日志持久化、轮转、终端过滤
              └─ DiagnoseCenter：规则引擎分析 → 节点级定位与修复建议
```

各阶段的详细说明见 `Docs/architecture/engine.md`。

---

## 5. 数据与持久化

| 数据 | 存放位置 | 隔离维度 |
|---|---|---|
| 工程（项目元数据 + 工作流 JSON） | 服务端 `engstudio.db`（sql.js） | 按 `user_id` |
| 生成的工程目录 | 客户端指定的工程根目录 | 按项目目录 |
| AI 对话历史 | 服务端 `ai_conversations` / `ai_messages` 表 | 按 `user_id`，级联删除 |
| 运行日志 | 工程目录 `logs/` + LogCenter 轮转 | 按项目 |
| 客户端偏好（主题、服务端地址、自动保存） | Qt `QSettings` | 本机 |

---

## 6. 关键约束与非目标

1. **不依赖商业软件也能验收**：V1 只承诺 Python / AI 主链路；MATLAB、ANSYS、STM32 烧录、真实 ROS 机器人在无许可证/硬件时不承诺结果。
2. **外部命令一律参数化**：所有进程调用走适配层，显式设置工作目录、环境变量、超时、输出上限、取消信号与退出码映射，禁止把用户输入拼进 shell 字符串。
3. **AI 输出必须人工确认**：AI 生成/改写的工作流不能直接控制设备或进入生产。
4. **文档中的性能数值不做验收指标**，必须以基准脚本实测为准。
