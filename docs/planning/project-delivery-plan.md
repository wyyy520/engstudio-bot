# EngStudio 项目总结与实际交付落地计划

> 文档版本：1.2
> 基于仓库现状整理日期：2026-09-13
> 修订记录：
> - 1.1（2026-09-12）：修正“87 个节点”口径——87 是**节点类型数**，“好几百”的是**工程模板数（736）**；新增 §2.5 数量口径与 §2.6 基线修复记录；四端节点类型已统一，模板注册表加载率 736/736。
> - 1.2（2026-09-13）：桌面端完成架构收敛——移除 `packages/frontend`（React/Vite）与 `packages/electron`，改为 **Qt 6 Widgets 原生客户端** `packages/qtclient`；“四端一致”调整为**引擎/客户端/服务端三端一致**；§2.4 结论按当前实测（三包 tsc 通过、vitest 171 通过）更新；§2.6 复现命令同步。
> 目标：把 EngStudio 从“功能较完整的工程原型”推进到可安装、可验证、可运维、可交付的产品版本。

## 1. 项目定位与交付目标

EngStudio（工程工作室）是一套以工作流为核心的多领域工程开发平台。用户在 **Qt 6 桌面客户端的可视化画布**上拖拽编辑工作流，系统将 Workflow JSON 编译为 EWIR（工程统一中间表示）和 ExecutionPlan，再由模板引擎生成真实工程文件，最后由 Runtime 调度执行并采集日志、诊断错误。

平台覆盖 AI/Python、MATLAB、STM32、ANSYS、ROS/ROS2、数据处理和通用工具等场景，桌面端为 **Qt 6 Widgets 原生应用**（Windows/Linux），同时提供 Express REST 服务用于云端或局域网部署。核心价值是把“工程设计、编译、代码生成、运行、诊断”串成一条可追踪流水线，降低专业工程的重复配置成本。

本项目的可交付定义不是“代码能编译”，而是以下闭环全部可复现：

1. 用户能在受支持的操作系统安装并启动客户端。
2. 用户能创建项目、拖拽节点、保存和恢复工作流。
3. 工作流能通过校验、编译并生成可独立运行的工程目录。
4. 在声明的 Runtime 和外部依赖已安装时，工程能运行并显示实时日志。
5. 失败任务能定位到节点、参数、环境或外部工具，并可导出诊断信息。
6. 服务端部署后具备认证、数据持久化、备份、日志、健康检查和升级回滚能力。
7. 发行包、版本说明、用户手册和验收报告可以交给第三方按步骤复现。

## 2. 当前系统概览

### 2.1 代码组织

| 目录 | 职责 | 交付关注点 |
|---|---|---|
| `packages/shared` | 跨包类型、EWIR、节点/项目/工作流模型、校验器 | API 与数据模型的兼容性 |
| `packages/engine` | 编译器、优化器、生成器、模板、Runtime、日志、诊断、插件、Provider | 核心正确性、外部工具适配、资源隔离 |
| `packages/qtclient` | Qt 6 Widgets 原生客户端：工作流画布、参数编辑器、项目管理、编译/运行/日志/诊断页面、模板库 | 安装包、路径、权限、跨平台行为、用户流程 |
| `packages/server` | Express REST API、JWT 认证、SQLite(sql.js) 持久化 | 安全、并发、备份、升级 |
| `Docs` | 架构、API、插件 SDK、工作流 SDK、UI 设计说明 | 与实际代码同步 |
| `packages/engine/templates` | Python/MATLAB/STM32/ROS/ANSYS 等工程模板 | 模板版本、依赖声明、可运行性 |

### 2.2 核心数据流

```text
用户操作
  -> Workflow JSON
  -> Parser / EWIRBuilder
  -> GraphOptimizer / Validator
  -> DependencyAnalyzer / TopologicalSorter
  -> ExecutionPlanBuilder
  -> DomainDispatcher / Generator / TemplateEngine
  -> 生成工程目录与 execution_plan.json
  -> Runtime / ProcessManager 执行
  -> LogCenter 采集
  -> DiagnoseCenter 分析与修复建议
```

### 2.3 已具备能力

