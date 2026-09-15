# YOLO 节点

YOLO 节点代表目标检测训练，是 AI 训练类节点。

## 节点信息

| 属性 | 值 |
|------|-----|
| 节点类型 | `yolo` |
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
| modelName | enum | `yolov8n` | 模型名称 | `yolov8n`, `yolov8s`, `yolov8m`, `yolov8l`, `yolov8x` |
| epochs | number | `100` | 训练轮数 | 必须大于 0 |
| batchSize | number | `16` | 批次大小 | 必须大于 0 |
| imageSize | number | `640` | 输入图像尺寸 | 必须大于 0 |
| workers | number | `4` | 数据加载线程数 | 必须大于等于 0 |
| device | enum | `auto` | 训练设备 | `auto`, `cpu`, `cuda` |
| optimizer | enum | `SGD` | 优化器 | `SGD`, `Adam`, `AdamW` |
| learningRate | number | `0.01` | 学习率 | 必须大于 0 |
| datasetPath | string | - | 数据集路径 | 路径必须存在 |
| outputDir | string | - | 输出目录 | 可选 |

## 节点状态

- 参数合法 → `active`
- 参数不合法 → `error`
- 节点禁用 → `disabled`

## 使用示例

```json
{
  "id": "node-yolo-001",
  "type": "yolo",
  "name": "YOLO 目标检测",
  "config": {
    "modelName": "yolov8n",
    "epochs": 100,
    "batchSize": 16,
    "imageSize": 640,
    "device": "cuda",
    "optimizer": "Adam",
    "learningRate": 0.001,
    "datasetPath": "./datasets/coco",
    "outputDir": "./outputs/yolo"
  }
}
```