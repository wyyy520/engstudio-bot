# 更新记录

每次发布修复或新增了什么，在这里都可追溯。点击左侧版本号可直接跳到对应版本的详细说明。

<div class="version-nav">

- [v1.0.4](#v104) — 模板全量原生化（去 Handlebars）
- [v1.0.3](#v103) — 生成/导出链路修复
- [v1.0.2](#v102) — 一键后端 + AI 工程
- [v1.0.1](#v101) — RAG 语义检索
- [v1.0.0](#v100) — 首个正式版

</div>

---

## v1.0.4 {#v104}

**发布日期**：2026-09-17 · [GitHub Release](https://github.com/wyyy520/ES/releases/tag/v1.0.4)

> 核心目标：模板引擎去 Handlebars 化 —— 736 个模板全部改为原生源文件，参数在运行时注入，彻底消除 `{{ }}` 占位符。

### ✨ 变更

1. **模板全量原生化**
   - 移除全部 `.tpl` 文件，736 个模板改为原生源文件：Python 读 `params.json`、MATLAB `jsondecode`、ROS launch 运行时传参，STM32 由引擎生成 `config.h`，C++/CMake/配置文件烘焙默认值。
   - 模板源码不再含真实 `{{ }}`（仅保留 GitHub Actions 的 `${{ }}`），转换后均可被原生工具链解析/编译。

2. **RAG 语义检索升级**
   - 索引 `INDEX_VERSION=2`，索引文本前置模板 id，修复自查询召回；重建 736 模板向量索引。

3. **模板目录完整性测试**
   - 新增校验：注册数量、id 唯一、无 `.tpl` 引用、声明文件存在性。

### 🐛 修复的问题

1. **12 个 ANSYS 模板 `main.py` 语法错误**：MAPDL 空参数与方法链拼写修正，模板可正常解析。
2. **`ros2_nav2_dwb` 非法的 DWB 参数 YAML**：改为合法的 nav2 DWB 点式参数与 critics 列表。
3. **发布流程修复**：排除 `_CPack_Packages` 目录，避免 `gh release` 把目录当资产导致发布失败。
4. **`.gitignore`**：补充 `__pycache__/`、`*.py[cod]`。

### 📦 安装包

- Linux：`engstudio-1.0.4-linux-x86_64.deb`、`engstudio-1.0.4-Linux-x86_64.tar.gz`
- Windows：`engstudio-1.0.4-Windows-AMD64.exe`、`engstudio-1.0.4-Windows-AMD64.zip`（新增）

另附：[更新记录页](https://engstudio.bot.cd/releases.html)；[完整代码变更](https://github.com/wyyy520/ES/releases/tag/v1.0.4)。

---

## v1.0.3 {#v103}

**发布日期**：2026-09-16 · [GitHub Release](https://github.com/wyyy520/ES/releases/tag/v1.0.3)

> 核心目标：解决「PX4 工程导出生成为空」的一整条链路问题。

### 🐛 修复的问题

1. **PX4 工程导出后 `src/` 为空**
   - 此前导出只写 `.gitkeep` 占位、不调用后端，`src/` 永远没有内容。
   - 现在「导出工程目录 / 编译 Generate」会自动接后端渲染，真实模板文件（`.cpp/.hpp/.yaml/CMakeLists/package.xml/launch` 等）写入 `src/`。
   - 生成目标统一收拢到 `<工程根>/src` 下，目录结构清晰。

2. **PX4 模块无法生成代码（模板解析失败）**
   - PX4 节点的执行计划没有 `templateId`，引擎只按 `type`（如 `hover`）查模板注册表，而注册表 key 是 `px4.hover` → 匹配不到 → 生成 0 个文件。
   - 修复：按 `domain.type` 组合兜底解析模板 ID，本地计划也能命中 `px4.hover`、`px4.attitude_control` 等模板。

3. **必填输入「PX4 状态」未连接导致编译被阻断**
   - `px4_state` 是飞控外部遥测源，模板库里没有节点能输出它，此前严格校验让所有 PX4 工作流都编译失败。
   - 修复：必填输入未连接不再阻断（生成端用默认值占位）。

4. **安装版（deb）环境下生成结果为空**
   - 服务端启动时未注入 `ENGSTUDIO_TEMPLATES_PATH`，deb 安装后引擎找不到模板目录。
   - 修复：启动命令统一携带模板路径（支持环境变量覆盖）。

### ✨ 其他改进

- 工作流连线改为避障正交路由：线不压模块、拐角在模块外，画布更清晰。
- AI 工程缺 `templateId` 的节点在打开时自动匹配模板库并持久化。
- 后端启动提供「原地 / 用户目录」切换，系统目录不可写时自动切到 `~/.engstudio` 副本。
- `--screenshot` 模式，用于发布截图与网站素材自动生成。

另附：[更新记录页](https://engstudio.bot.cd/releases.html)；[完整代码变更](https://github.com/wyyy520/ES/releases/tag/v1.0.3)。

---

## v1.0.2 {#v102}

**发布日期**：2026-09-15 · [GitHub Release](https://github.com/wyyy520/ES/releases/tag/v1.0.2)

> 核心目标：让后端「一键就能拉起来」，并把 AI 生成结果直接落成可编辑的工程。

### ✨ 新增

- **一键后端启动命令**：`ENGSTUDIO_LOCAL` 一键模式 + 健康自检 + Reactome，服务端可独立打包分发。
  - 之前需要手动配环境变量、建数据目录；现在双击/单命令即可本地运行。
- **AI 工程模式「解析为工程」**：AI 对话产物直接落盘为流程图工程，打开即可编辑、连线、运行。
  - 状态栏文字化：关键状态不再只靠弹窗，操作反馈更明确。
- **RAG 语义检索降级策略**：transformers.js 依赖缺失时自动回退为关键词检索，不至于整条链路不可用。

### 🐛 修复

- 无。

### 📦 安装包

- Linux deb：`engstudio-1.0.2-linux-x86_64.deb`

另附：[完整代码变更](https://github.com/wyyy520/ES/releases/tag/v1.0.2)。

---

## v1.0.1 {#v101}

**发布日期**：2026-09-14 · [GitHub Release](https://github.com/wyyy520/ES/releases/tag/v1.0.1)

> 核心目标：让 AI 只能引用真实模板（杜绝编造），并让模板随安装包一起分发。

### ✨ 新增

- **RAG 语义检索**：transformers.js 本地向量 + 混合检索，AI 必须引用真实存在的模板 id 才能通过白名单校验，从机制上杜绝幻觉模块。
- **模板库随安装包分发**：客户端自动加载安装路径下的模板，断网也有完整模板可用。
- RAG 索引构建接入 CI + 模板语义检索 API 文档。

### 🐛 修复

- **Windows 构建**：改用 ilammy/msvc-dev-cmd + Ninja，规避 VS generator 探测失败；Release 幂等（已存在则补传）。
- **Qt 兼容性**：`QTimeZone::UTC` 需 Qt 6.5+，改用 `QTimeZone::utc()`，兼容 CI 的 Qt 6.4。
- **MSVC 编译**：`\x01` 后跟十六进制字母被贪婪解析报 C7744，断开字符串字面量。

### 📦 安装包

- Linux deb + tar.gz，Windows exe（含安装说明）。

另附：[完整代码变更](https://github.com/wyyy520/ES/releases/tag/v1.0.1)。

---

## v1.0.0 {#v100}

**发布日期**：2026-09-10 · [GitHub Release](https://github.com/wyyy520/ES/releases/tag/v1.0.0)

> 首个正式版本。面向 AI、MATLAB、STM32、ANSYS、ROS2 等领域，把「每个项目重写脚本、配环境」变成「拖节点、连线、一键运行」。

### ✨ 核心能力

- **700+ 工程模板**：AI/MATLAB/STM32/ANSYS/PX4/Python 全部补齐依赖、真实输入输出参数、README 与质量徽记（✅ 已验证 / ⚠️ 骨架）。
- **可视化工作流编辑器**（Qt6 桌面端）：拖拽模板节点连线组流程；撤销/重做、自动布局、网格吸附、缩放导航。
- **模式驱动的参数化生成**：schema-driven 动态参数系统，map 格式参数/端口兼容。
- **一键运行与调度**：多任务执行、超时保护、进程树 kill、输出裁剪、CPU/内存监控，Python/MATLAB/ROS 运行时真实化、无注入面。
- **AI 对话双模式**：意图模式 / 工程模式，对话历史归档与可搜索的历史面板。
- **环境检测**：返回可执行文件路径与版本，设置页可视化展示。
- **诊断与自修复**：规则引擎定位错误到具体节点，5 类修复器自动出方案。

### 📦 安装包

- Linux deb + AppImage、Windows exe（首次发布）。

另附：[完整代码变更](https://github.com/wyyy520/ES/releases/tag/v1.0.0)。

---

## 全部历史发布

所有版本历史产物（安装包、校验和、源码 Tag）见 [GitHub Releases](https://github.com/wyyy520/ES/releases)。