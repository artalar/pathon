// TODO: `.watch.map(mapper, ?comparator)` and `.watch.shape(mapper, ?comparator)`

const mutablePreset = require('./presets').mutablePreset;

const path = (key, initialState = {}, updaterPreset = mutablePreset) =>
  new Path(
    key, //
    initialState, //
    updaterPreset, //
    createMainCore(key, initialState, updaterPreset) // parent
  );

const createMainCore = (key, initialState, updaterPreset) => {
  const state = new Map([[key, initialState]]);

  const get = () => state;

  const setOwnStateToParentStateByPath = (childKey, childNewState) => {
    state.set(childKey, childNewState);
  };

  const updates = new Map();
  let nestedLevel = 0;
  const addWatchersForUpdate = (watchers, state) => void updates.set(watchers, state);
  const freezeWatchers = () => void ++nestedLevel;
  const unfreezeWatchers = () => {
    if (--nestedLevel !== 0) return;
    for (const [watchers, state] of updates) {
      watchers.forEach(watcher => safeExecutor(watcher, state));
    }
    updates.clear();
  };

  const defaultPath = [];
  const getPath = () => defaultPath;

  const catchError = error => {
    nestedLevel = 0;
    updates.clear();
    throw error;
  };

  return {
    get,
    setChildStateToOwnStateByPath: setOwnStateToParentStateByPath,
    addWatchersForUpdate,
    freezeWatchers,
    unfreezeWatchers,
    getPath,
    catchError,
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

class Path {
  constructor(key, initialState, updaterPreset, parent) {
    this.__key = key;
    this.__state = initialState;
    this.__updaterPreset = updaterPreset;
    this.__parent = parent;

    this.__getOwnStateFromParentStateByPath = updaterPreset.getValueByKey;
    this.__mergeStateAndPayload = updaterPreset.mergeStateAndPayload;
    this.__insertValueToStateByPath = updaterPreset.insertValueToStateByPath;
    this.__stateHasPath = updaterPreset.hasPath;

    this.__watchers = new Set();
    this.__childList = new Map();
  }

  __setChildStateToOwnStateByPath(childKey, childState) {
    this.__state = this.__insertValueToStateByPath(this.__state, childKey, childState);
    this.__parent.setChildStateToOwnStateByPath(this.__key, this.__state);
    this.__parent.addWatchersForUpdate(this.__watchers, this.__state);
  }

  get() {
    return this.__state;
  }

  set(payload) {
    this.__parent.freezeWatchers();
    try {
      this.__state = this.__mergeStateAndPayload(this.__state, payload);
      this.__parent.setChildStateToOwnStateByPath(this.__key, this.__state);
    } catch (e) {
      this.__parent.catchError(e);
    }
    this.__parent.addWatchersForUpdate(this.__watchers, this.__state);
    this.__parent.unfreezeWatchers();
  }

  batch(callback) {
    try {
      this.__parent.freezeWatchers();
      callback(this);
      this.__parent.unfreezeWatchers();
    } catch (e) {
      this.__parent.catchError(e);
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
    return /* or `get()` ? */ () => this.__watchers.delete(callback);
  }

  unwatch(callback) {
    return this.__watchers.delete(callback);
  }

  path(childKey, childInitialState, childUpdaterPreset = this.__updaterPreset) {
    const { __childList, __parent } = this;

    if (__childList.has(childKey) === true) return __childList.get(childKey);

    const childPath = new Path(childKey, childUpdaterPreset, this);

    __childList.set(childKey, childPath);

    if (childInitialState !== undefined && this.__stateHasPath(this.__state, childKey) === false) {
      try {
        setChildStateToOwnStateByPath(childKey, childInitialState);
      } catch (e) {
        catchError(e);
      }
    }

    return childPath;
  }
}

module.exports.path = path;
