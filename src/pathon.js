// TODO: `compose`, `.watch.map(mapper, ?comparator)` and `.watch.shape(mapper, ?comparator)`

const path = (key, initialState, updaterPreset) =>
  createPath(
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

const createPath = (key, initialState = {}, updaterPreset, parent) => {
  const getOwnStateFromParentStateByPath = updaterPreset.getValueByKey;
  const mergeStateAndPayload = updaterPreset.mergeStateAndPayload;
  const insertValueToStateByPath = updaterPreset.insertValueToStateByPath;
  const stateHasPath = updaterPreset.hasPath;

  const getParentState = parent.get;
  const setOwnStateToParentStateByPath = parent.setChildStateToOwnStateByPath;
  const addWatchersForUpdate = parent.addWatchersForUpdate;
  const freezeWatchers = parent.freezeWatchers;
  const unfreezeWatchers = parent.unfreezeWatchers;
  const getPathParent = parent.getPath;
  const catchError = parent.catchError;

  // TODO: cache?
  const get = () => getOwnStateFromParentStateByPath(getParentState(), key);

  const set = payload => {
    freezeWatchers();
    let newState;
    try {
      newState = mergeStateAndPayload(get(), payload);
      setOwnStateToParentStateByPath(key, newState);
    } catch (e) {
      catchError(e);
    }
    addWatchersForUpdate(watchers, newState);
    unfreezeWatchers();
  };

  const setChildStateToOwnStateByPath = (childKey, childState) => {
    freezeWatchers();

    const newState = insertValueToStateByPath(get(), childKey, childState);
    setOwnStateToParentStateByPath(key, newState);
    addWatchersForUpdate(watchers, newState);

    unfreezeWatchers();
  };

  const getPath = () => key;
  const getPathFull = () => [...getPathParent(), key];

  const watchers = new Set();
  const watch = callback => {
    watchers.add(callback);
    return /* or `get()` ? */ () => watchers.delete(callback);
  };
  const unwatch = callback => watchers.delete(callback);

  const childList = new Map();

  return {
    get,
    set,
    getPath,
    getPathFull,
    watch,
    unwatch,
    path: (childKey, childInitialState, childUpdaterPreset = updaterPreset) => {
      if (childList.has(childKey) === true) return childList.get(childKey);

      const childPath = createPath(childKey, childInitialState, childUpdaterPreset, {
        get,
        setChildStateToOwnStateByPath,
        addWatchersForUpdate,
        freezeWatchers,
        unfreezeWatchers,
        getPath: getPathFull,
        catchError,
      });

      childList.set(childKey, childPath);

      if (childInitialState !== undefined && stateHasPath(get(), childKey) === false) {
        try {
          setChildStateToOwnStateByPath(childKey, childInitialState);
        } catch (e) {
          catchError(e);
        }
      }

      return childPath;
    },
  };
};

module.exports.path = path;
