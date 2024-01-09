import { h, createTextVNode } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './Foo.js'

window.self = null
export const app = {
  render() {
    window.self = this
    const app = h('div', {}, 'mini vue app')
    const foo = h(Foo, {}, {
      header: ({ age }) => [h("p", {}, "header" + age),
        createTextVNode("this is header")
      ],
      footer: () => h("p", {}, "footer")
    })
    return h("div", {}, [app, foo])
  },
  setup() {
    return {
      msg: 'hello mini vue'
    }
  }
}