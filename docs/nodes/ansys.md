# ANSYS 节点

ANSYS 节点代表有限元分析，是仿真类节点。

## 节点信息

| 属性 | 值 |
|------|-----|
| 节点类型 | `ansys` |
| 所属 Domain | `ansys` |
| 节点分类 | 仿真类 |

## 输入端口

| 端口名称 | 端口类型 | 是否必填 | 说明 |
|----------|----------|----------|------|
| geometry | file | 否 | 输入几何模型 |
| trigger | trigger | 否 | 触发信号 |

## 输出端口

| 端口名称 | 端口类型 | 说明 |
|----------|----------|------|
| result | data | 输出分析结果 |
| logs | data | 输出运行日志 |

## 参数配置

| 参数名称 | 类型 | 默认值 | 说明 | 校验规则 |
|----------|------|--------|------|----------|
| projectFile | string | - | 项目文件路径 | 路径必须存在 |
| analysisType | enum | `static` | 分析类型 | `static`, `modal`, `thermal`, `fluid` |
| meshSize | number | `1.0` | 网格尺寸 | 必须大于 0 |
| solver | enum | `direct` | 求解器 | `direct`, `iterative` |
| parameters | object | - | 分析参数 | 可选 |
| outputDir | string | - | 输出目录 | 可选 |

## 节点状态

- 参数合法 → `active`
- 参数不合法 → `error`
- 节点禁用 → `disabled`

## 使用示例

```json
{
  "id": "node-ansys-001",
  "type": "ansys",
  "name": "ANSYS 有限元分析",
  "config": {
    "projectFile": "./projects/analysis.wbpj",
    "analysisType": "static",
    "meshSize": 0.5,
    "solver": "direct",
    "outputDir": "./outputs/ansys"
  }
}
```