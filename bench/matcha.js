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
const normalizedCount = 10;

const iterations = 1000;

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

/* redux */
suite('redux', function() {
  const { createStore } = require('redux');
  const {
    counterReducer,
    modifyReducer,
    normalizedReducer,
    deepCounterReducer,
  } = require('./reduxReducers');
  const { createSelector } = require('reselect');

  bench('create deep count', function() {
    const actionIncrement = { type: 'INCREMENT' };
    const actionDecrement = { type: 'DECREMENT' };

    const scope0Selector = createSelector(state => state.scope0, _ => _);
    const scope1Selector = createSelector(scope0Selector, scope0 => scope0.scope1);
    const scope2Selector = createSelector(scope1Selector, scope1 => scope1.scope2);
    const scope3Selector = createSelector(scope2Selector, scope2 => scope2.scope3);
    const scope4Selector = createSelector(scope3Selector, scope3 => scope3.scope4);
    const counterSelector = createSelector(scope4Selector, scope4 => scope4.counter);

    const deepCounter = createStore(deepCounterReducer(deepState));
    deepCounter.subscribe(() => counterSelector(deepCounter.getState()));
  });

  const actionIncrement = { type: 'INCREMENT' };
  const actionDecrement = { type: 'DECREMENT' };

  const scope0Selector = createSelector(state => state.scope0, _ => _);
  const scope1Selector = createSelector(scope0Selector, scope0 => scope0.scope1);
  const scope2Selector = createSelector(scope1Selector, scope1 => scope1.scope2);
  const scope3Selector = createSelector(scope2Selector, scope2 => scope2.scope3);
  const scope4Selector = createSelector(scope3Selector, scope3 => scope3.scope4);
  const counterSelector = createSelector(scope4Selector, scope4 => scope4.counter);

  const deepCounter = createStore(deepCounterReducer(deepState));
  deepCounter.subscribe(() => counterSelector(deepCounter.getState()));

  bench('deep counter', function() {
    deepCounter.dispatch(actionIncrement);
    deepCounter.dispatch(actionDecrement);
    deepCounter.getState();
  });

  //

  bench('create normalized', function() {
    var actions = { type: 'add', payload: { id: 1, text: 'some news text' + 1 } };
    var actions = { type: 'delete', payload: 1 };

    const newsSelector = createSelector(state => state.news, _ => _);
    const minusSelector = createSelector(newsSelector, news => news['-1']);

    const storeNormalized = createStore(normalizedReducer(initNormalizedState));
    storeNormalized.subscribe(() => minusSelector(storeNormalized.getState()));
  });

  var actions = { type: 'add', payload: { id: 1, text: 'some news text' + 1 } };
  var actions = { type: 'delete', payload: 1 };

  const newsSelector = createSelector(state => state.news, _ => _);
  const minusSelector = createSelector(newsSelector, news => news['-1']);

  const storeNormalized = createStore(normalizedReducer(initNormalizedState));
  storeNormalized.subscribe(() => minusSelector(storeNormalized.getState()));

  bench('normalized', function() {
    for (let i = 1; i < normalizedCount; i++) {
      storeNormalized.dispatch({ type: 'add', payload: { id: i, text: 'some news text' + i } });
    }
    for (let i = normalizedCount - 1; i >= 1; i--) {
      storeNormalized.dispatch({ type: 'delete', payload: i });
    }
  });
});

/* pathon */

// FIXME: build version
suite('pathon from ../src', function() {
  const { path, immutablePreset, mutablePreset } = require('../src');

  bench('create deep counter', function() {
    const deepExamplePath = path('deep-example', { ...deepState }, immutablePreset);

    const counterPath = deepExamplePath
      .path('scope0')
      .path('scope1')
      .path('scope2')
      .path('scope3')
      .path('scope4')
      .path('counter');
    const increment = () => {
      counterPath.set(counterPath.get() + 1);
    };
    const decrement = () => {
      counterPath.set(counterPath.get() - 1);
    };
    deepExamplePath.watch(state => state);
  });

  const deepExamplePath = path('deep-example', { ...deepState }, immutablePreset);

  const counterPath = deepExamplePath
    .path('scope0')
    .path('scope1')
    .path('scope2')
    .path('scope3')
    .path('scope4')
    .path('counter');
  const increment = () => {
    counterPath.set(counterPath.get() + 1);
  };
  const decrement = () => {
    counterPath.set(counterPath.get() - 1);
  };
  deepExamplePath.watch(state => state);
  bench('deep counter', function() {
    increment();
    decrement();
    deepExamplePath.get()
  });

  //

  bench('create normalized', function() {
    const newsExamplePath = path('news-example', { ...initNormalizedState }, immutablePreset);
    newsExamplePath
      .path('news')
      .path('-1')
      .watch(state => state);

    const addNews = news => {
      const state = newsExamplePath.get();
      newsExamplePath.set({
        news: { ...state.news, [news.id]: news },
        show: [...state.show, news.id],
      });
    };

    const deleteNews = id => {
      const state = newsExamplePath.get();
      const { [id]: _, ...news } = state.news;
      newsExamplePath.set({
        news,
        show: state.show.filter(element => element !== id),
      });
    };
  });

  const newsExamplePath = path('news-example', { ...initNormalizedState }, immutablePreset);
  newsExamplePath
    .path('news')
    .path('-1')
    .watch(state => state);

  const addNews = news => {
    const state = newsExamplePath.get();
    newsExamplePath.set({
      news: { ...state.news, [news.id]: news },
      show: [...state.show, news.id],
    });
  };

  const deleteNews = id => {
    const state = newsExamplePath.get();
    const { [id]: _, ...news } = state.news;
    newsExamplePath.set({
      news,
      show: state.show.filter(element => element !== id),
    });
  };

  bench('normalized', function() {
    for (let i = 0; i < normalizedCount; i++) {
      addNews({ id: i, text: 'some news text' + i });
    }
    for (let i = normalizedCount - 1; i >= 0; i--) {
      deleteNews(i);
    }
  });
});
