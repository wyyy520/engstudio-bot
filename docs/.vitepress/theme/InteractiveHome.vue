<script setup>
import { ref, onMounted } from 'vue'

const domains = [
  {
    key: 'ai',
    name: 'AI / 机器学习',
    icon: '🤖',
    color: '#e93e60',
    desc: '目标检测、图像分类、语义分割、模型评估的完整流水线。从数据集拆分到模型训练、评估、部署，一键生成可运行工程。',
    tags: ['YOLO 目标检测', '图像分类', 'LSTM 时序', '模型评估', '数据预处理'],
  },
  {
    key: 'matlab',
    name: 'MATLAB / Simulink',
    icon: '📊',
    color: '#e8930c',
    desc: '信号处理、控制系统、建模仿真。connect 你的算法节点，自动生成 MATLAB 工程与脚本。',
    tags: ['信号处理', '控制算法', 'Simulink 模型', '数据可视化'],
  },
  {
    key: 'stm32',
    name: 'STM32 嵌入式',
    icon: '🔌',
    color: '#2f8f4f',
    desc: '代码生成、固件编译、烧录、外设配置。面向 MCU 开发的完整工具链。',
    tags: ['代码生成', '固件烧录', 'GPIO 配置', '定时器', '串口调试'],
  },
  {
    key: 'ansys',
    name: 'ANSYS 仿真',
    icon: '🧪',
    color: '#6272e8',
    desc: '结构分析、稳态热分析、模态分析。从 CAD 到求解器到后处理的工程链路。',
    tags: ['结构分析', '热力学', '模态分析', '网格划分'],
  },
  {
    key: 'ros',
    name: 'ROS2 / PX4',
    icon: '🚁',
    color: '#22a0d0',
    desc: '机器人、无人机、导航控制。167 个 ROS2 + 80 个 PX4 模板，覆盖节点开发到实机部署。',
    tags: ['ROS2 节点', '导航控制', 'PX4 飞控', '航线规划'],
  },
  {
    key: 'python',
    name: 'Python 通用',
    icon: '🐍',
    color: '#8a5cf6',
    desc: '任意 Python 脚本流程化。虚拟环境、依赖安装、脚本执行，结果可追溯。',
    tags: ['Python 脚本', '虚拟环境', '依赖管理'],
  },
]

const stats = [
  { label: '工程模板', value: 736, suffix: '+' },
  { label: '节点类型', value: 87, suffix: ' 种' },
  { label: '自动化用例', value: 171, suffix: ' 个' },
  { label: '语言/框架支持', value: 7, suffix: ' 类' },
]

const faqs = [
  {
    q: 'EngStudio 是做什么的？',
    a: '它是专业工程的可视化流水线工具：把 AI、MATLAB/Simulink、STM32、ANSYS、ROS2/PX4 等领域的工程搭建，从「每个项目重写脚本、配环境、对接口」变成「拖节点、连线、一键生成可运行工程」。',
  },
  {
    q: '需要注册账号吗？需要联网吗？',
    a: '不需要。EngStudio 是本地优先架构：Qt 桌面端 + 自托管 Node 服务端，数据全部落在本机，无需注册账号，断网也能用。',
  },
  {
    q: '装了就能用，还是要装一堆依赖？',
    a: '主链路（Python/AI）开箱即用，不需要商业软件授权。MATLAB、ANSYS 等可选领域仅在你有对应许可证和环境的机器上使用，平台不会强制。',
  },
  {
    q: 'AI 生成的东西靠谱吗？会不会编造模块？',
    a: '不会。工程模式使用 RAG 语义检索 + 模板白名单校验：AI 只能引用模板库里真实存在的模板，输出必须通过校验，从机制上杜绝幻觉。',
  },
  {
    q: '支持哪些平台？',
    a: '当前已发布 Linux（deb）安装包，Windows 版本计划在 v1.1.0 提供。',
  },
]

const activeDomain = ref(domains[0].key)
const activeFaq = ref(0)
const statValues = ref(stats.map(() => 0))
const lightbox = ref(null)
let rafStarted = false

