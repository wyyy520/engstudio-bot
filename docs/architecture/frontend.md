# 桌面客户端架构（Qt 6 Widgets）

> 文档版本：2.0（2026-09-13）
> 适用范围：`packages/qtclient`
> 历史：1.x 版本描述的是 React + Vite + React Flow + Tauri/Electron 方案，该方案已被移除，本文档为当前的 Qt 6 原生客户端架构。

---

## 1. 技术选型

| 技术 | 版本/要求 | 用途 |
|------|-----------|------|
| Qt | 6（Widgets / Network / Concurrent） | UI 框架、REST 网络、并发任务 |
| C++ | C++17 | 全部实现语言 |
| CMake | ≥ 3.16（`AUTOMOC` / `AUTORCC`） | 构建系统 |
| QGraphicsView / QGraphicsScene | Qt 6 自带 | 工作流画布渲染与交互 |
| QNetworkAccessManager | Qt 6 自带 | 调用服务端 REST API |
| QSettings | Qt 6 自带 | 本地配置持久化 |

**设计取舍**：桌面端不引入任何第三方 UI 组件库，画布基于 `QGraphicsView` 自绘，全部依赖 Qt 官方模块，安装包体积与依赖面最小，也避免了 Web 运行时带来的启动与内存开销。

---

## 2. 目录结构

```text
packages/qtclient/
├── CMakeLists.txt          # 单一可执行目标 engstudio
├── resources/              # 图标、样式、字体等资源
└── src/
    ├── main.cpp            # 入口：初始化 Settings / Theme / Tr / MainWindow
    ├── MainWindow.{h,cpp}  # 主窗口：侧边导航 + QStackedWidget + 菜单栏 + 工具栏 + 状态栏
    ├── core/               # 与 UI 无关的应用层：网络、状态、配置、模型、校验、导出
    ├── workflow/           # 画布实现（QGraphicsView 子类）
    ├── widgets/            # 可复用控件（节点面板、属性面板、参数编辑器、控制台、状态徽标）
    └── pages/              # 12 个主页面，统一继承 NavPage
```

---

## 3. 分层设计

| 层 | 位置 | 职责 |
|----|------|------|
| 入口与外壳 | `main.cpp`、`MainWindow` | 窗口、导航路由、菜单/工具栏、健康状态指示 |
| 页面层 | `src/pages/*` | 每个功能页（工作流、编译器、运行时、日志、诊断、插件、技能、AI、云端、设置…） |
| 控件层 | `src/widgets/*` | 节点面板、属性面板、参数编辑器、控制台、状态徽标、流式布局 |
| 画布层 | `src/workflow/WorkflowCanvas` | 节点/端口/连线的绘制与交互 |
| 状态层 | `src/core/*Store` | 工程、工作流、运行时、日志、控制台、插件状态 |
| 服务层 | `src/core/ApiClient` | 统一 REST 调用、会话管理、错误上报 |
| 基础层 | `Settings`、`Theme`、`Tr`、`Models`、`MiniYaml`、`Taxonomy`、`TemplateLibrary`、`WorkflowValidator`、`ProjectExporter` | 配置、主题、国际化、数据模型、YAML 解析、节点分类、模板库、校验、导出 |

### 3.1 页面清单

`src/pages/Pages.h` 声明全部页面，均继承 `NavPage`，由 `MainWindow::navigate(route)` 驱动切换：

| 页面 | 类 | 主要职责 |
|------|----|----------|
| 仪表盘 | `DashboardPage` | 快速开始、模板统计、系统状态 |
| 工作流 | `WorkflowPage` | 节点面板 + 画布 + 属性面板 + 控制台，编译/导出入口 |
| AI 对话 | `AIChatPage` | 与 LLM Provider 交互 |
| 编译器 | `CompilerPage` | 校验、编译、生成的操作与结果展示 |
| 运行时 | `RuntimePage` | 运行、停止、任务列表与资源状态 |
| 项目管理 | `ProjectManagerPage` | 工程创建/打开/导入/删除、自动保存提示 |
| 日志中心 | `LogCenterPage` | 日志检索与过滤 |
| 诊断中心 | `DiagnoseCenterPage` | 错误分析与修复建议 |
| 插件中心 | `PluginCenterPage` | 本地插件与插件市场 |
| 技能中心 | `SkillCenterPage` | AI Skill 管理 |
| 云端 | `CloudPage` | 账号、登录注册、云端工程同步 |
| 设置 | `SettingsPage` | 语言、主题、字体、栅格、自动保存、外部工具路径 |

### 3.2 核心状态与基础设施

| 模块 | 职责要点 |
|------|----------|
| `ProjectStore` | 工程 CRUD、激活工程、**自动保存（默认 1.5s 防抖）**、快照 push/apply（撤销/重做）、导入目录 |
| `WorkflowStore` | 节点与边的增删改、选中态、复制/粘贴、校验触发 |
| `RuntimeStore` | 运行任务状态、启动/停止、任务轮询 |
| `LogStore` / `ConsoleStore` | 日志与控制台消息的收集、过滤、持久化展示 |
| `PluginStore` | 插件列表、安装/卸载/启停状态 |
| `ApiClient` | 会话建立与保持、统一 `get/post/remove`、JSON 解析、错误回调、健康检查、网络状态信号 |
| `Settings` | 语言（zh/en）、主题（dark/light）、字号、栅格、吸附、小地图、自动保存开关与间隔、外部工具路径、账号信息 |
| `Theme` | 深色/浅色主题与调色板 |
| `Tr` | 轻量 i18n：按 key 翻译，缺失英文时回退中文原文 |
| `Taxonomy` | 节点分类与展示元数据 |
| `TemplateLibrary` | 模板库本地索引与浏览 |
| `MiniYaml` | 轻量 YAML 解析（读取 `template.yaml`） |
| `WorkflowValidator` | 客户端侧前置校验（连接合法性、孤立节点等） |
| `ProjectExporter` | 导出工作流 JSON 与完整工程目录 |

