# STM32 节点

STM32 节点代表嵌入式工程，是嵌入式类节点。

## 节点信息

| 属性 | 值 |
|------|-----|
| 节点类型 | `stm32` |
| 所属 Domain | `stm32` |
| 节点分类 | 嵌入式类 |

## 输入端口

| 端口名称 | 端口类型 | 是否必填 | 说明 |
|----------|----------|----------|------|
| config | data | 否 | 输入配置数据 |
| trigger | trigger | 否 | 触发信号 |

## 输出端口

| 端口名称 | 端口类型 | 说明 |
|----------|----------|------|
| project | file | 输出嵌入式工程 |
| logs | data | 输出运行日志 |

## 参数配置

| 参数名称 | 类型 | 默认值 | 说明 | 校验规则 |
|----------|------|--------|------|----------|
| mcuModel | string | - | MCU 型号 | 不能为空 |
| cubeMxTemplate | string | - | CubeMX 模板 | 必须存在 |
| clockConfig | object | - | 时钟配置 | 可选 |
| peripheralConfig | object | - | 外设配置 | 可选 |
| outputDir | string | - | 输出目录 | 可选 |

## 节点状态

- 参数合法 → `active`
- 参数不合法 → `error`
- 节点禁用 → `disabled`

## 使用示例

```json
{
  "id": "node-stm32-001",
  "type": "stm32",
  "name": "STM32 嵌入式工程",
  "config": {
    "mcuModel": "STM32F407VGT6",
    "cubeMxTemplate": "./templates/stm32f4",
    "outputDir": "./outputs/stm32"
  }
}
```