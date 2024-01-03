import { h } from '../../lib/guide-mini-vue.esm.js'


export const Foo = {
  setup(props, { emit }) {
    const emitClick = () => {
      console.log('emitClick')
      emit('add', 1, 2)
      emit('add-foo')
    }
    return {
      emitClick
    }
  },
  render() {
    const btn = h('button', {
      onClick: this.emitClick
    }, 'emitClick')
    const foo = h('div', {}, 'foo')
    return h("div", {}, [foo, btn])
  }
}