# 后端引擎架构 (Node.js + TypeScript)

## 1. 技术选型

| 技术 | 用途 |
|------|------|
| Node.js 20+ | 后端引擎运行时 |
| TypeScript 5+ | 类型安全 |
| Express / Fastify | HTTP 框架（可选，用于 Web 模式） |
| winston | 日志系统 |
| node-pty | 终端进程管理 |
| chokidar | 文件监听 |
| handlebars / liquidjs | 模板引擎 |

## 2. 目录结构说明

```
Engine/
├── src/
│   ├── index.ts                 # 引擎入口
│   │
│   ├── project/                 # Project Manager
│   │   ├── ProjectManager.ts    # 项目生命周期管理
│   │   ├── ProjectStructure.ts  # 项目目录结构
│   │   ├── FileWatcher.ts       # 文件变更监听
│   │   └── AutoSaver.ts         # 自动保存
│   │
│   ├── compiler/                # Compiler 系统
│   │   ├── Compiler.ts          # 主编译器
│   │   ├── WorkflowParser.ts    # Workflow JSON 解析
│   │   ├── WorkflowGraph.ts     # 有向图构建
│   │   ├── NodeValidator.ts     # 节点合法性校验
│   │   ├── ParameterValidator.ts# 参数校验
│   │   ├── DependencyAnalyzer.ts# 依赖分析
│   │   ├── TopologicalSorter.ts # DAG 拓扑排序
│   │   ├── ExecutionPlanBuilder.ts # 执行计划生成
│   │   ├── DomainDispatcher.ts  # Domain 分发
│   │   └── CompilerError.ts     # 编译错误体系
│   │
│   ├── template/                # Template Engine
│   │   ├── TemplateEngine.ts    # 模板引擎核心
│   │   ├── TemplateLoader.ts    # 模板加载与发现
│   │   ├── TemplateRenderer.ts  # 模板渲染（变量替换）
│   │   ├── TemplateValidator.ts # 模板完整性校验
│   │   └── templates/           # 官方模板仓库
│   │       ├── python/
│   │       ├── matlab/
│   │       ├── stm32/
│   │       └── ansys/
│   │
│   ├── generator/               # Generator 系统
│   │   ├── Generator.ts         # 主生成器
│   │   ├── PythonGenerator.ts   # Python 工程生成
│   │   ├── MATLABGenerator.ts   # MATLAB 工程生成
│   │   ├── STM32Generator.ts    # STM32 工程生成
│   │   ├── ANSYSGenerator.ts    # ANSYS 工程生成
│   │   └── interfaces/
│   │       └── IGenerator.ts    # Generator 接口定义
│   │
│   ├── runtime/                 # Runtime 系统
│   │   ├── Runtime.ts           # 主运行时
│   │   ├── ProcessManager.ts    # 进程管理
│   │   ├── EnvironmentDetector.ts # 环境检测
│   │   ├── Terminal.ts          # 终端输出管理
│   │   ├── PythonRuntime.ts     # Python 运行环境
│   │   ├── MATLABRuntime.ts     # MATLAB 运行环境
│   │   └── interfaces/
│   │       └── IRuntime.ts      # Runtime 接口定义
│   │
│   ├── log/                     # Log Center
│   │   ├── LogCenter.ts         # 日志中心
│   │   ├── LogCollector.ts      # 日志收集
│   │   ├── LogPersister.ts      # 日志持久化
│   │   └── LogRotator.ts        # 日志轮转
│   │
│   ├── diagnose/                # Diagnose Center
│   │   ├── DiagnoseCenter.ts    # 诊断中心
│   │   ├── ErrorAnalyzer.ts     # 错误分析
│   │   ├── RuleEngine.ts        # 规则引擎
│   │   └── fixers/              # 自动修复
│   │
│   ├── plugin/                  # Plugin System
│   │   ├── PluginManager.ts     # 插件管理器
│   │   ├── PluginLoader.ts      # 插件加载器
│   │   ├── PluginRegistry.ts    # 插件注册表
│   │   ├── PluginValidator.ts   # 插件校验
│   │   └── interfaces/
│   │       ├── INodePlugin.ts
│   │       ├── ITemplatePlugin.ts
│   │       ├── IGeneratorPlugin.ts
│   │       ├── IRuntimePlugin.ts
│   │       ├── ISkillPlugin.ts
│   │       └── IProviderPlugin.ts
│   │
│   ├── skill/                   # Skill Center (AI)
│   │   ├── SkillCenter.ts       # AI 技能中心
│   │   ├── skills/
│   │   │   ├── WorkflowPlannerSkill.ts
│   │   │   ├── DebugSkill.ts
│   │   │   ├── ExplainSkill.ts
│   │   │   └── OptimizeSkill.ts
│   │   ├── ContextManager.ts    # 上下文管理
│   │   └── PromptManager.ts     # Prompt 管理
│   │
│   ├── provider/                # Provider 抽象层
│   │   ├── ProviderManager.ts   # Provider 管理
│   │   ├── providers/
│   │   │   ├── OpenAIProvider.ts
│   │   │   ├── ClaudeProvider.ts
│   │   │   ├── QwenProvider.ts
│   │   │   └── OpenAICompatibleProvider.ts
│   │   └── interfaces/
│   │       └── IProvider.ts     # Provider 接口
│   │
│   └── shared/                  # 共享类型与工具
│       ├── types/
│       │   ├── workflow.ts      # Workflow 类型
│       │   ├── project.ts       # Project 类型
│       │   ├── execution-plan.ts# Execution Plan 类型
│       │   ├── plugin.ts        # Plugin 类型
│       │   └── log.ts           # Log 类型
│       └── utils/               # 工具函数
│
├── package.json
└── tsconfig.json
```

