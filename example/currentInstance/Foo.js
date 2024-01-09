import { h, renderSlots } from '../../lib/guide-mini-vue.esm.js'


export const Foo = {
  setup() {

  },
  render() {
    const foo = h("p", {}, "foo")
    const age = 19
    console.log(this.$slots)
    return h("div", {}, [renderSlots(this.$slots, 'header', {
      age
    }), foo, renderSlots(this.$slots, 'footer')])
  }
}