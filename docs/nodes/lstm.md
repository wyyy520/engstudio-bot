# LSTM 节点

LSTM 节点代表时序预测，是 AI 训练类节点。

## 节点信息

| 属性 | 值 |
|------|-----|
| 节点类型 | `lstm` |
| 所属 Domain | `ai` |
| 节点分类 | AI 训练类 |

## 输入端口

| 端口名称 | 端口类型 | 是否必填 | 说明 |
|----------|----------|----------|------|
| dataset | data | 是 | 输入时序数据集 |
| pretrained_model | model | 否 | 预训练模型 |

## 输出端口

| 端口名称 | 端口类型 | 说明 |
|----------|----------|------|
| model | model | 输出训练好的模型 |
| predictions | data | 输出预测结果 |
| logs | data | 输出训练日志 |

## 参数配置

| 参数名称 | 类型 | 默认值 | 说明 | 校验规则 |
|----------|------|--------|------|----------|
| hiddenSize | number | `64` | 隐藏层大小 | 必须大于 0 |
| numLayers | number | `2` | LSTM 层数 | 必须大于 0 |
| epochs | number | `100` | 训练轮数 | 必须大于 0 |
| batchSize | number | `32` | 批次大小 | 必须大于 0 |
| sequenceLength | number | `50` | 序列长度 | 必须大于 0 |
| learningRate | number | `0.001` | 学习率 | 必须大于 0 |
| dropout | number | `0.2` | Dropout 率 | 0-1 之间 |
| datasetPath | string | - | 数据集路径 | 路径必须存在 |
| outputDir | string | - | 输出目录 | 可选 |

## 节点状态

- 参数合法 → `active`
- 参数不合法 → `error`
- 节点禁用 → `disabled`

## 使用示例

```json
{
  "id": "node-lstm-001",
  "type": "lstm",
  "name": "LSTM 时序预测",
  "config": {
    "hiddenSize": 128,
    "numLayers": 3,
    "epochs": 200,
    "batchSize": 64,
    "sequenceLength": 100,
    "learningRate": 0.0005,
    "dropout": 0.3,
    "datasetPath": "./datasets/timeseries",
    "outputDir": "./outputs/lstm"
  }
}
```