## 3. 分层架构

```
┌─────────────────────────────────────────────────────────────┐
│                      API Layer (可选)                         │
│         HTTP Router │ Middleware │ Request Handler            │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────┐
│                    Service Layer                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │Project   │ │Compiler  │ │Generator │ │ Runtime  │       │
│  │Manager   │ │Engine    │ │Engine    │ │Engine    │       │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘       │
│       │            │            │             │               │
│  ┌────┴────────────┴────────────┴─────────────┘              │
│  │                    Template Engine                          │
│  └──────────────────────┬──────────────────────────────────┘ │
│                         │                                     │
│  ┌──────────┐ ┌────────┴──────┐ ┌──────────┐ ┌──────────┐   │
│  │Log       │ │  Diagnose     │ │  Skill   │ │  Plugin  │   │
│  │Center    │ │  Center       │ │  Center  │ │  Center  │   │
│  └──────────┘ └───────────────┘ └──────────┘ └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────┐
│                    Storage Layer                              │
│   workflow.json │ templates/ │ generated/ │ logs/ │ plugins/ │
└─────────────────────────────────────────────────────────────┘
```

## 4. 核心模块设计

### 4.1 Compiler 系统

```typescript
// compiler/Compiler.ts
import { WorkflowParser } from './WorkflowParser';
import { WorkflowGraph } from './WorkflowGraph';
import { NodeValidator } from './NodeValidator';
import { TopologicalSorter } from './TopologicalSorter';
import { ExecutionPlanBuilder } from './ExecutionPlanBuilder';
import type { WorkflowJSON, ExecutionPlan, CompilerError } from '../shared/types';

export class Compiler {
  async compile(workflowJson: WorkflowJSON): Promise<ExecutionPlan | CompilerError[]> {
    // 1. 解析 Workflow JSON
    const workflow = WorkflowParser.parse(workflowJson);
    
    // 2. 构建有向图
    const graph = new WorkflowGraph(workflow);
    
    // 3. 节点合法性校验
    const nodeErrors = NodeValidator.validate(graph.nodes);
    if (nodeErrors.length > 0) return nodeErrors;
    
    // 4. 循环依赖检测
    if (graph.hasCycle()) {
      return [{ type: 'error', code: 'CYCLE_DETECTED', message: '工作流存在循环依赖' }];
    }
    
    // 5. 拓扑排序
    const sortedNodes = TopologicalSorter.sort(graph);
    
    // 6. 生成 Execution Plan
    const plan = ExecutionPlanBuilder.build(sortedNodes, graph.edges);
    
    return plan;
  }
}
```

### 4.2 Template Engine

```typescript
// template/TemplateEngine.ts
import { Liquid } from 'liquidjs';
import type { ExecutionPlan, Template } from '../shared/types';

export class TemplateEngine {
  private engine: Liquid;
  
  constructor() {
    this.engine = new Liquid({
      root: './templates',
      extname: '.liquid'
    });
  }
  
  async render(templateName: string, context: Record<string, any>): Promise<string> {
    const template = await this.engine.getTemplate(templateName);
    return await template.render(context);
  }
  
  async generateFromPlan(plan: ExecutionPlan, outputDir: string): Promise<void> {
    for (const step of plan.steps) {
      const template = await this.loadTemplate(step.domain, step.nodeType);
      const rendered = await this.render(template, step.parameters);
      await this.writeToOutput(rendered, outputDir, step.outputPath);
    }
  }
}
```

