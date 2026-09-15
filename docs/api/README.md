# EngStudio REST API 接口文档

> 文档版本：2.0（2026-09-14 重写）
> 依据提交：本次 `/api/ready` 与配置自检上线后的代码
> 代码位置：`packages/server/src/`（路由在 `src/routes/`，装配在 `src/app.ts`）

---

## 1. 通用约定

| 项 | 约定 |
|---|---|
| 根路径 | `http://<host>:3456/api`（端口由 `PORT` 配置，默认 3456） |
| 编码 | 请求与响应均为 `application/json; charset=utf-8` |
| 请求体上限 | 10 MB（`express.json({ limit: '10mb' })`） |
| 认证 | 除标注「公开」的端点外，均需请求头 `Authorization: Bearer <token>` |
| 安全头 | Helmet；CORS 走 `CORS_ORIGINS` 白名单；`FORCE_HTTPS=1` 时强制 HTTPS |
| 限流 | `/api/auth/*` 为 20 次 / 15 分钟（`/api/auth/local` 不受限，供客户端每次启动调用） |
| 日志 | morgan `combined` → Winston |

### 1.1 响应与错误格式

成功：由各端点定义（多为资源对象或数组）。
失败：统一为

```json
{ "success": false, "error": "错误描述" }
```

引擎类端点（`/api/engine/*`）额外返回节点级细节：

```json
{ "success": false, "errors": [{ "message": "…", "nodeId": "n1", "edgeId": "e1" }] }
```

### 1.2 状态码

| 状态码 | 含义 |
|---|---|
| 200 | 成功 |
| 400 | 请求体校验失败（Zod 校验不通过） |
| 401 | 未提供 token / token 无效或过期 |
| 404 | 路由不存在，或资源不属于当前用户 |
| 409 | 资源冲突（如用户名或邮箱已注册） |
| 429 | 触发限流 |
| 500 | 未处理的服务端异常（统一隐藏内部细节） |
| 503 | `/api/ready` 报告数据库不可用 |

---

## 2. 健康检查

| 方法 | 路径 | 鉴权 | 说明 |
|---|---|---|---|
| GET | `/api/health` | 公开 | **进程存活**，永远 200 |
| GET | `/api/ready` | 公开 | **综合就绪**：数据库可查询 + 关键外部依赖 |

`/api/ready` 响应示例：

```json
{
  "service": "engstudio-server",
  "status": "ready",
  "db": { "ok": true },
  "deps": {
    "python": { "ready": true, "path": "/usr/bin/python3", "version": "Python 3.12.3" }
  },
  "uptimeSeconds": 42
}
```

`status` 取值与语义：

| 值 | 含义 | HTTP |
|---|---|---|
| `ready` | 数据库可用且 Python 已就绪 | 200 |
| `degraded` | 数据库可用但 Python 缺失（V1 主链路不可用，工程浏览不受影响） | 200 |
| `unavailable` | 数据库不可用 | 503 |

> 语义必须分离：`/api/health` 不因依赖缺失而变 5xx，否则反向代理会在依赖缺失时反复重启一个其实健康的进程。

---

## 3. 认证 `/api/auth`

| 方法 | 路径 | 鉴权 | 请求体 | 说明 |
|---|---|---|---|---|
| POST | `/local` | 公开 | — | 本机会话，返回 `{ user, token, local: true }`；桌面客户端启动时调用 |
| POST | `/register` | 公开 | `{ username, email, password }` | 注册并返回 token；密码需同时含大小写字母与数字且 ≥ 8 位 |
| POST | `/login` | 公开 | `{ username, password }` | 登录并返回 token |
| POST | `/logout` | Bearer | — | 使当前 token 失效 |
| GET | `/me` | Bearer | — | 返回当前用户信息 |

---

