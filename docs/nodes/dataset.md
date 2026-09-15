# Dataset 节点

Dataset 节点代表数据集，是工作流中的数据源节点。

## 节点信息

| 属性 | 值 |
|------|-----|
| 节点类型 | `dataset` |
| 所属 Domain | `common` |
| 节点分类 | 数据类 |

## 输入端口

| 端口名称 | 端口类型 | 是否必填 | 说明 |
|----------|----------|----------|------|
| - | - | - | 无输入端口（数据源节点） |

## 输出端口

| 端口名称 | 端口类型 | 说明 |
|----------|----------|------|
| data | data | 输出数据集 |
| metadata | data | 输出数据集元数据 |

## 参数配置

| 参数名称 | 类型 | 默认值 | 说明 | 校验规则 |
|----------|------|--------|------|----------|
| datasetPath | string | - | 数据集路径 | 路径必须存在 |
| datasetType | enum | `image` | 数据集类型 | `image`, `text`, `tabular`, `custom` |
| dataFormat | enum | `folder` | 数据格式 | `folder`, `csv`, `json`, `zip` |
| splitRatio | object | `{ train: 0.8, val: 0.2 }` | 数据划分比例 | 总和必须为 1 |
| annotations | string | - | 标注文件路径 | 可选 |
| classes | string[] | - | 类别列表 | 可选 |

## 节点状态

- 数据集路径有效 → `active`
- 数据集路径无效 → `error`
- 节点禁用 → `disabled`

## 使用示例

```json
{
  "id": "node-dataset-001",
  "type": "dataset",
  "name": "Dataset",
  "config": {
    "datasetPath": "./datasets/my-dataset",
    "datasetType": "image",
    "dataFormat": "folder",
    "splitRatio": { "train": 0.8, "val": 0.1, "test": 0.1 }
  }
}
```