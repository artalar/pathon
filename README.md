# pathon

<!-- path + O(n) ? -->

# WIP

```javascript
import { createRootPath, immutablePreset } from 'pathon';

// create observable top level lens
// with preset for manipulate data
const pathRoot = createRootPath({ data: {} }, 'root', immutablePreset);

// create lens for inner filed
const pathRootData = pathRoot.path('data');

// return current value for this path
typeof pathRoot.get;
// function

// set new value for this path
typeof pathRoot.set;
// function

// create new inner lens
typeof pathRoot.path;
// function

// subscribe for updates by callback
typeof pathRoot.watch;
// function

// unsubscribe form updates by callback
typeof pathRoot.unwatch;
// function

TODO:
* `.watch.map` for computed values and memorize
* `.watch.shape` for computed structure and memorize
* `compose` for complex updates
* tests
* mutable preset
* callback preset
* types
* immutablejs preset
```
