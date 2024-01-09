export const extend = Object.assign
export const isObject = (value) => {
  return value !== null && typeof value === 'object'
}
export const hasChanged = (value, oldValue) => {
  return !Object.is(value, oldValue)
}

export const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key)

// 正则将字符串转换为驼峰 ‘add-foo’ -> addFoo
export const camelize = (str: string) => {
  return str.replace(/-(\w)/g, (_, c) => {
    return c ? c.toUpperCase() : ''
  })
}

// 将第一个首字母大写
export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// event前加on
export const toHandlerKey = (str: string) => {
  return str ? "on" + capitalize(str) : ""
}