- Qt 6 Widgets（C++17 + CMake）原生桌面客户端，12 个功能页面，QNetworkAccessManager 调用 REST 服务。
- TypeScript 严格模式的 pnpm monorepo，Node.js 要求 `>=20`。
- 工作流解析、EWIR 构建、DAG 优化、循环检测、参数和端口校验、拓扑排序、执行计划生成。
- 图优化包含常规规则、CPM/关键路径、HEFT，以及 GA/PSO/ACO/模拟退火等高级优化实现。
- Python、MATLAB、STM32、ANSYS、ROS 等 Runtime/Generator 框架；Python 生成链路最完整。
- 87 种内置节点类型（三端一致，见 §2.5），736 个工程模板全部可加载（见 §2.5）。
- 运行时进程管理、CPU/内存/GPU 监控、日志持久化/轮转、终端过滤和诊断规则引擎。
- 6 类 LLM Provider、工作流规划/解释/优化等 AI Skill、RAG 和 Prompt 版本管理。
- 插件生命周期管理、依赖循环检测、冲突检测和 SDK 文档。
- Qt 客户端：多项目支持（创建/打开/导入/删除）、自动保存（1.5s 防抖）、撤销/重做快照、工作流导入导出、中英文本地化（`core/Tr`）。
- Express API、JWT、Helmet、CORS、限流依赖、SQLite(sql.js) 数据库及 Docker Compose 示例。
- 已有编译器、生成器、Runtime、节点库、Provider、SDK、性能和端到端测试文件。

### 2.4 当前结论

仓库适合作为“功能完整度较高的 Beta 候选版本”，但不能仅凭现有源码声明已经完成生产验收。

已验证部分（2026-09-13 实测）：`shared`/`engine`/`server` 三包 `tsc` 通过；vitest **29 个测试文件、171 个用例全部通过**；模板注册表加载 736/736。

仍需补齐的部分：MATLAB/ANSYS/STM32/ROS 等外部工具和硬件链路缺乏可重复的 CI 验证；跨 Runtime 数据管道仍偏框架化；服务端数据库和任务执行更适合单机或小规模部署；发行、升级、监控、备份恢复和安全运营尚需形成标准流程。

### 2.5 节点与模板数量口径（2026-09-12 修订，实测为准）

此前“87 个内置节点”表述不完整，容易被误读为只有 87 个可用能力单元。实际口径如下
（“好几百个”的是**工程模板**，不是节点类型）：

| 概念 | 数量 | 定义与位置 | 核对方式 |
|---|---|---|---|
| 节点类型（Node Type） | **87** | 可拖拽的节点种类，`type` 为唯一标识；三端已统一拼写 | `packages/engine/src/node-library/nodes/index.ts`（`builtinNodes`） |
| 客户端节点面板 | **87** | 节点面板展示项，经 `GET /api/nodes` 拉取并与引擎一一对应 | `packages/qtclient/src/core/ApiClient.cpp` + `core/Taxonomy.cpp`（分类元数据） |
| 服务端节点清单 | **87** | `GET /api/nodes` 返回项 | `packages/server/src/routes/nodes.ts`（`ALL_NODES`） |
| 参数 Schema（手工） | 32 | `shared.DEFAULT_NODE_SCHEMAS` 覆盖的节点；其余 55 种由引擎内置节点 `properties` 自动补齐校验 | `packages/shared/src/constants/node-schemas.ts` + `ParameterValidator` |
| 工程模板（Template） | **736** | 每个模板是“完整、可实例化、可运行的工程”（含代码文件 + `template.yaml/json`），通过模板 ID 引用；注册表加载率 736/736 | `packages/engine/templates/` + `TemplateRegistry.scan()` |

节点类型按领域分布（合计 87）：AI 14、MATLAB 7、STM32 10、ANSYS 8、Data 13、
Control 9、Tool 8、MCP 6、AISkill 7、Python 5。客户端可按需将 MCP 6 并入 Tool 展示（Tool 14），总数仍为 87。

模板按前缀分布（合计 736）：matlab 201、ros2 167、ansys 150、px4 80、python 51、
simulink 30、rtos/iot/embedded/devops/comm 各 10、ctrl 2、stm32/ros/sensor/plan/opencv/csharp/common 各 1（旧格式）。
`csharp/`、`python/` 为分组目录（内含子模板，本身不是模板），不计入总数。

注意：ros2（167）+ px4（80）模板暂无专属节点类型，通过 `ROSGenerator`/`TemplateEngine` +
通用节点调用。这是已知的覆盖缺口（V1 边界见 §3.2），不是计数错误。

### 2.6 基线修复记录（2026-09-12，已验证）

为让项目切实落地，本次修订同步修复了以下阻断问题（`tsc --noEmit` 三包通过，
vitest 171 项通过，模板加载 736/736）：

