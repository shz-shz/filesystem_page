import Vue from 'vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import { Message, MessageBox } from 'element-ui'

Vue.use(ElementUI);
Vue.prototype.$message = Message
Vue.prototype.$confirm = MessageBox.confirm