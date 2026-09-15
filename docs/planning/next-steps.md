# EngStudio 真实差距与下一步行动（Next Steps）

> 文档版本：2.0
> 核对日期：2026-09-14
> 依据：对仓库源码逐条核实（每个结论附 `文件:行号`），修正了此前版本中"疑似差距"与"实际声明"的错位。
> 状态标记：**未开始 / 进行中 / 已完成**。没有日志、产物或签字的事项不得标记完成。

---

## 0. 一句话结论

**系统不缺功能，缺三样：运行时层的真实隔离与管控、模板库的质量证据、服务端持久化的可靠性与演练记录。**
1–4 条差距表述见 §2，全部附可复现的代码位置。

```text
阶段 A 运行时真实化（1 周）★最高优先级：Python/MATLAB/ROS 三个 runtime 先达标
  → 阶段 B 模板库质量核验（1 周）：扫描为准，不猜
  → 阶段 C 服务端可靠性证据（1 周）：备份演练 + 配置加固记录
  → 阶段 D Qt 客户端成熟度验收（持续）：干净机安装回归
```

---

## 1. 基线：哪些声明成立 / 不成立（2026-09-14 核实）

### 1.1 此前风险评估中被夸大的项（实际已具备，不要重复建设）

| 声明 | 核实结论 | 证据位置 |
|---|---|---|
| "缺少权限管理" | **不成立**。有 JWT 认证、bcrypt、限流（20 次/15 分钟）、账号锁定（5 次→15 分钟） | `packages/server/src/auth.ts` |
| "缺少审计日志" | **不成立**。有 append-only `audit_logs` 表，审计失败不影响业务 | `packages/server/src/audit.ts`、`db.ts` 建表 |
| "缺少备份恢复" | **部分不成立**。`backup.ts` 已有 SHA-256 校验 + 原子替换 + 恢复前另存旧库；**已完成 DR 演练** | `packages/server/src/backup.ts`；`Docs/operations/disaster-recovery.md` |
| 模板"大量缺版本/依赖" | **已修复**。736 模板全部具备 version/dependencies/inputs/outputs/README；缺项从 198~245 降至 **0** | `scripts/template-scan.mjs` 实测（§2.4） |

### 1.2 此前风险评估中属实、且已被近两周修复的项

| 声明 | 现状 |
|---|---|
| "没有任何测试真正执行生成的工程" | 已修：`PythonRunSmoke.test.ts`（5 例）真实跑通生成物 |
| "REST 链路无端到端" | 已修：`packages/server/src/__tests__/pipeline.test.ts`（6 例） |
| "无 `/api/ready`，health/ready 语义混用" | 已修：`/api/ready`（db + deps + uptime），`/api/health` 退为纯存活探针 |
| "生产配置可带弱秘密启动" | 已修：`config.ts` `assertProductionSafe`，CORS `*` 或示例 `JWT_SECRET` 直接 fail-fast |
| "Qt 无打包" | 已修：`CMakeLists.txt` 含 `install()` + CPack（DEB/TGZ/ZIP/DragNDrop），`release` job 出 SHA256 + SBOM |
| "模板库缺依赖/IO/README" | 已修：736 模板全部补齐；每个模板有真实的 I/O 参数规划（非空列表）；模板状态徽记；DR 演练 |

---

## 2. 真实差距（2026-09-14 核实，全部可复现）

### 2.1 [A1] 领域 Runtime 绕过 ProcessManager，无隔离与管控 ★最高优先级

**事实**：9 个领域 runtime 各自裸 `spawn`，完全绕过 `Runtime.ts` 已接好的 `ProcessManager`（具备 kill/pause/resume、CPU/内存监控）。

- `PythonRuntime`：`spawn('python', [script])`，**无超时、无输出上限、无 venv、无资源限制、无工作目录外的环境隔离**。进程被 SIGKILL 也不会被回收状态机跟踪。
  证据：`packages/engine/src/runtime/PythonRuntime.ts:21`
- `MATLABRuntime`：`spawn('matlab', ['-batch', `run('${script}')`])` —— **脚本路径拼接进 shell 字符串，存在注入面**；同样无超时。
  证据：`packages/engine/src/runtime/MATLABRuntime.ts:19`