1. 构建阻断：补齐 `shared`/`engine` 的 `dist` 构建；修复 `TemplateAdapter` 错误的
   相对导入（`../template/` → `../../template/`）；对齐 `TemplateInstance` 与
   `shared.TemplateInstanceData` 字段（`parameters` → `parameterOverrides` /
   `effectiveParameters`，`select` → `enum`）；修复 `TemplateGenerator.isTemplateNode`
   返回 `boolean | undefined`；修复 `CompositionEngine` 读取旧 `instance.parameters` 字段。
2. 节点类型三方统一：引擎 16 个 `type` 与客户端/服务端/`shared` 不一致
  （如引擎 `'MATLAB Script'` vs 三方 `'MATLABScript'`、引擎 `'ANSYSAPDL'` vs 三方 `'APDL'`、
   引擎 `'HTTP'` vs 三方 `'Http'`、`STMSensor`/`STMMotor`/`STMOTA` vs `Sensor`/`Motor`/`OTA` 等），
   已按三方共识拼写统一引擎定义及两处 Adapter 映射；`name`（展示名）保持不变。
   另补齐前端与服务端此前遗漏的 `FormatConvert` 预设（86 → 87）。
3. 参数校验覆盖：`ParameterValidator` 在 `shared` 32 个手工 schema 之外，
   自动从 87 个内置节点 `properties` 生成必填/数值范围校验；集成测试夹具按节点定义补齐必填参数。
4. 模板注册表兼容与数据修复：支持旧格式 `template.json`（`capability`/`variables`/`range`/`select`/
   字符串 `options`）与 `files: [{path, description}]` 写法；修复 3 个 YAML 语法错误
  （`px4_precision_agriculture`、`px4_scan_pattern` 未闭合的 `unit: '%`，
   `matlab_power_load_flow` 未加引号的含冒号 `description`）。加载失败由 15 个降为 0 个。

复现命令（仓库根目录，Node.js 20+，需先 `pnpm install`）：

```bash
./node_modules/.bin/tsc -p packages/shared/tsconfig.json
./node_modules/.bin/tsc -p packages/engine/tsconfig.json
./node_modules/.bin/tsc -p packages/server/tsconfig.json --noEmit
./node_modules/.bin/vitest run   # 29 files / 171 passed
node --input-type=module -e "
import { TemplateRegistry } from './packages/engine/dist/template/TemplateRegistry.js';
const r = new TemplateRegistry('./packages/engine/templates');
await r.scan(); console.log('templates:', r.getAll().length);  // 736
"
```

## 3. 交付范围与版本边界

### 3.1 建议的首个可交付版本（V1.0）

V1.0 建议聚焦“桌面端 + Python/AI 主链路 + 基础云端项目管理”，把最容易验收且不依赖商业软件授权的场景做成稳定产品：

- Qt 桌面端 Windows 发行包，另提供 Linux 构建（CI 的 `release` 任务已可产出 Linux 二进制）；macOS 作为后续平台。
- 项目、工作流、节点参数、编译、生成、运行、日志、诊断、导出/导入。
- Python 环境检测、虚拟环境/依赖安装指引、CPU 执行和可选 GPU 执行。
- CSV/JSON/图像数据导入，至少一个完整 AI 示例（如数据集 -> 训练 -> 导出）。
- 远端 Server 的注册、登录、项目列表和工作流同步。
- 插件和 LLM Provider 采用显式安装/配置，默认关闭高风险执行能力。

### 3.2 V1.0 明确不承诺

- 没有对应许可证、驱动或硬件时，不承诺 MATLAB、ANSYS、STM32 烧录、真实 ROS 机器人结果。
- ROS2/PX4 的 247 个模板在 V1 仅保证“模板可加载、可渲染”，专属 ROS/PX4 节点类型尚未建设，
  需经通用节点 + `ROSGenerator`/`TemplateEngine` 调用，不承诺开箱即用的 ROS 可视化编排体验。
- 不承诺多用户实时协同编辑、企业级高可用和大规模分布式调度。
- 不承诺由 AI 自动生成的工作流无需人工审核即可用于生产或控制设备。
- 不把文档中的理论性能数值当作已验收指标，必须通过基准脚本实测。

## 4. 交付前必须完成的工作包

### P0：基线、依赖和可复现构建

