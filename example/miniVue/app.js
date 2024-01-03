import { h } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './Foo.js'

window.self = null
export const app = {
  render() {
    window.self = this
    return h('div', {
      id: 'root', class: 'red', onClick() {
      }
    },
      [h('div', { class: 'title' }, 'Hi' + this.masg), h(Foo, {
        onAdd(a, b) {
          console.log('onAdd', '============', a, b)
        },
        onAddFoo() {
          console.log('onAddFoo')
        }
      })]
    )
  },
  setup() {
    return {
      msg: 'hello mini vue'
    }
  }
}