import { h, createTextVNode, getCurrentInstance } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './Foo.js'

export const app = {
  name: 'App',
  render() {
    return h("div", {}, [h("p", {}, "current demo")])
  },
  setup() {
    const instance = getCurrentInstance()
    console.log(instance)
  }
}