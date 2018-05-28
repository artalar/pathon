// TODO: `compose`, `.watch.map(mapper, ?comparator)` and `.watch.shape(mapper, ?comparator)`

const createPath = (path, defaultConfig, parent) => {
  const getByPath = defaultConfig.getByPath(path);
  const setByPath = defaultConfig.setByPath(path);
  const pathFull = `${parent.path}/${path}`;
  const parentSet = parent.set;
  const parentGet = parent.get;
  const addWatcher = parent.addWatcher;
  const deleteWatcher = parent.deleteWatcher;
  const scheduleUpdate = parent.scheduleUpdate;
  const update = parent.update;

  const get = () => getByPath(parentGet());

  const set = (...payload) => {
    scheduleUpdate(pathFull, get);
    parentSet(setByPath(get(), ...payload));
    update();
    return get();
  };

  return {
    get,
    set,
    watch: callback => addWatcher(pathFull, callback),
    unwatch: callback => deleteWatcher(pathFull, callback),
    path: (pathInner, config = defaultConfig) =>
      createPath(pathInner, config, {
        path: pathFull,
        get,
        set,
        addWatcher,
        deleteWatcher,
        scheduleUpdate,
        update
      })
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

  const path = (pathInner, config = defaultConfig) =>
    createPath(pathInner, config, {
      path: name,
      get,
      set,
      addWatcher: watch,
      deleteWatcher: unwatch,
      scheduleUpdate,
      update
    });

  return {
    get,
    set,
    path,
    watch: callback => watch(name, callback),
    unwatch
  };
};
