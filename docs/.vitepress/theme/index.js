import DefaultTheme from 'vitepress/theme'
import InteractiveHome from './InteractiveHome.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('InteractiveHome', InteractiveHome)
  }
}