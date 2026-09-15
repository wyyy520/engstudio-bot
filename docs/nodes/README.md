# 节点系统文档

本文档基于 silu.md 标准定义，描述 EngStudio 平台中所有支持的节点类型、数据结构、端口定义及参数配置。

## 节点分类

根据 silu.md 定义，节点分为以下几大类：

| 分类 | 节点类型 | 说明 |
|------|----------|------|
| 数据类 | Dataset | 数据集管理节点 |
| AI 训练类 | YOLO, LSTM, 图像分类, 目标检测, 语义分割 | AI 模型训练与推理 |
| 仿真类 | MATLAB, ANSYS | 专业仿真与分析 |
| 嵌入式类 | STM32 | 嵌入式工程生成 |
| 脚本类 | Python Script | 自定义脚本执行 |
| 逻辑类 | 条件判断, 循环, 逻辑控制 | 工作流控制流 |
| 工具类 | 数据预处理, 模型评估, 变量, 常量 | 辅助工具节点 |

## 节点通用数据结构

每个节点必须包含以下统一数据结构：

```typescript
interface Node {
  id: string;              // 唯一 ID
  type: string;            // 节点类型
  name: string;            // 节点名称
  position: { x: number; y: number };  // 节点位置
  size: { width: number; height: number };  // 节点尺寸
  inputs: Port[];          // 输入端口
  outputs: Port[];         // 输出端口
  config: Record<string, any>;  // 参数配置
  status: 'active' | 'disabled' | 'error';  // 节点状态
  enabled: boolean;        // 启用状态
  createdAt: string;       // 创建时间
  updatedAt: string;       // 更新时间
  extensions: Record<string, any>;  // 扩展字段
  pluginInfo?: PluginInfo; // Plugin 信息
  domain: string;          // Domain 信息
}

interface Port {
  id: string;
  name: string;
  type: 'data' | 'model' | 'trigger' | 'file';
  optional: boolean;
}
```

## 节点设计原则

1. **Node 的职责是描述能力，而不是执行能力**
2. 真正执行由 Generator 完成
3. Node 必须支持未来插件动态扩展
4. 任何插件均可向 Node 增加新的属性，而无需修改 Workflow Schema

## 各节点详细文档

- [Dataset 节点](./dataset.md)
- [YOLO 节点](./yolo.md)
- [LSTM 节点](./lstm.md)
- [图像分类节点](./image-classification.md)
- [目标检测节点](./object-detection.md)
- [语义分割节点](./semantic-segmentation.md)
- [MATLAB 节点](./matlab.md)
- [ANSYS 节点](./ansys.md)
- [STM32 节点](./stm32.md)
- [Python Script 节点](./python-script.md)
- [逻辑控制节点](./logic-control.md)
- [数据预处理节点](./data-preprocessing.md)
- [模型评估节点](./model-evaluation.md)