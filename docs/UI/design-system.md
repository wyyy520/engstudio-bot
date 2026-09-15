# EngStudio UI 设计系统（Qt 6 Widgets）

> 文档版本：2.0（2026-09-14 重写）
> 依据提交：`90d3afd`
> 代码位置：`packages/qtclient/src/core/Theme.cpp`、`packages/qtclient/resources/style.qss`、`style_light.qss`

---

## 1. 设计原则

1. **专业桌面工具风格**：参照 VS Code、JetBrains、Figma 的信息密度与交互节奏，不做消费级大留白。
2. **深色为主、浅色可选**：默认暗色，适合长时间开发；浅色主题面向投影演示与浅色系统习惯。
3. **配色低饱和、高对比文字**：避免刺眼；正文与背景对比度优先于装饰性色彩。
4. **状态可见**：hover / checked / pressed / disabled / focus 五种状态都必须有可辨识差异，禁止只靠颜色区分（同时用边框或底色变化）。
5. **圆角与留白克制**：圆角 4–8px，分区靠背景层级与 1px 描边，不靠阴影堆叠。

---

## 2. 主题机制

- `Theme::apply(name)` 先设 `QPalette`，再设 `QSS`；**QSS 中未覆盖的控件继承调色板颜色**，因此新增控件即使没有样式也应可读。
- 主题资源编译进 Qt 资源系统：`:/style.qss`（暗色）、`:/style_light.qss`（浅色）。
- 样式表读取失败会打印 `[theme] 样式表加载失败` 警告（避免"点了切换但界面没变"的静默失败）；设 `ENGSTUDIO_DEBUG_THEME=1` 可打印实际加载的样式表与字节数。
- 当前主题名由 `Theme::current()` 提供，可选值 `dark` / `light`，持久化在 `QSettings`。

---

## 3. 调色板

### 3.1 暗色主题（默认）

| 语义 | 色值 | 用途 |
|---|---|---|
| 窗口底色 | `#0f172a` | 主窗口、中央部件、页面栈 |
| 侧边栏 | `#0b1120` | 导航侧栏（比窗口更深一级） |
| 面板/卡片 | `#1e293b` | 分组框、下拉面板、Tooltip、输入框边框 |
| 描边 | `#334155` | 1px 分隔线、控件边框 |
| 正文 | `#e2e8f0` | 主要文字 |
| 次级文字 | `#94a3b8` | 说明文字、导航未选中项、占位符 |
| 三级文字 / 禁用 | `#64748b` / `#475569` | 禁用态文字 |
| 主色 | `#4f46e5` | 主按钮、选中态 |
| 主色（hover/深） | `#6366f1` / `#4338ca` | 主按钮 hover、按下 |
| 强调浅色 | `#a5b4fc` / `#e0e7ff` | Logo、链接已访问、选中文字底色 |
| 危险 | `#7f1d1d` | 错误提示底色 |

调色板关键项（`Theme.cpp`）：`Highlight #4338ca`、`Link #818cf8`、`BrightText #ef4444`、Placeholder `#94a3b8`。

### 3.2 浅色主题

| 语义 | 色值 | 用途 |
|---|---|---|
| 窗口底色 | `#ffffff` | 主窗口与输入控件 |
| 面板 | `#f0f0f0` | 按钮、工具栏（MATLAB 风格灰） |
| 描边 | `#c8c8c8` | 控件边框 |
| 正文 | `#1a1a1a` | 主要文字 |
| 次级文字 | `#5a5a5a` | 说明文字 |
| 主色 | `#0072bd` | 选中、主按钮（MATLAB 蓝） |
| 主色（深） | `#00507a` | hover / 按下 |
| 选中底色 | `#e3f0fa` / `#cde6f5` | 列表与表格选中项 |
| 危险 | `#a2142f` | 错误文本 |

---

## 4. 控件规范

样式通过**类型选择器 + objectName** 两级覆盖，新增页面请复用既有 objectName，避免重复造轮子。

| objectName / 类型 | 用途 | 状态要求 |
|---|---|---|
| `QWidget#sidebar` | 左侧导航容器 | 深色底 + 右侧 1px 描边 |
| `QLabel#logoLabel` | 品牌标识 | 16px / 600 字重 / `#a5b4fc` |
| `QPushButton#navButton` | 导航项 | 默认透明底；hover 变色；`:checked` 用主色区分当前页 |
| `QPushButton` | 通用按钮 | hover / pressed / disabled 四态齐备 |
| `QPushButton#primaryButton` | 主操作（编译、生成、运行） | 主色底，一屏最多一个 |
| `QPushButton#toolbarButton` | 工具栏图标按钮 | 透明底 + hover 高亮 |
| `QPushButton#browseButton` / `#colorSwatch` | 路径选择、颜色选择 | 与通用按钮区分的小尺寸样式 |
| `QLineEdit` / `QComboBox` / `QSpinBox` / `QDoubleSpinBox` / `QPlainTextEdit` / `QTextEdit` | 输入类 | 统一高度、圆角、focus 描边、disabled 降对比 |
| `QTreeWidget` / `QListWidget` / `QTableWidget` | 列表与表格 | 表头与行交替色、选中行高亮、item padding 统一 |
| `QTabWidget::pane` | 页面分区 | 与窗口底色一致，靠边框区分 |
| `QProgressBar` | 进度 | `chunk` 使用主色 |
| `QScrollBar` | 滚动条 | 细条、hover 加深、去掉上下箭头 |
| `QToolTip` | 悬浮提示 | 面板底色 + 1px 描边 + 4px 圆角 |

> 全局禁用了控件 focus 矩形（`* { outline: none; }`），因此**键盘可达性必须由 focus 态的边框/底色变化来保证**——新增可交互控件时务必补 `:focus` 样式。

---

## 5. 布局与间距

- 主框架：`QMainWindow` + 左侧固定宽导航（`sidebar`）+ 右侧 `QStackedWidget#pageStack` 切换 12 个功能页面。
- 页面内部统一使用 `QGroupBox` 分区 + 表单式布局（左侧标签、右侧输入），长内容区用 `QSplitter` 分栏（如 AI 对话的「历史列表 / 对话区」）。
- 间距以 4px 为基数（4 / 8 / 12 / 16），同类控件间距保持一致；页面外边距不小于 12px。

---

## 6. 文案与本地化

- 所有界面文案集中在 `packages/qtclient/src/core/Tr.cpp` 的字符串表，键名按 `page.<页面>.<语义>` 命名（如 `page.aiChat.historyEmpty`）。
- 每个键必须同时提供中文与英文，缺失时回退到键名，便于发现漏翻。
- 文案要说明"为什么"而不只是"是什么"，例如环境检测提示写「点击「检测环境」查看本机可执行文件地址与版本」。

---

## 7. 后续待办

- 图标系统尚未统一（当前以文字按钮为主），需定义一套 SVG 图标与尺寸档位。
- 缺少高对比度/无障碍主题；浅色主题仍有部分控件走调色板继承，需逐页核对。
- 安装包与主题资源随发行包分发的校验见 `Docs/planning/next-steps.md` S2-1。