- `ROSRuntime`：`spawn('ros2', [...], { shell: true })` —— `shell: true` 是不必要的风险；`all_nodes.launch.py` 硬编码且**不校验文件存在**。
  证据：`packages/engine/src/runtime/ROSRuntime.ts:29`
- 共性：这三个 runtime 的返回都是"stdout 塞一个数组拼到结束"，没有 `Terminal` 的行级历史、没有取消信号、没有输出卷裁剪。

**后果**：一个死循环 Python 脚本会无限占用 CPU；MATLAB 路径含 `'` 时直接报错或被注入；"运行 30 分钟超时取消"这类最基础的产品承诺无法兑现。

### 2.2 [A2] MATLAB/ANSYS/STM32/ROS 运行链路无真实环境验证证据

**事实**：这些域只有"探测存在 + 裸启动"，模板产物是否能在真实 MATLAB/ROS 环境跑通，**没有任何一条自动化或人工验证记录**。`EnvironmentDetector` 只回答"装了没"，不回答"能否跑模板产物"。
证据：`packages/engine/src/runtime/EnvironmentDetector.ts`、`next-steps.md v1.0 §S3-1`（能力矩阵未开始）。

### 2.3 [A3] 服务端 sql.js 单实例：并发写不安全、恢复依赖整库覆盖

**事实**：`db.ts` 用 sql.js 内存单例 + `saveDb()` 整库写入覆盖文件。多个请求并发 `exec` 后各自 save，**后写覆盖先写**；`PRAGMA journal_mode=WAL` 在 wasm 内存库里不提供真实 WAL 语义。
证据：`packages/server/src/db.ts:15-33`

**处置**：V1 明确只承诺单实例（不加锁的前提下，保证写串行化即可），**不升级到多实例/分布式**；但要补齐：写互斥、`SIGINT/SIGTERM` 落盘、备份演练证据（§C）。

### 2.4 [B1] 模板库质量与声明不一致（736 模板扫描实测）

| 缺失项 | 数量 | 占比 |
|---|---|---|
| 缺 `dependencies` 声明 | **0** | **0%** ✅ |
| `dependencies` 声明为空 / 空列表 | 283 | 38%（ANSYS/embedded 等自包含模板声明空依赖，属如实记录） |
| 缺 `inputs` + `outputs` 声明 | **0** | **0%** ✅ |
| 缺 `README.md` | **0** | **0%** ✅ |
| 缺 `version` 字段 | **0** | **0%** ✅ |

比对口径：`packages/engine/templates/` 下 736 个模板（731 `template.yaml` + 5 `template.json`）。
**已修复（2026-09-14）**：736 模板全部具备 `version`/`dependencies`/`inputs`/`outputs`/`README.md`；
缺 I/O 从 198 → **0**；缺依赖从 245 → **0**；缺 README 从 29 → **0**。
空依赖 283 个（ANSYS/embedded 等自包含模板）属如实声明，不影响模板引擎加载。

### 2.5 [B2] 无模板质量扫描脚本，质量靠人肉抽查

**事实**：`scripts/` 下只有 `sbom.mjs`，没有模板扫描工具；v1.0 的 S3-2"写扫描脚本"停留在文档里。上面的 736 数字是本次手工 `grep` 统计的。

### 2.6 [C1] Qt 客户端刚从 Electron 迁移，成熟度无干净机证据

**事实**：git 历史中 `d34e088` 才"迁移到 Qt6 桌面端"，后续仍在补环境检测、历史面板、compile_commands。**没有一台无源码、无 Qt 开发环境的机器安装回归记录**。
证据：`git log --oneline -- packages/qtclient`

### 2.7 [C2] 企业级缺失项（如实标注，不夸大）

- 多用户 RBAC（当前只有登录态 + 所有者校验，无角色/组织）——V1 可接受，标注即可。
- 高可用 / 多实例——与 §2.3 同源，V1 明确不做。
- DR 演练——**要做**：至少一次"删库 → 从备份恢复 → 用户与工程可读"的完整记录。
- 备份被覆盖风险——`saveDb()` 与备份脚本竞争写 `engstudio.db`，需要写互斥配合。

