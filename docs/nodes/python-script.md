# Python Script 节点

Python Script 节点代表 Python 自定义脚本，是脚本类节点。

## 节点信息

| 属性 | 值 |
|------|-----|
| 节点类型 | `python-script` |
| 所属 Domain | `python` |
| 节点分类 | 脚本类 |

## 输入端口

| 端口名称 | 端口类型 | 是否必填 | 说明 |
|----------|----------|----------|------|
| input_data | data | 否 | 输入数据 |
| trigger | trigger | 否 | 触发信号 |

## 输出端口

| 端口名称 | 端口类型 | 说明 |
|----------|----------|------|
| output_data | data | 输出数据 |
| logs | data | 输出运行日志 |

## 参数配置

| 参数名称 | 类型 | 默认值 | 说明 | 校验规则 |
|----------|------|--------|------|----------|
| scriptPath | string | - | 脚本文件路径 | 路径必须存在 |
| pythonVersion | enum | `3.10` | Python 版本 | `3.8`, `3.9`, `3.10`, `3.11`, `3.12` |
| arguments | string[] | - | 脚本参数 | 可选 |
| environment | string | - | 虚拟环境路径 | 可选 |
| timeout | number | `300` | 超时时间（秒） | 必须大于 0 |

## 节点状态

- 参数合法 → `active`
- 参数不合法 → `error`
- 节点禁用 → `disabled`

## 使用示例

```json
{
  "id": "node-py-001",
  "type": "python-script",
  "name": "Python 自定义脚本",
  "config": {
    "scriptPath": "./scripts/preprocess.py",
    "pythonVersion": "3.10",
    "arguments": ["--input", "./data", "--output", "./output"],
    "timeout": 600
  }
}
```