1. 安装并固定 Node.js 20 LTS、Corepack、pnpm 版本；启用 `corepack enable`，确认 `pnpm-lock.yaml` 可复现安装。
2. 执行 `pnpm install --frozen-lockfile`，记录操作系统、Node、pnpm、Git、Python 版本。
3. 执行 `pnpm build`、`pnpm test`、`pnpm lint:check`、`pnpm format`，保存完整日志。
4. 修复所有编译错误、失败测试、未处理 Promise、空测试或仅占位测试；将关键占位测试替换为有断言的测试。
5. 建立 GitHub Actions/内部 CI：安装依赖、类型检查、单元测试、构建、产物归档。
6. 为每次发布生成版本号、提交 SHA、依赖锁文件摘要和构建时间，写入 `VERSION` 或发行元数据。

验收：新机器按 README 操作可完成安装和构建；CI 在干净环境通过；失败日志可定位到具体包和命令。

### P1：核心用户流程闭环

1. 新建项目：填写名称、目录、领域和 Runtime，生成标准目录结构。
2. 编辑工作流：从节点面板拖拽节点，连接端口，编辑参数，复制/粘贴、撤销/重做、自动保存。
3. 校验工作流：显示孤立节点、循环依赖、类型不匹配、缺失参数、重复输出连接、节点版本不兼容、模板/Generator 缺失。
4. 编译：展示阶段进度和诊断信息；失败时定位节点 ID 和错误路径；成功后允许查看 EWIR 和 ExecutionPlan。
5. 生成：输出完整工程，包含 README、依赖文件、运行入口、执行计划和生成清单；重复生成必须可预测。
6. 运行：支持启动、停止、重试、取消；展示节点级状态、标准输出、标准错误、退出码和资源使用。
7. 结果：统一输出目录和元数据，支持打开目录、导出日志、复制诊断报告。

验收：使用内置最小 Python 案例，从新建项目到生成并运行成功，全程无需手工修改生成代码。

### P2：Runtime 与模板产品化

1. 为每个 Runtime 建立能力矩阵：支持的平台、版本、必需命令、许可证、输入输出格式、已验证模板。
2. 每个模板必须有 `template.yaml`、README、依赖声明、示例输入、期望输出和版本号。
3. 所有外部命令通过统一适配层调用：显式设置工作目录、环境变量、超时、最大输出、取消信号和退出码映射。
4. 禁止把用户输入直接拼接到 shell 字符串；使用参数数组、白名单和路径规范化。
5. 对跨 Runtime 数据交换定义文件协议（JSON/CSV/NPY/ONNX/ROS bag 等），生成校验文件、编码和 schema。
6. 为 Python Runtime 提供环境诊断：Python 路径、版本、pip、关键包、CUDA、GPU、磁盘空间和写权限。
7. 对 MATLAB/ANSYS/STM32/ROS 增加“未安装/未授权/版本不兼容/连接失败”的明确状态，不把失败归类为普通节点错误。

验收：每个声明支持的 Runtime 至少有一个在干净测试机上的自动化冒烟案例；无法自动化的部分有人工验收脚本和环境清单。

### P3：服务端、认证和数据可靠性

1. 明确 Server 部署模式：单机 Docker、局域网服务器或云主机；V1 只保证单实例。
2. 生产环境必须设置随机、长度至少 32 的 `JWT_SECRET`，使用 HTTPS 或反向代理终止 TLS。
3. 配置白名单 `CORS_ORIGINS`，禁止生产使用 `*`；限制 JSON 请求体、上传大小和请求频率。
4. 设计数据库备份：停止写入或使用一致性导出，备份 `engstudio.db` 与配置；每日备份、保留 7/30 天，定期恢复演练。
5. 增加数据库迁移版本表、启动迁移日志和失败回滚策略；禁止直接修改生产数据库结构。
6. 增加用户会话失效、密码策略、登录失败锁定、审计日志和管理员操作记录。
7. 明确任务执行权限：Server 默认只管理项目和编译请求，危险的本地进程执行应由受控 Agent/桌面端承担。
8. 提供 `/api/health` 和 `/api/ready`，区分进程存活、数据库可用和依赖可用。

验收：删除测试实例后可从备份恢复用户和项目；未授权请求返回正确状态码；HTTPS、CORS、限流和审计日志均有验证记录。

### P4：桌面端发行与升级

