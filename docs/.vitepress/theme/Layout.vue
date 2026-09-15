<script setup>
import DefaultTheme from 'vitepress/theme'
import NavButtons from './NavButtons.vue'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #nav-bar-content-after>
      <NavButtons />
    </template>
  </Layout>
</template>