import DefaultTheme from 'vitepress/theme'
import InteractiveHome from './InteractiveHome.vue'
import Layout from './Layout.vue'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('InteractiveHome', InteractiveHome)
  }
}