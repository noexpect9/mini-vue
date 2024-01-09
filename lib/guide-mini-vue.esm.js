const extend = Object.assign;
const isObject = (value) => {
    return value !== null && typeof value === 'object';
};
const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);
// 正则将字符串转换为驼峰 ‘add-foo’ -> addFoo
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : '';
    });
};
// 将第一个首字母大写
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
// event前加on
const toHandlerKey = (str) => {
    return str ? "on" + capitalize(str) : "";
};

// 收集依赖 key value 唯一值
const targetMap = new Map();
function trigger(target, key) {
    const depsMap = targetMap.get(target);
    const dep = depsMap.get(key);
    triggerEffect(dep);
}
function triggerEffect(dep) {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key) {
        if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* ReactiveFlags.IS_READONLY */) {
            return isReadonly;
        }
        const res = Reflect.get(target, key);
        if (shallow) {
            return res;
        }
        // 查看res是不是object
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        trigger(target, key);
        return res;
    };
}
const mutableHandlers = {
    get,
    set
};
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key, value) {
        console.warn(`target.${key} is readonly`, target);
        return true;
    }
};
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet
});

function createActiveObject(raw, baseHandlers) {
    if (!isObject(raw)) {
        console.warn(`target ${raw} 必须是一个对象`);
    }
    return new Proxy(raw, baseHandlers);
}
function reactive(raw) {
    return createActiveObject(raw, mutableHandlers);
}
function shallowReadonly(raw) {
    return createActiveObject(raw, shallowReadonlyHandlers);
}
function readonly(raw) {
    return createActiveObject(raw, readonlyHandlers);
}

function emit(instance, event, ...args) {
    const { props } = instance;
    const handleName = toHandlerKey(camelize(event));
    const handler = props[handleName];
    handler && handler(...args);
}

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

// this.$el
const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots
};
const publicIntanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        if (key in setupState) {
            return setupState[key];
        }
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

const initSlots = (instance, children) => {
    // slots
    const { vnode } = instance;
    if (vnode.shapeFlag & 16 /* ShapeFlags.SLOTS_CHILDREN */) {
        normalizeObjectSlot(instance, children);
    }
};
function normalizeObjectSlot(instance, children) {
    const slots = {};
    for (const key in children) {
        const value = children[key];
        slots[key] = (props) => normalizeChildren(value(props));
    }
    instance.slots = slots;
}
function normalizeChildren(vnodes) {
    return Array.isArray(vnodes) ? vnodes : [vnodes];
}

// 创建component实例
function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        emit: () => { }
    };
    // emit需要传入组件实例
    component.emit = emit.bind(null, component);
    return component;
}
// 挂载
function setupComponent(instance) {
    // 初始化props
    initProps(instance, instance.vnode.props);
    // 初始化slots
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    const { setup } = Component;
    instance.proxy = new Proxy({ _: instance }, publicIntanceProxyHandlers);
    if (setup) {
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        });
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    if (Component.render) {
        instance.render = Component.render;
    }
}

const Fragment = Symbol('Fragment');
const Text$1 = Symbol('Text');
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        key: props && props.key,
        children,
        component: null,
        shapeFlag: getShapeFlag(type),
        el: null
    };
    // children
    if (typeof children === 'string') {
        vnode.shapeFlag |= 4 /* ShapeFlags.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 8 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    // 组件 + children object
    if (vnode.shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        if (typeof children === 'object') {
            vnode.shapeFlag |= 16 /* ShapeFlags.SLOTS_CHILDREN */;
        }
    }
    return vnode;
}
function getShapeFlag(type) {
    return typeof type === 'string'
        ? 1 /* ShapeFlags.ELEMENT */
        : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
}
function createTextVNode(text) {
    return createVNode(Text, {}, text);
}

// render操作
function render(vnode, container) {
    patch(vnode, container);
}
function patch(vnode, container) {
    const { type, shapeFlag } = vnode;
    // Fragment -> 只渲染children
    switch (type) {
        case Fragment:
            progressFragment(vnode, container);
            break;
        case Text:
            progressText(vnode, container);
            break;
        default:
            // 判断是否是element
            if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                progressElement(vnode, container);
            }
            else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
                progressComponent(vnode, container);
            }
            break;
    }
}
// 处理component
function progressComponent(vnode, container) {
    mountComponent(vnode, container);
}
// 处理element
function progressElement(vnode, container) {
    mountElement(vnode, container);
}
// 处理Fragment
function progressFragment(vnode, container) {
    mountChildren(vnode, container);
}
// 处理Text
function progressText(vnode, container) {
    const { children } = vnode;
    const textNode = document.createTextNode(children);
    vnode.el = textNode;
    container.appendChild(textNode);
}
// 挂载element
function mountElement(vnode, container) {
    const { type, props, children, shapeFlag } = vnode;
    const el = (vnode.el = document.createElement(type));
    if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
        mountChildren(vnode, el);
    }
    for (const key in props) {
        const val = props[key];
        const isOn = (key) => /^on[A-Z]/.test(key);
        if (isOn(key)) {
            // 获取key中事件名称
            const event = key.slice(2).toLowerCase();
            // 注册事件
            el.addEventListener(event, val);
        }
        else {
            el.setAttribute(key, val);
        }
    }
    container.appendChild(el);
}
// 挂载Component
function mountComponent(initVNode, container) {
    const instance = createComponentInstance(initVNode);
    setupComponent(instance);
    setupRenderEffect(instance, initVNode, container);
}
function setupRenderEffect(instance, initVNode, container) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    patch(subTree, container);
    initVNode.el = subTree.el;
}
function mountChildren(vnode, container) {
    vnode.children.forEach(child => {
        patch(child, container);
    });
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // component -> vnode 所有操作都会基于vnode
            const vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

function renderSlots(slots, name, props) {
    const slot = slots[name];
    if (slot) {
        if (typeof slot === 'function') {
            return createVNode(Fragment, {}, slot(props));
        }
    }
}

export { createApp, createTextVNode, h, renderSlots };
