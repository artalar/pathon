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
import { path, immutablePreset } from './pathon';

const pathRoot = path('root', { count: [1, 1, 1], individualCount: 1 }, immutablePreset);

const pathCount = pathRoot.path('count');

const {
  // Every method is a function:
  get, // get `path` value
  set, // set (and merge) value to `path`
  batch, // accept callback which u can do many set's without call subscriptions (only after `batch`)
  watch, // subscribe to updates
  unwatch, // unsubscribe
  path, // create new `path` - element of current value by specified key
  getPath, // get array of keys from root to current `path`
} =
  pathRoot || pathCount || pathCount.path('0');
```

If you will update inner [property] `path` - all parent `path`'s watchers will be called but other watchers of `path`'s in neighbour branches will not be called

Except `immutablePreset` you can use any preset for any data-structure. Anyway you can choose not to specify a preset - by default accepted structure will update by mutations.

# TODO

> Docs

# TIPS

> it's sound like `pazone`
