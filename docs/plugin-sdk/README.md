# 鎻掍欢绯荤粺璁捐

## 1. 鎻掍欢绯荤粺姒傝堪

EngStudio 閲囩敤寮€鏀惧紡鎻掍欢鏋舵瀯锛屼娇绗笁鏂瑰紑鍙戣€呰兘澶熼€氳繃鎻掍欢鎵╁睍鏂扮殑鑺傜偣銆佹ā鏉裤€丟enerator銆丼kill 浠ュ強涓撲笟杞欢鏀寔銆?
鎻掍欢鏄?EngStudio 鐢熸€佺殑鏍稿績锛屾墍鏈夐鍩熻兘鍔涳紙AI銆丮ATLAB銆丼TM32銆丄NSYS 绛夛級鍧囬€氳繃鎻掍欢瀹炵幇銆?
## 2. 鎻掍欢绫诲瀷

| 鎻掍欢绫诲瀷 | 鎺ュ彛 | 鑱岃矗 | 绀轰緥 |
|----------|------|------|------|
| NodePlugin | INodePlugin | 鎻愪緵鏂扮殑鑺傜偣绫诲瀷 | YOLO 鑺傜偣銆丮ATLAB 鑺傜偣 |
| TemplatePlugin | ITemplatePlugin | 鎻愪緵宸ョ▼妯℃澘 | Python 妯℃澘銆丼TM32 妯℃澘 |
| GeneratorPlugin | IGeneratorPlugin | 鎻愪緵宸ョ▼鐢熸垚鍣?| PythonGenerator銆丮ATLABGenerator |
| RuntimePlugin | IRuntimePlugin | 鎻愪緵杩愯鐜 | PythonRuntime銆丮ATLABRuntime |
| SkillPlugin | ISkillPlugin | 鎻愪緵 AI 鑳藉姏 | WorkflowPlanner銆丏ebugSkill |
| ProviderPlugin | IProviderPlugin | 鎻愪緵 LLM 鎺ュ彛 | OpenAI銆丆laude銆丵wen |

## 3. 鎻掍欢鐩綍缁撴瀯

```
plugins/
鈹溾攢鈹€ official/                    # 瀹樻柟鎻掍欢
鈹?  鈹溾攢鈹€ ai-nodes/               # AI 鑺傜偣鎻掍欢
鈹?  鈹溾攢鈹€ matlab-nodes/           # MATLAB 鑺傜偣鎻掍欢
鈹?  鈹溾攢鈹€ stm32-nodes/            # STM32 鑺傜偣鎻掍欢
鈹?  鈹溾攢鈹€ ansys-nodes/            # ANSYS 鑺傜偣鎻掍欢
鈹?  鈹溾攢鈹€ logic-nodes/            # 閫昏緫鎺у埗鑺傜偣鎻掍欢
鈹?  鈹溾攢鈹€ python-template/        # Python 妯℃澘鎻掍欢
鈹?  鈹溾攢鈹€ matlab-template/        # MATLAB 妯℃澘鎻掍欢
鈹?  鈹溾攢鈹€ stm32-template/         # STM32 妯℃澘鎻掍欢
鈹?  鈹斺攢鈹€ ansys-template/         # ANSYS 妯℃澘鎻掍欢
鈹溾攢鈹€ community/                   # 绀惧尯鎻掍欢
鈹?  鈹斺攢鈹€ <plugin-id>/
鈹斺攢鈹€ user/                        # 鐢ㄦ埛鑷畾涔夋彃浠?    鈹斺攢鈹€ <plugin-id>/
```

## 4. 鎻掍欢鎺ュ彛瀹氫箟

### 4.1 NodePlugin

