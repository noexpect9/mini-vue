import { extend } from "../shared"
let activeEffect, shouldTrack

export class ReactiveEffect {
  private _fn: any
  deps = []
  active = true
  onStop?: () => void
  constructor(fn, public scheduler?) {
    this._fn = fn
  }
  run() {
    if (!this.active) {
      return this._fn()
    }
    shouldTrack = true
    activeEffect = this
    const result = this._fn()
    shouldTrack = false
    return result
  }
  stop() {
    if (this.active) {
      clearupEffect(this)
      if (this.onStop) {
        this.onStop()
      }
      this.active = false
    }
  }
}

function clearupEffect(effect) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect)
  })
  effect.deps.length = 0
}

// 收集依赖 key value 唯一值
const targetMap = new Map()
export function track(target, key) {
  if (!isTracking()) return
  // target -> key -> dep 对应唯一
  let depsMap = targetMap.get(target)
  // 判断是否存在 初始化
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }
  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Set()
    depsMap.set(key, dep)
  }
  trackEffect(dep)
}

export function trackEffect(dep) {
  if (dep.has(activeEffect)) return
  dep.add(activeEffect)
  activeEffect.deps.push(dep)
}

export function isTracking() {
  return shouldTrack && activeEffect !== undefined
}

export function trigger(target, key) {
  const depsMap = targetMap.get(target)
  const dep = depsMap.get(key)
  triggerEffect(dep)
}

export function triggerEffect(dep) {
  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }
}

export function effect(fn, options: any = {}) {
  // fn()
  const _effect = new ReactiveEffect(fn, options.scheduler)
  // 1. _effect.onStop = options.onStop
  // 2. Object.assign(_effect, options)
  extend(_effect, options)
  _effect.run()
  const runner: any = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner
}

export function stop(runner) {
  runner.effect.stop()
}