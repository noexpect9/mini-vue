import { ShapeFlags } from "../shared/ShapeFlags"

export const initSlots = (instance, children) => {
  // slots
  const { vnode } = instance
  if (vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN) {
    normalizeObjectSlot(instance, children)
  }
}

function normalizeObjectSlot(instance, children) {
  const slots = {}
  for (const key in children) {
    const value = children[key]
    slots[key] = (props) => normalizeChildren(value(props))
  }
  instance.slots = slots
}

function normalizeChildren(vnodes) {
  return Array.isArray(vnodes) ? vnodes : [vnodes]
}