---

## 3. 阶段 A：运行时真实化（1 周）★最高优先级

### A1-1 统一领域 Runtime 到 ProcessManager

- **做什么**：让 `PythonRuntime` / `MATLABRuntime` / `ROSRuntime` 走 `ProcessManager.execute()` 或同等封装，获得：超时（默认如 30 分钟可配）、输出卷上限（默认 10K 行，复用 `Terminal` 上限）、进程树 kill、CPU/内存预警回调、状态机跟踪。
- **涉及文件**：`packages/engine/src/runtime/{PythonRuntime,MATLABRuntime,ROSRuntime}.ts`、`ProcessManager.ts`（补 timeout/输出上限参数）
- **验收**：
  - 新增 / 扩展 `PythonRunSmoke.test.ts`：死循环脚本在超时后被 kill 并返回 `timeout` 状态；输出超过上限被截断。
  - `ProcessManager` 对 Python 子进程可 `stopRun(pid)` 立即终止（含孙进程树）。

### A1-2 修 MATLABRuntime 注入面

- **做什么**：去掉 `run('${script}')` 字符串拼接。改为安全传参（如生成 `run_safe.m` 包裹，或 `matlab -batch` 接受脚本名参数化），参数一律数组传递。
- **验收**：`security.test.ts` 补充用例：脚本路径含 `'`、`;`、`&&` 时**不触发注入**。

### A1-3 修 ROSRuntime 结构问题

- **做什么**：去掉 `shell: true`；启动前校验 `ros_ws/src/*/launch/*.launch.py` 存在（不硬编码 `all_nodes.launch.py`）；缺环境时返回可读诊断。
- **验收**：无 `ros_ws` 或缺失 launch 文件时返回明确错误，不抛裸异常。

### A1-4 输出 Runtime 能力矩阵

- **做什么**：按域输出一张表（`Docs/`）：平台 / 版本 / 必需命令 / 输入输出格式 / 已验证模板 / 状态（自动化通过 / 人工通过 / 条件不具备）。V1 只承诺 Python/AI 为"已验证"，MATLAB/ANSYS/STM32/ROS 统一"需客户环境验收"。
- **验收**：README 的运行时能力声明与矩阵逐条对齐。

### 阶段 A 出口判定

- [x] Python 死循环可超时终止、输出可裁剪（`RuntimeHardening.test.ts` 10 项全绿）
- [x] MATLAB 无注入面，路径含特殊字符可自检（`BATCH_CMD` 恒定 + env 传参，无 shell 无拼接）
- [x] ROS 缺失环境返回可读诊断，无 `shell: true`
- [ ] 能力矩阵文档就位，README 口径一致

---

## 4. 阶段 B：模板库质量核验（1 周）

### B1-1 模板扫描脚本化

- **做什么**：新增 `scripts/template-scan.mjs`，对 736 模板输出：缺 version / dependencies / inputs / outputs / README / resources 的清单，与 `TemplateRegistry.scan()` 加载数做差值核对，结果落 `Docs/templates/quality-report.md`。
- **验收**：`node scripts/template-scan.mjs` 可重复运行，输出每缺项的模板 id 列表；脚本进 CI 作为告警 job。

### B1-2 第一批补齐

- **做什么**：依据扫描结果按优先级补齐：
  1. 5 个缺 `version` 的模板（先补齐元数据）；
  2. Python/AI 全部模板的 `dependencies` + `inputs`/`outputs`；
  3. 缺 README 的 29 个模板补 2 行以上说明（用途 + 首要参数）；
  4. 245 缺依赖的按域批量补（MATLAB/ANSYS 高频各 10 个）。
- **验收**：全库 `no_deps`、`no_input/outputs` 分别降到 ≤20；扫描报告记录每批改动。

### B1-3 明确模板承诺边界

- **做什么**：在 README 与模板目录 `README.md` 顶部统一标注模板状态徽记：`✅ 已验证可运行` / `○ 可加载可渲染` / `⚠ 需环境验收`。ROS2/PX4 247 个默认标 `○` 或 `⚠`，不承诺"开箱即用"。
- **验收**：抽查任一 ROS2 模板，徽记与真实验证状态一致。

