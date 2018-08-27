const { path, immutablePreset } = require('./index');

describe('pathon', () => {
  test('methods', () => {
    const pRoot = path('root', { child: true }, immutablePreset);
    expect(typeof pRoot.set).toBe('function');
    expect(typeof pRoot.get).toBe('function');
    expect(typeof pRoot.batch).toBe('function');
    expect(typeof pRoot.watch).toBe('function');
    expect(typeof pRoot.unwatch).toBe('function');
    expect(typeof pRoot.getPath).toBe('function');
    expect(typeof pRoot.path).toBe('function');

    const pChild = pRoot.path('child');
    expect(typeof pChild.set).toBe('function');
    expect(typeof pChild.get).toBe('function');
    expect(typeof pChild.batch).toBe('function');
    expect(typeof pChild.watch).toBe('function');
    expect(typeof pChild.unwatch).toBe('function');
    expect(typeof pChild.getPath).toBe('function');
    expect(typeof pChild.path).toBe('function');
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
        const initialState = {
          child1: true,
          child2: { child: { child: true } },
        };
        const pRoot = path('root', initialState, preset);

        expect(pRoot.get()).toBe(initialState);
        expect(pRoot.path('child1').get()).toBe(initialState.child1);
        expect(
          pRoot
            .path('child2')
            .path('child')
            .path('child')
            .get(),
        ).toBe(initialState.child2.child.child);
      });

      test('chidren deep default', () => {
        const initialStateRoot = { child1: true };
        const initialStateChild2 = { child: { child: true } };
        const pRoot = path('root', initialStateRoot, preset);
        const pChild1 = pRoot.path('child2', initialStateChild2);

        expect(pRoot.get()).toEqual({
          child1: true,
          child2: { child: { child: true } },
        });
        expect(pRoot.path('child1').get()).toBe(initialStateRoot.child1);
        expect(pChild1.get()).toBe(initialStateChild2);
        expect(
          pChild1
            .path('child')
            .path('child')
            .get(),
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
            .get(),
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
            .get(),
        ).toBe(initialStateChild1.child.child);
      });
    });
  };

  const testMemorizedChild = preset => () => {
    test('memirize first child', () => {
      const pRoot = path('root', { child: true }, preset);

      expect(pRoot.path('child')).toBe(pRoot.path('child'));
    });
  };

  const testBatch = preset => () => {
    test('batch itself for loop', () => {
      const iterations = 5;
      const subscriptionToRoot = jest.fn();
      const subscriptionToСounter = jest.fn();
      const pRoot = path('root', { counter: 0 }, preset);
      const pCounter = pRoot.path('counter');

      pRoot.watch(subscriptionToRoot);
      pCounter.watch(subscriptionToСounter);

      pCounter.batch(path => {
        for (let i = 1; i <= iterations; ++i) {
          path.set(i);
        }
      });

      expect(subscriptionToRoot.mock.calls.length).toBe(1);
      expect(subscriptionToСounter.mock.calls.length).toBe(1);
      expect(pCounter.get()).toBe(iterations);
    });

    test('batch inner path from outside', () => {
      const iterations = 5;
      const subscriptionToRoot = jest.fn();
      const subscriptionToСounter = jest.fn();
      const pRoot = path('root', { counter: 0 }, preset);
      const pCounter = pRoot.path('counter');

      pRoot.watch(subscriptionToRoot);
      pCounter.watch(subscriptionToСounter);

      pCounter.batch(() => {
        for (let i = 1; i <= iterations; ++i) {
          pCounter.set(i);
        }
      });

      expect(subscriptionToRoot.mock.calls.length).toBe(1);
      expect(subscriptionToСounter.mock.calls.length).toBe(1);
      expect(pCounter.get()).toBe(iterations);
    });

    test('batch outer path from outside', () => {
      const iterations = 5;
      const subscriptionToRoot = jest.fn();
      const subscriptionToСounter = jest.fn();
      const pRoot = path('root', { counter: 0 }, preset);
      const pCounter = pRoot.path('counter');

      pRoot.watch(subscriptionToRoot);
      pCounter.watch(subscriptionToСounter);

      pCounter.batch(() => {
        for (let i = 1; i <= iterations; ++i) {
          pRoot.set({ counter: i });
        }
      });

      expect(subscriptionToRoot.mock.calls.length).toBe(1);
      expect(subscriptionToСounter.mock.calls.length).toBe(1);
      expect(pCounter.get()).toBe(iterations);
    });
  };

  const testWatch = preset => () => {
    const pRoot = path('root', { child1: false, child2: false }, preset);
    const subscriptionToRoot = jest.fn();
    const subscriptionToRootRepeat = jest.fn();
    const subscriptionToChild1 = jest.fn();
    const subscriptionToChild2 = jest.fn();

    const unwatchSubscriptionToRootRepeat = pRoot.watch(
      subscriptionToRootRepeat,
    );

    pRoot.watch(subscriptionToRoot);
    // test double subscription
    pRoot.watch(subscriptionToRootRepeat);
    pRoot.path('child1').watch(subscriptionToChild1);
    pRoot.path('child2').watch(subscriptionToChild2);

    test('watch', () => {
      pRoot.path('child1').set(true);

      expect(subscriptionToRoot.mock.calls.length).toBe(1);
      expect(subscriptionToRootRepeat.mock.calls.length).toBe(1);
    });

    test('watch only touched path`s', () => {
      expect(subscriptionToChild1.mock.calls.length).toBe(1);
      expect(subscriptionToChild2.mock.calls.length).toBe(0);
    });

    test('unwatch', () => {
      unwatchSubscriptionToRootRepeat();
      pRoot.path('child2').set(true);

      expect(subscriptionToRoot.mock.calls.length).toBe(2);
      expect(subscriptionToRootRepeat.mock.calls.length).toBe(1);
    });

    test('watch only touched path`s', () => {
      expect(subscriptionToChild1.mock.calls.length).toBe(1);
      expect(subscriptionToChild2.mock.calls.length).toBe(1);
    });
  };

  const testDelete = preset => () => {
    test('object', () => {
      const pRoot = path('root', { 1: 1, 2: 2 }, preset);

      pRoot.del('1');

      expect(pRoot.get()).toEqual({ 2: 2 });
    });

    test('array', () => {
      const pRoot = path('root', [0, 1, 2, 3, 4], preset);

      pRoot.del(-1);
      expect(pRoot.get()).toEqual([0, 1, 2, 3, 4]);
      pRoot.del('4');
      expect(pRoot.get()).toEqual([0, 1, 2, 3]);
      pRoot.del('2');
      expect(pRoot.get()).toEqual([0, 1, 3]);
      pRoot.del('0');
      expect(pRoot.get()).toEqual([1, 3]);
      pRoot.del(pRoot.get().length);
      expect(pRoot.get()).toEqual([1, 3]);
      pRoot.del(pRoot.get().length - 1);
      expect(pRoot.get()).toEqual([1]);
      pRoot.del(0);
      expect(pRoot.get()).toEqual([]);
    });

    test('nested', () => {
      const pRoot = path(
        'root',
        { 1: 1, 2: [{ 1: 1, 2: 2 }, { 1: 1, 2: 2 }, { 1: 1, 2: 2 }] },
        preset,
      );

      pRoot
        .path('2')
        .path('1')
        .del('1');

      expect(pRoot.get()).toEqual({
        1: 1,
        2: [{ 1: 1, 2: 2 }, { 2: 2 }, { 1: 1, 2: 2 }],
      });
    });
  };

  describe('immutablePreset', () => {
    describe('get', testsGet(immutablePreset));

    describe('memorized child', testMemorizedChild(immutablePreset));

    describe('batch', testBatch(immutablePreset));

    describe('watchers', testWatch(immutablePreset));

    describe('delete', testDelete(immutablePreset));

    test('immutable update parent', () => {
      const initialState = { counter: 0 };
      const pRoot = path('root', initialState, immutablePreset);
      const pCounter1 = pRoot.path('counter');

      pCounter1.set(1);

      expect(pRoot.get() !== initialState).toBe(true);
    });

    test('set and update children', () => {
      const initialState = {
        counter1: 0,
        counter2: 0,
        counterDeep: { counter: 0 },
      };
      const pRoot = path('root', initialState, immutablePreset);
      const pCounter1 = pRoot.path('counter1');
      const pCounter2 = pRoot.path('counter2');
      const pCounterDeepCounter = pRoot.path('counterDeep').path('counter');

      let trackingCounter1 = false;
      let trackingCounter2 = false;
      let trackingCounterDeepCounter = false;

      pCounter1.watch(() => (trackingCounter1 = true));
      pCounter2.watch(() => (trackingCounter2 = true));
      pCounterDeepCounter.watch(() => (trackingCounterDeepCounter = true));

      pRoot.set({ counter1: 1 });
      pRoot.set({ counterDeep: { counter: 1 } });

      expect(pCounter1.get()).toBe(1);
      expect(trackingCounter1).toBe(true);
      expect(trackingCounter2).toBe(false);
      expect(trackingCounterDeepCounter).toBe(true);
      expect(pCounterDeepCounter.get()).toBe(1);
    });

    // TODO: rewrite
    test('root path state', () => {
      const initialState = {};
      const pRoot = path('root', initialState, immutablePreset);
      expect(pRoot.get()).toBe(initialState);

      let tracking;
      const watcher = newState => (tracking = newState);
      const deepField = {};
      pRoot.watch(watcher);
      pRoot.set({ deepField });
      expect(pRoot.get()).toBe(tracking);
      expect(pRoot.get().deepField).toBe(deepField);
    });
  });

  describe('defaultPreset', () => {
    describe('get', testsGet());

    describe('memorized child', testMemorizedChild());

    describe('batch', testBatch());

    describe('watchers', testWatch());

    describe('delete', testDelete());
  });
});
