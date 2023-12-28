import { publicIntanceProxyHandlers } from "./componentPublicInstance"

// 创建component实例
export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
  }
  return component
}

// 挂载
export function setupComponent(instance) {
  // TODO
  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance) {
  const Component = instance.type
  const { setup } = Component
  instance.proxy = new Proxy({ _: instance }, publicIntanceProxyHandlers)
  if (setup) {
    const setupResult = setup()
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

