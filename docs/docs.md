# 文档中心

EngStudio 的完整设计与接口文档。按类别浏览，或使用右上角搜索框快速定位。

---

## 产品介绍

- [功能详解](/features)：可视化工作流编辑器、700+模板库、AI 工程模式、一键运行、诊断与自修复
- [下载安装](/download)：Linux deb 安装包 + SHA256 校验
- [快速上手](/deployment/install)：从安装到首次运行，5 分钟开始使用

## 技术架构

帮助你理解系统是如何工作的：

- [系统设计概览](/architecture/system-design)：一句话说清架构约束与设计目标
- [引擎架构](/architecture/engine)：Workflow → EWIR → ExecutionPlan 的完整编译链路
- [服务端架构](/architecture/backend)：Express + SQLite，认证、审计、备份、健康检查
- [数据流](/architecture/data-flow)：数据如何在节点、模板、运行时之间流转
- [运行时](/architecture/runtime)：Python / MATLAB / ROS 三大运行时安全化实现
- [前端架构](/architecture/frontend)：Qt 原生画布与 C++ 实现细节
- [模板生成器](/architecture/template-generator)：从模板到可运行工程的完整路径
- [项目管理](/architecture/project-manager)：工程存储、备份、版本管理
- [Runtime 能力矩阵](/runtime-capability-matrix)：各域平台、版本、输入输出与验证状态

## 部署与运维

面向系统管理员和运维人员：

- [安装与部署手册](/deployment/install)：产物校验、Linux/Windows 安装、服务端启动、备份恢复
- [依赖清单](/deployment/dependencies)：所需软件包与版本

## 开发者接口

面向插件开发者和二次开发：

- [REST API 文档](/api/README)：所有端点、认证方式、请求响应格式
- [插件 SDK](/plugin-sdk/README)：6 类插件接口，AI Provider / Runtime / Generator / Template / Plugin / Skill
- [插件系统](/plugin-sdk/plugin-system)：动态加载、沙箱、市场
- [工作流 SDK](/workflow-sdk/README)：自定义节点、参数、校验器

## 节点库

87 种节点类型完整说明，包括输入输出参数、依赖与使用示例：

- [节点总览](/nodes/README)
- [目标检测 (YOLO)](/nodes/yolo) / [LSTM](/nodes/lstm) / [数据集](/nodes/dataset) / [目标检测](/nodes/object-detection)
- [图像分类](/nodes/image-classification) / [语义分割](/nodes/semantic-segmentation) / [模型评估](/nodes/model-evaluation)
- [数据预处理](/nodes/data-preprocessing) / [逻辑控制](/nodes/logic-control) / [Python 脚本](/nodes/python-script)
- [MATLAB](/nodes/matlab) / [STM32](/nodes/stm32) / [ANSYS](/nodes/ansys)

## UI 与设计

- [设计系统](/UI/design-system)：暗色/亮色主题、色彩规范、组件样式

---

> 所有文档随源码仓库发布（[wyyy520/ES](https://github.com/wyyy520/ES)），内容与代码版本同步。