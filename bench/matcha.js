const deepCount = 100;

const normalizedCount = 20;

const normalizedModRepeats = 10;

const iterations = 10;

const initCounterStore = {
  scope: {
    counter: 0,
  },
};
const initNormalizedState = {
  news: { '-1': { id: '-1', text: 'some news text' + '-1' } },
  show: ['-1'],
};
const deepState = {
  scope0: {
    scope1: {
      scope2: {
        scope3: {
          scope4: {
            counter: 0,
          },
        },
      },
    },
  },
};

// like in real world - React.js component or etc.
const createHeavySubscriber = () => {
  let calls = 0;
  const getSubscriberCalls = () => calls;
  const heavySubscriber = () => {
    calls++;
    return new Array(50).fill(Math.random()).reduce((acc, v) => acc + v + Math.random());
  };

  return { getSubscriberCalls, heavySubscriber };
};

set('iterations', iterations);

suite('immutable noop', function() {
  set('iterations', iterations);
  bench('create', function() {
    const store = {
      scope: {
        counter: 0,
      },
    };
  });
  let store = initCounterStore;
  bench('modify', function() {
    store = {
      ...store,
      scope: {
        ...store.scope,
        counter: 1,
      },
    };
  });
});

/* redux */ suite('redux', function() {
  const { createStore } = require('redux');
  const {
    counterReducer,
    modifyReducer,
    normalizedReducer,
    deepCounterReducer,
  } = require('./reduxReducers');
  const { createSelector } = require('reselect');

  const testDeepCounter = onlyCreation => () => {
    const { getSubscriberCalls, heavySubscriber } = createHeavySubscriber();

    const actionIncrement = { type: 'INCREMENT' };
    const actionDecrement = { type: 'DECREMENT' };

    const scope0Selector = createSelector(state => state.scope0, _ => _);
    const scope1Selector = createSelector(scope0Selector, scope0 => scope0.scope1);
    const scope2Selector = createSelector(scope1Selector, scope1 => scope1.scope2);
    const scope3Selector = createSelector(scope2Selector, scope2 => scope2.scope3);
    const scope4Selector = createSelector(scope3Selector, scope3 => scope3.scope4);
    const counterSelector = createSelector(scope4Selector, scope4 => scope4.counter);
    const memorizedSubcriber = (counterSelector, heavySubscriber);

    const deepCounter = createStore(deepCounterReducer(deepState));
    deepCounter.subscribe(() => memorizedSubcriber(deepCounter.getState()));

    if (onlyCreation) return;

    for (let i = 1; i < deepCount; i++) {
      deepCounter.dispatch(actionIncrement);
      deepCounter.dispatch(actionDecrement);
      deepCounter.getState();
    }

    const realetedCalls = getSubscriberCalls();
    const expectedCalls = deepCount /* actionIncrement */ + deepCount; /* actionDecrement */
    if (realetedCalls !== expectedCalls) {
      // FIXME: check calls for clearly results
      //throw new Error(`expected ${expectedCalls} calls but receive ${realetedCalls}`);
    }
  };

  bench('create deep counter', testDeepCounter(true));
  bench('deep counter', testDeepCounter(false));

  //

  const testNormalized = onlyCreation => () => {
    const { getSubscriberCalls, heavySubscriber } = createHeavySubscriber();

    const add = id => ({ type: 'add', payload: { id: id, text: 'some news text' + id } });
    const mod = id => ({ type: 'mod', payload: { id, text: Math.random().toString() } });
    const del = id => ({ type: 'delete', payload: { id } });

    const newsSelector = createSelector(state => state.news, _ => _);

    const storeNormalized = createStore(normalizedReducer(initNormalizedState));

    if (onlyCreation) return;

    for (let i = 1; i < normalizedCount; i++) {
      storeNormalized.dispatch(add(i));
      const itemSelector = createSelector(newsSelector, news => news[i]);
      const memorizedSubcriber = createSelector(itemSelector, heavySubscriber);
      storeNormalized.subscribe(() => memorizedSubcriber(storeNormalized.getState()));
    }
    let modRepeats = normalizedModRepeats;
    while (modRepeats--) {
      for (let i = 1; i < normalizedCount; i++) {
        storeNormalized.dispatch(mod(i));
      }
    }
    for (let i = normalizedCount - 1; i >= 1; i--) {
      storeNormalized.dispatch(del(i));
    }
  };

  bench('create normalized', testNormalized(true));
  bench('normalized', testNormalized(false));
});

