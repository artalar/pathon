# pathon

<!-- path + O(n) ? -->

> `pathon` doing one job - and doing it great - observable data structures. No more architecture or workflow dependence. Just observable state with maximum performance for subscribers (without selectors and etc.).

### Example

> Basic
>
> [![Demo](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/j2n4v685vv)

> Complex
>
> [![Demo](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/6rrm677pk)

# API

```javascript
import { path } from './pathon';

const pathRoot = path('root', { count: [1, 1, 1], individualCount: 1 });

const pathCount = pathRoot.path('count');

const {
  get, // get `path` value
  set, // set value to `path`
  watch, // subscribe to updates
  unwatch, // unsubscribe
  compose, // compose many updates (`.set`)
  path, // create new `path` - element of current value by specified key
  getPath, // get current `path` key
  getPathFull, // get array of keys from root to current `path`
} =
  pathRoot || pathCount || pathCount.path('0');

// if you will update inner [property] `path` - all parent `path`'s watchers will be called
// but other watchers of `path`'s in neighbour branches will not be called

// except `immutablePreset` you can use any preset for any data-structure
```

# TODO

> advanced examples with presets

# TIPS

> it's sound like `pazone`
