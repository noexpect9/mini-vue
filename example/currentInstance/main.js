import { createApp } from '../../lib/guide-mini-vue.esm.js'
import { app } from './app.js'

const rootContainer = document.querySelector('#app')
createApp(app).mount(rootContainer)