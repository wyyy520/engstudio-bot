# 图像分类节点

图像分类节点代表图像分类训练，是 AI 训练类节点。

## 节点信息

| 属性 | 值 |
|------|-----|
| 节点类型 | `image-classification` |
| 所属 Domain | `ai` |
| 节点分类 | AI 训练类 |

## 输入端口

| 端口名称 | 端口类型 | 是否必填 | 说明 |
|----------|----------|----------|------|
| dataset | data | 是 | 输入图像数据集 |
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
| backbone | enum | `resnet50` | 骨干网络 | `resnet18`, `resnet50`, `resnet101`, `efficientnet`, `mobilenet` |
| epochs | number | `100` | 训练轮数 | 必须大于 0 |
| batchSize | number | `32` | 批次大小 | 必须大于 0 |
| imageSize | number | `224` | 输入图像尺寸 | 必须大于 0 |
| learningRate | number | `0.001` | 学习率 | 必须大于 0 |
| optimizer | enum | `Adam` | 优化器 | `SGD`, `Adam`, `AdamW` |
| datasetPath | string | - | 数据集路径 | 路径必须存在 |
| outputDir | string | - | 输出目录 | 可选 |

## 节点状态

- 参数合法 → `active`
- 参数不合法 → `error`
- 节点禁用 → `disabled`

## 使用示例

```json
{
  "id": "node-cls-001",
  "type": "image-classification",
  "name": "图像分类",
  "config": {
    "backbone": "resnet50",
    "epochs": 50,
    "batchSize": 32,
    "imageSize": 224,
    "learningRate": 0.001,
    "optimizer": "Adam",
    "datasetPath": "./datasets/imagenet",
    "outputDir": "./outputs/classification"
  }
}
```