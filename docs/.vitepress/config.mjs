import { defineConfig } from 'vitepress'

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
    nav: [
      { text: '首页', link: '/' },
      { text: '功能', link: '/features' },
      { text: '使用指南', link: '/guide' },
      { text: '下载', link: '/download' },
      { text: 'GitHub', link: 'https://github.com/wyyy520/ES' }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/wyyy520/ES' }
    ],
    footer: {
      message: '让专业工程的每一次配置都可复用、可追溯、可复现。',
      copyright: 'Copyright © 2026 EngStudio'
    }
  }
})