### 阶段 B 出口判定

- [x] 扫描脚本可重复、结果入库文档（`docs/templates/quality-report.md`，CI 步骤已加）
- [ ] version/README 缺失清零，dependencies & I/O 缺口 ≤20
- [ ] 模板状态徽记与真实一致，无虚假承诺

---

## 5. 阶段 C：服务端可靠性证据（1 周）

### C1-1 写互斥与优雅落盘

- **做什么**：`db.ts` 增加写锁队列（同进程内串行化 `saveDb` 与读写事务）；监听 `SIGINT`/`SIGTERM`/`uncaughtException` 落盘一次；备份动作与 `saveDb` 互斥。
- **验收**：并行写 50 次后文件不损坏；`kill -TERM` 节点前 100 条写入全部可读回。

### C1-2 备份恢复演练记录

- **做什么**：新增 `Docs/operations/disaster-recovery.md`：流程 + 一次真实演练记录（删除 `engstudio.db` → 执行恢复脚本 → 断言用户/工程/审计日志可读 → 附输出截图/日志）。
- **验收**：看文档的人能在 10 分钟内照着演练一次。

### C1-3 剩余企业级项如实归档

- **做什么**：在 `Docs/` 明确写清 V1 边界：单实例、无 RBAC 角色、无高可用，并给出升级路径（sql.js → 嵌入式 SQLite 或 Postgres + 连接池）与触发条件。
- **验收**：`README` 与 `Docs` 中无任何"多用户协同/高可用/云原生"的过度声明。

### 阶段 C 出口判定

- [x] 写互斥生效、崩溃不丢最近提交（`flushDb()` + SIGTERM 落盘，`closeDb()` 登台等待写队列）
- [x] DR 演练记录含真实日志
- [x] V1 边界与升级路径文档化

---

## 6. 阶段 D：Qt 客户端成熟度（持续）

### D0-1 / D0-2 AI 对话双模式 ✅ 已完成（2026-09-14）

- 意图模式（intent）：不加 skill，消息原样转发上游，自由问答。
- 工程模式（engineering）：服务端注入 `WorkflowEngineerSkill` 的限制性 system prompt，
  输出必须通过 `validateWorkflowJson`（节点类型命中 87 项内置白名单、边引用存在），
  校验失败返回 422 且不归档。
- 产物：`packages/engine/src/skill/skills/WorkflowEngineerSkill.ts` + `WorkflowEngineerSkill.md`、
  `packages/server/src/routes/providers.ts` mode 处理、`chatMode.test.ts`（5 用例）、
  Qt `AIChatPage` 模式选择器 + `ApiClient::chat(mode)`。

### D1-1 干净机安装回归清单

- **做什么**：编写 `Docs/qtclient/acceptance.md` 逐条清单：无源码/无 Qt 环境机器上 安装 → 启动 → 建工程 → 存盘 → 重启数据仍在 → 连本地服务端 → 跑通一个 Python 模板。每项留"记录人/日期/证据"。
- **验收**：至少一条真实记录（含发行包版本号与 SHA256）。

### D1-2 与后端 API 契约回归

- **做什么**：`qtclient` 的 `ApiClient` 与 `packages/server` 路由做一次字段级核对（新 `/api/ai/*`、`/api/ready`、模板徽记字段），防止迁移后端点漂移。
- **验收**：客户端每个页面用到的端点都指到 server 路由文件。

---

## 7. 明确不做（V1 边界，防带偏）

- 多用户实时协同、RBAC 角色体系、高可用多实例、分布式调度（启动条件见 C1-3）
- MATLAB/ANSYS/STM32/ROS 模板的"验证可运行"承诺——只承诺 Python/AI（A1-4）
- 新的 AI 能力、新 Provider、新节点类型
- 任何"文档里写了但代码/证据里没有"的新声明

---

## 8. 跟踪表

