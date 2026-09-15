# Project Manager、文件系统与工程生命周期设计

## 1. 设计背景

EngStudio 并不是一个简单的网页应用，也不仅仅是一个 AI 聊天软件，而是一个真正面向工程开发的平台。因此，平台必须具备完整的项目（Project）管理能力，而不仅仅是保存一个 JSON 文件。

传统 IDE（如 Visual Studio、CLion、PyCharm、MATLAB、STM32CubeIDE）都以 Project（项目）作为管理单位，一个项目包含源代码、配置文件、资源文件、日志、输出结果等完整工程内容。

EngStudio 同样采用 Project 作为最小管理单元。Workflow、Template、Generator、Runtime、Log Center 等所有模块均围绕 Project 展开工作，而不是围绕单个 Workflow 文件。

Project Manager 的职责不仅是保存工程，更负责整个项目生命周期管理，包括创建、打开、保存、恢复、迁移、备份以及项目资源管理。

## 2. Project 架构定位

Project 是平台中最高层级的数据组织方式。

一个 Project 至少包含：

- Workflow
- 工程配置
- 模板缓存
- 生成工程
- 运行日志
- 插件配置
- 数据集
- 输出结果
- 缓存文件

整个系统遵循：

```
Project
  ▼
Workflow
  ▼
Compiler
  ▼
Generator
  ▼
Runtime
```

任何 Workflow 必须属于某一个 Project。任何 Generator 输出必须属于某一个 Project。任何日志也必须归属于 Project。

## 3. Project 生命周期

| 阶段 | 操作 |
|------|------|
| **Create** | 初始化目录、创建默认 workflow.json、创建 project.json、初始化缓存 |
| **Open** | 恢复工作流、恢复画布、恢复最近运行记录、恢复插件状态 |
| **Edit** | 实时修改 Workflow、更新配置、更新资源、生成工程、运行工程 |
| **Save** | 同步 workflow.json、同步 project.json、更新资源、写入日志 |
| **Close** | 释放资源、关闭 Runtime、保存状态、再次打开时恢复 |

整个过程由 Project Manager 自动完成。

## 4. Project 目录结构

所有项目采用统一目录规范：

```
Project/
├── workflow.json        // 工作流
├── project.json         // 项目信息
├── settings.json        // 项目配置
├── datasets/            // 数据集
├── generated/           // 自动生成工程
├── outputs/             // 输出结果
├── logs/                // 日志
├── cache/               // 缓存
├── templates/           // 模板缓存
├── plugins/             // 项目插件
├── assets/              // 图片资源
├── scripts/             // 用户脚本
├── documents/           // 文档
└── temp/                // 临时文件
```

所有模块均不得随意创建目录，统一由 Project Manager 管理。

## 5. workflow.json

workflow.json 是整个项目最重要的数据文件，描述：

- 节点
- 连线
- 参数
- 画布
- 变量
- Domain
- Workflow Metadata

Compiler 唯一读取 workflow.json。Generator 不读取前端。Runtime 不读取 Workflow。workflow.json 始终保持平台无关。

## 6. project.json

project.json 用于描述整个项目：

| 字段 | 说明 |
|------|------|
| 项目名称 | 项目显示名称 |
| 作者 | 项目作者 |
| 创建时间 | 项目创建时间 |
| 更新时间 | 最后更新时间 |
| 版本 | 项目版本 |
| Compiler 版本 | 使用的 Compiler 版本 |
| Generator 版本 | 使用的 Generator 版本 |
| Plugin 列表 | 已安装插件 |
| 默认 Runtime | 默认运行环境 |
| 默认 Provider | 默认 AI Provider |
| 最近打开时间 | 最后访问时间 |
| 支持 Domain | 项目涉及的 Domain |

Project Manager 根据 project.json 恢复整个项目。

## 7. 项目配置

支持项目级配置：

- 默认 Python / MATLAB
- 默认 Generator / Template
- 默认 Runtime / Provider
- 默认日志等级
- 自动保存时间
- 缓存目录 / 生成目录

项目配置与软件配置相互独立。

## 8. 打开真实目录

EngStudio 必须支持打开电脑真实文件夹。项目目录不是虚拟目录。

用户可以：

- 浏览本地目录
- 创建新目录
- 打开已有项目
- 拖入项目 / 数据集
- 直接访问真实文件系统

未来支持 Windows、Linux、macOS，统一实现。

## 9. 文件监听（File Watcher）

Project Manager 应建立文件监听系统，监听：

- workflow.json
- project.json
- datasets
- generated
- plugins

如果外部修改 Workflow，自动刷新，无需重新打开项目，保持项目同步。

## 10. 自动保存

EngStudio 支持自动保存：

- Workflow 修改
- 参数修改
- 节点移动
- 连线修改
- 项目配置修改

均自动保存。采用防抖机制，避免频繁写磁盘。保证软件异常退出时数据仍然完整。

## 11. 最近项目

Project Manager 自动维护最近项目：

- 最近打开
- 最近生成
- 最近运行
- 固定项目
- 收藏项目

支持一键重新打开，方便开发者快速恢复工作。

## 12. 多项目管理

后续支持同时打开多个 Project。不同 Project 拥有独立的 Workflow、Generator、Runtime、Log、Plugin，避免互相影响。Project Manager 统一调度。

## 13. 工程生成目录

Generator 输出统一管理：

```
generated/
├── AI/
├── MATLAB/
├── STM32/
└── ANSYS/
```

不同 Domain 互不影响。方便重新生成、重新运行、删除旧工程。

## 14. 数据集管理

Project Manager 提供数据集管理：

- 导入 / 删除 / 复制数据集
- 检查 / 验证数据集

未来支持：YOLO、COCO、VOC、ImageNet、CSV、Excel、数据库，统一管理。

## 15. 输出管理

所有生成结果统一进入 outputs：

- 训练结果 / 预测结果
- MATLAB 图片 / ANSYS 图片
- Excel / CSV / PDF
- 模型权重

统一管理，方便版本控制、历史查看、导出、分享。

## 16. 缓存管理

Project Manager 管理：

- Compiler Cache
- Generator Cache
- Template Cache
- Plugin Cache
- Log Cache

用户可清理缓存、重建缓存，避免长期使用导致缓存膨胀。

## 17. 备份与恢复

EngStudio 支持：

- 项目备份
- 自动备份
- 恢复备份
- 历史版本

未来支持 Git、云端同步、版本比较、Workflow Diff。保证误删除仍可恢复。

## 18. Project 与 AI

Project Manager 不依赖 AI。关闭 AI 后，Project 的创建、打开、保存、生成、运行全部正常。