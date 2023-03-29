
/** @type {Map<string, Array<function>>} */
const listeners = new Map();

export const globalData = {
    authKey: "",
}

export const setData = (name, value) => {
    globalData[name] = value;
    if (listeners.has(name)) {
        for (const fun of listeners.get(name)) {
            fun(value);
        }
    }
}

export const addListener = (name, cb) => {
    if (!listeners.has(name)) {
        listeners.set(name, []);
    }
    listeners.get(name).push(cb);
}

export const removeListener = (name, cb) => {
    if (listeners.has(name)) {
        const index = listeners.get(name).indexOf(cb);
        if (index >= 0) {
            listeners.get(name).splice(index, 1);
        }
    }
}
