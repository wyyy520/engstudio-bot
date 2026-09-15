# Runtime、日志中心（Log Center）与 Diagnose Center 系统设计

## 1. 设计背景

EngStudio 的目标不仅仅是帮助用户生成工程，更重要的是让用户能够在平台内完成整个工程开发闭环。

传统低代码平台通常只能生成代码，随后需要用户自行打开 IDE、运行程序、查看终端、定位错误、修改代码，整个开发流程被割裂。

EngStudio 希望实现 **"工程生成 → 工程运行 → 日志采集 → 错误诊断 → 重新运行"** 的一体化开发体验，因此设计了 Runtime、Log Center 以及 Diagnose Center 三个核心模块。

- **Runtime** 负责运行工程
- **Log Center** 负责采集和管理所有运行日志
- **Diagnose Center** 负责分析日志、定位问题，并在启用 AI 时调用大语言模型进行智能诊断

这三个模块共同组成平台的运行中心（Execution Center）。

## 2. Runtime 架构定位

Runtime 位于 Generator 之后：

```
Workflow
  ↓
Compiler
  ↓
Execution Plan
  ↓
Generator
  ↓
Real Project
  ↓
Runtime
  ↓
Log Center
  ↓
Diagnose Center
  ↓
Skill（Optional）
```

Runtime 是唯一允许启动本地程序的模块。任何 Generator 不允许直接运行 Python，任何 Workflow 不允许直接运行 MATLAB。所有运行行为必须统一交给 Runtime。

## 3. Runtime 职责

| 职责 | 说明 |
|------|------|
| 环境检测 | 自动检测运行环境 |
| 启动程序 | 启动对应程序 |
| 进程管理 | 管理运行进程 |
| 输出采集 | 实时采集终端输出（stdout、stderr） |
| 状态监控 | 监控运行状态 |
| 运行控制 | 支持停止、重新运行、多任务运行 |
| 通知 | 支持运行完成通知、运行失败通知 |

Runtime 不负责解析错误，不负责 AI 推理，只负责"运行"。

## 4. 多运行环境支持

每一种 Runtime 均实现统一接口：

- Python Runtime
- MATLAB Runtime
- STM32 Runtime
- ANSYS Runtime
- ROS Runtime

未来可扩展：SolidWorks、OpenFOAM、Unity、Unreal。

以后增加新的运行环境，无需修改 Runtime 核心代码。

## 5. 环境检测（Environment Detection）

运行工程之前，Runtime 必须首先检测本地环境：

- Python 是否安装、版本是否符合、是否存在虚拟环境
- MATLAB 是否安装
- CubeMX 是否安装
- ANSYS 是否安装
- 必要依赖是否完整

如果环境缺失，Runtime 不允许直接报错退出，而是生成环境检测报告，发送 Diagnose Center，由 Diagnose Center 提示用户安装或修复。

## 6. Process Manager（进程管理）

Runtime 内部建立统一进程管理器，负责：

- 启动、暂停、恢复、终止进程
- 查询状态、获取 PID
- 监控 CPU、内存、运行时间

每个运行任务均拥有独立 Process，支持多个工程同时运行。

## 7. Terminal（终端）

EngStudio 内置统一终端，所有程序运行输出均进入 Terminal：

- Python 输出
- MATLAB 输出
- 系统输出
- Generator 输出
- Compiler 输出

Terminal 支持：彩色高亮、自动滚动、复制、搜索、保存日志、清空日志、过滤输出。

## 8. Log Center

Log Center 是整个系统唯一日志中心。所有模块均统一输出日志：

- Compiler
- Generator
- Runtime
- Plugin
- Skill
- Provider
- Environment

统一日志格式便于分析与检索，禁止各模块自行打印日志。

### 日志分类

| 类型 | 说明 |
|------|------|
| System | 系统日志 |
| Runtime | 运行日志 |
| Compiler | 编译日志 |
| Generator | Generator 日志 |
| Plugin | 插件日志 |
| Environment | 环境日志 |
| AI | AI 日志 |
| Error | 错误日志 |
| Warning | 警告日志 |
| Debug | 调试日志 |
| Info | 信息日志 |

### 日志持久化

所有日志默认保存至项目目录：

```
logs/
├── compiler.log
├── runtime.log
├── generator.log
├── system.log
└── diagnose.log
```

支持自动归档、日志轮换、日志压缩。

### 日志可视化

Log Center 支持：

- 实时刷新
- 错误高亮
- 搜索、过滤
- 日志等级、时间排序、模块排序
- 点击日志自动定位对应节点
- 未来支持：日志时间轴、运行历史、性能分析

## 9. Diagnose Center

Diagnose Center 是整个平台的诊断中心。它不负责运行程序，只负责分析问题。

### 接收来源

- Compiler 错误
- Generator 错误
- Runtime 错误
- Environment 错误
- Plugin 错误

### 输出内容

- 错误原因
- 错误位置
- 修复建议
- 解决方案

### Diagnose 工作流程

```
Runtime 输出错误
  ↓
Log Center 收集
  ↓
Diagnose 接收日志
  ↓
识别错误类型
  ↓
生成诊断结果
  ↓
展示给用户
```

如果启用 AI → Skill 调用 LLM → 返回更详细解释。整个流程形成闭环。

## 10. Debug Skill

Debug Skill 是平台最重要的 Skill 之一，负责：

- 读取错误日志
- 分析报错、定位错误
- 生成修改建议

支持：Python Traceback、ModuleNotFound、ImportError、CUDA Error、MATLAB Error、CubeMX Error、ANSYS Error。

Debug Skill 不直接修改代码。用户可以查看建议、一键交给 AI 修改，或者自行修改。

## 11. AI Optional

Diagnose 必须支持两种模式：

**不开启 AI**：Diagnose 根据规则分析日志、提示错误。

**开启 AI**：Diagnose 将日志发送至 LLM，由 AI 解释错误、推荐修改、优化 Workflow。

AI 永远只是增强能力，Diagnose 必须可以独立工作。

## 12. Runtime 与 Workflow

Runtime 不读取前端，不解析 Workflow，只读取 Generator 生成后的真实工程。

Generator 与 Runtime 必须彻底解耦。Workflow 修改不会影响 Runtime。

## 13. Runtime 与 Plugin

插件允许扩展新的 Runtime（如 Unity Runtime、Docker Runtime、ROS Runtime）。插件只需实现统一 Runtime Interface 即可接入平台。Runtime 保持稳定。

## 14. 最终目标

Runtime、Log Center 与 Diagnose Center 共同组成平台的工程运行平台。

- Generator 负责生成工程
- Runtime 负责运行工程
- Log Center 负责记录工程
- Diagnose Center 负责分析工程
- Skill 负责智能增强

整个模块共同形成 **"生成 → 运行 → 记录 → 分析 → 优化"** 的完整工程闭环。