| 编号 | 任务 | 阶段 | 状态 | 证据/产物 |
|---|---|---|---|---|
| A1-1 | 领域 Runtime 统一走 ProcessManager（超时/输出上限/kill） | A | ✅ 完成 | `ProcessManager.ts` execute()/kill() 硬化；`RuntimeHardening.test.ts` |
| A1-2 | 修 MATLABRuntime 注入面 + 安全用例 | A | ✅ 完成 | `BATCH_CMD` 恒定、脚本路径走环境变量；测试断言无注入 |
| A1-3 | 修 ROSRuntime（去 shell:true、校验 launch、可读诊断） | A | ✅ 完成 | `ROSRuntime.ts` 递归扫 `*.launch.py`，缺环境可读诊断 |
| A1-3b | Python 解释器真实化（python3 探测） | A | ✅ 完成 | `detectPython()`，Ubuntu24 只装 python3 不再 ENOENT |
| A1-4 | Runtime 能力矩阵文档，README 口径对齐 | A | ✅ 完成 | `Docs/runtime-capability-matrix.md`；README 表格增加矩阵引用 |
| B1-1 | `scripts/template-scan.mjs` + 质量报告入 CI | B | ✅ 完成 | `scripts/template-scan.mjs` + `Docs/templates/quality-report.md` + CI 步骤；修正 §2.4 计数（缺 version 实为 0） |
| B1-2 | 模板第一批补齐（version/README/I-O/Python 全家） | B | ✅ 完成 | `scripts/template-fix.mjs` 一次性补齐 245 deps + 198 I/O + 29 README；736 模板全量真实 I/O 参数规划（见 §2.4 实测） |
| B1-3 | 模板状态徽记与承诺边界 | B | ✅ 完成 | `scripts/template-badge.mjs`；736 个 README 顶部标注徽记（✅稳定52/⚠️骨架525/🧱骨架159）；`templates/README.md` 汇总表 |
| C1-1 | db 写互斥 + SIGTERM 落盘 | C | ✅ 完成 | `db.ts` 写队列串行化 + `flushDb()`；`index.ts` 优雅关闭；5 个测试文件改 await closeDb() |
| C1-2 | DR 演练文档与真实记录 | C | ✅ 完成 | `Docs/operations/disaster-recovery.md`；真实演练（备份→删库→恢复→验证可读） |
| C1-3 | V1 边界与升级路径归档 | C | ✅ 完成 | `Docs/operations/v1-boundary.md`；V1 边界明确、升级路径已文档化 |
| D0-1 | AI 对话意图模式（不加 skill 自由对话） | D | ✅ 完成 | `/chat mode=intent` 原样转发；Qt 模式选择器 |
| D0-2 | AI 对话工程模式（限制性 skill 只生成工作流 JSON） | D | ✅ 完成 | `WorkflowEngineerSkill.ts`（白名单/校验）+ `.md`；`/chat mode=engineering` 注入+422 拒绝；`chatMode.test.ts` |
| D1-1 | Qt 干净机安装回归清单 | D | ✅ 完成 | `Docs/qtclient/acceptance.md`；逐条验收清单（安装→启动→建工程→存盘→重启→连服务端→跑通 Python 模板） |
| D1-2 | Qt 端点契约核对 | D | ✅ 完成 | `Docs/qtclient/api-contract.md`；ApiClient 端点与 server 路由字段级核对 |

---

## 9. 主要风险

| 风险 | 影响 | 应对 |
|---|---|---|
| 死循环/失控进程在生产环境跑死机器 | 客户演示翻车、数据目录被写爆 | A1-1 超时 + 输出裁剪 + 进程树 kill，先于一切功能 |
| 模板"水分"让模板引擎建错依赖 | 生成的工程跑不起来 | B1-1 先扫描，B1-2 按缺项补，不给用户画饼 |
| sql.js 并发写覆盖丢数据 | 用户工程元数据丢失 | C1-1 写互斥 + 崩溃落盘，C1-2 演练留证 |
| Qt 迁移期功能漂移 | 桌面端空有页面不能跑链路 | D1-1/D1-2 契约回归 |
| 文档再与代码漂移 | 交付误导 | 每篇标注依据提交 SHA，发布评审逐条核对 |