import { h } from '../../lib/guide-mini-vue.esm.js'

window.self = null
export const app = {
  render() {
    window.self = this
    return h('div', { id: 'root', class: 'red' },
      'hi' + this.msg
      // [h('h1', { class: 'title' }, 'Hi'), h('p', { class: 'content' }, 'mini-vue')]
    )
  },
  setup() {
    return {
      msg: 'hello mini vue'
    }
  }
}