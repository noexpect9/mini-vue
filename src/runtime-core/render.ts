import { isObject } from "../shared";
import { createComponentInstance, setupComponent } from "./component"

// render操作
export function render(vnode, container) {
  patch(vnode, container)
}

function patch(vnode, container) {
  // 判断是否是element
  if (typeof vnode.type === 'string') {
    progressElement(vnode, container)
  } else if (isObject(vnode.type)) {
    progressComponent(vnode, container)
  }
}

// 处理component
function progressComponent(vnode, container) {
  mountComponent(vnode, container)
}

// 处理element
function progressElement(vnode: any, container: any) {
  mountElement(vnode, container)
}

// 挂载element
function mountElement(vnode: any, container: any) {
  const { type, prop, children } = vnode
  const el = (vnode.el = document.createElement(type))
  if (typeof children === 'string') {
    el.textContent = children
  } else if (Array.isArray(children)) {
    mountChildren(vnode, el)
  }
  for (const key in prop) {
    const val = prop[key]
    el.setAttribute(key, val)
  }
  container.appendChild(el)
}

// 挂载Component
function mountComponent(initVNode: any, container: any) {
  const instance = createComponentInstance(initVNode)
  setupComponent(instance)
  setupRenderEffect(instance, initVNode, container)
}
function setupRenderEffect(instance: any, initVNode: any, container: any) {
  const { proxy } = instance
  const subTree = instance.render.call(proxy)
  patch(subTree, container)
  initVNode.el = subTree.el
}

function mountChildren(vnode: any, container: any) {
  vnode.children.forEach(child => {
    patch(child, container)
  })
}