## 4. 工程 `/api/projects`

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/` | 当前用户的工程列表 |
| GET | `/root` | 工程根目录路径 |
| POST | `/` | 创建工程：`{ name, description, path?, domains?, workflow? }` |
| POST | `/import` | 从目录导入工程 |
| GET | `/:id` | 工程详情 |
| POST | `/:id/open` | 打开工程（记录最近打开） |
| PUT | `/:id` | 更新工程：`{ name?, description?, workflow_data? }` |
| DELETE | `/:id` | 删除工程 |

工程按 `user_id` 隔离：查询与修改只会命中当前 token 所属账号的数据。

---

## 5. 引擎 `/api/engine`

| 方法 | 路径 | 请求体 | 说明 |
|---|---|---|---|
| POST | `/validate` | `{ workflow, projectPath? }` | 结构、连线、参数与端口校验，返回 `errors` / `warnings` |
| POST | `/compile` | 同上 | 编译为 `ExecutionPlan` |
| POST | `/generate` | `{ plan, projectPath? }` | 生成工程目录与 `execution_plan.json` |
| POST | `/run` | `{ plan?, projectPath?, domain? }` | 按执行计划运行 |
| POST | `/stop` | `{ pid? }` | 停止任务 |
| GET | `/tasks` | — | 任务列表 |
| GET | `/tasks/:pid` | — | 单个任务状态、退出码与资源占用 |

`workflow` 结构：`{ id?, name?, project_id?, nodes: [...], edges?: [...] }`，`nodes` 至少 1 个。

典型调用顺序：`validate → compile → generate → run`，每一步都用上一步的返回作为输入。

---

## 6. 环境 `/api/env`

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/check` | 批量探测：`{ domains: ["python", "matlab", ...] }` |
| GET | `/:domain` | 单个领域探测（`python` / `matlab` / `stm32` / `ansys` / `ros2`） |

响应：

```json
{ "ready": true, "path": "/usr/bin/python3", "version": "Python 3.12.3" }
```

未安装时：`{ "ready": false, "reason": "Python not found in PATH" }`。

---

## 7. 节点 `/api/nodes`

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/` | 全部 87 个节点类型 |
| GET | `/categories` | 分类（客户端 `Taxonomy.cpp` 据此渲染节点面板） |
| GET | `/search` | 关键词搜索 |

---

## 8. 插件 `/api/plugins`

| 方法 | 路径 | 请求体 | 说明 |
|---|---|---|---|
| GET | `/` | — | 已安装插件 |
| GET | `/market` | — | 市场插件 |
| POST | `/install` | `{ id }` | 安装 |
| POST | `/uninstall` | `{ id }` | 卸载 |
| POST | `/enable` | `{ id }` | 启用 |
| POST | `/disable` | `{ id }` | 禁用 |

---

## 9. Provider `/api/providers`

| 方法 | 路径 | 请求体 | 说明 |
|---|---|---|---|
| GET | `/` | — | 当前用户的 Provider 列表 |
| POST | `/` | `{ name, providerType, baseUrl?, model?, apiKey? }` | 新增 |
| PUT | `/:id` | 同上 + `enabled` | 修改 |
| DELETE | `/:id` | — | 删除 |
| POST | `/configure` | `{ id, name, providerType, baseUrl, model, apiKey }` | 配置并设为当前 |
| POST | `/:id/test` | — | 连通性测试 |
| POST | `/chat` | `{ providerId, messages, model?, conversationId? }` | 对话；`conversationId` 为空时新建一条历史对话 |

---

## 10. AI 对话历史 `/api/ai`

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/conversations` | 当前账号的对话列表，支持 `?q=关键词` 全文搜索标题与正文 |
| GET | `/conversations/:id` | 单条对话的完整消息 |
| DELETE | `/conversations/:id` | 删除对话（级联删除消息） |

归档规则见 `Docs/architecture/system-design.md` §3：客户端照旧发送完整上下文，服务端只把新增的一问一答落库，首条用户消息自动作为标题。

---