1. Qt 客户端默认以 `QNetworkAccessManager` 访问服务端，不在本机执行任意进程；需确认工程目录写入、文件导入导出和模板路径的最小权限边界。
2. 为 Windows/Linux 构建签名或至少提供校验哈希；记录 Qt 版本、编译器版本和构建机信息。
3. 检查模板、默认资源、图标和翻译资源是否全部进入安装包；安装后在无源码目录环境启动。
4. 验证首次启动向导、用户数据目录、日志目录、缓存目录、项目目录和临时目录的读写权限。
5. 配置更新源、版本检查、下载失败重试、取消更新和回滚说明；更新前保留用户项目和配置。
6. 生成安装手册、卸载说明、离线安装包和常见故障排查表。

验收：全新 Windows 账户安装、启动、创建项目、重启恢复、升级到新版本、卸载后数据行为均通过人工脚本。

### P5：测试、性能和质量门禁

测试层次应按以下顺序建设：

1. 单元测试：shared 校验器、编译器每个阶段、模板渲染、Runtime 状态机、日志轮转、认证工具。
2. 集成测试：Workflow -> EWIR -> ExecutionPlan -> Generator -> Runtime 的最小闭环；Server API + 数据库。
3. 契约测试：Qt 客户端 `ApiClient`/service 层、REST 响应结构和错误码与 shared 类型一致。
4. E2E 测试：新建项目、编辑、编译、生成、运行、失败诊断、导出。
5. 外部工具测试：在可用许可证/硬件实验室执行 MATLAB、ANSYS、STM32、ROS 案例；无环境时执行 mock 适配器测试。
6. 性能测试：节点数 10/50/200/1000，编译耗时、内存、生成耗时、日志吞吐、并发任务数和取消延迟。
7. 安全测试：越权访问、JWT 篡改、路径穿越、命令注入、上传类型、插件权限、CORS、限流和敏感日志。

质量门禁建议：主分支必须通过类型检查、lint、单元/集成测试；发布分支必须通过 E2E、安装包冒烟、备份恢复和安全扫描。

## 5. 推荐实施顺序与里程碑

### 第 1 周：建立基线

- 固定工具链和 CI；完成依赖安装、构建、测试、lint 的第一次真实记录。
- 清点所有测试文件，标记 placeholder、跳过测试和依赖外部环境的测试。
- 确认 V1.0 支持平台、Python 版本、最小硬件和外部软件版本。
- 输出《构建基线报告》和《Runtime 能力矩阵》。

### 第 2 周：打通最小主链路

- 选定一个 Python AI 案例，准备小型公开或内部数据集。
- 修复校验、编译、生成、运行、日志和失败诊断中的阻断问题。
- 完成从桌面端操作到生成工程运行的 E2E 脚本。
- 输出可演示的 Beta 安装包。

### 第 3 周：可靠性与安全

- 完成 Server 配置校验、数据库迁移、备份恢复、健康检查和审计日志。
- 完成外部命令参数化、超时、取消、资源限制和路径安全检查。
- 完成 IPC 权限审计、CORS/HTTPS/限流测试和敏感信息脱敏。

### 第 4 周：模板与外部环境验收

- 为每个 V1 声明模板补齐依赖、输入输出、版本和冒烟测试。
- 在真实 Python/GPU 环境执行性能测试；在实验室环境执行 MATLAB/ANSYS/STM32/ROS 案例。
- 标记每个案例为“自动化通过、人工通过、条件不具备”三种状态。

### 第 5 周：发行与试点

- 构建 Windows/Linux 安装包，进行全新安装、升级、卸载和数据迁移测试。
- 编写用户手册、管理员部署手册、故障排查手册、版本说明和已知限制。
- 选择 3 至 5 名试点用户，收集任务完成时间、失败原因和崩溃日志。

### 第 6 周：发布决策

- 关闭 P0/P1 阻断缺陷；P2 缺陷必须有明确规避方案和负责人。
- 完成发布评审：功能、质量、安全、运维、文档、许可证和回滚。
- 打标签并发布安装包、容器镜像、校验哈希、SBOM 和变更记录。

## 6. 部署操作手册

### 6.1 开发环境

```bash
# 前置：Node.js 20 LTS、Corepack、pnpm、Git
corepack enable
pnpm --version
pnpm install --frozen-lockfile
pnpm build
pnpm test
pnpm lint:check
```

启动服务端：

```bash
cd packages/server && pnpm dev
```

桌面端开发：先构建 shared/engine，再执行 CMake 配置与构建 `packages/qtclient`（见 §2.1 与 README），运行 `packages/qtclient/build/engstudio`。首次启动后检查设置页中的服务端地址、工程目录、日志和模板路径是否正确。

