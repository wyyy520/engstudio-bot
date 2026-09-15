# Workflow SDK 璁捐

## 1. SDK 姒傝堪

Workflow SDK 鏄?EngStudio 鎻愪緵缁欑涓夋柟寮€鍙戣€呯殑宸ュ叿鍖咃紝鐢ㄤ簬锛?- 鍒涘缓鑷畾涔夎妭鐐规彃浠?- 鍒涘缓鑷畾涔夋ā鏉挎彃浠?- 鍒涘缓鑷畾涔?Generator 鎻掍欢
- 鍒涘缓鑷畾涔?Runtime 鎻掍欢
- 鍒涘缓鑷畾涔?AI Skill 鎻掍欢

## 2. 瀹夎

```bash
npm install @engstudio/workflow-sdk
```

## 3. 蹇€熷紑濮?
### 3.1 鍒涘缓鑺傜偣鎻掍欢

```typescript
import { defineNodePlugin } from '@engstudio/workflow-sdk';

export default defineNodePlugin({
  id: 'my-yolo-node',
  name: 'YOLO 璁粌鑺傜偣',
  version: '1.0.0',
  domain: 'python',
  description: 'YOLO 鐩爣妫€娴嬭缁冭妭鐐?,
  author: 'Your Name',
  
  // 鑺傜偣瀹氫箟
  schema: {
    type: 'yolo',
    category: 'AI',
    label: 'YOLO 璁粌',
    icon: '馃幆',
    color: '#4CAF50',
    description: '浣跨敤 YOLO 杩涜鐩爣妫€娴嬭缁?,
    
    ports: {
      inputs: [
        { id: 'dataset', label: '鏁版嵁闆?, type: 'file', required: true },
        { id: 'config', label: '閰嶇疆', type: 'json', required: false }
      ],
      outputs: [
        { id: 'model', label: '妯″瀷', type: 'file' },
        { id: 'metrics', label: '鎸囨爣', type: 'json' }
      ]
    },
    
    properties: [
      {
        key: 'model',
        label: '妯″瀷',
        type: 'select',
        required: true,
        options: [
          { label: 'YOLOv8n', value: 'yolov8n.pt' },
          { label: 'YOLOv8s', value: 'yolov8s.pt' },
          { label: 'YOLOv8m', value: 'yolov8m.pt' }
        ],
        defaultValue: 'yolov8n.pt'
      },
      {
        key: 'epoch',
        label: '璁粌杞暟',
        type: 'number',
        required: true,
        defaultValue: 100,
        validation: { min: 1, max: 1000 }
      },
      {
        key: 'batchSize',
        label: '鎵规澶у皬',
        type: 'number',
        required: false,
        defaultValue: 16
      }
    ]
  },
  
  // 鍙傛暟鏍￠獙
  validate(config) {
    if (!config.model) return false;
    if (config.epoch && config.epoch <= 0) return false;
    return true;
  }
});
```

### 3.2 鍒涘缓妯℃澘鎻掍欢

```typescript
import { defineTemplatePlugin } from '@engstudio/workflow-sdk';

export default defineTemplatePlugin({
  id: 'my-python-template',
  name: 'Python 妯℃澘',
  version: '1.0.0',
  domain: 'python',
  
  templates: [
    {
      name: 'yolo_train',
      domain: 'python',
      nodeType: 'yolo',
      description: 'YOLO 璁粌妯℃澘',
      variables: [
        { name: 'model', type: 'string', required: true },
        { name: 'epoch', type: 'number', required: true },
        { name: 'batchSize', type: 'number', required: false },
        { name: 'datasetPath', type: 'string', required: true }
      ],
      outputPath: 'train.py'
    }
  ],
  
  // 妯℃澘鍐呭
  async getTemplateContent(templateName) {
    if (templateName === 'yolo_train') {
      return `
from ultralytics import YOLO

# 鍔犺浇妯″瀷
model = YOLO("{{ model }}")

# 璁粌
model.train(
    data="{{ datasetPath }}",
    epochs={{ epoch }},
    batch={{ batchSize | default: 16 }}
)
`;
    }
    throw new Error(`Template not found: ${templateName}`);
  }
});
```

### 3.3 鍒涘缓 Generator 鎻掍欢

```typescript
import { defineGeneratorPlugin } from '@engstudio/workflow-sdk';

export default defineGeneratorPlugin({
  id: 'my-python-generator',
  name: 'Python Generator',
  version: '1.0.0',
  domain: 'python',
  
  async generate(plan, outputDir) {
    const templateEngine = new TemplateEngine();
    
    for (const step of plan.steps) {
      if (step.domain !== 'python') continue;
      
      const template = await this.getTemplate(step.nodeType);
      const rendered = await templateEngine.render(template, step.parameters);
      
      await this.writeFile(outputDir, step.outputPath, rendered);
    }
  },
  
  validate(plan) {
    return plan.steps.every(step => step.domain === 'python');
  }
});
```

### 3.4 鍒涘缓 Runtime 鎻掍欢

