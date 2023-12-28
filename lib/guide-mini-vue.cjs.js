'use strict';

const isObject = (value) => {
    return value !== null && typeof value === 'object';
};

// this.$el
const publicPropertiesMap = {
    $el: (i) => i.vnode.el
};
const publicIntanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState } = instance;
        if (key in setupState) {
            return setupState[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

// 创建component实例
function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
    };
    return component;
}
// 挂载
function setupComponent(instance) {
    // TODO
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    const { setup } = Component;
    instance.proxy = new Proxy({ _: instance }, publicIntanceProxyHandlers);
    if (setup) {
        const setupResult = setup();
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

// render操作
function render(vnode, container) {
    patch(vnode, container);
}
function patch(vnode, container) {
    // 判断是否是element
    if (typeof vnode.type === 'string') {
        progressElement(vnode, container);
    }
    else if (isObject(vnode.type)) {
        progressComponent(vnode, container);
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
// 挂载element
function mountElement(vnode, container) {
    const { type, prop, children } = vnode;
    const el = (vnode.el = document.createElement(type));
    if (typeof children === 'string') {
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
        mountChildren(vnode, el);
    }
    for (const key in prop) {
        const val = prop[key];
        el.setAttribute(key, val);
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

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        key: props && props.key,
        children,
        component: null,
        el: null
    };
    return vnode;
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

exports.createApp = createApp;
exports.h = h;