```typescript
// plugin/interfaces/INodePlugin.ts
export interface INodePlugin {
  id: string;
  name: string;
  version: string;
  domain: string;
  description: string;
  author: string;
  
  // 鐢熷懡鍛ㄦ湡
  onLoad(): Promise<void>;
  onUnload(): Promise<void>;
  
  // 鑺傜偣瀹氫箟
  getNodeSchema(): NodeSchema;
  
  // 鍙傛暟鏍￠獙
  validate(config: Record<string, any>): boolean;
  
  // 鑺傜偣鎵ц锛堝彲閫夛紝鐢ㄤ簬 Runtime 鎵ц锛?  execute?(context: ExecutionContext): Promise<ExecutionResult>;
}

export interface NodeSchema {
  type: string;
  category: string;
  label: string;
  icon: string;
  color: string;
  description: string;
  
  ports: {
    inputs: PortSchema[];
    outputs: PortSchema[];
  };
  
  properties: PropertySchema[];
}

export interface PortSchema {
  id: string;
  label: string;
  type: 'image' | 'text' | 'number' | 'json' | 'file' | 'tensor' | 'stream';
  required: boolean;
}

export interface PropertySchema {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'file' | 'textarea';
  required: boolean;
  defaultValue?: any;
  options?: { label: string; value: any }[];
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}
```

### 4.2 TemplatePlugin

```typescript
// plugin/interfaces/ITemplatePlugin.ts
export interface ITemplatePlugin {
  id: string;
  name: string;
  version: string;
  domain: string;
  
  onLoad(): Promise<void>;
  onUnload(): Promise<void>;
  
  getTemplates(): TemplateDefinition[];
  getTemplateContent(templateName: string): Promise<string>;
}

export interface TemplateDefinition {
  name: string;
  domain: string;
  nodeType: string;
  description: string;
  variables: TemplateVariable[];
  outputPath: string;
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  defaultValue?: any;
}
```

### 4.3 GeneratorPlugin

```typescript
// plugin/interfaces/IGeneratorPlugin.ts
export interface IGeneratorPlugin {
  id: string;
  name: string;
  version: string;
  domain: string;
  
  onLoad(): Promise<void>;
  onUnload(): Promise<void>;
  
  generate(plan: ExecutionPlan, outputDir: string): Promise<void>;
  validate(plan: ExecutionPlan): boolean;
}
```

### 4.4 RuntimePlugin

```typescript
// plugin/interfaces/IRuntimePlugin.ts
export interface IRuntimePlugin {
  id: string;
  name: string;
  version: string;
  domain: string;
  
  onLoad(): Promise<void>;
  onUnload(): Promise<void>;
  
  checkEnvironment(): Promise<EnvironmentStatus>;
  run(context: RunContext): Promise<RunResult>;
  stop(taskId: string): Promise<void>;
}

export interface EnvironmentStatus {
  ready: boolean;
  version?: string;
  message?: string;
  command?: string;
  args?: string[];
}
```

### 4.5 SkillPlugin

```typescript
// plugin/interfaces/ISkillPlugin.ts
export interface ISkillPlugin {
  id: string;
  name: string;
  version: string;
  description: string;
  
  onLoad(): Promise<void>;
  onUnload(): Promise<void>;
  
  execute(context: SkillContext): Promise<SkillResult>;
}

export interface SkillContext {
  workflow?: WorkflowJSON;
  logs?: LogEntry[];
  error?: string;
  userQuery: string;
}

export interface SkillResult {
  success: boolean;
  message: string;
  data?: any;
  suggestions?: string[];
}
```

### 4.6 ProviderPlugin

```typescript
// plugin/interfaces/IProviderPlugin.ts
export interface IProviderPlugin {
  id: string;
  name: string;
  version: string;
  description: string;
  
  onLoad(): Promise<void>;
  onUnload(): Promise<void>;
  
  chat(messages: Message[], options?: ChatOptions): Promise<ChatResponse>;
  streamChat(messages: Message[], options?: ChatOptions): AsyncIterable<string>;
}

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
```

