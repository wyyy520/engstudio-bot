# 数据预处理节点

数据预处理节点用于对输入数据进行预处理操作。

## 节点信息

| 属性 | 值 |
|------|-----|
| 节点类型 | `data-preprocessing` |
| 所属 Domain | `common` |
| 节点分类 | 工具类 |

## 输入端口

| 端口名称 | 端口类型 | 是否必填 | 说明 |
|----------|----------|----------|------|
| input_data | data | 是 | 输入原始数据 |

## 输出端口

| 端口名称 | 端口类型 | 说明 |
|----------|----------|------|
| output_data | data | 输出预处理后的数据 |

## 参数配置

| 参数名称 | 类型 | 默认值 | 说明 | 校验规则 |
|----------|------|--------|------|----------|
| operations | array | - | 预处理操作列表 | 至少一个操作 |
| resize | object | - | 图像缩放配置 | 可选 |
| normalize | boolean | `true` | 是否归一化 | 可选 |
| augmentation | object | - | 数据增强配置 | 可选 |

## 节点状态

- 参数合法 → `active`
- 参数不合法 → `error`
- 节点禁用 → `disabled`

## 使用示例

```json
{
  "id": "node-preprocess-001",
  "type": "data-preprocessing",
  "name": "数据预处理",
  "config": {
    "operations": ["resize", "normalize", "augmentation"],
    "resize": { "width": 640, "height": 640 },
    "normalize": true,
    "augmentation": {
      "flip": true,
      "rotation": 15,
      "brightness": 0.2
    }
  }
}
```