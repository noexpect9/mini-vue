import { h, createTextVNode, getCurrentInstance } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './Foo.js'

window.self = null
export const app = {
  render() {
    return h("div", {}, this.msg)
  },
  setup() {
    return {
      msg: 'hello mini vue'
    }
  }
}