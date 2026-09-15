import { defineConfig } from 'vitepress'

const sidebar = [
  {
    text: '文档总览',
    link: '/docs'
  },
  {
    text: '架构设计',
    collapsed: false,
    items: [
      { text: '系统设计说明书（全景）', link: '/architecture/engstudio' },
      { text: '系统设计概览', link: '/architecture/system-design' },
      { text: '引擎架构', link: '/architecture/engine' },
      { text: '服务端架构', link: '/architecture/backend' },
      { text: '数据流', link: '/architecture/data-flow' },
      { text: '运行时', link: '/architecture/runtime' },
      { text: '前端架构', link: '/architecture/frontend' },
      { text: '模板生成器', link: '/architecture/template-generator' },
      { text: '项目管理', link: '/architecture/project-manager' },
    ]
  },
  {
    text: 'Runtime 能力矩阵',
    link: '/runtime-capability-matrix'
  },
  {
    text: '部署与运维',
    collapsed: false,
    items: [
      { text: '安装与部署', link: '/deployment/install' },
      { text: '依赖清单', link: '/deployment/dependencies' },
    ]
  },
  {
    text: '接口与 SDK',
    collapsed: false,
    items: [
      { text: 'REST API', link: '/api/README' },
      { text: '插件 SDK', link: '/plugin-sdk/README' },
      { text: '插件系统', link: '/plugin-sdk/plugin-system' },
      { text: '工作流 SDK', link: '/workflow-sdk/README' },
    ]
  },
  {
    text: '节点库',
    collapsed: false,
    items: [
      { text: '节点总览', link: '/nodes/README' },
      { text: 'yolo', link: '/nodes/yolo' },
      { text: 'lstm', link: '/nodes/lstm' },
      { text: 'dataset', link: '/nodes/dataset' },
      { text: 'object-detection', link: '/nodes/object-detection' },
      { text: 'image-classification', link: '/nodes/image-classification' },
      { text: 'semantic-segmentation', link: '/nodes/semantic-segmentation' },
      { text: 'model-evaluation', link: '/nodes/model-evaluation' },
      { text: 'data-preprocessing', link: '/nodes/data-preprocessing' },
      { text: 'logic-control', link: '/nodes/logic-control' },
      { text: 'python-script', link: '/nodes/python-script' },
      { text: 'matlab', link: '/nodes/matlab' },
      { text: 'stm32', link: '/nodes/stm32' },
      { text: 'ansys', link: '/nodes/ansys' },
    ]
  },
  {
    text: '模板库',
    items: [
      { text: '模板质量报告', link: '/templates/quality-report' },
    ]
  },
  {
    text: 'UI 与设计',
    items: [
      { text: '设计系统', link: '/UI/design-system' },
    ]
  },
  {
    text: '规划与价值',
    collapsed: false,
    items: [
      { text: '交付与验收计划', link: '/planning/project-delivery-plan' },
      { text: '下一步行动清单', link: '/planning/next-steps' },
      { text: '商业价值分析', link: '/planning/business-value' },
    ]
  },
]

export default defineConfig({
  title: 'EngStudio',
  description: '面向 AI 工程与专业工程开发的可视化低代码平台',
  lang: 'zh-CN',
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', href: '/logo.png' }],
    ['meta', { name: 'theme-color', content: '#1a1a2e' }],
  ],
  themeConfig: {
    logo: '/logo.png',
    search: {
      provider: 'local'
    },
    nav: [
      { text: '首页', link: '/' },
      { text: '功能', link: '/features' },
      { text: '文档', link: '/docs' },
      { text: '下载', link: '/download' },
      { text: 'GitHub', link: 'https://github.com/wyyy520/ES' }
    ],
    sidebar,
    socialLinks: [
      { icon: 'github', link: 'https://github.com/wyyy520/ES' }
    ],
    footer: {
      message: '让专业工程的每一次配置都可复用、可追溯、可复现。',
      copyright: 'Copyright © 2026 EngStudio'
    }
  }
})