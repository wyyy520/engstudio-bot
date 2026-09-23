# 使用指南

从安装到跑通第一个工作流，全程约 5 分钟。本指南面向**不使用代码**的用户，所有步骤都有说明。

---

## 1. 安装客户端

从 [下载页](/download) 获取安装包并安装：

```bash
# Linux / Debian / Ubuntu 系
sudo apt install ./engstudio-1.0.5-linux-x86_64.deb
```

安装完成后，在应用菜单或终端执行 `engstudio` 启动客户端。

---

## 2. 启动后端服务（重点！）

EngStudio 由「**桌面客户端** + **本地后端服务**」两部分组成，两者必须同时运行。

客户端启动后，进入 **Dashboard（仪表盘）** 页面，页面顶部会显示**后端启动命令**，并提供两种启动方案（A / B 可切换）：

### 方案 A：原地启动（推荐，目录可写时可用）

在软件安装目录直接启动，无需额外操作：

```bash
cd ~/.engstudio/server && ENGSTUDIO_DATA_DIR=~/.engstudio/data ENGSTUDIO_LOCAL=1 npm install && node dist/index.js
```

### 方案 B：用户目录副本（系统目录不可写时自动选择）

deb 把后端装到 `/usr/share/engstudio/server`（root 拥有），普通用户无法在那里安装依赖。此时 Dashboard 会自动切换为**方案 B**，使用 `~/.engstudio/server` 的用户目录副本。

**首次使用（必须执行，一次性）**——把 Dashboard 复制的命令粘到终端执行，会先复制 + 授权 + 装依赖：

```bash
mkdir -p ~/.engstudio && sudo cp -r /usr/share/engstudio/server ~/.engstudio/server && sudo chown -R $USER ~/.engstudio/server && cd ~/.engstudio/server && ENGSTUDIO_DATA_DIR=~/.engstudio/data ENGSTUDIO_LOCAL=1 npm install && node dist/index.js
```

**之后每次使用**（依赖已装好，更快）：

```bash
cd ~/.engstudio/server && ENGSTUDIO_DATA_DIR=~/.engstudio/data ENGSTUDIO_LOCAL=1 node dist/index.js
```

### 两种方案的共同点

- 所有启动命令都通过 `ENGSTUDIO_DATA_DIR` 指向**同一个数据目录** `~/.engstudio/data`，无论用哪种方式启动，你的对话记录、供应商配置、项目都**互通**，不会出现"换个启动方式数据就消失"。
- `ENGSTUDIO_LOCAL=1` 代表**一键本地模式**：服务端自动生成临时密钥，免去手工配置 `JWT_SECRET`，新手开箱即可用。
- `npm install` 只需**第一次**运行（约 1-3 分钟，请等待完成）；之后直接执行 `node dist/index.js` 即可。
- 看到类似输出即表示后端已就绪：

```
EngStudio server listening on http://localhost:3456
```

### 如何判断后端已就绪

- Dashboard 页面右上角状态灯变为 **绿色「已连接」**
- 或打开浏览器访问 `http://localhost:3456/api/health`，显示 `{"status":"ok"}` 即正常

> 如果状态一直显示「未连接」，先确认上一步的启动命令已在终端执行、且没有报错。

---

## 3. 快速体验

后端连上后，就可以开始搭建你的第一个工程流水线了：

1. 左侧「节点面板」选择模板（AI、MATLAB、STM32、ANSYS、ROS2 等）
2. 拖入画布、连线组织流程
3. 点击右上角「运行」，系统自动编译、调度并逐节点执行
4. 运行结果实时回传到画布，节点状态一目了然

---

## 4. 常见问题

**问：`npm install` 很慢或失败？**
答：首次安装需要联网拉取依赖。如果失败，检查网络后重试该命令即可。

**问：后端一直显示未连接？**
答：确认启动命令已在终端执行且无报错，稍等 1-2 秒刷新再试，或直接访问 `http://localhost:3456/api/health` 判断。

**问：之前问 AI 的记录怎么不见了？**
答：对话 / 供应商 / 项目保存在 `~/.engstudio/data/engstudio.db`。如果你此前用另一个目录（如旧版本、开发目录）启动过后端，数据会留在那个目录的库里。为免混淆，请始终用 Dashboard 给出的启动命令，并确认命令里的 `ENGSTUDIO_DATA_DIR` 指向 `~/.engstudio/data`。

**问：会联网上传我的数据吗？**
答：不会。后端服务完全运行在本机，数据不出域，无需注册账号。