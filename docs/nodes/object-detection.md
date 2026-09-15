# 目标检测节点

目标检测节点代表通用目标检测训练（除 YOLO 外的其他检测模型）。

## 节点信息

| 属性 | 值 |
|------|-----|
| 节点类型 | `object-detection` |
| 所属 Domain | `ai` |
| 节点分类 | AI 训练类 |

## 输入端口

| 端口名称 | 端口类型 | 是否必填 | 说明 |
|----------|----------|----------|------|
| dataset | data | 是 | 输入数据集 |
| pretrained_model | model | 否 | 预训练模型 |

## 输出端口

| 端口名称 | 端口类型 | 说明 |
|----------|----------|------|
| model | model | 输出训练好的模型 |
| logs | data | 输出训练日志 |
| metrics | data | 输出评估指标 |

## 参数配置

| 参数名称 | 类型 | 默认值 | 说明 | 校验规则 |
|----------|------|--------|------|----------|
| modelType | enum | `faster-rcnn` | 检测模型类型 | `faster-rcnn`, `ssd`, `retinanet`, `detr` |
| backbone | enum | `resnet50` | 骨干网络 | `resnet50`, `resnet101`, `mobilenet` |
| epochs | number | `100` | 训练轮数 | 必须大于 0 |
| batchSize | number | `8` | 批次大小 | 必须大于 0 |
| learningRate | number | `0.001` | 学习率 | 必须大于 0 |
| datasetPath | string | - | 数据集路径 | 路径必须存在 |
| outputDir | string | - | 输出目录 | 可选 |

## 节点状态

- 参数合法 → `active`
- 参数不合法 → `error`
- 节点禁用 → `disabled`

## 使用示例

```json
{
  "id": "node-od-001",
  "type": "object-detection",
  "name": "目标检测",
  "config": {
    "modelType": "faster-rcnn",
    "backbone": "resnet50",
    "epochs": 100,
    "batchSize": 8,
    "learningRate": 0.001,
    "datasetPath": "./datasets/coco",
    "outputDir": "./outputs/detection"
  }
}
```