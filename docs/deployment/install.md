# EngStudio 安装与部署手册

> 文档版本：1.0
> 整理日期：2026-09-14
> 依据：仓库当前代码（`packages/server/src`、`packages/qtclient/CMakeLists.txt`、`.github/workflows/ci.yml`）。发行前请按实际版本号替换下文的 `1.0.0`。

---

## 0. 先选部署形态

| 形态 | 适用 | 包含内容 |
|---|---|---|
| **桌面客户端**（Qt6） | 单机使用、工程师本机 | 图形界面，可直连本地/远端服务端 |
| **服务端**（Node.js） | 团队共享、需要账号与工程存储 | REST API（默认端口 3456）+ sql.js 数据库 |

两者版本一致：桌面端二进制里的版本号由 `-DENGSTUDIO_VERSION` 编译进（定义在 `packages/qtclient/CMakeLists.txt`），发行包文件名与 Git 标签（`v*`）一致。

---

## 1. 校验产物（必做）

每个发行包都附带 `SHA256SUMS.txt` 与 `sbom.cdx.json`：

```bash
sha256sum -c SHA256SUMS.txt          # 全部 OK 才继续
```

`sbom.cdx.json` 是 CycloneDX 1.5 物料清单，覆盖**服务端 npm 运行期依赖**；Qt 客户端的系统依赖（Qt6 等）不在其中，以 DEB 包的 `Depends` 字段为准。

---

## 2. 桌面客户端

### Linux（DEB，推荐）

```bash
sudo apt install ./engstudio-1.0.0-linux-x86_64.deb
engstudio                      # 可执行文件安装到 /usr/bin
```

卸载：`sudo apt remove engstudio`

### Linux（TGZ，免 root）

```bash
tar -xzf engstudio-1.0.0-Linux-x86_64.tar.gz
./engstudio-1.0.0-Linux-x86_64/bin/engstudio
```

TGZ 不含系统依赖，需自行安装 Qt6 运行库：

```bash
sudo apt install libqt6widgets6 libqt6network6 libgl1
```

### Windows / macOS

- Windows：解压 ZIP 后运行 `bin/engstudio.exe`（未做 `windeployqt` 打包，需目标机器已装 Qt6 运行库并加入 `PATH`）。
- macOS：打开 DMG，把 `engstudio.app` 拖入 `Applications`；首次运行若提示"来自未识别开发者"，右键 → 打开。

---

## 3. 服务端

### 3.1 运行

```bash
node -v            # 需 >= 20
pnpm install --frozen-lockfile
pnpm -r run build
NODE_ENV=production pnpm --filter server start
```

### 3.2 必配环境变量

| 变量 | 必填 | 说明 |
|---|---|---|
| `JWT_SECRET` | 是 | ≥ 32 位随机字符串；生产环境沿用示例值会**直接拒绝启动**（见 §3.4） |
| `PORT` | 否 | 默认 `3456` |
| `CORS_ORIGINS` | 是（生产） | 逗号分隔白名单，生产环境含 `*` 会拒绝启动 |
| `ENGSTUDIO_DATA_DIR` | 否 | 数据库与备份目录，默认 `packages/server/data` |
| `ENGSTUDIO_ALLOW_ADMIN` | 否 | 置 `true` 才开启备份/恢复/审计查询接口（见 §3.5） |
| `OPENAI_API_KEY` / `DASHSCOPE_API_KEY` / `ANTHROPIC_API_KEY` | 否 | AI 能力所需 |

### 3.3 健康检查

| 端点 | 语义 | 用途 |
|---|---|---|
| `GET /api/health` | 进程存活，**永远 200** | 存活探针；不要用它判断依赖就绪 |
| `GET /api/ready` | 数据库可查 + `python3` 可用；仅**数据库不可用返回 503** | 就绪探针 / 反向代理摘流量 |

### 3.4 启动自检（fail-fast）

`NODE_ENV=production` 时，以下情况进程直接退出并打印原因，而不是带病上线：

- `CORS_ORIGINS` 含 `*`
- `JWT_SECRET` 为示例默认值
- 未配置 TLS 且未开启 `FORCE_HTTPS`（仅告警：允许由反向代理终止 TLS）

### 3.5 备份与恢复

开启管理员接口后（`ENGSTUDIO_ALLOW_ADMIN=true`，需带登录后的 JWT）：

```bash
# 备份：返回文件名、大小、sha256
curl -X POST http://localhost:3456/api/admin/backup -H "Authorization: Bearer $TOKEN"

# 列出备份
curl http://localhost:3456/api/admin/backups -H "Authorization: Bearer $TOKEN"

# 恢复：校验 sha256 后整体替换数据库文件（会先把当前库另存为 .pre-restore-<ts>）
curl -X POST http://localhost:3456/api/admin/restore \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"filename":"engstudio-2026-09-14T05-30-00-000Z.db"}'
```

备份文件位于 `$ENGSTUDIO_DATA_DIR/backups/`。**恢复前建议手工复制一份当前库**，恢复动作会重建内存中的数据库实例，期间不要并发写入。

### 3.6 审计日志

敏感操作（注册、登录成功/失败、登出、工程增删改、备份、恢复）写入 `audit_logs` 表，可通过 `GET /api/admin/audit?limit=50` 查询（同样需要管理员开关与 JWT）。日志只追加不修改，用于事后追溯。

---

## 4. 已知限制

- 服务端使用 sql.js（单文件数据库），**只支持单实例部署**，不提供多用户实时协同与高可用。
- `python3` 缺失时 `/api/ready` 仍返回 200（只有数据库不可用才 503），但生成工程的运行会失败——部署后请确认 `/api/ready` 的 `deps.python3` 为 `true`。

---

## 5. 卸载与数据清理

```bash
rm -rf "$ENGSTUDIO_DATA_DIR"     # 默认 packages/server/data，含数据库与 backups/
```

---

## 6. 相关文档

- `README.md`：项目总览与开发命令
- 有问题或建议，欢迎到 [GitHub Discussions](https://github.com/wyyy520/ES/discussions) 交流
