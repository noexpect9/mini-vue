import { h, ref } from "../../lib/guide-mini-vue.esm.js"
export const App = {
  name: "App",
  setup() {
    const count = ref(1)

    const onClick = () => {
      count.value++
    }
    const props = ref({
      foo: 'foo',
      bar: 'bar',
    })
    const onChangePropsDemo1 = () => {
      props.value.foo = 'foo1'
    }
    const onChangePropsDemo2 = () => {
      props.value.foo = undefined
    }
    const onChangePropsDemo3 = () => {
      props.value = {
        foo: "foo"
      }
    }
    return {
      count,
      onClick,
      onChangePropsDemo1,
      onChangePropsDemo2,
      onChangePropsDemo3,
      props
    }
  },
  render() {
    return h("div", { id: "root", ...this.props }, [
      h("div", {}, "count:" + this.count),
      h("button", { onClick: this.onClick }, "click"),
      h("button", { onClick: this.onChangePropsDemo1 }, "changePropsDemo1"),
      h("button", { onClick: this.onChangePropsDemo2 }, "changePropsDemo2"),
      h("button", { onClick: this.onChangePropsDemo3 }, "changePropsDemo3"),
    ])
  }
}