const gallery = [
  { src: '/screenshot.png', caption: '仪表盘' },
  { src: '/eng_shot_dashboard.png', caption: '日志中心' },
  { src: '/eng_shot_workflow_hover.png', caption: '工作台' },
  { src: '/eng_shot_compiler.png', caption: '步骤预览' },
  { src: '/eng_shot_aichat.png', caption: 'AI 对话 · 意图模式' },
]

function openLightbox(g) {
  lightbox.value = g
}

function domainByKey(key) {
  return domains.find((d) => d.key === key)
}

onMounted(() => {
  const el = document.getElementById('stats-box')
  if (!el) return
  const run = () => {
    if (rafStarted) return
    rafStarted = true
    const start = performance.now()
    const dur = 1200
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur)
      const eased = 1 - Math.pow(1 - t, 3)
      statValues.value = stats.map((s) => Math.round(s.value * eased))
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && run()),
    { threshold: 0.3 },
  )
  io.observe(el)
})
</script>

<template>
  <div class="interactive-home">
    <!-- 领域切换 -->
    <section class="domain-section">
      <h2 class="section-title">不止一个领域，一个平台全搞定</h2>
      <p class="section-sub">点击领域，查看对应能力与模板覆盖</p>

      <div class="domain-tabs">
        <button
          v-for="d in domains"
          :key="d.key"
          class="domain-tab"
          :class="{ active: activeDomain === d.key }"
          :style="activeDomain === d.key ? { borderColor: d.color, background: d.color + '1a' } : {}"
          @click="activeDomain = d.key"
        >
          <span class="domain-icon">{{ d.icon }}</span>
          {{ d.name }}
        </button>
      </div>

      <div class="domain-card" :style="{ borderLeftColor: domainByKey(activeDomain).color }">
        <div class="domain-card-head">
          <span class="domain-big-icon">{{ domainByKey(activeDomain).icon }}</span>
          <h3 :style="{ color: domainByKey(activeDomain).color }">
            {{ domainByKey(activeDomain).name }}
          </h3>
        </div>
        <p class="domain-desc">{{ domainByKey(activeDomain).desc }}</p>
        <div class="domain-tags">
          <span
            v-for="t in domainByKey(activeDomain).tags"
            :key="t"
            class="domain-tag"
            :style="{ background: domainByKey(activeDomain).color + '22', color: domainByKey(activeDomain).color }"
          >{{ t }}</span>
        </div>
      </div>
    </section>

    <!-- 数字统计/滚动 -->
    <section class="stats-section" id="stats-box">
      <div v-for="(s, i) in stats" :key="s.label" class="stat-item">
        <div class="stat-value">{{ statValues[i] }}<span class="stat-suffix">{{ s.suffix }}</span></div>
        <div class="stat-label">{{ s.label }}</div>
      </div>
    </section>

    <!-- 界面预览画廊（点击放大） -->
    <section class="gallery-section">
      <h2 class="section-title">界面预览</h2>
      <p class="section-sub">点击任意截图即可放大查看</p>
      <div class="gallery-grid">
        <figure v-for="g in gallery" :key="g.src" class="gallery-item" @click="openLightbox(g)">
          <img :src="g.src" :alt="g.caption" loading="lazy" />
          <figcaption>{{ g.caption }}</figcaption>
        </figure>
      </div>
    </section>

    <!-- 放大遮罩 -->
    <div v-if="lightbox" class="lightbox" @click="lightbox = null">
      <figure>
        <img :src="lightbox.src" :alt="lightbox.caption" />
        <figcaption>{{ lightbox.caption }}</figcaption>
      </figure>
      <span class="lightbox-close">✕ 关闭</span>
    </div>

    <!-- FAQ 手风琴 -->
    <section class="faq-section">
      <h2 class="section-title">常见问题</h2>
      <div class="faq-list">
        <div
          v-for="(f, i) in faqs"
          :key="i"
          class="faq-item"
          :class="{ open: activeFaq === i }"
          @click="activeFaq = activeFaq === i ? -1 : i"
        >
          <div class="faq-q">
            <span class="faq-arrow">{{ activeFaq === i ? '▾' : '▸' }}</span>
            {{ f.q }}
          </div>
          <div v-show="activeFaq === i" class="faq-a">{{ f.a }}</div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.section-title {
  font-size: 1.7rem;
  font-weight: 700;
  margin-bottom: 0.4rem;
  text-align: center;
}
.section-sub {
  text-align: center;
  opacity: 0.7;
  margin-bottom: 1.6rem;
}

