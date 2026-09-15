# Template Engine 与 Generator 系统设计

## 1. 设计背景

在传统低代码平台或代码生成平台中，大多数系统通过字符串拼接（String Concatenation）方式生成代码：

```
code += "model.train("
code += f"epochs={epoch}"
code += ")"
```

这种方式虽然实现简单，但随着业务复杂度增加，会出现代码难以维护、模板重复、可扩展性差、不同语言之间无法复用等问题。

EngStudio 不采用字符串拼接方式生成代码，而采用 **Template（模板）驱动** 的工程生成方式。

平台预先维护各类标准工程模板，Compiler 仅负责组织数据，Generator 根据 Execution Plan 调用对应模板，并完成变量填充，最终生成真实可运行的工程。

## 2. 架构定位

Template Engine 位于 Compiler 与 Generator 之间：

```
Workflow
  ▼
workflow.json
  ▼
Compiler
  ▼
Execution Plan
  ▼
Template Engine
  ▼
Generator
  ▼
Real Project
```

Template Engine 不负责解析 Workflow，不负责运行工程，不负责 AI 推理。它唯一职责就是管理工程模板，并提供统一模板渲染能力。

## 3. Template 设计思想

Template 并不是一个代码片段，而是一套完整工程。

例如 YOLO 模板：

```
templates/
└── python/
    └── yolo/
        ├── train.py.tpl
        ├── predict.py.tpl
        ├── export.py.tpl
        ├── dataset.yaml.tpl
        ├── requirements.txt
        ├── README.md
        ├── .gitignore
        └── config.json
```

Generator 不需要理解 `train.py`，只需要复制整个目录、替换变量，即可得到完整工程。

## 4. Template 分类

所有模板按照 Domain 分类：

```
templates/
├── python/
│   ├── yolo/
│   ├── lstm/
│   ├── classification/
│   ├── segmentation/
│   ├── detection/
│   └── custom-script/
├── matlab/
├── stm32/
├── ansys/
├── ros/
├── opencv/
└── common/
```

## 5. Template 占位符

所有模板支持变量占位：

```
{{model}}
{{epoch}}
{{batch}}
{{dataset}}
{{output}}
{{device}}
{{learning_rate}}
```

Generator 根据 Execution Plan 自动完成替换。模板内部禁止硬编码业务参数。

## 6. Template Engine 工作流程

1. 读取 Execution Plan
2. 定位 Template
3. 复制 Template
4. 扫描所有模板文件
5. 识别变量
6. 替换变量
7. 生成真实工程
8. 返回 Generator

整个过程无需理解业务逻辑。

## 7. Generator 定位

Generator 是整个工程生成模块，可以理解为 **Template Dispatcher（模板调度器）**。

Generator 不负责解析 Workflow，不负责 Compiler，不负责 Runtime。唯一职责是根据 Execution Plan 调用对应 Template，生成真实工程。

### Generator 分类

按照 Domain 分类：

- Python Generator
- MATLAB Generator
- STM32 Generator
- ANSYS Generator
- ROS Generator

每一个 Generator 均实现统一接口。以后增加新的 Domain，无需修改已有 Generator。

### Generator 工作流程

1. 读取 Execution Plan
2. 识别当前节点 Domain
3. 定位对应 Template
4. 调用 Template Engine
5. 生成工程目录
6. 输出工程

整个过程不得直接拼接代码。

## 8. 工程输出目录

所有 Generator 输出工程统一放置：

```
generated/
└── project-name/
    ├── python/
    ├── matlab/
    ├── stm32/
    └── ansys/
```

一个 Workflow 可以同时生成多个专业工程：既生成 Python AI 工程，又生成 MATLAB 仿真工程，又生成 STM32 控制工程。

## 9. Template 与 Plugin

Template 支持插件扩展。第三方开发者可以新增 YOLO12、SAM、GroundingDINO、ROS2、OpenCV 等，只需增加 Template、Generator、Plugin，无需修改平台源码。

Template 本身也是插件。

## 10. Template Version

所有 Template 必须拥有版本管理：

- Version
- Author
- Create Time
- Support Domain
- Support Generator
- Compatible Compiler

不同版本 Generator 可以自动选择兼容模板。

## 11. Template 校验

Generator 在生成工程之前必须完成：

- 模板存在检查
- 模板版本检查
- 变量完整检查
- 模板文件完整检查
- 依赖完整检查

如果模板损坏，禁止继续生成工程，并返回 Diagnose Center。

## 12. Template 与 Runtime

Template 只负责生成工程，Generator 只负责创建工程，真正运行工程由 Runtime 完成。

Template 永远不调用 Python，永远不启动 MATLAB。Template 与 Runtime 必须彻底解耦。

## 13. Template 与 AI

AI 不参与 Template，不负责生成代码，不修改模板。AI 仅可推荐模板、解释模板、优化模板。

真正工程生成始终基于固定模板，保证结果可重复。

## 14. 最终目标

Template Engine 的最终目标是建立一个面向工程开发的标准模板生态。

未来所有专业软件均通过统一模板描述工程，而不是通过字符串拼接生成代码。Generator 永远保持简单，Compiler 永远保持稳定，Template 持续扩展。

开发者只需新增模板，即可让 EngStudio 支持新的开发平台。