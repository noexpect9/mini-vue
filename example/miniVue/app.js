import { h } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './Foo.js'

window.self = null
export const app = {
  render() {
    window.self = this
    return h('div', {
      id: 'root', class: 'red', onClick() {
        console.log('click')
      }
    },
      [h('div', { class: 'title' }, 'Hi' + this.masg), h(Foo, {
        count: 10
      })]
    )
  },
  setup() {
    return {
      msg: 'hello mini vue'
    }
  }
}