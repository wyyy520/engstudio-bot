# 模型评估节点

模型评估节点用于对训练好的模型进行评估。

## 节点信息

| 属性 | 值 |
|------|-----|
| 节点类型 | `model-evaluation` |
| 所属 Domain | `ai` |
| 节点分类 | 工具类 |

## 输入端口

| 端口名称 | 端口类型 | 是否必填 | 说明 |
|----------|----------|----------|------|
| model | model | 是 | 输入待评估模型 |
| dataset | data | 是 | 输入评估数据集 |

## 输出端口

| 端口名称 | 端口类型 | 说明 |
|----------|----------|------|
| metrics | data | 输出评估指标 |
| report | data | 输出评估报告 |

## 参数配置

| 参数名称 | 类型 | 默认值 | 说明 | 校验规则 |
|----------|------|--------|------|----------|
| metrics | string[] | `['accuracy', 'precision', 'recall', 'f1']` | 评估指标列表 | 至少一个指标 |
| batchSize | number | `32` | 批次大小 | 必须大于 0 |
| device | enum | `auto` | 评估设备 | `auto`, `cpu`, `cuda` |
| outputDir | string | - | 输出目录 | 可选 |

## 节点状态

- 参数合法 → `active`
- 参数不合法 → `error`
- 节点禁用 → `disabled`

## 使用示例

```json
{
  "id": "node-eval-001",
  "type": "model-evaluation",
  "name": "模型评估",
  "config": {
    "metrics": ["accuracy", "precision", "recall", "f1", "mAP"],
    "batchSize": 32,
    "device": "cuda",
    "outputDir": "./outputs/evaluation"
  }
}
```