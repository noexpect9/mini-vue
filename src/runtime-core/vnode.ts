export function createVNode(type, props?, children?) {
  const vnode = {
    type,
    props,
    key: props && props.key,
    children,
    component: null,
    el: null
  }
  return vnode
}