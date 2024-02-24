import { effect } from "../reactivity/effect";
import { EMPTY_OBJ, isObject } from "../shared";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component"
import { createAppAPI } from "./createApp";
import { Fragment } from "./vnode";

// render操作
export function createRenderer(renderOptions) {
  const { createElement, hostPatchProp, insert } = renderOptions
  function render(vnode, container, parentComponent) {
    patch(null, vnode, container, null)
  }

  // n1: 旧的vnode
  // n2: 新的vnode
  function patch(n1, n2, container, parentComponent) {
    const { type, shapeFlag } = n2
    // Fragment -> 只渲染children
    switch (type) {
      case Fragment:
        progressFragment(n1, n2, container, parentComponent)
        break;
      case Text:
        progressText(n1, n2, container)
        break;
      default:
        // 判断是否是element
        if (shapeFlag & ShapeFlags.ELEMENT) {
          progressElement(n1, n2, container, parentComponent)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          progressComponent(n1, n2, container, parentComponent)
        }
        break
    }

  }

  // 处理component
  function progressComponent(n1, n2, container, parentComponent) {
    mountComponent(n2, container, parentComponent)
  }

  // 处理element
  function progressElement(n1, n2: any, container: any, parentComponent) {
    if (!n1) {
      mountElement(n2, container, parentComponent)
    } else {
      patchElement(n1, n2, container)
    }
  }
  // 处理更新操作
  function patchElement(n1, n2, container) {
    console.log('patchElement', n2, n1);
    // 下次更新时n2中是没有el的
    const el = (n2.el = n1.el)
    const oldProps = n1.props || EMPTY_OBJ
    const newProps = n2.props || EMPTY_OBJ
    patchProp(el, oldProps, newProps)
  }

  function patchProp(el, oldProps, newProps) {
    if (oldProps !== newProps) {
      // 循环新的props
      for (const key in newProps) {
        const prevProp = oldProps[key]
        const nextProp = newProps[key]
        if (prevProp !== nextProp) {
          hostPatchProp(el, key, prevProp, nextProp)
        }
      }
      // oldProps在新的props中不存在
      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          if (!(key in newProps)) {
            hostPatchProp(el, key, oldProps[key], null)
          }
        }
      }
    }
  }

  // 处理Fragment
  function progressFragment(n1, n2: any, container: any, parentComponent) {
    mountChildren(n2, container, parentComponent)
  }

  // 处理Text
  function progressText(n1, n2: any, container: any) {
    const { children } = n2
    const textNode = document.createTextNode(children)
    n2.el = textNode
    container.appendChild(textNode)
  }

  // 挂载element
  function mountElement(vnode: any, container: any, parentComponent) {

    const { type, props, children, shapeFlag } = vnode
    const el = (vnode.el = createElement(type))
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode, el, parentComponent)
    }

    for (const key in props) {
      const val = props[key]
      hostPatchProp(el, key, null, val)
    }
    // container.appendChild(el)
    insert(el, container)
  }

  // 挂载Component
  function mountComponent(initVNode: any, container: any, parentComponent) {
    const instance = createComponentInstance(initVNode, parentComponent)
    setupComponent(instance)
    setupRenderEffect(instance, initVNode, container, parentComponent)
  }
  function setupRenderEffect(instance: any, initVNode: any, container: any, parentComponent) {
    effect(() => {
      if (!instance.isMounted) {
        console.log('init');
        const { proxy } = instance
        const subTree = (instance.subTree = instance.render.call(proxy))
        patch(null, subTree, container, instance)
        initVNode.el = subTree.el
        instance.isMounted = true
      } else {
        console.log('update');
        const { proxy } = instance
        const subTree = instance.render.call(proxy)
        const prevSubTree = instance.subTree
        instance.subTree = subTree
        patch(prevSubTree, subTree, container, instance)
      }
    })
  }

  function mountChildren(vnode: any, container: any, parentComponent) {
    vnode.children.forEach(child => {
      patch(null, child, container, parentComponent)
    })
  }

  return {
    createApp: createAppAPI(render)
  }
}

