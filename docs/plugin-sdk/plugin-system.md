# Plugin、Skill、Provider 与平台扩展架构设计

## 1. 设计背景

EngStudio 的目标不仅仅是完成一个 AI 工作流开发平台，更希望构建一个开放式、可扩展的工程开发生态。

传统开发软件通常采用固定功能设计，当开发者需要支持新的框架、新的软件或者新的模型时，往往需要直接修改软件源码，维护成本高、扩展能力差。

因此，EngStudio 从设计之初便采用 **插件化（Plugin-Based Architecture）** 的思想，将节点、模板、Generator、AI 能力以及模型接入全部进行解耦，使平台能够随着插件不断扩展，而无需修改系统核心代码。

平台核心只负责提供基础运行框架，各种专业能力均以插件形式动态加载。

## 2. 平台扩展理念

所有功能均遵循 **"核心稳定，能力扩展"** 的设计原则。

### 平台核心仅负责

- 项目管理
- Workflow 编辑
- Compiler
- Template Engine
- Generator
- Runtime
- Log Center
- Diagnose Center

### 通过插件扩展的能力

- 新增一个 YOLO12 节点
- 新增一个 ROS2 Generator
- 新增一个 STM32 模板
- 新增一个 Gemini Provider
- 新增一个 Debug Skill

均无需修改平台源码。平台只负责加载插件，插件负责实现能力。

## 3. Plugin System

Plugin System 是平台的插件管理中心，负责整个插件生命周期管理：

| 功能 | 说明 |
|------|------|
| 插件发现 | 扫描可用插件 |
| 插件安装 | 安装新插件 |
| 插件卸载 | 移除已安装插件 |
| 插件升级 | 更新插件版本 |
| 插件启用/禁用 | 控制插件状态 |
| 版本管理 | 管理插件版本 |
| 依赖检查 | 检查插件依赖 |
| 热加载 | 运行时加载插件 |
| 冲突检测 | 检测插件冲突 |

所有插件均由 Plugin Manager 统一管理，禁止模块自行加载插件。

## 4. Plugin 分类

| 类型 | 说明 | 示例 |
|------|------|------|
| **Node Plugin** | 扩展新的 Workflow 节点 | YOLO、LSTM、SAM、MATLAB、STM32、ANSYS |
| **Template Plugin** | 提供工程模板 | Python Template、MATLAB Template、STM32CubeMX Template |
| **Generator Plugin** | 新增工程生成器 | Python Generator、ROS Generator、Unity Generator |
| **Runtime Plugin** | 支持新的运行环境 | MATLAB Runtime、Docker Runtime、ROS Runtime |
| **Skill Plugin** | 扩展 AI 能力 | Workflow Planner、Debug Skill、Explain Skill |
| **Provider Plugin** | 接入大语言模型 | OpenAI、Claude、Gemini、DeepSeek、Qwen |

## 5. Node Plugin

每一个 Node Plugin 至少应提供：

- 节点名称、类型、图标、分类
- 输入端口、输出端口
- 参数定义、参数校验规则
- 默认模板、默认 Generator
- 帮助文档

Node Plugin 不负责生成代码，仅负责描述节点能力。

## 6. Template Plugin

每一个 Template Plugin 至少包含：

- 模板目录
- 模板版本
- 模板变量
- README
- 依赖配置

Generator 调用 Template Plugin 自动完成工程生成。未来任何新框架均建议首先开发 Template Plugin。

## 7. Generator Plugin

Generator Plugin 负责：

- 读取 Execution Plan
- 调用 Template
- 填充变量
- 生成工程

Generator Plugin 不读取 Workflow，不操作前端，仅处理 Execution Plan。所有 Generator 必须实现统一 Generator Interface。

## 8. Skill Plugin

Skill Plugin 是平台的智能增强模块。Skill 并不是系统运行的必要组成部分，关闭 Skill 后 Workflow、Compiler、Generator、Runtime 均应正常运行。

Skill 主要承担：

- Workflow 自动生成
- 自然语言规划
- 错误解释、日志分析
- 参数推荐、工程优化
- 代码说明、开发建议

所有 Skill 必须基于统一 Skill Interface。

### Debug Skill

Debug Skill 是平台最重要的 Skill，职责包括：

- 读取 Runtime 日志
- 解析 Compiler 错误、Python Traceback、MATLAB Error、环境错误
- 生成错误解释、提供修复建议

用户可选择查看建议、自动交给 AI 修改，或者自行修改。Debug Skill 不直接修改工程，而是提供辅助能力。

## 9. Provider Plugin

Provider Plugin 用于统一接入各种大语言模型。平台不绑定任何模型厂商，采用 Provider 抽象层。

任何支持 OpenAI API 格式的模型均可接入，支持：

- API Key、Base URL、Model Name
- Timeout、Proxy
- Temperature、Max Token

用户可自由切换模型，无需修改系统代码。

### API Key 管理

提供统一 Provider 配置中心，用户可以配置 OpenAI、Claude、Gemini、DeepSeek、Qwen、Moonshot 以及其他兼容 OpenAI API 的模型。

API Key 应统一加密保存，禁止硬编码。支持新增、编辑、删除、测试连接、设置默认 Provider。

## 10. MCP 扩展能力

EngStudio 支持 MCP（Model Context Protocol）扩展。MCP 并不参与工程生成，而是作为平台与外部软件通信的桥梁：

- 调用 MATLAB / ANSYS
- 调用数据库 / 浏览器
- 调用企业内部系统

Workflow 可通过 MCP 节点与外部软件建立连接，实现跨软件自动化。

## 11. Plugin 生命周期

所有插件均应遵循统一生命周期：

1. 发现插件
2. 加载插件
3. 初始化
4. 注册能力
5. 运行
6. 暂停 / 恢复
7. 卸载
8. 释放资源

Plugin Manager 负责统一管理生命周期，避免资源泄漏。

## 12. 插件市场（Plugin Marketplace）

未来规划建立插件市场。开发者可发布 Node Plugin、Template Plugin、Generator Plugin、Runtime Plugin、Skill Plugin、Provider Plugin。用户可直接下载、安装、升级插件。

平台通过插件不断扩展能力，而无需频繁更新主程序。

## 13. SDK

EngStudio 提供 Plugin SDK。开发者无需修改平台源码，即可开发属于自己的插件。

SDK 应提供：

- Plugin Interface
- Generator Interface
- Template Interface
- Runtime Interface
- Skill Interface
- Provider Interface
- Schema 定义

开发者按照 SDK 即可完成插件开发。

## 14. AI Optional

EngStudio 坚持 AI Optional 设计理念。AI 永远不是平台运行的必要条件。

**关闭 AI 后**：Workflow、Compiler、Template、Generator、Runtime、Log Center、Diagnose 全部仍可正常运行。

**开启 AI 后**：仅增加智能规划、日志解释、自动推荐、工作流生成、智能优化。

AI 是平台能力增强层，不是平台核心。

## 15. 平台最终目标

Plugin、Skill、Provider 共同组成平台的开放生态。

- Workflow 描述工程
- Compiler 编译工程
- Generator 生成工程
- Runtime 运行工程
- Plugin 扩展工程
- Skill 增强工程
- Provider 提供 AI 能力

整个系统形成 **"核心稳定、插件扩展、AI 增强"** 的整体架构，使 EngStudio 能够不断支持新的工程软件、新的开发框架以及新的 AI 模型，而无需重构平台核心。