### 4.3 Generator 系统

```typescript
// generator/interfaces/IGenerator.ts
export interface IGenerator {
  domain: string;
  generate(plan: ExecutionPlan, outputDir: string): Promise<void>;
  validate(plan: ExecutionPlan): boolean;
}

// generator/PythonGenerator.ts
export class PythonGenerator implements IGenerator {
  domain = 'python';
  
  async generate(plan: ExecutionPlan, outputDir: string): Promise<void> {
    // 调用 Template Engine 生成 Python 工程
    const templateEngine = new TemplateEngine();
    await templateEngine.generateFromPlan(plan, outputDir);
  }
  
  validate(plan: ExecutionPlan): boolean {
    return plan.steps.every(step => step.domain === 'python');
  }
}
```

### 4.4 Runtime 系统

```typescript
// runtime/Runtime.ts
import { ProcessManager } from './ProcessManager';
import { EnvironmentDetector } from './EnvironmentDetector';
import type { RunContext, RunResult } from '../shared/types';

export class Runtime {
  private processManager: ProcessManager;
  private envDetector: EnvironmentDetector;
  
  constructor() {
    this.processManager = new ProcessManager();
    this.envDetector = new EnvironmentDetector();
  }
  
  async run(context: RunContext): Promise<RunResult> {
    // 1. 环境检测
    const envStatus = await this.envDetector.check(context.domain);
    if (!envStatus.ready) {
      throw new Error(`环境未就绪: ${envStatus.message}`);
    }
    
    // 2. 启动进程
    const process = await this.processManager.start({
      command: envStatus.command,
      args: envStatus.args,
      cwd: context.projectPath,
      onOutput: (data) => context.onOutput?.(data),
      onError: (error) => context.onError?.(error)
    });
    
    // 3. 返回运行结果
    return {
      taskId: process.id,
      status: 'running',
      pid: process.pid
    };
  }
  
  async stop(taskId: string): Promise<void> {
    await this.processManager.stop(taskId);
  }
}
```

### 4.5 Plugin 系统

```typescript
// plugin/interfaces/INodePlugin.ts
export interface INodePlugin {
  id: string;
  name: string;
  version: string;
  domain: string;
  
  onLoad(): Promise<void>;
  onUnload(): Promise<void>;
  getNodeSchema(): NodeSchema;
  validate(config: Record<string, any>): boolean;
}

// plugin/PluginManager.ts
export class PluginManager {
  private registry: Map<string, INodePlugin> = new Map();
  
  async loadPlugin(pluginPath: string): Promise<void> {
    const plugin = await import(pluginPath);
    const instance = new plugin.default();
    await instance.onLoad();
    this.registry.set(instance.id, instance);
  }
  
  getPlugin(id: string): INodePlugin | undefined {
    return this.registry.get(id);
  }
  
  async unloadPlugin(id: string): Promise<void> {
    const plugin = this.registry.get(id);
    if (plugin) {
      await plugin.onUnload();
      this.registry.delete(id);
    }
  }
}
```

## 5. 数据库模型

使用 SQLite 存储项目元数据：

```typescript
// shared/types/project.ts
export interface Project {
  id: string;
  name: string;
  path: string;
  createdAt: Date;
  updatedAt: Date;
  lastOpenedAt?: Date;
}

// shared/types/workflow.ts
export interface WorkflowJSON {
  version: string;
  id: string;
  projectId: string;
  name: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  viewport: ViewportState;
  metadata: Record<string, any>;
}

export interface WorkflowNode {
  id: string;
  type: string;
  domain: string;
  plugin: string;
  position: { x: number; y: number };
  data: Record<string, any>;
  enabled: boolean;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}
```

## 6. 关键设计原则

1. **Workflow 是唯一数据源** — 所有模块只读 workflow.json，不读前端 Store
2. **Compiler 是唯一解析者** — Generator/Runtime/Plugin 不得直接解析 workflow.json
3. **Generator 不拼接代码** — 只调用 Template Engine 填充模板
4. **Runtime 只运行工程** — 不解析 Workflow，不生成代码
5. **Log Center 统一日志** — 禁止各模块自行打印
6. **AI Optional** — 核心模块不依赖 AI，AI 仅作为增强层