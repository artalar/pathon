'use strict';

const { test, beforeAll, afterAll } = require('./benchmark');

beforeAll(() => {
  const { Record, Repeat } = require('immutable');
  const { createEvent, createStore } = require('effector');
  const { default: produce, setAutoFreeze, setUseProxies } = require('immer');
  const { path, immutablePreset } = require('../src');
});

afterAll(results => {
  const { printResults } = require('./printResults');
  printResults(results);
});

const MAX = 100000;
const MODIFY_FACTOR = 0.1;

function getItem(any, i) {
  return {
    todo: `todo_${i}`,
    done: false,
    someThingCompletelyIrrelevant: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
  };
}
function generateDraft() {
  const draft = [];
  for (let i = 0; i < MAX; i++) {
    draft.push(getItem(undefined, i));
  }
  return draft;
}

test('pathon (immutable single update)', prepared => {
  //$off
  const { path, immutablePreset } = require('../src');
  const rootPath = path('root', generateDraft(), immutablePreset);
  prepared();

  const newDraft = rootPath.get().concat([]);
  for (let i = 0; i < MAX * MODIFY_FACTOR; i++) {
    newDraft[i] = Object.assign({}, newDraft[i], { done: true });
  }
  rootPath.set(newDraft);

  return rootPath.get();
});

test('effector (immutable single update)', prepared => {
  //$off
  const { createEvent, createStore } = require('effector');
  const updateEvent = createEvent('update');
  const effectorStore = createStore(generateDraft()).on(updateEvent, draft => {
    const newDraft = draft.concat([]);
    for (let i = 0; i < MAX * MODIFY_FACTOR; i++) {
      newDraft[i] = Object.assign({}, newDraft[i], { done: true });
    }
    return newDraft;
  });
  prepared();
  updateEvent();
  return effectorStore.getState();
});

test('pathon (mutable single update)', prepared => {
  //$off
  const { path, mutablePreset } = require('../src');
  const rootPath = path('root', generateDraft(), mutablePreset);
  prepared();

  const newDraft = rootPath.get();
  for (let i = 0; i < MAX * MODIFY_FACTOR; i++) {
    newDraft[i].done = true;
  }
  rootPath.set(newDraft);

  return rootPath.get();
});

test('effector (mutable single update)', prepared => {
  //$off
  const { createEvent, createStore } = require('effector');
  const updateEvent = createEvent('update');
  const effectorStore = createStore(generateDraft()).on(updateEvent, draft => {
    for (let i = 0; i < MAX * MODIFY_FACTOR; i++) {
      draft[i].done = true;
    }
    return draft;
  });
  prepared();
  updateEvent();
  return effectorStore.getState();
});

test('pathon (immutable each update)', prepared => {
  //$off
  const { path, immutablePreset } = require('../src');
  const rootPath = path('root', generateDraft(), immutablePreset);
  const update = i =>
    rootPath
      .path(i)
      .path('done')
      .set(true);
  prepared();

  for (let i = 0; i < MAX * MODIFY_FACTOR; i++) {
    update(i);
  }
  return rootPath.get();
});

test('effector (immutable each update)', prepared => {
  //$off
  const { createEvent, createStore } = require('effector');
  const updateEvent = createEvent('update');
  const effectorStore = createStore(generateDraft()).on(updateEvent, (state, i) => {
    const newDraft = draft.concat([]);
    newDraft[i] = Object.assign({}, newDraft[i], { done: true });
    return newDraft;
  });
  prepared();
  for (let i = 0; i < MAX * MODIFY_FACTOR; i++) {
    updateEvent(i);
  }
  return effectorStore.getState();
});

test('pathon (mutable each update)', prepared => {
  //$off
  const { path, mutablePreset } = require('../src');
  const rootPath = path('root', generateDraft(), mutablePreset);
  const update = i =>
    rootPath
      .path(i)
      .path('done')
      .set(true);
  prepared();

  for (let i = 0; i < MAX * MODIFY_FACTOR; i++) {
    update(i);
  }
  return rootPath.get();
});

test('effector (mutable each update)', prepared => {
  //$off
  const { createEvent, createStore } = require('effector');
  const updateEvent = createEvent('update');
  const effectorStore = createStore(generateDraft()).on(updateEvent, (state, i) => {
    newDraft[i].done = true;
    return newDraft;
  });
  prepared();
  for (let i = 0; i < MAX * MODIFY_FACTOR; i++) {
    updateEvent(i);
  }
  return effectorStore.getState();
});

test('just mutate', prepared => {
  const draft = generateDraft();
  prepared();
  for (let i = 0; i < MAX * MODIFY_FACTOR; i++) {
    draft[i].done = true;
  }
  return draft;
});

test('just immutate', prepared => {
  const draft = generateDraft();
  prepared();
  const newDraft = draft.slice();
  for (let i = 0; i < MAX * MODIFY_FACTOR; i++) {
    newDraft[i] = Object.assign({}, newDraft[i], { done: true });
  }
  return newDraft;
});
