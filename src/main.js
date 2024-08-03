import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'

import axios from 'axios'

import './assets/css/global.css'

document.title = 'File System'

axios.defaults.baseURL = 'http://locahost:8080/'

axios.interceptors.request.use(config => {
  config.headers.token = window.sessionStorage.getItem('token')
  return config
})

Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