## 11. 模板 `/api/templates`

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/` | 模板列表 |
| GET | `/tree` | 按目录树组织 |
| GET | `/search` | 关键词搜索 |
| GET | `/search/rag` | **语义混合检索**（向量 + 关键词 + 元数据过滤） |
| GET | `/stats` | 统计信息（总数、按前缀分布） |
| GET | `/:id` | 模板详情 |

### 11.1 语义混合检索 `GET /api/templates/search/rag`

用 bge-small-zh 语义向量 + BM25 关键词 + 元数据过滤做 **RRF 融合**：

| 参数 | 类型 | 说明 |
|---|---|---|
| `q` | string | 必填，检索意图（支持中文/英文） |
| `topK` | number | 默认 6，上限 20 |
| `category` | string | 过滤：模板分类 |
| `language` | string | 过滤：`python` / `matlab` / `c++` 等 |
| `status` | string | 过滤：`stable` / `warn` / `skeleton` |
| `runtimeType` | string | 过滤：运行时类型 |

返回 `results[]`，每项含 `id/name/description/category/language/status/tags/inputs/outputs/score`。
`score` 由语义(`semantic`)与关键词(`keyword`)两路 RRF 秩相加得出。

向量索引在首次请求时构建（联网下载模型到 hf-mirror），之后落盘 `packages/engine/templates/.template-index.json` 增量复用；
离线部署可先用 `node scripts/build-template-index.mjs` 预构建，服务端启动后零网络开销。

> 该端点被 `/chat` 工程模式复用：检索命中的模板 id 会注入 system prompt，
> 并要求模型在输出的工作流节点里引用（否则判定为防幻觉失败并拒绝）。

---

## 12. 管理接口 `/api/admin`

> 这一组能整体替换数据库，**默认关闭**：需设置 `ENGSTUDIO_ALLOW_ADMIN=true` 并重启服务；
> 未开启时带有效 token 访问也返回 `403`。路由要求先通过 JWT 鉴权。

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/backup` | 创建备份：导出整库字节 + 写 `.json` 清单（大小 / sha256 / 时间 / 备注） |
| GET | `/backups` | 备份列表（按时间倒序） |
| POST | `/restore` | 从备份恢复，body 需 `{ filename, confirm }`，两者必须一致 |
| GET | `/audit?limit=50` | 最近审计日志（倒序，limit 夹在 1–500） |

恢复流程：校验文件名（`engstudio-*.db` 白名单，拒绝路径穿越）→ 校验 sha256 与清单一致 → 把当前库另存为 `engstudio.db.pre-restore-<时间戳>` → 整文件替换 → 丢弃内存中的旧库并重新初始化。校验不通过直接拒绝，**不会**覆盖成坏库。

审计记录 `admin.backup` / `admin.restore` 及认证、工程增删改等动作，见 `src/audit.ts`。

---

## 13. 端点总数

11 个业务模块共 **51 个端点**，加 `/api/health`、`/api/ready` 共 **53 个**。

| 模块 | 端点数 |
|---|---|
| admin | 4 |
| auth | 5 |
| projects | 8 |
| engine | 7 |
| env | 2 |
| nodes | 3 |
| plugins | 6 |
| providers | 7 |
| ai | 3 |
| templates | 6 |
| health / ready | 2 |

---

## 14. 启动与配置自检

服务启动顺序（`src/index.ts`）：读取并 Zod 校验配置 → 生产安全自检 → 初始化数据库与迁移 → 装配应用 → 监听端口。

生产环境（`NODE_ENV=production`）不满足以下基线将**直接启动失败**：

- `CORS_ORIGINS` 含 `*`
- `JWT_SECRET` 仍是 `.env.example` 里的示例值

未配置 `SSL_KEY_PATH` / `SSL_CERT_PATH` 且未开 `FORCE_HTTPS` 时只告警（允许由反向代理终止 TLS）。

布尔开关（`FORCE_HTTPS`、`ENGSTUDIO_ALLOW_ADMIN`）**不用 `z.coerce.boolean()`**：它会走 `Boolean(value)`，
于是 `FORCE_HTTPS=false` 会被解析成 `true`，生产环境直接把所有请求 301 到 https。
现在只把 `true` / `1` 当开，其余一律关（见 `src/config.ts`）。
