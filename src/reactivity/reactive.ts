import { isObject } from "../shared"
import { mutableHandlers, readonlyHandlers, shallowReadonlyHandlers } from "./baseHandlers"

export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly"
}

function createActiveObject(raw, baseHandlers) {
  if (!isObject(raw)) {
    console.warn(`target ${raw} 必须是一个对象`)
  }
  return new Proxy(raw, baseHandlers)
}

export function reactive(raw) {
  return createActiveObject(raw, mutableHandlers)
}

export function shallowReadonly(raw) {
  return createActiveObject(raw, shallowReadonlyHandlers)
}

export function isReactive(value) {
  return !!value[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(value) {
  return !!value[ReactiveFlags.IS_READONLY]
}

export function readonly(raw) {
  return createActiveObject(raw, readonlyHandlers)
}

export function isProxy(value) {
  return isReactive(value) || isReadonly(value)
}