## 5. 鎻掍欢绠＄悊鍣?
```typescript
// plugin/PluginManager.ts
import { INodePlugin, ITemplatePlugin, IGeneratorPlugin, IRuntimePlugin, ISkillPlugin, IProviderPlugin } from './interfaces';

export class PluginManager {
  private nodePlugins: Map<string, INodePlugin> = new Map();
  private templatePlugins: Map<string, ITemplatePlugin> = new Map();
  private generatorPlugins: Map<string, IGeneratorPlugin> = new Map();
  private runtimePlugins: Map<string, IRuntimePlugin> = new Map();
  private skillPlugins: Map<string, ISkillPlugin> = new Map();
  private providerPlugins: Map<string, IProviderPlugin> = new Map();
  
  // 鍔犺浇鎻掍欢
  async loadPlugin(pluginPath: string): Promise<void> {
    const plugin = await import(pluginPath);
    const instance = plugin.default;
    
    switch (instance.type) {
      case 'node':
        await instance.onLoad();
        this.nodePlugins.set(instance.id, instance);
        break;
      case 'template':
        await instance.onLoad();
        this.templatePlugins.set(instance.id, instance);
        break;
      case 'generator':
        await instance.onLoad();
        this.generatorPlugins.set(instance.id, instance);
        break;
      case 'runtime':
        await instance.onLoad();
        this.runtimePlugins.set(instance.id, instance);
        break;
      case 'skill':
        await instance.onLoad();
        this.skillPlugins.set(instance.id, instance);
        break;
      case 'provider':
        await instance.onLoad();
        this.providerPlugins.set(instance.id, instance);
        break;
    }
  }
  
  // 鍗歌浇鎻掍欢
  async unloadPlugin(pluginId: string): Promise<void> {
    const plugin = this.findPlugin(pluginId);
    if (plugin) {
      await plugin.onUnload();
      this.removePlugin(pluginId, plugin.type);
    }
  }
  
  // 鑾峰彇鎻掍欢
  getNodePlugin(id: string): INodePlugin | undefined {
    return this.nodePlugins.get(id);
  }
  
  getTemplatePlugin(id: string): ITemplatePlugin | undefined {
    return this.templatePlugins.get(id);
  }
  
  // ... 鍏朵粬 getter 鏂规硶
  
  private findPlugin(id: string): any {
    return this.nodePlugins.get(id) 
      || this.templatePlugins.get(id)
      || this.generatorPlugins.get(id)
      || this.runtimePlugins.get(id)
      || this.skillPlugins.get(id)
      || this.providerPlugins.get(id);
  }
  
  private removePlugin(id: string, type: string): void {
    switch (type) {
      case 'node': this.nodePlugins.delete(id); break;
      case 'template': this.templatePlugins.delete(id); break;
      case 'generator': this.generatorPlugins.delete(id); break;
      case 'runtime': this.runtimePlugins.delete(id); break;
      case 'skill': this.skillPlugins.delete(id); break;
      case 'provider': this.providerPlugins.delete(id); break;
    }
  }
}
```

## 6. 鎻掍欢寮€鍙戣鑼?
1. 鎻掍欢蹇呴』瀹炵幇瀵瑰簲鐨勬帴鍙?2. 鎻掍欢蹇呴』鎻愪緵 package.json 鎻忚堪鏂囦欢
3. 鎻掍欢蹇呴』瀹炵幇 onLoad 鍜?onUnload 鐢熷懡鍛ㄦ湡
4. 鎻掍欢涓嶅緱鐩存帴璁块棶鍏ㄥ眬鐘舵€侊紝蹇呴』閫氳繃鎺ュ彛浜や簰
5. 鎻掍欢閿欒涓嶅緱褰卞搷鏍稿績绯荤粺杩愯
6. 鎻掍欢蹇呴』閫氳繃 PluginManager 娉ㄥ唽锛屼笉寰楄嚜琛屾敞鍐?
## 7. 鎻掍欢瀹夊叏

- 鎻掍欢杩愯鍦ㄦ矙绠辩幆澧冧腑
- 鎻掍欢涓嶅緱璁块棶鏂囦欢绯荤粺锛堥櫎闈為€氳繃鎺堟潈 API锛?- 鎻掍欢涓嶅緱鍚姩澶栭儴杩涚▼锛堥櫎闈為€氳繃鎺堟潈 API锛?- 鎻掍欢缃戠粶璇锋眰蹇呴』閫氳繃鐧藉悕鍗曞煙鍚