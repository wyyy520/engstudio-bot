<script setup>
import { ref } from 'vue'
import { useRouter, withBase } from 'vitepress'

const router = useRouter()
const showCoffee = ref(false)
const showContact = ref(false)
const copied = ref(false)

const email = 'wangyangzzu@outlook.com'

function openCoffee() {
  showCoffee.value = true
  showContact.value = false
}

function openContact() {
  showContact.value = true
  showCoffee.value = false
}

async function copyEmail() {
  try {
    await navigator.clipboard.writeText(email)
  } catch (e) {
    const ta = document.createElement('textarea')
    ta.value = email
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

function closeAll() {
  showCoffee.value = false
  showContact.value = false
}
</script>

<template>
  <div class="nav-buttons">
    <vpi-switch v-if="router.route.path === '/'" style="margin-right: 12px" />
    <a class="nav-btn nav-btn-coffee" href="javascript:void(0)" @click="openCoffee">☕ 请喝咖啡</a>
    <a class="nav-btn nav-btn-contact" href="javascript:void(0)" @click="openContact">💬 联系作者</a>

    <!-- Coffee modal -->
    <teleport to="body">
      <transition name="modal">
        <div v-if="showCoffee" class="modal-mask" @click.self="closeAll">
          <div class="modal-card">
            <button class="modal-close" @click="closeAll">✕</button>
            <h3>☕ 请助力一杯咖啡</h3>
            <p class="modal-sub">如果你觉得 EngStudio 对你有所帮助，欢迎扫描下方付款码支持一下～</p>
            <div class="coffee-img-wrap">
              <img :src="withBase('/coffee.jpg')" alt="请喝咖啡付款码" class="coffee-img" />
            </div>
            <p class="modal-tip">您的支持是我持续更新的动力，感谢！</p>
          </div>
        </div>
      </transition>

      <transition name="modal">
        <div v-if="showContact" class="modal-mask" @click.self="closeAll">
          <div class="modal-card">
            <button class="modal-close" @click="closeAll">✕</button>
            <h3>💬 联系作者</h3>
            <p class="modal-sub">有建议、问题或商务合作，欢迎通过邮箱联系：</p>
            <div class="email-box">
              <span class="email-text">{{ email }}</span>
              <button class="copy-btn" @click="copyEmail">
                {{ copied ? '✅ 已复制' : '📋 复制' }}
              </button>
            </div>
            <p class="modal-tip">一般会在 1-2 个工作日内回复。</p>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<style scoped>
.nav-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 8px;
}
.nav-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s ease;
}
.nav-btn-coffee {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff;
}
.nav-btn-coffee:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(217, 119, 6, 0.35);
  color: #fff;
}
.nav-btn-contact {
  background: transparent;
  border: 1.5px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
}
.nav-btn-contact:hover {
  border-color: #42d392;
  color: #42d392;
}

.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.modal-card {
  position: relative;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  padding: 2rem 2rem 1.6rem;
  max-width: 440px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
  text-align: center;
}
.modal-card h3 {
  margin: 0 0 0.6rem;
  font-size: 1.3rem;
}
.modal-sub {
  margin: 0 0 1.2rem;
  opacity: 0.75;
  font-size: 0.95rem;
  line-height: 1.6;
}
.modal-close {
  position: absolute;
  top: 12px;
  right: 14px;
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  color: var(--vp-c-text-2);
  padding: 4px 6px;
}
.modal-close:hover { color: var(--vp-c-text-1); }
.coffee-img-wrap {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  margin-bottom: 1rem;
}
.coffee-img {
  width: 100%;
  display: block;
}
.modal-tip {
  margin: 0;
  font-size: 0.85rem;
  opacity: 0.6;
}
.email-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 0.8rem 1rem;
  margin: 0 0 1rem;
}
.email-text {
  font-family: monospace;
  font-size: 0.95rem;
  word-break: break-all;
}
.copy-btn {
  flex-shrink: 0;
  padding: 6px 12px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #42d392, #22a0d0);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}
.copy-btn:hover { opacity: 0.9; }

.modal-enter-active, .modal-leave-active { transition: opacity 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .modal-card { transition: transform 0.25s ease; }
.modal-enter-from .modal-card { transform: scale(0.92); }
.modal-leave-to .modal-card { transform: scale(0.95); }

@media (max-width: 720px) {
  .nav-btn { display: none; }
}
</style>