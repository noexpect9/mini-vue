import { createRenderer } from "../runtime-core";

function createElement(type) {
  return document.createElement(type)
}

function patchProps(el, key, prevVal, nextVal) {
  const isOn = (key: string) => /^on[A-Z]/.test(key)
  if (isOn(key)) {
    // 获取key中事件名称
    const event = key.slice(2).toLowerCase()
    // 注册事件
    el.addEventListener(event, nextVal)
  } else {
    // 如果nextVal是null/undefined,那么就是删除该属性
    if (nextVal === undefined || nextVal === null) {
      el.removeAttribute(key)
    } else {
      el.setAttribute(key, nextVal)
    }
  }
}

function insert(el, parent) {
  parent.appendChild(el)
}


const renderer: any = createRenderer({
  createElement,
  hostPatchProp: patchProps,
  insert
})

export function createApp(...args) {
  return renderer.createApp(...args)
}

export * from "../runtime-core";