```typescript
import { defineRuntimePlugin } from '@engstudio/workflow-sdk';

export default defineRuntimePlugin({
  id: 'my-python-runtime',
  name: 'Python Runtime',
  version: '1.0.0',
  domain: 'python',
  
  async checkEnvironment() {
    try {
      const { stdout } = await exec('python --version');
      return {
        ready: true,
        version: stdout.trim(),
        command: 'python',
        args: []
      };
    } catch {
      return {
        ready: false,
        message: 'Python 鏈畨瑁呮垨鏈坊鍔犲埌 PATH'
      };
    }
  },
  
  async run(context) {
    const { command, args, cwd } = context;
    
    const process = spawn(command, args, { cwd });
    
    process.stdout.on('data', (data) => {
      context.onOutput?.(data.toString());
    });
    
    process.stderr.on('data', (data) => {
      context.onError?.(data.toString());
    });
    
    return new Promise((resolve, reject) => {
      process.on('close', (code) => {
        if (code === 0) {
          resolve({ status: 'success' });
        } else {
          reject(new Error(`Process exited with code ${code}`));
        }
      });
    });
  },
  
  async stop(taskId) {
    // 鍋滄杩涚▼
    const process = this.processes.get(taskId);
    if (process) {
      process.kill();
      this.processes.delete(taskId);
    }
  }
});
```

### 3.5 鍒涘缓 Skill 鎻掍欢

```typescript
import { defineSkillPlugin } from '@engstudio/workflow-sdk';

export default defineSkillPlugin({
  id: 'my-debug-skill',
  name: '璋冭瘯鍔╂墜',
  version: '1.0.0',
  description: '鍒嗘瀽杩愯鏃ュ織骞舵彁渚涜皟璇曞缓璁?,
  
  async execute(context) {
    const { logs, error, userQuery } = context;
    
    // 鏋勫缓 Prompt
    const prompt = this.buildPrompt(logs, error, userQuery);
    
    // 璋冪敤 LLM
    const response = await this.callLLM(prompt);
    
    return {
      success: true,
      message: '璋冭瘯瀹屾垚',
      suggestions: response.suggestions
    };
  },
  
  buildPrompt(logs, error, userQuery) {
    return `
浣犳槸涓€涓?EngStudio 璋冭瘯鍔╂墜銆?
閿欒淇℃伅锛?${error}

鏃ュ織锛?${logs?.join('\n')}

鐢ㄦ埛闂锛?${userQuery}

璇峰垎鏋愰敊璇苟鎻愪緵璋冭瘯寤鸿銆?`;
  }
});
```

## 4. SDK API 鍙傝€?
### 4.1 鎻掍欢瀹氫箟鍑芥暟

| 鍑芥暟 | 鐢ㄩ€?| 杩斿洖绫诲瀷 |
|------|------|----------|
| defineNodePlugin | 瀹氫箟鑺傜偣鎻掍欢 | INodePlugin |
| defineTemplatePlugin | 瀹氫箟妯℃澘鎻掍欢 | ITemplatePlugin |
| defineGeneratorPlugin | 瀹氫箟鐢熸垚鍣ㄦ彃浠?| IGeneratorPlugin |
| defineRuntimePlugin | 瀹氫箟杩愯鏃舵彃浠?| IRuntimePlugin |
| defineSkillPlugin | 瀹氫箟鎶€鑳芥彃浠?| ISkillPlugin |
| defineProviderPlugin | 瀹氫箟 Provider 鎻掍欢 | IProviderPlugin |

### 4.2 宸ュ叿鍑芥暟

```typescript
// 鏃ュ織宸ュ叿
import { logger } from '@engstudio/workflow-sdk';

logger.info('淇℃伅');
logger.warn('璀﹀憡');
logger.error('閿欒');

// 鏂囦欢宸ュ叿
import { fs } from '@engstudio/workflow-sdk';

await fs.readFile(path);
await fs.writeFile(path, content);
await fs.exists(path);

// 杩涚▼宸ュ叿
import { exec } from '@engstudio/workflow-sdk';

const { stdout, stderr } = await exec('python --version');

// 妯℃澘寮曟搸
import { TemplateEngine } from '@engstudio/workflow-sdk';

const engine = new TemplateEngine();
const rendered = await engine.render(template, context);
```

## 5. 鎻掍欢鍙戝竷

### 5.1 鎻掍欢閰嶇疆

```json
{
  "name": "engstudio-plugin-my-yolo",
  "version": "1.0.0",
  "description": "YOLO 璁粌鑺傜偣鎻掍欢",
  "author": "Your Name",
  "license": "MIT",
  "engstudio": {
    "pluginType": "node",
    "domain": "python",
    "main": "dist/index.js"
  }
}
```

### 5.2 鍙戝竷鍒扮ぞ鍖?
```bash
npm publish
```

## 6. 鏈€浣冲疄璺?
1. 鎻掍欢鍛藉悕閬靛惊 `engstudio-plugin-<name>` 鏍煎紡
2. 浣跨敤 TypeScript 寮€鍙戯紝鎻愪緵绫诲瀷瀹氫箟
3. 鎻愪緵瀹屾暣鐨勫崟鍏冩祴璇?4. 閿欒澶勭悊瑕佸畬鍠勶紝涓嶈鎶涘嚭鏈崟鑾峰紓甯?5. 涓嶈闃诲鎻掍欢鐢熷懡鍛ㄦ湡
6. 閬靛惊鎺ュ彛瀹氫箟锛屼笉瑕佺洿鎺ヨ闂唴閮?API