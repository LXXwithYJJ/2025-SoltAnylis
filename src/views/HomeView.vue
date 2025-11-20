<script setup lang="ts">
import { NButton, NSpace } from 'naive-ui';
import { useRouter } from 'vue-router';

const router = useRouter();

const goToSearch = () => {
  router.push('/search');
};

</script>

<template>
  <div class="home">
    <h1>科研成果检索平台</h1>
    <n-space vertical :size="20">
      <p>欢迎使用科研成果检索平台</p>
      <n-button type="primary" size="large" @click="goToSearch">
        进入检索页面
      </n-button>
    </n-space>
  </div>
</template>

<style scoped>
.home {
  padding: 20px;
  text-align: center;
  margin-top: 100px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

h1 {
  font-size: 2.5em;
  margin-bottom: 30px;
  color: #333;
}

p {
  font-size: 1.2em;
  color: #666;
}
</style>
