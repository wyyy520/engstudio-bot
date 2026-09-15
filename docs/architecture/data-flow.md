# 数据流转架构

## 1. 数据流概览

```
用户拖拽编排工作流 → Workflow Store → workflow.json
    → Compiler 解析工作流图 → 拓扑排序 → 生成 Execution Plan
    → Generator 调用 Template → 生成真实工程
    → Runtime 运行工程 → 日志回传前端 → 实时渲染
```

## 2. 工作流执行数据流

### 2.1 工作流定义 → 执行图

```typescript
// 前端 Workflow JSON
{
  "version": "1.0",
  "id": "wf_001",
  "name": "车辆检测工作流",
  "nodes": [
    {
      "id": "n1",
      "type": "input",
      "plugin": "image_input",
      "position": { "x": 100, "y": 200 },
      "data": { "source": "file" }
    },
    {
      "id": "n2",
      "type": "vision",
      "plugin": "yolo",
      "position": { "x": 400, "y": 200 },
      "data": { "model": "yolov8n.pt", "confidence": 0.5 }
    },
    {
      "id": "n3",
      "type": "output",
      "plugin": "json_output",
      "position": { "x": 700, "y": 200 },
      "data": {}
    }
  ],
  "edges": [
    { "id": "e1", "source": "n1", "target": "n2", "sourceHandle": "image", "targetHandle": "image" },
    { "id": "e2", "source": "n2", "target": "n3", "sourceHandle": "detections", "targetHandle": "input" }
  ]
}

// Compiler 转换为 Execution Plan
{
  "id": "plan_001",
  "workflowId": "wf_001",
  "steps": [
    {
      "order": 1,
      "nodeId": "n1",
      "nodeType": "input",
      "domain": "python",
      "templatePath": "templates/python/input.liquid",
      "outputPath": "generated/input.py"
    },
    {
      "order": 2,
      "nodeId": "n2",
      "nodeType": "vision",
      "domain": "python",
      "templatePath": "templates/python/yolo.liquid",
      "outputPath": "generated/yolo_train.py"
    },
    {
      "order": 3,
      "nodeId": "n3",
      "nodeType": "output",
      "domain": "python",
      "templatePath": "templates/python/output.liquid",
      "outputPath": "generated/output.py"
    }
  ]
}
```

### 2.2 节点间数据传递

```
Node A 执行完毕
    │
    ├── output: { "detections": [...] }
    │
    ▼
数据路由器 (Data Router)
    │
    ├── 根据 Edge 定义将 output 端口数据
    │   映射到下游 node 的 input 端口
    │
    ▼
Node B 接收 input: { "detections": [...] }
    │
    ├── 执行插件逻辑
    │
    ▼
Node B output: { "result": true }
```

### 2.3 数据类型系统

| 类型 | 标识 | 说明 | 示例 |
|------|------|------|------|
| image | `image` | 图像数据 | 文件路径 |
| text | `text` | 文本字符串 | "Hello World" |
| number | `number` | 数值 | 0.95 |
| json | `json` | 结构化数据 | `{"boxes": [...], "scores": [...]}` |
| file | `file` | 文件引用 | `/storage/datasets/img001.jpg` |
| tensor | `tensor` | 张量数据 | numpy array 序列化 |
| stream | `stream` | 流式数据 | LLM token 流 |

## 3. 运行时数据存储

### 3.1 节点运行时状态

```typescript
interface NodeRuntime {
  nodeId: string;
  status: 'idle' | 'running' | 'success' | 'error';
  input: Record<string, any>;     // 输入快照
  output: Record<string, any>;    // 输出快照
  error?: string;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
}
```

### 3.2 执行上下文流转

```typescript
interface WorkflowContext {
  workflowId: string;
  taskId: string;
  projectId: string;
  workDir: string;                  // /runtime/workspace/{taskId}/
  nodeOutputs: Map<string, any>;   // 节点输出缓存
  variables: Record<string, any>;  // 用户自定义变量
}
```

## 4. 实时数据推送

```
Engine (Node.js)              Frontend (React)
  │                              │
  │── WebSocket / IPC 连接 ─────│
  │                              │
  │── node_status: running ─────→│  节点变黄
  │── node_log: "loading..."────→│  日志面板
  │── node_status: success ─────→│  节点变绿
  │── node_output: {...} ───────→│  数据预览
  │                              │
  │── workflow_done ────────────→│  完成提示
```

### TypeScript 实现

```typescript
// 前端监听运行时事件
import { listen } from '@tauri-apps/api/event';

export const useRuntimeEvents = () => {
  useEffect(() => {
    const unlistenStatus = listen('node_status', (event) => {
      const { nodeId, status } = event.payload;
      useWorkflowStore.getState().updateNodeStatus(nodeId, status);
    });
    
    const unlistenLog = listen('node_log', (event) => {
      const { nodeId, message } = event.payload;
      useLogStore.getState().addLog(nodeId, message);
    });
    
    return () => {
      unlistenStatus.then(fn => fn());
      unlistenLog.then(fn => fn());
    };
  }, []);
};

// 后端推送事件
import { emit } from '@tauri-apps/api/event';

export const emitNodeStatus = async (nodeId: string, status: string) => {
  await emit('node_status', { nodeId, status });
};

export const emitNodeLog = async (nodeId: string, message: string) => {
  await emit('node_log', { nodeId, message });
};
```

## 5. 大数据处理策略

| 场景 | 策略 | 说明 |
|------|------|------|
| 图像/视频 | 文件引用 | 不直接传 base64，传文件路径 |
| 大批量数据 | 分块处理 | 流式处理，避免内存溢出 |
| 模型推理结果 | 压缩传输 | JSON 压缩或二进制序列化 |
| 中间结果 | 磁盘缓存 | 落盘到 Runtime/workspace |

## 6. 错误处理与重试

```
节点执行失败
    │
    ├── 检查是否有 Retry 节点
    │   ├── 是 → 重试 N 次后继续
    │   └── 否 → 标记错误，停止下游执行
    │
    ├── 错误信息推送到前端
    │
    └── 已执行节点结果保留（可断点续跑）
```

```typescript
// 断点续跑实现
export const retryWorkflow = async (taskId: string, skipNodes: string[]) => {
  // 从缓存恢复已成功节点的结果
  const cachedOutputs = await loadCachedOutputs(taskId);
  
  // 仅重新执行失败节点及其下游
  const nodesToRetry = filterNodesToRetry(taskId, skipNodes);
  
  for (const node of nodesToRetry) {
    if (skipNodes.includes(node.id)) {
      // 使用缓存结果
      restoreFromCache(node.id, cachedOutputs);
    } else {
      // 重新执行
      await executeNode(node);
    }
  }
};
```

## 7. 数据流规范

1. **Workflow 是唯一数据源** — 所有模块只读 workflow.json，不读前端 Store
2. **Compiler 是唯一解析者** — Generator/Runtime/Plugin 不得直接解析 workflow.json
3. **Generator 不拼接代码** — 只调用 Template Engine 填充模板
4. **Runtime 只运行工程** — 不解析 Workflow，不生成代码
5. **Log Center 统一日志** — 禁止各模块自行打印
6. **AI Optional** — 核心模块不依赖 AI，AI 仅作为增强层