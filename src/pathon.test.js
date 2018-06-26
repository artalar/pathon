const path = require('./pathon').path;
const immutablePreset = require('./presets').immutablePreset;

describe('pathon', () => {
  it('methods', () => {
    const pathRoot = path('root', { child: true });
    expect(typeof pathRoot.set).toBe('function');
    expect(typeof pathRoot.get).toBe('function');
    expect(typeof pathRoot.batch).toBe('function');
    expect(typeof pathRoot.watch).toBe('function');
    expect(typeof pathRoot.unwatch).toBe('function');
    expect(typeof pathRoot.getPath).toBe('function');
    expect(typeof pathRoot.getPathFull).toBe('function');
    expect(typeof pathRoot.path).toBe('function');

    const pathChild = pathRoot.path('child');
    expect(typeof pathChild.get).toBe('function');
    expect(typeof pathChild.batch).toBe('function');
    expect(typeof pathChild.watch).toBe('function');
    expect(typeof pathChild.unwatch).toBe('function');
    expect(typeof pathChild.getPath).toBe('function');
    expect(typeof pathChild.getPathFull).toBe('function');
    expect(typeof pathChild.path).toBe('function');
  });
  it('memorized child', () => {
    const pathRoot = path('root', { child: true });
    expect(pathRoot.path('child')).toBe(pathRoot.path('child'));
  });
  it('subscriptions', () => {
    const pathRoot = path('root', { child: false });
    let subscriptionToRoot = false;
    let subscriptionToChild = false;

    pathRoot.watch(state => (subscriptionToRoot = state.child));
    pathRoot.path('child').watch(state => subscriptionToChild = state);

    pathRoot.path('child').set(true);

    expect(subscriptionToRoot).toBe(true);
    expect(subscriptionToChild).toBe(true);
  });
  it('root path state', () => {
    const initialState = {};
    const pathRoot = path('root', initialState, immutablePreset);
    expect(pathRoot.get()).toBe(initialState);

    let tracking;
    const watcher = newState => (tracking = newState);
    const deepField = {};
    pathRoot.watch(watcher);
    pathRoot.set({ deepField });
    expect(pathRoot.get()).toBe(tracking);
    expect(pathRoot.get().deepField).toBe(deepField);
  });

  describe('set', () => {
    it('set', () => {
      /*  */
    });
    it('get', () => {
      /*  */
    });
    // ...
  });
});
