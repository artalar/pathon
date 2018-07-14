// @flow

const path = require('./index').path;
const immutablePreset = require('./index').immutablePreset;
describe('pathon', () => {
  test('methods', () => {
    const pathRoot = path('root', { child: true }, immutablePreset);
    expect(typeof pathRoot.set).toBe('function');
    expect(typeof pathRoot.get).toBe('function');
    expect(typeof pathRoot.batch).toBe('function');
    expect(typeof pathRoot.watch).toBe('function');
    expect(typeof pathRoot.unwatch).toBe('function');
    expect(typeof pathRoot.getPath).toBe('function');
    expect(typeof pathRoot.path).toBe('function');

    const pathChild = pathRoot.path('child');
    expect(typeof pathChild.set).toBe('function');
    expect(typeof pathChild.get).toBe('function');
    expect(typeof pathChild.batch).toBe('function');
    expect(typeof pathChild.watch).toBe('function');
    expect(typeof pathChild.unwatch).toBe('function');
    expect(typeof pathChild.getPath).toBe('function');
    expect(typeof pathChild.path).toBe('function');
  });

  // TODO: reset
  // TODO: delete

  const testsGet = preset => () => {
    test('root default', () => {
      const pRoot = path('root', undefined, preset);

      expect(pRoot.get()).toEqual({});
    });

    test('root default literal', () => {
      const initialState = 0;
      const pRoot = path('root', initialState, preset);

      expect(pRoot.get()).toBe(initialState);
    });

    describe('object', () => {
      test('root', () => {
        const initialState = {};
        const pRoot = path('root', initialState, preset);

        expect(pRoot.get()).toBe(initialState);
      });

      test('child', () => {
        const initialState = { child: true };
        const pRoot = path('root', initialState, preset);

        expect(pRoot.get()).toBe(initialState);
        expect(pRoot.path('child').get()).toBe(initialState.child);
      });

      test('child default', () => {
        const initialStateRoot = {};
        const initialStateChild = true;
        const pRoot = path('root', initialStateRoot, preset);
        const pChild = pRoot.path('child', initialStateChild);

        expect(pRoot.get()).toEqual({ child: true });
        expect(pChild.get()).toBe(initialStateChild);
      });

      test('chidren', () => {
        const initialState = { child1: true, child2: true };
        const pRoot = path('root', initialState, preset);

        expect(pRoot.get()).toBe(initialState);
        expect(pRoot.path('child1').get()).toBe(initialState.child1);
        expect(pRoot.path('child2').get()).toBe(initialState.child2);
      });

      test('chidren deep', () => {
        const initialState = { child1: true, child2: { child: { child: true } } };
        const pRoot = path('root', initialState, preset);

        expect(pRoot.get()).toBe(initialState);
        expect(pRoot.path('child1').get()).toBe(initialState.child1);
        expect(
          pRoot
            .path('child2')
            .path('child')
            .path('child')
            .get()
        ).toBe(initialState.child2.child.child);
      });

      test('chidren deep default', () => {
        const initialStateRoot = { child1: true };
        const initialStateChild2 = { child: { child: true } };
        const pRoot = path('root', initialStateRoot, preset);
        const pChild1 = pRoot.path('child2', initialStateChild2);

        expect(pRoot.get()).toEqual({ child1: true, child2: { child: { child: true } } });
        expect(pRoot.path('child1').get()).toBe(initialStateRoot.child1);
        expect(pChild1.get()).toBe(initialStateChild2);
        expect(
          pChild1
            .path('child')
            .path('child')
            .get()
        ).toBe(initialStateChild2.child.child);
      });
    });

    describe('array', () => {
      test('root', () => {
        const initialState = [];
        const pRoot = path('root', initialState, preset);

        expect(pRoot.get()).toBe(initialState);
      });

      test('child', () => {
        const initialState = [1];
        const pRoot = path('root', initialState, preset);

        expect(pRoot.get()).toBe(initialState);
        expect(pRoot.path(0).get()).toBe(initialState[0]);
      });

      test('child default', () => {
        const initialStateRoot = [];
        const initialStateChild = true;
        const pRoot = path('root', initialStateRoot, preset);
        const pChild = pRoot.path(0, initialStateChild);

        expect(pRoot.get()).toEqual([true]);
        expect(pChild.get()).toBe(initialStateChild);
      });

      test('chidren', () => {
        const initialState = [1, 2];
        const pRoot = path('root', initialState, preset);

        expect(pRoot.get()).toBe(initialState);
        expect(pRoot.path(0).get()).toBe(initialState[0]);
        expect(pRoot.path(1).get()).toBe(initialState[1]);
      });

      test('chidren deep', () => {
        const initialState = [1, { child: { child: true } }];
        const pRoot = path('root', initialState, preset);

        expect(pRoot.get()).toBe(initialState);
        expect(pRoot.path(0).get()).toBe(initialState[0]);
        expect(
          pRoot
            .path(1)
            .path('child')
            .path('child')
            .get()
        ).toBe(initialState[1].child.child);
      });

      test('chidren deep default', () => {
        const initialStateRoot = [1];
        const initialStateChild1 = { child: { child: true } };
        const pRoot = path('root', initialStateRoot, preset);
        const pChild1 = pRoot.path(1, initialStateChild1);

        expect(pRoot.get()).toEqual([1, { child: { child: true } }]);
        expect(pRoot.path(0).get()).toBe(initialStateRoot[0]);
        expect(pChild1.get()).toBe(initialStateChild1);
        expect(
          pChild1
            .path('child')
            .path('child')
            .get()
        ).toBe(initialStateChild1.child.child);
      });
    });
  };

  const testMemorizedChild = preset => () => {
    test('memirize first child', () => {
      const pathRoot = path('root', { child: true }, preset);

      expect(pathRoot.path('child')).toBe(pathRoot.path('child'));
    });
  };

  const testBatch = preset => () => {
    test('batch', () => {
      const iterations = 5;
      const subscriptionToRoot = jest.fn();
      const subscriptionToСounter = jest.fn();
      const pathRoot = path('root', { counter: 0 }, preset);
      const counter = pathRoot.path('counter');

      pathRoot.watch(subscriptionToRoot);
      counter.watch(subscriptionToСounter);

      counter.batch(path => {
        for (let i = 1; i <= iterations; ++i) {
          path.set(i);
        }
      });

      expect(subscriptionToRoot.mock.calls.length).toBe(1);
      expect(subscriptionToСounter.mock.calls.length).toBe(1);
      expect(counter.get()).toBe(iterations);
    });
  };

  const testWatch = preset => () => {
    const pathRoot = path('root', { child1: false, child2: false }, preset);
    const subscriptionToRoot = jest.fn();
    const subscriptionToRootRepeat = jest.fn();
    const subscriptionToChild1 = jest.fn();
    const subscriptionToChild2 = jest.fn();

    const unwatchSubscriptionToRootRepeat = pathRoot.watch(subscriptionToRootRepeat);

    pathRoot.watch(subscriptionToRoot);
    // test double subscription
    pathRoot.watch(subscriptionToRootRepeat);
    pathRoot.path('child1').watch(subscriptionToChild1);
    pathRoot.path('child2').watch(subscriptionToChild2);

    test('watch', () => {
      pathRoot.path('child1').set(true);

      expect(subscriptionToRoot.mock.calls.length).toBe(1);
      expect(subscriptionToRootRepeat.mock.calls.length).toBe(1);
    });

    test('watch only touched path`s', () => {
      expect(subscriptionToChild1.mock.calls.length).toBe(1);
      expect(subscriptionToChild2.mock.calls.length).toBe(0);
    });

    test('unwatch', () => {
      unwatchSubscriptionToRootRepeat();
      pathRoot.path('child2').set(true);

      expect(subscriptionToRoot.mock.calls.length).toBe(2);
      expect(subscriptionToRootRepeat.mock.calls.length).toBe(1);
    });

    test('watch only touched path`s', () => {
      expect(subscriptionToChild1.mock.calls.length).toBe(1);
      expect(subscriptionToChild2.mock.calls.length).toBe(1);
    });
  };

  describe('immutablePreset', () => {
    describe('get', testsGet(immutablePreset));

    describe('memorized child', testMemorizedChild(immutablePreset));

    describe('batch', testBatch(immutablePreset));

    describe('watchers', testWatch(immutablePreset));

    test('set and update children', () => {
      const pathRoot = path(
        'root',
        { counter1: 0, counter2: 0, counterDeep: { counter: 0 } },
        immutablePreset
      );
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

    // TODO: rewrite
    test('root path state', () => {
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

  describe('defaultPreset', () => {
    describe('get', testsGet());

    describe('memorized child', testMemorizedChild());

    describe('batch', testBatch());

    describe('watchers', testWatch());
  });
});