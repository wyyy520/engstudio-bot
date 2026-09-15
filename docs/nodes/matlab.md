# MATLAB 节点

MATLAB 节点代表 MATLAB 仿真，是仿真类节点。

## 节点信息

| 属性 | 值 |
|------|-----|
| 节点类型 | `matlab` |
| 所属 Domain | `matlab` |
| 节点分类 | 仿真类 |

## 输入端口

| 端口名称 | 端口类型 | 是否必填 | 说明 |
|----------|----------|----------|------|
| input_data | data | 否 | 输入数据 |
| trigger | trigger | 否 | 触发信号 |

## 输出端口

| 端口名称 | 端口类型 | 说明 |
|----------|----------|------|
| result | data | 输出仿真结果 |
| logs | data | 输出运行日志 |

## 参数配置

| 参数名称 | 类型 | 默认值 | 说明 | 校验规则 |
|----------|------|--------|------|----------|
| modelName | string | - | 模型名称 | 不能为空 |
| scriptPath | string | - | 脚本文件路径 | 路径必须存在 |
| simulationTime | number | `10` | 仿真时间 | 必须大于 0 |
| solver | enum | `ode45` | 求解器 | `ode45`, `ode23`, `ode15s` |
| parameters | object | - | 仿真参数 | 可选 |
| outputDir | string | - | 输出目录 | 可选 |

## 节点状态

- 参数合法 → `active`
- 参数不合法 → `error`
- 节点禁用 → `disabled`

## 使用示例

```json
{
  "id": "node-matlab-001",
  "type": "matlab",
  "name": "MATLAB 仿真",
  "config": {
    "modelName": "my_simulation_model",
    "scriptPath": "./scripts/simulation.m",
    "simulationTime": 10,
    "solver": "ode45",
    "outputDir": "./outputs/matlab"
  }
}
```