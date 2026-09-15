# EngStudio 系统设计

> 文档版本：2.0（2026-09-14 重写）
> 依据提交：`90d3afd`。替代此前描述 React + Tauri 架构的旧版（该架构已随 `packages/frontend`、`packages/electron` 移除而作废）。

---

## 1. 设计目标与约束

| 目标 | 约束（设计边界） |
|---|---|
| 一次设计，多域复用 | 领域差异收敛到 Generator / Runtime / Adapter，编译层只认 EWIR 与 ExecutionPlan |
| 生成的工程必须能跑 | 模板即完整工程（代码 + `template.yaml` + README），生成物不依赖平台运行时 |
| 失败可定位 | 每个错误带 `nodeId` / `edgeId`，诊断规则引擎映射到具体节点与修复建议 |
| 可单机交付 | 桌面端 + 单实例服务端，避免 V1 引入分布式复杂度 |
| 中文优先、可扩展多语言 | 客户端 `core/Tr` 字符串表集中管理，服务端错误信息中英双语 |

---

## 2. 模块划分与职责

### 2.1 `packages/shared`

- 跨端类型：`Workflow` / `WorkflowNode` / `WorkflowEdge` / `EWIRDocument` / `ExecutionPlan`。
- 32 个手工参数 Schema（`constants/node-schemas.ts`），其余 55 种节点由引擎内置 `properties` 自动补齐校验。
- 校验器：`ParameterValidator` 的基础规则与共享工具。

### 2.2 `packages/engine`

| 子系统 | 职责 |
|---|---|
| `compiler/` | 8 阶段编译流水线、优化器（常规 + CPM + HEFT + GA/PSO/ACO/模拟退火）、调度器、领域适配器 |
| `generator/` | 各领域代码生成器，统一实现 `IGenerator` |
| `template/` | `TemplateEngine`（Handlebars 渲染）、`TemplateRegistry`（扫描与兼容新旧格式）、`TemplateInstance` |
| `runtime/` | `Runtime` 抽象、`ProcessManager`、各域 Runtime、`EnvironmentDetector`、`executor/` 内置执行器 |
| `diagnose/` | `DiagnoseCenter` + `RuleEngine` + `AutoFixer`（Python / MATLAB / STM32 / ANSYS / 环境 五类修复器） |
| `node-library/` | 87 个内置节点定义与 `NodeSchema` |
| `provider/` `rag/` `ai/` `skill/` | LLM Provider 管理、RAG 知识库、AI 增强、7 种 AI Skill |
| `plugin/` `sdk/` `project/` `composition/` | 插件生命周期与 6 类插件接口、SDK、工程管理、模块组合 |

### 2.3 `packages/server`

- 10 个路由模块、46 个业务端点（清单见 `Docs/api/README.md`），外加 `/api/health`。
- 中间件：Helmet、CORS 白名单、`express.json({ limit: '10mb' })`、morgan→Winston、可选 `FORCE_HTTPS` 重定向、统一 404/500 响应。
- 配置：`src/config.ts` 用 Zod 校验环境变量（`JWT_SECRET` ≥ 32 位、`PORT`、`CORS_ORIGINS`、`SSL_*`、`LOG_LEVEL`、`NODE_ENV`）。
- 持久化：sql.js（`src/db.ts`）+ 迁移（`src/migrations/migrate.ts`）；业务数据按 `user_id` 隔离。
- 鉴权：`requireAuth` 中间件校验 JWT；`POST /api/auth/local` 提供本机免登录会话。

### 2.4 `packages/qtclient`

- 12 个功能页面：工作流、编译器、运行时、日志中心、诊断中心、项目管理、插件中心、技能中心、AI 对话、云端、仪表盘、设置。
- 网络层集中在 `core/ApiClient`（`QNetworkAccessManager`），页面只依赖 `RuntimeStore` 信号，不直接发请求。
- 主题：`core/Theme.cpp` + `resources/style.qss` / `style_light.qss`，配色与控件规范见 `Docs/UI/design-system.md`。
- 本地状态：`Settings`（QSettings）、`ProjectStore`（工程与自动保存，1.5s 防抖）、`RuntimeStore`（编译/运行/日志/诊断的运行时状态机）。

---

## 3. 关键设计决策

| 决策 | 理由 | 代价 |
|---|---|---|
| 引入 EWIR 中间表示 | 让"图"与"领域实现"解耦，跨域复用编译与优化能力 | 多一层转换与维护成本 |
| 模板即完整工程 | 生成物可直接运行、可直接交付客户，不依赖平台 | 736 个模板需要持续的依赖与版本治理 |
| 桌面端选 Qt 6 Widgets 而非 Electron | 原生启动速度、无 Chromium 体积、系统级文件/进程能力 | 需要维护 C++ 客户端与 CMake 构建 |
| 服务端用 sql.js 单文件库 | 零运维部署、便于随桌面端分发 | 单实例写入，不适合高并发与多写者 |
| 外部进程统一走适配层 | 超时、取消、输出上限、退出码可控，避免命令注入 | 每个领域都要实现 Runtime 与 Generator |
| 客户端照旧发送完整上下文，服务端只存增量（AI 对话） | 兼容无状态调用方式，服务端无需重建上下文 | 历史表仅用于检索与回溯，不参与推理 |

---

## 4. 错误处理模型

1. **编译期**：`CompilerError` 携带阶段与节点定位；`validate` 返回 `errors` / `warnings`，每条含 `nodeId`、`edgeId`、`message`。
2. **运行期**：进程退出码映射为任务状态；`LogCenter` 采集 stdout/stderr 并按节点归档；超时与取消显式标记，不与失败混淆。
3. **诊断期**：`DiagnoseCenter` 用规则引擎把原始错误匹配到规则，输出节点级定位与修复建议（五类修复器）。
4. **API 层**：统一响应 `{ success: false, error }`；引擎路由额外返回 `errors[]`，保留节点级细节。

---

## 5. 安全边界

- 认证：JWT（bcrypt 存储密码哈希）；未携带或篡改 token 的请求在 `requireAuth` 处拒绝。
- 传输：生产环境要求 HTTPS（可设 `SSL_KEY_PATH`/`SSL_CERT_PATH`，或由反向代理终止 TLS）；`FORCE_HTTPS` 开启时强制 301。
- 跨域：`CORS_ORIGINS` 白名单，生产禁止 `*`。
- 输入：所有请求体经 Zod 校验；文件路径在服务端做规范化与根目录约束；外部命令使用参数数组，禁止拼接 shell 字符串。
- 日志：Winston + morgan 统一出口，token、API Key、密码不落日志。

---

## 6. 已知限制

- 服务端为单实例设计，sql.js 不适合并发写入；云化需迁移到 PostgreSQL + 任务队列。
- ROS2 / PX4 的 247 个模板目前只保证可加载、可渲染，暂无专属节点类型。
- MATLAB / ANSYS / STM32 硬件链路缺少可重复的自动化验收，依赖客户环境人工验收。
- 桌面端尚无安装包与自动更新（见 `Docs/planning/next-steps.md` S2-1、S2-2）。
