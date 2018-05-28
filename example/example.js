/* 
  EXAMPLE
*/

import { createRootPath, immutablePreset } from '../src/';

const createLogger = id => (...args) => console.log(`ID: ${id}`, ...args);

const pathSome = createRootPath(
  // initial state
  { list: [{ id: 0, value: Math.random() }] },
  // default setters and getters (for `path` to)
  immutablePreset
);

const pathSomeList = pathSome.path('list');

// special method for track only structure of collection
// accept new `get` handler by first argument
// trigger only on `pathSomeList.set()`
// (will not trigger for `pathSomeList.path(key).set()`)
const pathSomeListIds = pathSomeList.shape(state => state.map(({ id }) => id));

// special method for track and memorize computed data
// trigger on `pathSomeList.set()` and `pathSomeList.path(key).set()`
const pathSomeListSum = pathSomeList.map(
  state => state.reduce((acc, { value }) => acc + value), // computed
  (prevCalc, newCalc) => prevCalc === newCalc // comparator
);

// it effective to watch list and every item separately
const pathSomeListItem0 = pathSomeList.path('0');

pathSome.watch(createLogger('pathSome'));
pathSomeList.watch(createLogger('pathSomeList'));
pathSomeListIds.watch(createLogger('pathSomeListIds'));
pathSomeListSum.watch(createLogger('pathSomeListSum'));
pathSomeListItem0.watch(createLogger('pathSomeListItem0'));

// update store === dynamic expansion
// after this you can `pathSome.path('newField').watch(callback)`
pathSome.set({ newField: true });
// "ID: pathSome ...."

pathSomeListItem0.set({ value: Math.random() });
// "ID: pathSome ...."
// "ID: pathSomeList ...."
// "ID: pathSomeListSum ...."
// "ID: pathSomeListItem0 ...."
// watchers for `pathSomeListIds` will not trigger

// `.set` - is method for "extend" collection, but not modify old elements
// so it doesn't trigger watchers in nested elements
pathSomeList.set([...pathSomeList.get(), { id: 1, value: Math.random() }]);
// "ID: pathSome ...."
// "ID: pathSomeList ...."
// "ID: pathSomeListIds ...."
// "ID: pathSomeListSum ...."

// `.reset` - is method for rewrite collection
// so it will trigger watchers in nested elements
pathSomeList.reset(pathSomeList.get().map(element => ({ ...element, newValue: true })));
// "ID: pathSome ...."
// "ID: pathSomeList ...."
// "ID: pathSomeListIds ...."
// "ID: pathSomeListSum ...."
// "ID: pathSomeListItem0 ...." // <-- your attention

// FIXME:
// remove `.reset`
// rewrite `map` and `shape` to 
// `.watch.map(mapper, ?comparator)` and `.watch.shape(mapper, ?comparator)`

// TODO: `compose`

const createPath = (path, config, parent) => {
  const getPath = config.getPath(path);
  const setPath = config.setPath(path);
  const parentSet = parent.set;
  const parentGet = parent.get;
  const addWatcher = parent.addWatcher;
  const deleteWatcher = parent.deleteWatcher;
  const scheduleUpdate = parent.scheduleUpdate;
  const update = parent.update;

  const get = () => getPath(parentGet())

  const set = (...payload) => {
    scheduleUpdate(path, get);
    parentSet(setPath(get(), ...payload));
    update();
    return get();
  }

  return {
    get,
    set,
    watch: callback => addWatcher(path, callback),
    unwatch: callback => deleteWatcher(path, callback),
    path: (pathInner, config) => createPath(
      pathInner,
      config,
      { path, get, set, addWatcher, deleteWatcher, scheduleUpdate, update }
    ),
  }
}

const createRootPath = (name, initialState, defaultConfig) => {
  let state = initialState;

  const watchers = new Map();
  const watch = (path, callback) => {
    watchers.set(path, callback);
    return () => watchers.delete(callback);
  }
  const unwatch = (callback) => watchers.delete(callback);

  let nestedLevel = 0;
  const schedule = new Map();
  const scheduleUpdate = (path, getter) => {
    nestedLevel++;
    schedule.set(path, getter);
  }
  const update = () => {
    if (--nestedLevel !== 0) return;
    for (const [path, getter] of schedule) {
      const callback = watchers.get(path) || (() => { });
      callback(getter());
    }
    schedule.clear()
  }

  const get = () => defaultConfig.get(state);
  const set = (...payload) => {
    scheduleUpdate(name, get);
    state = defaultConfig.set(state, ...payload);
    update();
    return get();
  }

  const path = (pathInner, config = defaultConfig) => createPath(
    pathInner,
    config,
    { path: name, get, set, addWatcher: watch, deleteWatcher: unwatch, scheduleUpdate, update }
  )

  return {
    get,
    set,
    path,
    watch: callback => watch(name, callback),
    unwatch,
  }
}