### 6.2 Docker 服务端

1. 准备 `.env`，至少设置 `JWT_SECRET`、`CORS_ORIGINS`、`NODE_ENV=production`。
2. 使用反向代理提供 HTTPS，并把 `/api` 转发到容器 `3456` 端口。
3. 执行 `docker compose build` 和 `docker compose up -d`。
4. 访问 `/api/health`，再用真实账号完成注册、登录、创建项目和读取项目。
5. 将 Docker volume `engstudio-data` 纳入备份；升级前先备份并记录镜像版本。
6. 查看容器日志、磁盘使用、数据库文件时间和健康检查结果。

### 6.3 发布与回滚

发布前：冻结版本号 -> 运行 CI -> 生成安装包/镜像 -> 生成 SHA256 和 SBOM -> 备份数据库 -> 小范围试点。

发现严重问题时：停止扩大部署 -> 保留日志和数据库副本 -> 回滚到上一个镜像/安装包 -> 验证健康检查和项目读取 -> 发布事故记录和修复版本。禁止用未经迁移验证的旧程序直接打开新版本数据库。

## 7. 运行维护清单

每日检查：服务健康、错误率、未处理异常、磁盘空间、数据库备份、任务失败数、崩溃日志。

每周检查：恢复一次备份、清理过期日志和临时文件、审查插件和 Provider、检查依赖安全公告、抽样验证生成工程可运行。

每月检查：升级 Node/Qt/关键依赖的安全补丁，重新执行性能基线，复核用户权限和审计日志，更新模板兼容矩阵。

必须采集的指标：API 请求量与延迟、编译成功率、生成成功率、Runtime 成功率、任务取消延迟、崩溃次数、CPU/内存峰值、磁盘占用、LLM Token/费用（如启用）。

## 8. 风险、责任人与完成判定

| 风险 | 影响 | 应对 | 完成判定 |
|---|---|---|---|
| pnpm/Node 版本不一致 | 无法构建或锁文件漂移 | 固定版本并纳入 CI | 干净机器可复现构建 |
| 外部软件/硬件不可用 | 案例无法验收 | 能力矩阵、mock、实验室脚本 | 每项有测试状态和证据 |
| 生成工程依赖缺失 | 用户运行失败 | 依赖清单、环境检测、安装指引 | 最小案例在干净环境成功 |
| 命令执行和路径输入 | 安全事故 | 参数数组、白名单、权限隔离 | 安全测试无高危问题 |
| sql.js 单实例持久化 | 并发/恢复风险 | V1 限定单实例、备份演练；后续评估 PostgreSQL | 恢复 RTO/RPO 达标 |
| 文档与代码漂移 | 交付误导 | 每版同步差距表和变更记录 | 发布评审签字 |
| AI 输出不可控 | 错误工作流或敏感信息 | 人工确认、Provider 开关、脱敏 | 高风险操作不能静默执行 |

每个工作包都应有负责人、截止日期、证据链接和状态。状态只能使用：未开始、进行中、阻塞、待验收、已完成。没有测试日志、截图、产物或人工签字的事项不得标记为已完成。

## 9. 交付物目录

发布包至少包含：

- Windows/Linux 安装包及 SHA256。
- Docker 镜像、Compose 文件、`.env.example` 和部署手册。
- 用户手册、管理员手册、Runtime 环境矩阵、插件 SDK 文档。
- 自动化测试报告、性能报告、安全扫描报告、备份恢复记录。
- 版本说明、已知限制、许可证清单、SBOM、升级和回滚说明。
- 一个可公开分发或已获授权的最小示例项目及期望输出。

## 10. 最终发布检查表

- [ ] 干净机器可以安装依赖、构建和运行测试。
- [ ] 桌面端安装包可以启动，用户数据和模板路径正确。
- [ ] 最小 Python 案例完成设计、编译、生成、运行和日志闭环。
- [ ] 失败任务可以停止、重试并生成可读诊断报告。
- [ ] Server 的认证、HTTPS、CORS、限流、备份和恢复已验证。
- [ ] 所有对外宣称的 Runtime 都有对应环境、模板和验收证据。
- [ ] CI、版本号、构建产物、哈希和 SBOM 已归档。
- [ ] 用户、管理员、开发和运维文档与当前代码一致。
- [ ] 已知限制已在发布说明中明确，试点反馈已处理或登记。
- [ ] 发布负责人、回滚负责人和事故联系人已确定。

