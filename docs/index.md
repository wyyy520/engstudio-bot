---
layout: home
hero:
  name: EngStudio
  text: 让专业工程可复用、可追溯、可复现
  tagline: 面向 AI、MATLAB、STM32、ANSYS、ROS2 等领域的可视化工作流平台。把「每个项目重写脚本、配环境」变成「拖节点、连线、一键运行」。
  image:
    src: /screenshot.png
    alt: EngStudio 主界面
  actions:
    - theme: brand
      text: 立即下载 1.0.3
      link: /download
    - theme: alt
      text: 了解功能
      link: /features

features:
  - icon: 📦
    title: 700+ 工程模板
    details: MATLAB 201、ROS2 167、ANSYS 150、PX4 80、Python 50…每个模板自带版本、依赖、真实输入输出参数。参数化实例化，一键生成完整可运行工程。
  - icon: 🧩
    title: 可视化工作流编辑器
    details: Qt 原生画布，拖拽模板节点连线组流程；撤销/重做、自动布局、网格吸附、缩放导航。图形编译为可执行计划，拓扑排序调度执行。
  - icon: 🤖
    title: AI 工程模式
    details: RAG 语义检索召回真实模板，AI 必须引用已存在的模板 id 才能通过白名单校验，杜绝编造模块。一键「解析为工程」，AI 生成直接落盘为流程图。
  - icon: ⚙️
    title: 一键运行与调度
    details: 多任务执行、超时保护、进程树 kill、输出裁剪、CPU/内存监控。Python / MATLAB / ROS 运行时真实化，无注入面。
  - icon: 🩺
    title: 诊断与自修复
    details: 规则引擎定位错误到具体节点；5 类修复器（Python/MATLAB/STM32/ANSYS/环境）自动生成修复方案，从报错到定位秒级闭环。
  - icon: 🗂️
    title: 模板质量保障
    details: 自动扫描脚本验证模板完整性；依赖、I/O、README 全部实测补齐；质量徽记（✅已验证 / ⚠️骨架）直接标注在每个模板上，不画饼。
  - icon: 🔒
    title: 本地优先架构
    details: Qt 桌面端 + 自托管 Node 服务端，数据落本机，开箱即用。无需注册账号，数据不出域，断网也能用。
  - icon: 🧩
    title: 插件体系
    details: 6 类插件接口 + 插件市场雏形。为生态方预留扩展通道：AI Provider、Runtime、Generator、Template、Plugin、Skill 动态加载。
---

<InteractiveHome />