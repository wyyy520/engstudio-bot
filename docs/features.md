# 功能详解

EngStudio 是**专业工程的可视化流水线工具**：把 AI、MATLAB/Simulink、STM32、ANSYS、ROS2/PX4 等领域的工程搭建过程，从「每个项目重复写脚本、配环境、对接口」变成「拖节点、连线、一键生成可运行工程，并全程可追溯」。

> **项目规模**：736 个工程模板 / 87 种节点类型 / 7 类 LLM Provider / 5 类诊断修复器 / 171 个自动化测试用例。  
> **技术栈**：Qt 6 Widgets (C++17) + Node.js (Express + SQLite) + TypeScript 引擎，MIT 协议开源。

## 可视化工作流编辑器

- **Qt 原生画布**：`QGraphicsView` 自定义编辑器，支持拖拽建节点、连线即时校验、缩放导航（Ctrl+滚轮）、右键菜单
- **拓扑排序与调度**：编译层 Workflow → EWIR → ExecutionPlan，支持 CPM/HEFT 关键路径与 GA/PSO/ACO 优化调度
- **一键执行**：点运行后自动按编译产物顺序逐节点执行，进度实时回传到画布节点状态
- **历史面板**：执行结果与历史版本可搜索、可对比

模板库选择 → 连线组流程 → WorkflowCompiler → EWIR 中间表示 → ExecutionPlan 调度 → Runtime 逐节点执行 → 结果回传画布

---

## 700+ 工程模板库

EngStudio 内置 736 个工程模板，覆盖 AI / MATLAB / STM32 / ANSYS / ROS2 / Python 等领域。

### 领域分布

| 领域 | 数量 | 说明 |
|---|---|---|
| MATLAB/Simulink | 201 | 信号处理、控制系统、仿真建模 |
| ROS2/PX4 | 167 | 机器人、无人机、导航控制 |
| ANSYS | 150 | 结构分析、流体、热力学 |
| PX4 专用 | 80 | 飞控、航线规划、参数调优 |
| Python/AI | 50 | 目标检测、图像分类、NLP |
| 其他 | 88 | STM32、Simulink、逻辑控制等 |

### 模板质量保证

每个模板都经过 `scripts/template-scan.mjs` 自动扫描验证：

```
✅ 已验证可运行  52 个（Python/AI 主链路）
⚠️ 可加载可渲染 525 个（需真实环境验收）
🧱 骨架/待完善   159 个（结构完整，运行条件未验证）
```

每个模板 README 顶部标注质量徽记，不虚假承诺。

### 模板结构示例

```yaml
# template.yaml
id: python.target_detection
domain: template
version: "1.0"
inputs:
  - name: model_path
    type: file
    description: 预训练模型路径
  - name: image_dir
    type: directory
    description: 待检测图片目录
outputs:
  - name: result_json
    type: file
    description: 检测结果 JSON
dependencies:
  - ultralytics>=8.0.0
  - opencv-python>=4.8.0
```

---

## AI 工程模式

EngStudio 提供两种 AI 对话模式：

### 意图模式（自由问答）

无约束，AI 原样回复上游。适合编程辅助、问题咨询、头脑风暴。

### 工程模式（防幻觉生成）

1. **RAG 语义检索**：`transformers.js` 本地向量化，`bge-small-zh` 模型，混合检索（向量 + 关键词）从模板库召回相关模板
2. **白名单校验**：输出必须是合法工作流 JSON，节点类型命中 87 项内置白名单（绝不生成不存在的模块）
3. **模板引用**：AI 必须引用检索到的真实模板 id，422 拒绝无来源的工程生成

```json
{
  "nodes": [
    {
      "type": "template",
      "templateId": "python.target_detection",
      "parameters": { "model_path": "./best.pt" }
    }
  ],
  "edges": [{ "from": "n1", "to": "n2" }]
}
```

点击 AI 回复中的「解析为工程」按钮，即可将 JSON 落盘为可视化流程图。

---

## 一键运行与调度

| 能力 | 说明 |
|---|---|
| 多任务并发 | 多个工作流可同时运行，互不干扰 |
| 超时保护 | 默认 30 分钟可配置，超时后自动终止进程树 |
| 输出裁剪 | 默认 10000 行上限，超出自动截断 |
| 进程树 kill | `ProcessManager` 统一管控，kill 立即终止所有子进程 |
| CPU/内存监控 | 运行期间实时监控，预警阈值可配 |
| 状态机跟踪 | 每个节点独立状态（等待/运行中/完成/失败），画布实时回传 |

