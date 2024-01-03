import { shallowReadonly } from "../reactivity/reactive"
import { emit } from "./componentEmit"
import { initProps } from "./componentProps"
import { publicIntanceProxyHandlers } from "./componentPublicInstance"

// 创建component实例
export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    emit: () => {}
  }
  component.emit = emit.bind(null, component) as any
  return component
}

// 挂载
export function setupComponent(instance) {
  // TODO
  initProps(instance, instance.vnode.props)
  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance) {
  const Component = instance.type
  const { setup } = Component
  instance.proxy = new Proxy({ _: instance }, publicIntanceProxyHandlers)
  if (setup) {
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit
    })
    handleSetupResult(instance, setupResult)
  }
}

function handleSetupResult(instance, setupResult: any) {
  if (typeof setupResult === 'object') {
    instance.setupState = setupResult
  }
  finishComponentSetup(instance)
}

function finishComponentSetup(instance: any) {
  const Component = instance.type
  if (Component.render) {
    instance.render = Component.render
  }
}

