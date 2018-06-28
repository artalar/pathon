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
const deepCount = 100;
const normalizedCount = 50;

const iterations = 10;

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

  bench('deep counter', function() {
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

    for (let i = 1; i < deepCount; i++) {
      deepCounter.dispatch(actionIncrement);
      deepCounter.dispatch(actionDecrement);
      deepCounter.getState();
    }
  });

  //

  bench('create normalized', function() {
    const add = id => ({ type: 'add', payload: { id: id, text: 'some news text' + id } });
    const mod = id => ({ type: 'mod', payload: { id: id, text: Math.random().toString() } });
    const del = id => ({ type: 'delete', payload: id });

    const newsSelector = createSelector(state => state.news, _ => _);

    const storeNormalized = createStore(normalizedReducer(initNormalizedState));
  });

  bench('normalized', function() {
    const add = id => ({ type: 'add', payload: { id: id, text: 'some news text' + id } });
    const mod = id => ({ type: 'mod', payload: { id: 1, text: Math.random().toString() } });
    const del = id => ({ type: 'delete', payload: { id } });

    const newsSelector = createSelector(state => state.news, _ => _);

    const storeNormalized = createStore(normalizedReducer(initNormalizedState));

    for (let i = 1; i < normalizedCount; i++) {
      storeNormalized.dispatch(add(i));
      const itemSelector = createSelector(newsSelector, news => news[i]);
      storeNormalized.subscribe(() => itemSelector(storeNormalized.getState()));
    }
    for (let i = 1; i < normalizedCount * 10; i++) {
      storeNormalized.dispatch(mod(i));
    }
    for (let i = normalizedCount - 1; i >= 1; i--) {
      storeNormalized.dispatch(del(i));
    }
  });
}); // FIXME: build version

/* pathon */ suite('immutable pathon from ../src', function() {
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
    deepExamplePath.watch(() => {});
  });
  bench('deep counter', function() {
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

    for (let i = 1; i < deepCount; i++) {
      increment();
      decrement();
      deepExamplePath.get();
    }
  });

  //

  bench('create normalized', function() {
    const newsExamplePath = path('news-example', { ...initNormalizedState }, immutablePreset);
    const pNews = newsExamplePath.path('news');
    const pShow = newsExamplePath.path('show');

    const add = news =>
      newsExamplePath.batch(p => {
        pNews.path(news.id).set(news);
        pShow.path(pShow.get().length, news.id);
      });

    const mod = id =>
      pNews
        .path(id)
        .path('text')
        .set(Math.random().toString());

    const del = id => {
      const state = newsExamplePath.get();
      const { [id]: _, ...news } = pNews.get();
      pNews.set(news);
      pShow.set(pShow.get().filter(element => element !== id));
    };
  });

  bench('normalized', function() {
    const newsExamplePath = path('news-example', { ...initNormalizedState }, immutablePreset);
    const pNews = newsExamplePath.path('news');
    const pShow = newsExamplePath.path('show');

    const add = news =>
      newsExamplePath.batch(p => {
        pNews.path(news.id, news);
        pShow.path(news.id, news.id);
      });

    const mod = news =>
      pNews
        .path(news.id)
        .path('text')
        .set(news.text);

    const del = id => {
      const { [id]: _, ...news } = pNews.get();
      pNews.set(news);
      pShow.set(pShow.get().filter(element => element !== id));
    };

    for (let i = 0; i < normalizedCount; i++) {
      add({ id: i, text: 'some news text' + i });
      pShow.path(i).watch(() => {});
    }
    for (let i = 0; i < normalizedCount * 10; i++) {
      mod({ id: 1, text: Math.random().toString() });
    }
    for (let i = normalizedCount - 1; i >= 0; i--) {
      del(i);
    }
  });
});

/* suite('mutable pathon from ../src', function() {
  const { path, immutablePreset, mutablePreset } = require('../src');

  bench('create deep counter', function() {
    const deepExamplePath = path('deep-example', { ...deepState });

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
    deepExamplePath.watch(() => {});
  });

  const deepExamplePath = path('deep-example', { ...deepState });

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
    deepExamplePath.get();
  });

  //

  bench('create normalized', function() {
    const newsExamplePath = path('news-example', { ...initNormalizedState });
    const pNews = newsExamplePath.path('news');
    const pShow = newsExamplePath.path('show');

    const add = news =>
      newsExamplePath.batch(p => {
        pNews.path(news.id).set(news);
        pShow.path(pShow.get().length, news.id);
      });

    const mod = id =>
      pNews
        .path(id)
        .path('text')
        .set(Math.random().toString());

    const del = id => {
      const state = newsExamplePath.get();
      const news = pNews.get();
      delete news[id];
      pNews.set(news);
      pShow.set(pShow.get().filter(element => element !== id));
    };
  });

  const newsExamplePath = path('news-example', { ...initNormalizedState });
  const pNews = newsExamplePath.path('news');
  const pShow = newsExamplePath.path('show');

  const add = news =>
    newsExamplePath.batch(p => {
      console.log(news, pNews.path(news.id).get())
      pNews.path(news.id).set(news);
      pShow.path(pShow.get().length, news.id);
    });

  const mod = news =>
    pNews
      .path(news.id)
      .path('text')
      .set(news.text);

  const del = id => {
    const state = newsExamplePath.get();
    const { [id]: _, ...news } = pNews.get();
    pNews.set(news);
    pShow.set(pShow.get().filter(element => element !== id));
  };

  bench('normalized', function() {
    for (let i = 0; i < normalizedCount; i++) {
      add({ id: i, text: 'some news text' + i });
      pShow.path(i).watch(() => {});
    }
    for (let i = 0; i < normalizedCount * 10; i++) {
      mod({ id: 1, text: Math.random().toString() });
    }
    for (let i = normalizedCount - 1; i >= 0; i--) {
      del(i);
    }
  });
}); */
