const mutablePreset = {
  hasPath(state, key) {
    return state.hasOwnProperty(key);
  },
  getValueByKey(state, key) {
    return state[key];
  },
  mergeStateAndPayload(state, payload) {
    if (typeof state === 'object') {
      return Object.assign(state, payload);
    }
    return payload;
  },
  insertValueToStateByPath(state, key, value) {
    state[key] = value;

    return state;
  },
};

const safeExecutor = (f, ...args) => {
  try {
    return f(...args);
  } catch (error) {
    // Continue work
    // but throw error with stack trace for `window.onerror`
    const errorWithStack = new Error(error);
    setTimeout(() => {
      throw errorWithStack;
    });
  }
};

const path = (key, initialState = {}, updaterPreset = mutablePreset) =>
  new Path(
    key, //
    initialState,
    updaterPreset, //
    createMainCore(key, initialState, updaterPreset), // parent
  );

const createMainCore = (key, initialState) => {
  key = key || 'root';

  const rootState = { [key]: initialState };

  const get = () => rootState;

  const __setChildStateToOwnStateByPath = (childKey, childNewState) => {
    rootState[key] = childNewState;
  };

  const updates = new Map();
  let nestedLevel = 0;
  const __addWatchersForUpdate = (watchers, state) =>
    void updates.set(watchers, state);
  const __freezeWatchers = () => void ++nestedLevel;
  const __unfreezeWatchers = () => {
    if (--nestedLevel !== 0) return;
    for (const [watchers, state] of updates) {
      for (const watcher of watchers) safeExecutor(watcher, state);
    }
    updates.clear();
  };

  const defaultPath = [];
  const getPath = () => defaultPath;

  const __catchError = error => {
    nestedLevel = 0;
    updates.clear();
    throw error;
  };

  return {
    get,
    __setChildStateToOwnStateByPath,
    __addWatchersForUpdate,
    __freezeWatchers,
    __unfreezeWatchers,
    getPath,
    __catchError,
  };
};

class PathSystem {
  constructor(key, initialState, updaterPreset, parent) {
    this.__key = key;
    this.__updaterPreset = updaterPreset;
    this.__parent = parent;

    this.__ignoreSetFromChildLevel = 0;
    this.__watchers = new Set();
    this.__children = new Map();

    this.__freezeWatchers = parent.__freezeWatchers;
    this.__unfreezeWatchers = parent.__unfreezeWatchers;
    this.__addWatchersForUpdate = parent.__addWatchersForUpdate;
    this.__catchError = parent.__catchError;
  }

  __setChildStateToOwnStateByPath(childKey, childState) {
    if (this.__ignoreSetFromChildLevel !== 0) return;

    const newState = this.__updaterPreset.insertValueToStateByPath(
      this.get(),
      childKey,
      childState,
    );
    this.__parent.__setChildStateToOwnStateByPath(this.__key, newState);
    this.__parent.__addWatchersForUpdate(this.__watchers, newState);
  }
}

class Path extends PathSystem {
  get() {
    return this.__updaterPreset.getValueByKey(this.__parent.get(), this.__key);
  }

  set(payload) {
    let newState;

    this.__freezeWatchers();

    try {
      if (
        this.__children.size !== 0 &&
        typeof payload === 'object' &&
        payload !== null
      ) {
        this.__ignoreSetFromChildLevel++;

        const childrenWithPath = this.__children;
        const newChildren = Object.entries(payload);

        // need to update only overlapped children
        if (childrenWithPath.size < newChildren.length) {
          for (const [key, value] of childrenWithPath.entries()) {
            value.set(payload[key]);
          }
        } else {
          for (const [key, value] of newChildren) {
            const child = childrenWithPath.get(key);
            if (child !== undefined) child.set(value);
          }
        }
        this.__ignoreSetFromChildLevel--;
      }

      newState = this.__updaterPreset.mergeStateAndPayload(this.get(), payload);
      this.__parent.__setChildStateToOwnStateByPath(this.__key, newState);
    } catch (e) {
      this.__ignoreSetFromChildLevel--;
      this.__catchError(e, this.getPath());
    }
    this.__addWatchersForUpdate(this.__watchers, newState);
    this.__unfreezeWatchers();

    return newState;
  }

  batch(callback) {
    try {
      this.__freezeWatchers();
      this.__ignoreSetFromChildLevel++;
      callback(this);
      this.__ignoreSetFromChildLevel--;
      this.__parent.__setChildStateToOwnStateByPath(this.__key, this.get());
      this.__unfreezeWatchers();
    } catch (e) {
      this.__ignoreSetFromChildLevel--;
      this.__catchError(e);
    }
  }

  getPath() {
    return this.__parent.getPath().concat([this.__key]);
  }

  watch(callback) {
    this.__watchers.add(callback);
    return /* or `get()` ? */ () => this.unwatch(callback);
  }

  unwatch(callback) {
    return this.__watchers.delete(callback);
  }

  path(childKey, childInitialState, childUpdaterPreset = this.__updaterPreset) {
    const { __children } = this;

    if (__children.has(childKey) === true) return __children.get(childKey);

    const childPath = new Path(
      childKey,
      childInitialState,
      childUpdaterPreset,
      this,
    );

    __children.set(childKey, childPath);

    if (
      childInitialState !== undefined &&
      this.__updaterPreset.hasPath(this.get(), childKey) === false
    ) {
      try {
        this.__freezeWatchers();
        this.__setChildStateToOwnStateByPath(childKey, childInitialState);
        this.__unfreezeWatchers();
      } catch (e) {
        this.__catchError(e);
      }
    }

    return childPath;
  }
}

module.exports.path = path;
