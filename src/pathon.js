// TODO: `.watch.map(mapper, ?comparator)` and `.watch.shape(mapper, ?comparator)`

const mutablePreset = {
  hasPath(state, key) {
    if (typeof state === 'object' && state !== null) {
      return state.hasOwnProperty(key);
    } else {
      return false;
    }
  },
  getValueByKey(state, key) {
    if (typeof state === 'object' && state !== null) {
      return state[key];
    } else {
      // TODO: ?
      return undefined;
    }
  },
  mergeStateAndPayload(state, payload) {
    return payload;
  },
  insertValueToStateByPath(state, key, value) {
    if (typeof state === 'object' && state !== null) {
      state[key] = value;
      return state;
    } else {
      // TODO: ?
      return state;
    }
  },
};

const path = (key, initialState = {}, updaterPreset = mutablePreset) =>
  new Path(
    key, //
    initialState,
    updaterPreset, //
    createMainCore(key, initialState, updaterPreset) // parent
  );

const createMainCore = (key, initialState, updaterPreset) => {
  const state = new Map([[key, initialState]]);

  const get = () => state;

  const __setChildStateToOwnStateByPath = (childKey, childNewState) => {
    state.set(childKey, childNewState);
  };

  const updates = new Map();
  let nestedLevel = 0;
  const __addWatchersForUpdate = (watchers, state) => void updates.set(watchers, state);
  const __freezeWatchers = () => void ++nestedLevel;
  const __unfreezeWatchers = () => {
    if (--nestedLevel !== 0) return;
    for (const [watchers, state] of updates) {
      // TODO: replace by for
      watchers.forEach(watcher => safeExecutor(watcher, state));
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
    __setChildStateToOwnStateByPath,
    __addWatchersForUpdate,
    __freezeWatchers,
    __unfreezeWatchers,
    getPath,
    __catchError,
  };
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

class PathSystem {
  constructor(key, initialState, updaterPreset, parent) {
    this.__key = key;
    this.__state = initialState;
    this.__updaterPreset = updaterPreset;
    this.__parent = parent;

    this.__watchers = new Set();
    this.__childList = new Map();

    this.__freezeWatchers = parent.__freezeWatchers;
    this.__unfreezeWatchers = parent.__unfreezeWatchers;
    this.__addWatchersForUpdate = parent.__addWatchersForUpdate;
    this.__catchError = parent.__catchError;
  }

  __setChildStateToOwnStateByPath(childKey, childState) {
    const newState = this.__updaterPreset.insertValueToStateByPath(
      this.__state,
      childKey,
      childState
    );
    this.__parent.__setChildStateToOwnStateByPath(this.__key, newState);
    this.__state = newState;
    this.__parent.__addWatchersForUpdate(this.__watchers, this.__state);
  }
}

class Path extends PathSystem {
  get() {
    return this.__state;
  }

  set(payload) {
    this.__freezeWatchers();
    try {
      const newState = this.__updaterPreset.mergeStateAndPayload(this.__state, payload);
      this.__parent.__setChildStateToOwnStateByPath(this.__key, newState);
      this.__state = newState;
    } catch (e) {
      this.__catchError(e);
    }
    this.__addWatchersForUpdate(this.__watchers, this.__state);
    this.__unfreezeWatchers();
  }

  batch(callback) {
    try {
      this.__parent.freezeWatchers();
      callback(this);
      this.__parent.unfreezeWatchers();
    } catch (e) {
      this.__parent.__catchError(e);
    }
  }

  getPath() {
    return this.__key;
  }

  getPathFull() {
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
    const { __childList } = this;

    if (__childList.has(childKey) === true) return __childList.get(childKey);

    const childPath = new Path(childKey, childInitialState, childUpdaterPreset, this);

    __childList.set(childKey, childPath);

    if (childInitialState !== undefined && this.__stateHasPath(this.__state, childKey) === false) {
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
