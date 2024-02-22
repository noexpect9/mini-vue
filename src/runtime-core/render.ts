import { isObject } from "../shared";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component"
import { Fragment } from "./vnode";

// render操作
export function render(vnode, container, parentComponent) {
  patch(vnode, container, null)
}

function patch(vnode, container, parentComponent) {
  const { type, shapeFlag } = vnode
  // Fragment -> 只渲染children
  switch (type) {
    case Fragment:
      progressFragment(vnode, container, parentComponent)
      break;
    case Text:
      progressText(vnode, container)
      break;
    default:
      // 判断是否是element
      if (shapeFlag & ShapeFlags.ELEMENT) {
        progressElement(vnode, container, parentComponent)
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        progressComponent(vnode, container, parentComponent)
      }
      break
  }

}

// 处理component
function progressComponent(vnode, container, parentComponent) {
  mountComponent(vnode, container, parentComponent)
}

// 处理element
function progressElement(vnode: any, container: any, parentComponent) {
  mountElement(vnode, container, parentComponent)
}

// 处理Fragment
function progressFragment(vnode: any, container: any, parentComponent) {
  mountChildren(vnode, container, parentComponent)
}

// 处理Text
function progressText(vnode: any, container: any) {
  const { children } = vnode
  const textNode = document.createTextNode(children)
  vnode.el = textNode
  container.appendChild(textNode)
}

// 挂载element
function mountElement(vnode: any, container: any, parentComponent) {

  const { type, props, children, shapeFlag } = vnode

  const el = (vnode.el = document.createElement(type))
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(vnode, el, parentComponent)
  }

  for (const key in props) {
    const val = props[key]
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
  container.appendChild(el)
}

// 挂载Component
function mountComponent(initVNode: any, container: any, parentComponent) {
  const instance = createComponentInstance(initVNode, parentComponent)
  setupComponent(instance)
  setupRenderEffect(instance, initVNode, container, parentComponent)
}
function setupRenderEffect(instance: any, initVNode: any, container: any, parentComponent) {
  const { proxy } = instance
  const subTree = instance.render.call(proxy)
  patch(subTree, container, instance)
  initVNode.el = subTree.el
}

function mountChildren(vnode: any, container: any, parentComponent) {
  vnode.children.forEach(child => {
    patch(child, container, parentComponent)
  })
}