/* pathon */ suite('immutable pathon from ../es', function() {
  const { path, immutablePreset, mutablePreset } = require('../es');

  const testDeepCounter = onlyCreation => () => {
    const { getSubscriberCalls, heavySubscriber } = createHeavySubscriber();

    const pRoot = path('deep-example', { ...deepState }, immutablePreset);

    const pCounter = pRoot
      .path('scope0')
      .path('scope1')
      .path('scope2')
      .path('scope3')
      .path('scope4')
      .path('counter');
    const increment = () => {
      pCounter.set(pCounter.get() + 1);
    };
    const decrement = () => {
      pCounter.set(pCounter.get() - 1);
    };
    pRoot.watch(heavySubscriber);

    if (onlyCreation) return;

    for (let i = 1; i < deepCount; i++) {
      increment();
      decrement();
      pRoot.get();
    }
  };

  bench('create deep counter', testDeepCounter(true));
  bench('deep counter', testDeepCounter(false));

  //

  const testNormalized = onlyCreation => () => {
    const { getSubscriberCalls, heavySubscriber } = createHeavySubscriber();

    const newsExamplePath = path('news-example', { ...initNormalizedState }, immutablePreset);
    const pNews = newsExamplePath.path('news');
    const pShow = newsExamplePath.path('show');

    const add = news =>
      newsExamplePath.batch(p => {
        pNews.path(news.id, news);
        pShow.path(news.id, news.id);
      });

    const mod = id =>
      pNews
        .path(id)
        .path('text')
        .set(Math.random().toString());

    const del = id =>
      newsExamplePath.batch(() => {
        const { [id]: _, ...news } = pNews.get();
        pNews.set(news);
        pShow.set(pShow.get().filter(element => element !== id));
      });

    if (onlyCreation) return;

    for (let i = 0; i < normalizedCount; i++) {
      add({ id: i, text: 'some news text' + i });
      pNews.path(i).watch(heavySubscriber);
    }
    let modRepeats = normalizedModRepeats;
    while (modRepeats--) {
      for (let i = 1; i < normalizedCount; i++) {
        mod(i);
      }
    }
    for (let i = normalizedCount - 1; i >= 0; i--) {
      del(i);
    }
  };

  bench('create normalized', testNormalized(true));
  bench('normalized', testNormalized(false));
});

/* kefir.atom */ suite('immutable kefir.atom', function() {
  const Atom = require('kefir.atom').default;
  const holding = require('kefir.atom').holding;

  const testDeepCounter = onlyCreation => () => {
    const { getSubscriberCalls, heavySubscriber } = createHeavySubscriber();

    const deepExampleAtom = new Atom({ ...deepState });

    const counterAtom = deepExampleAtom
      .view('scope0')
      .view('scope1')
      .view('scope2')
      .view('scope3')
      .view('scope4')
      .view('counter');
    const increment = () => {
      counterAtom.modify(value => value + 1);
    };
    const decrement = () => {
      counterAtom.modify(value => value - 1);
    };
    deepExampleAtom.onValue(heavySubscriber);

    if (onlyCreation) return;

    for (let i = 1; i < deepCount; i++) {
      increment();
      decrement();
      deepExampleAtom.get();
    }
  };

  bench('create deep counter', testDeepCounter(true));
  bench('deep counter', testDeepCounter(false));

  //

  const testNormalized = onlyCreation => () => {
    const { getSubscriberCalls, heavySubscriber } = createHeavySubscriber();

    const newsExampleAtom = Atom({ ...initNormalizedState });
    const newsAtom = newsExampleAtom.view('news');
    const showAtom = newsExampleAtom.view('show');

    const add = news =>
      holding(() => {
        newsAtom.modify(value => ({ ...value, [news.id]: news.text }));
        showAtom.modify(value => [...value, news.id]);
      });

    const mod = id =>
      newsAtom
        .view(id)
        .view('text')
        .set(Math.random().toString());

    const del = id => {
      holding(() => {
        newsAtom.view(id).remove();
        showAtom.modify(value => value.filter(element => element !== id));
      });
    };

    if (onlyCreation) return;

    for (let i = 0; i < normalizedCount; i++) {
      add({ id: i, text: 'some news text' + i });
      newsAtom.view(i).onValue(heavySubscriber);
    }
    let modRepeats = normalizedModRepeats;
    while (modRepeats--) {
      for (let i = 1; i < normalizedCount; i++) {
        mod(i);
      }
    }
    for (let i = normalizedCount - 1; i >= 0; i--) {
      del(i);
    }
  };

  bench('create normalized', testNormalized(true));
  bench('normalized', testNormalized(false));
});
