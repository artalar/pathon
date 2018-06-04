// TODO: `compose`, `.watch.map(mapper, ?comparator)` and `.watch.shape(mapper, ?comparator)`

// TODO: simplify to one universal `createPath` (without createRootPath)?
// optimaize `createPath` for existing `path` (memorize `path`)

const createPath = (path, defaultConfig, parent) => {
  const getByPathPreset = defaultConfig.getByPath(path);
  const setByPathPreset = defaultConfig.setByPath(path);
  const pathFull = `${parent.path}.${path}`;
  const parentSet = parent.set;
  const parentGet = parent.get;
  const addWatcher = parent.addWatcher;
  const deleteWatcher = parent.deleteWatcher;
  const scheduleUpdate = parent.scheduleUpdate;
  const update = parent.update;

  const get = () => getByPathPreset(parentGet());

  const set = (...payload) => {
    scheduleUpdate(pathFull, get);
    parentSet(setByPathPreset(parentGet(), ...payload));
    update();
    return get();
  };

  return {
    get state() {
      return get();
    },
    thisPath: path,
    thisPathFull: pathFull,
    get,
    set,
    watch: callback => addWatcher(pathFull, callback),
    unwatch: callback => deleteWatcher(pathFull, callback),
    path: (pathInner, config = defaultConfig) => {
      const pathFullNew = `${pathFull}.${pathInner}`;
      let newPath = parent.allPath.get(pathFullNew);
      if (newPath) return newPath;
      newPath =
        parent.allPath.get(newPath) ||
        createPath(pathInner, config, {
          path: pathFull,
          get,
          set,
          addWatcher,
          deleteWatcher,
          scheduleUpdate,
          update
        });
      parent.allPath.set(pathFullNew, newPath);
      return newPath;
    }
  };
};

export const createRootPath = (initialState, name = "root", defaultConfig) => {
  let state = initialState;

  const watchers = new Map();
  const watch = (path, callback) => {
    watchers.set(path, callback);
    return () => watchers.delete(callback);
  };
  const unwatch = callback => watchers.delete(callback);

  // test
  /* const allPathObj = {};
  const allPath = {
    set(a, b) {
      allPathObj[a] = b;
    },
    get(a) {
      return allPathObj[a]
    }
  } */

  const allPath = new Map();

  let nestedLevel = 0;
  const schedule = new Map();
  const scheduleUpdate = (path, getter) => {
    nestedLevel++;
    schedule.set(path, getter);
  };
  const update = () => {
    if (--nestedLevel !== 0) return;
    for (const [path, getter] of schedule) {
      const callback = watchers.get(path) || (() => {});
      callback(getter());
    }
    schedule.clear();
  };

  const get = () => defaultConfig.get(state);
  const set = (...payload) => {
    scheduleUpdate(name, get);
    state = defaultConfig.set(state, ...payload);
    update();
    return get();
  };

  const path = (pathInner, config = defaultConfig) => {
    const pathFullNew = `${name}.${pathInner}`;
    let newPath = allPath.get(pathFullNew);
    if (newPath) return newPath;

    newPath = createPath(pathInner, config, {
      path: name,
      get,
      set,
      addWatcher: watch,
      deleteWatcher: unwatch,
      scheduleUpdate,
      update
    });

    allPath.set(pathFullNew, newPath);
    return newPath;
  };

  return {
    get state() {
      return get();
    },
    thisPath: name,
    thisPathFull: name,
    get,
    set,
    path,
    watch: callback => watch(name, callback),
    unwatch
  };
};