/* 领域切换 */
.domain-section {
  max-width: 860px;
  margin: 0 auto;
  padding: 1.5rem 0 2rem;
}
.domain-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  justify-content: center;
  margin-bottom: 1.4rem;
}
.domain-tab {
  border: 1.5px solid transparent;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  padding: 0.5rem 0.9rem;
  border-radius: 999px;
  font-size: 0.92rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}
.domain-tab:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
}
.domain-icon {
  font-size: 1rem;
}
.domain-card {
  border: 1px solid var(--vp-c-divider);
  border-left: 5px solid;
  border-radius: 12px;
  padding: 1.4rem 1.5rem;
  background: var(--vp-c-bg-soft);
  transition: border-color 0.2s ease;
  animation: fadeSlide 0.3s ease;
}
@keyframes fadeSlide {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
.domain-card-head {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-bottom: 0.6rem;
}
.domain-card-head h3 {
  margin: 0;
  font-size: 1.25rem;
}
.domain-big-icon {
  font-size: 1.6rem;
}
.domain-desc {
  margin: 0 0 1rem;
  line-height: 1.7;
  opacity: 0.9;
}
.domain-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.domain-tag {
  padding: 0.28rem 0.7rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
}

/* 统计 */
.stats-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  max-width: 860px;
  margin: 0 auto;
  padding: 2rem 0 2.5rem;
}
.stat-item {
  text-align: center;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 1.2rem 0.5rem;
}
.stat-value {
  font-size: 2.2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #42d392, #22a0d0);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.stat-suffix {
  font-size: 1.2rem;
}
.stat-label {
  margin-top: 0.3rem;
  font-size: 0.9rem;
  opacity: 0.75;
}

/* 界面预览画廊 */
.gallery-section {
  max-width: 980px;
  margin: 0 auto;
  padding: 1.5rem 0 2.5rem;
}
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}
.gallery-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
  cursor: zoom-in;
  margin: 0;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.gallery-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.16);
}
.gallery-item img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 10;
  object-fit: cover;
}
.gallery-item figcaption {
  padding: 0.55rem 0.8rem;
  font-size: 0.88rem;
  opacity: 0.85;
  text-align: center;
}

/* 放大遮罩 */
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.82);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-out;
  animation: lightboxIn 0.22s ease;
}
@keyframes lightboxIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.lightbox figure {
  margin: 0;
  max-width: 92vw;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
}
.lightbox img {
  max-width: 92vw;
  max-height: 80vh;
  border-radius: 8px;
  box-shadow: 0 12px 44px rgba(0, 0, 0, 0.55);
  object-fit: contain;
}
.lightbox figcaption {
  color: #fff;
  font-size: 0.95rem;
  opacity: 0.95;
}
.lightbox-close {
  position: fixed;
  top: 1.2rem;
  right: 1.4rem;
  color: #fff;
  font-size: 0.95rem;
  background: rgba(255, 255, 255, 0.14);
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  opacity: 0.85;
}

@media (max-width: 760px) {
  .gallery-grid { grid-template-columns: 1fr; }
}

/* FAQ */
.faq-section {
  max-width: 760px;
  margin: 0 auto;
  padding: 1rem 0 2.5rem;
}
.faq-list {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
}
.faq-item {
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
  cursor: pointer;
  transition: background 0.2s ease;
}
.faq-item:last-child { border-bottom: none; }
.faq-item:hover { background: var(--vp-c-bg-alt); }
.faq-q {
  padding: 1rem 1.2rem;
  font-weight: 600;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.faq-arrow {
  color: #42d392;
  font-size: 0.85rem;
}
.faq-a {
  padding: 0 1.2rem 1.1rem;
  line-height: 1.7;
  opacity: 0.85;
  font-size: 0.95rem;
  animation: fadeSlide 0.2s ease;
}

@media (max-width: 640px) {
  .stats-section { grid-template-columns: repeat(2, 1fr); }
  .stat-value { font-size: 1.7rem; }
}
</style>