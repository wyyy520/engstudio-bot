# Runtime 能力矩阵

> 本文档列出各域 Runtime 的**平台要求、最低版本、必需命令、输入输出约定、已验证模板数与成熟度**。
> 供环境准备脚本、CI 矩阵、洁净安装回归清单以及对外文档（README 等）参考。
> 更新时请同步调整根目录 `README.md` 对应段落，保持口径一致。

| 域 | Runtime | 推荐平台 | 最低版本 | 必需命令/依赖 | 输入约定 | 输出约定 | 已验证模板（示例） | 成熟度 | 备注 |
|---|---|---|---|---|---|---|---|---|---|
| Python / AI | `PythonRuntime` | Linux / macOS / Windows | Python ≥ 3.9（建议 3.10+） | `python3`（或 `python`）；第三方依赖按模板 `requirements.txt` 安装 | 工程目录包含 `main.py` 或 `train.py` | stdout（执行日志）、退出码 0 = 成功 | `python_ml_yolo_train`、`python_cv_*` 系列 | ✅ 稳定 | 超时 30 分钟强制终止；输出行数上限 10,000 行；支持自定义 `pythonCommand` |
| MATLAB / Simulink | `MATLABRuntime` | 任意（需桌面授权） | R2020a+ | `matlab -batch` 或 Windows `MATLAB -run`；需有效 License | 工程目录包含 `main.m`，可含 `startup.m` | MATLAB 命令窗口输出、退出码 | `matlab_ml_*` 系列 | ⚠️ 骨架 | 依赖本地 MATLAB 授权；批量执行走 `-batch`；失败抛出诊断异常 |
| STM32 嵌入式 | `STM32Runtime` | Linux / Windows（macOS 有限） | — | STM32CubeIDE / Makefile；交叉编译器 `arm-none-eabi-gcc` | 工程目录含 `.cubemx` 项目或 Makefile | 构建日志、.elf/.bin/.hex 产物 | `stm32` 系列（GPIO/UART/PWM/ADC/CAN/FreeRTOS） | ⚠️ 骨架 | 构建流程由模板 `files` 指定；运行阶段主要做编译 |
| ANSYS 仿真 | `ANSYSRuntime` | Linux / Windows | 2021R1+（PyAnsys） | `ansys-mapdl-core`（MAPDL）或 `ansys-fluent-core`（Fluent）；Python ≥ 3.8 | 工程目录包含 `main.py`（PyAnsys 脚本） | 控制台输出、结果文件写入 `/tmp/...`；退出码 | `ansys_struct_*`、`ansys_cfd_*` 系列 | ⚠️ 骨架 | 依赖 PyAnsys 授权或本地 ANSYS 安装；超时/输出上限同 `ProcessManager` |
| ROS2 / PX4 | `ROSRuntime` | Linux（Ubuntu 22.04+ 推荐） | Humble / Jazzy | `ros2 launch`、`colcon build`；可选 PX4 工具链 | 工程目录含 `launch/`（`.py`）；可含 `package.xml` | launch 输出日志、退出码 | `ros2_plan_*`、`ros2_avoid_*`、`px4_*` 系列 | ⚠️ 骨架 | 目前聚焦 launch 扫描与执行；暂无通用节点类型检测 |
| C# / .NET | `CSharpRuntime` | 任意 | .NET ≥ 6.0 | `dotnet build` / `dotnet run` | 工程目录含 `.csproj` | 构建与运行日志、退出码 | 无（骨架） | 🧱 骨架 | 框架已就位，模板补齐后开放 |
| Docker | `DockerRuntime` | 任意（需 Docker） | Docker ≥ 20.10 | `docker build` / `docker run` | 工程目录含 `Dockerfile` | 构建与运行日志、退出码 | 无（骨架） | 🧱 骨架 | 支持 `docker run` 超时与 kill |
| Go | `GoRuntime` | 任意 | Go ≥ 1.19 | `go build` / `go run` | 工程目录含 `main.go` | 构建与运行日志、退出码 | 无（骨架） | 🧱 骨架 | `go mod tidy` 自动执行 |
| Unity | `UnityRuntime` | 任意（需 Unity Hub） | Unity ≥ 2021 LTS | Unity Editor CLI | Unity 工程目录 | 构建日志、.app/.exe 产物 | 无（骨架） | 🧱 骨架 | 依赖 Unity Hub 授权 |

## 成熟度标记

- ✅ **稳定**：单元/集成/冒烟测试完整，真实执行已验证，生产可用。
- ⚠️ **骨架**：核心流程已实现，测试覆盖基础路径，适合内部验证；生产部署前需补齐特定场景测试。
- 🧱 **骨架**：类/接口已定义，基本路由已连通；模板与测试均待补齐。

## 与 README 口径对照

1. README 第 92–100 行的表格应引用本文档，避免版本/命令信息分叉。
2. 各域"已验证模板"栏与 `Docs/templates/quality-report.md` 的全库统计互补；前者聚焦 Runtime 实测，后者覆盖元数据合规。
3. CI `python3` 探测规则与 `pythonInterpreter.ts` 的 `detectPython()` 一致：优先 `python3`，其次 `python`，Windows 默认 `python`。
