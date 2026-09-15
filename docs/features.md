# 功能

EngStudio 是**专业工程的可视化流水线工具**：把 AI、MATLAB/Simulink、STM32、ANSYS、ROS2/PX4 等领域的工程搭建过程，从「每个项目重复写脚本、配环境、对接口」变成「拖节点、连线、一键生成可运行工程，并全程可追溯」。

## 可视化工作流编辑

- 拖拽模板节点连线组流程，节点类型覆盖 AI / MATLAB / STM32 / ANSYS / Data / Control / Tool / MCP / Python
- 撤销/重做、自动布局、网格吸附、缩放导航
- 编译层把工作流图翻译为 EWIR → ExecutionPlan，做拓扑排序、依赖分析、生命周期调度

## 700+ 工程模板库

- MATLAB 201、ROS2 167、ANSYS 150、PX4 80、Python 50、Simulink 30 等
- 每个模板自带 `version`、`dependencies`、真实 `inputs`/`outputs`、README 与状态徽记
- 参数表驱动动态表单，模板参数化实例化

## AI 双模式对话

- **意图模式**：自由问答、编程辅助
- **工程模式**：RAG 语义检索从模板库召回真实模板，AI 必须引用检索到的模板 id 才能通过校验，杜绝编造模块
- 支持一键「解析为工程」，AI 生成的工作流直接落盘为可视化流程图

## 运行与调度

- 多任务运行/停止，节点状态实时回传
- 超时保护（默认 30 分钟可配）、进程树 kill、输出卷裁剪、CPU/内存监控
- Python / MATLAB / ROS 3 大运行时真实化，无注入面

## 诊断与自修复

- 诊断规则引擎定位错误到具体节点，并给出修复建议
- Python / MATLAB / STM32 / ANSYS / 环境 5 类修复器

## 本地优先、自托管

- Qt 6 原生桌面客户端（Windows / Linux）
- 自托管 Node 服务端（Express + SQLite），数据落本机，开箱即用
- JWT 认证、限流、审计日志、备份恢复、健康检查

## 插件体系

- 6 类插件接口 + 插件市场雏形，为生态引入预留通道