---

## 4. 工作流画布

`WorkflowCanvas` 继承 `QGraphicsView`，承载 `QGraphicsScene` 中的三类图元：

| 图元 | 说明 |
|------|------|
| `VNodeItem` | 节点：标题、类别配色、输入/输出端口 |
| `PortItem` | 端口：命中区域、类型标识、连线起点 |
| `VEdgeItem` | 连线：路径绘制、选中高亮 |

已实现的交互能力：

- 节点拖拽移动、栅格吸附（可开关）、自动布局与「下一个空位」定位
- 缩放（滚轮/按钮/指定比例）、适合窗口、重置视图、双击聚焦节点
- 端口级连线创建与校验，失败时通过 `edgeCreationFailed(reason)` 反馈原因
- 多选、框选、删除选中、右键上下文菜单（`contextMenuRequested`）
- 节点双击激活（进入参数编辑）、选中信号（节点/连线/空白处分别上报）
- 从节点面板拖入画布（`dragEnterEvent` 等拖放事件）
- 画布背景自绘（栅格/小地图），支持主题切换时重绘（`changeEvent`）

---

## 5. 数据流

```text
用户操作（拖拽/连线/改参数）
      │
      ▼
WorkflowStore / ProjectStore（内存状态 + 快照）
      │  自动保存（防抖）
      ├──────────────► 本地工程文件（workflow JSON / 工程目录）
      │
      ▼
ApiClient（QNetworkAccessManager，JSON over HTTP）
      │
      ▼
服务端 REST API（/api/...）
      │
      ▼
Engine（校验 / 编译 / 生成 / 运行）
      │  异步任务 + 轮询
      ▼
LogStore / RuntimeStore / ConsoleStore
      │
      ▼
界面刷新（控制台、日志中心、运行时状态、诊断建议）
```

会话：`ApiClient` 负责登录/注册、令牌保持、`GET /api/auth/me` 校验，失败时通过 `sessionEstablished` / `requestFailed` 信号通知界面。

---

## 6. 与服务端的接口映射

| 客户端方法 | 端点 |
|-----------|------|
| `login` / `registerUser` / `logout` / `me` | `/api/auth/login`、`/register`、`/logout`、`/me` |
| `listProjects` / `createProject` / `updateProjectWorkflow` / `getProject` / `openProject` / `importProject` / `deleteProject` / `projectsRoot` | `/api/projects` 系列 |
| `validateWorkflow` / `compileWorkflow` / `generate` / `run` / `stop` / `getTask` | `/api/engine/validate`、`/compile`、`/generate`、`/run`、`/stop`、`/tasks/:pid` |
| `checkEnv` / `checkAllEnv` | `/api/env/check`、`/api/env/:domain` |
| `getAllNodes` / `getNodeCategories` | `/api/nodes`、`/api/nodes/categories` |
| `listPlugins` / `listMarketPlugins` / `installPlugin` / `uninstallPlugin` / `enablePlugin` / `disablePlugin` | `/api/plugins` 系列 |
| `listProviders` / `createProvider` / `updateProvider` / `deleteProvider` / `testProvider` / `configureProvider` / `chat` | `/api/providers` 系列 |
| `getAllTemplates` / `getTemplate` | `/api/templates` 系列 |
| `checkHealth` | `/api/health` |

---

## 7. 构建与运行

```bash
# 依赖：Qt 6（qt6-base-dev）、CMake ≥ 3.16、支持 C++17 的编译器
cmake -S packages/qtclient -B packages/qtclient/build -DCMAKE_BUILD_TYPE=Release
cmake --build packages/qtclient/build -j
./packages/qtclient/build/engstudio
```

- 产物：单个可执行文件 `engstudio`（当前 Linux 构建约 2.7 MB，链接 Qt 动态库）
- CI：`.github/workflows/ci.yml` 的 `release` 任务在 `v*` 标签下安装 Qt6 依赖、CMake 构建并归档客户端产物
- 配置：客户端地址、外部工具路径、语言与主题均在「设置」页配置并持久化

---

## 8. 与旧前端方案的关系

| 维度 | 旧方案（已移除） | 当前方案 |
|------|------------------|----------|
| UI 框架 | React 18 + Ant Design | Qt 6 Widgets |
| 状态管理 | Zustand | C++ Store 类（信号槽驱动） |
| 画布 | React Flow | `QGraphicsView` 自绘 |
| 构建 | Vite | CMake |
| 桌面封装 | Tauri / Electron | 原生可执行文件 |
| 与引擎通信 | Electron/Tauri IPC + HTTP | 统一 HTTP（REST） |

迁移收益：去掉 Node/Chromium 运行时依赖，启动更快、内存更低、安装包更小，跨平台行为由 Qt 保证；同时把「桌面端」与「服务端」的耦合收敛为单一 REST 契约，便于服务端独立部署。

---

## 9. 已知限制与后续工作

- 画布的模板/节点渲染仍以「可读可编辑」为目标，尚未提供 Simulink 式的信号线类型推导可视化。
- 大工作流（100+ 节点）下的绘制与布局性能需要基准测试与进一步优化（视图裁剪、批量更新）。
- 撤销/重做目前基于工程快照，超大工程的内存占用需要评估。
- 契约测试尚未覆盖：`ApiClient` 的响应结构与 `shared` 类型的一致性需要自动化校验。
- 安装包签名、自动更新、回滚机制在 V1.0 交付计划中（见 `Docs/planning/project-delivery-plan.md` §P4）。
