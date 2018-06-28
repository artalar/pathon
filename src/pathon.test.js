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

  it('get', () => {
    const pathRoot = path('root', { count: 1 });

    expect(pathRoot.path('count').get()).toBe(1);
  });

  it('set', () => {
    /*  */
  });

  it('set and update children', () => {
    const pathRoot = path('root', { counter1: 0, counter2: 0, counterDeep: { counter: 0 } });
    const pathCounter1 = pathRoot.path('counter1');
    const pathCounter2 = pathRoot.path('counter2');
    const pathCounterDeepCounter = pathRoot.path('counterDeep').path('counter');

    let trackingCounter1 = false;
    let trackingCounter2 = false;
    let trackingCounterDeepCounter = false;

    pathCounter1.watch(() => (trackingCounter1 = true));
    pathCounter2.watch(() => (trackingCounter2 = true));
    pathCounterDeepCounter.watch(() => (trackingCounterDeepCounter = true));

    pathRoot.set({ counter1: 1 });
    pathRoot.set({ counterDeep: { counter: 1 } });

    expect(pathCounter1.get()).toBe(1);
    expect(trackingCounter1).toBe(true);
    expect(trackingCounter2).toBe(false);
    expect(trackingCounterDeepCounter).toBe(true);
    expect(pathCounterDeepCounter.get()).toBe(1);
  });

  it('memorized child', () => {
    const pathRoot = path('root', { child: true });
    expect(pathRoot.path('child')).toBe(pathRoot.path('child'));
  });

  it('subscriptions', () => {
    const pathRoot = path('root', { child: false });
    let subscriptionToRoot = false;
    let subscriptionToChild = false;

    const unwatchRoot = pathRoot.watch(state => (subscriptionToRoot = state.child));
    pathRoot.path('child').watch(state => (subscriptionToChild = state));

    pathRoot.path('child').set(true);

    expect(subscriptionToRoot).toBe(true);
    expect(subscriptionToChild).toBe(true);

    // unsubscribe
    unwatchRoot();
    pathRoot.path('child').set(1);

    expect(subscriptionToRoot).toBe(true);
    expect(subscriptionToChild).toBe(1);
  });

  it('batch', () => {
    const pathRoot = path('root', { counter: 0 });
    const counter = pathRoot.path('counter');
    const increment = () => counter.set(counter.get() + 1);
    const iterations = 5;
    let tracksRoot = 0;
    let tracksCounter = 0;
    pathRoot.watch(() => tracksRoot++);
    counter.watch(() => tracksCounter++);

    counter.batch(path => {
      for (let i = 1; i <= iterations; ++i) {
        path.set(i);
      }
    });

    expect(tracksRoot).toBe(1);
    expect(tracksCounter).toBe(1);
    expect(counter.get()).toBe(iterations);
  });

  // TODO: rewrite
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
});
