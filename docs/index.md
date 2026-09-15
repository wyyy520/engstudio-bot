---
layout: home
hero:
  name: EngStudio
  text: 专业工程的可视化流水线
  tagline: 把 AI、MATLAB、STM32、ANSYS、ROS2 的工程搭建，从「每个项目重写脚本、配环境、对接口」变成「拖节点、连线、一键生成可运行工程」。
  image:
    src: /screenshot.png
    alt: EngStudio
  actions:
    - theme: brand
      text: 立即下载
      link: /download
    - theme: alt
      text: 查看文档
      link: https://github.com/wyyy520/ES/blob/main/README.md

features:
  - icon: 📦
    title: 700+ 工程模板
    details: 覆盖 AI、MATLAB/Simulink、STM32、ANSYS、ROS2/PX4、Python 等领域，模板自带真实输入输出参数、依赖与使用说明，参数化实例化。
  - icon: 🧩
    title: 可视化工作流编辑器
    details: Qt 原生画布，拖拽节点连线即组流程；支持撤销/重做、自动布局、网格吸附，编译层把图形翻译成可执行计划（EWIR）。
  - icon: 🤖
    title: AI 双模式对话
    details: 意图模式自由问答；工程模式用 RAG 语义检索 + 模板白名单校验，只生成合法工作流 JSON，杜绝编造不存在的模块。
  - icon: ⚙️
    title: 一键运行与调度
    details: 多任务执行、超时保护、进程树 kill、输出裁剪、CPU/内存监控，节点状态实时回传。
  - icon: 🩺
    title: 诊断与自修复
    details: 规则引擎定位到具体节点，给出修复建议，Python/MATLAB/STM32/ANSYS/环境 5 类修复器自动生成修复方案。
  - icon: 🔒
    title: 本地优先架构
    details: Qt 桌面端 + 自托管 Node 服务端（Express + SQLite），数据落本机，开箱即用，数据不出域。
---