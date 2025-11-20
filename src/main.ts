import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Naive UI 的通用配置
import naive from 'naive-ui'

const app = createApp(App)

app.use(router)
app.use(naive)

app.mount('#app')
