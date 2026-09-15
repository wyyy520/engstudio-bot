import { defineConfig } from 'vitepress'

const sidebar = [
  {
    text: '文档总览',
    link: '/docs'
  },
  {
    text: '快速上手',
    collapsed: false,
    items: [
      { text: '安装与部署', link: '/deployment/install' },
      { text: '依赖清单', link: '/deployment/dependencies' },
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