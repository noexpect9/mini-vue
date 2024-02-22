import { createRenderer } from "../runtime-core";

function createElement(type) {
  return document.createElement(type)
}

function patchProps(el, key, val) {
  const isOn = (key: string) => /^on[A-Z]/.test(key)
  if (isOn(key)) {
    // 获取key中事件名称
    const event = key.slice(2).toLowerCase()
    // 注册事件
    el.addEventListener(event, val)
  } else {
    el.setAttribute(key, val)
  }
}

function insert(el, parent) {
  parent.appendChild(el)
}


const renderer: any = createRenderer({
  createElement,
  patchProps,
  insert
})

export function createApp(...args) {
  return renderer.createApp(...args)
}

export * from "../runtime-core";
