import { h } from '../../lib/guide-mini-vue.esm'
export const app = {
  render() {
    return h('div', 'hi' + this.msg)
  },
  setup() {
    return {
      msg: 'hello mini vue'
    }
  }
}