### 运行时安全

- **Python**：走 `ProcessManager.execute()`，有超时、输出上限、进程树管控
- **MATLAB**：`BATCH_CMD` 恒定通过环境变量传参，**无 shell 拼接，无注入面**
- **ROS2**：启动前校验 `launch.py` 存在，缺失环境返回可读诊断，无 `shell: true`

---

## 诊断与自修复

```
节点报错
  ↓ 规则引擎
定位到具体节点 + 错误类型
  ↓ 5 类修复器
Python / MATLAB / STM32 / ANSYS / 环境
  ↓ 自动生成修复方案
用户一键采纳
```

- 规则引擎映射到 **nodeId + edgeId**，报告精确到节点级别
- 修复方案从依赖安装到代码修改，附带真实日志佐证
- 5 类修复器均基于实际模板产物测试验证

---

## 本地优先、自托管

EngStudio 的服务端是**单进程 Node 服务**（Express + SQLite），可以：

- 一键 `npm install && node dist/index.js` 启动
- 无需注册账号（本地 JWT 认证）
- 数据落本机，没有云端依赖
- 开箱即用，数据不出域

### 安全与运维能力

| 能力 | 说明 |
|---|---|
| JWT 认证 | bcrypt + 限流（20 次/15 分钟）+ 账号锁定（5 次→15 分钟） |
| 审计日志 | append-only `audit_logs` 表，审计失败不影响业务 |
| 备份恢复 | SHA-256 校验 + 原子替换 + 恢练记录 |
| 健康检查 | `/api/health`（纯存活探针）+ `/api/ready`（含依赖检测） |

---

## 节点库（87 种）

节点是工作流的基本构建块，分 8 大类：

| 类别 | 数量 | 代表节点 |
|---|---|---|
| AI | 14 | ImageClassification、ObjectDetection、SemanticSegmentation |
| MATLAB | 7 | MATLABFunction、SimulinkModel、SignalProcess |
| STM32 | 10 | CodeGenerate、FlashUpload、GPIOConfig、Timer |
| ANSYS | 8 | StaticStructural、SteadyStateThermal、ModalAnalysis |
| Data | 13 | CSVRead、DataClean、Normalize、Split |
| Control | 9 | Condition、Loop、Switch、Delay、Threshold |
| Tool | 8 | Terminal、HTTPRequest、FileCopy、Archive |
| Python | 5 | PythonScript、VirtualEnv、PackageInstall |

---

## 插件体系

插件通过 6 类接口扩展平台能力：

```
┌─────────────────────────────┐
│         PluginManager       │
├─────────────────────────────┤
│  AIProvider  │  Runtime     │
│  Generator   │  Template    │
│  Plugin      │  Skill       │
└─────────────────────────────┘
        ↑ 动态加载（npm install）
```

插件市场支持本地安装与远程发现，未来计划加入签名与权限模型。

---

## 为什么选择 EngStudio

| 痛点 | 传统做法 | EngStudio 的做法 | 可感知收益 |
|---|---|---|---|
| 配置重复 | 每个新项目重搭目录、环境、脚本、依赖 | 736 个参数化模板 + 一键实例化 | 项目启动从天级降到小时级 |
| 链路割裂 | 设计、代码、运行记录分散多个工具 | 同一张工作流贯穿设计→编译→生成→运行 | 全程可追溯，交付物可审计 |
| 排错昂贵 | 报错只有一行 traceback，靠人翻代码 | 规则引擎定位到节点 + 5 类修复器自动修复 | 故障定位从「找人问」变「看诊断」 |
| 知识流失 | 方案在个人脑中，交接就断 | 模板即行业知识封装，组织可复用、可传递 | 经验资产化，减少重复踩坑 |
| 依赖商业软件 | MATLAB/ANSYS License 卡住交付 | AI/Python 主链路零授权依赖；商业软件走「能力矩阵 + 客户环境验收」 | V1 可独立交付，不被 License 卡死 |

**一句话总结**：EngStudio 把工程经验**资产化**——从个人脑中的隐性知识，变成组织可复用、可传递的模板与工作流。这是竞品最难短期复制的壁垒。