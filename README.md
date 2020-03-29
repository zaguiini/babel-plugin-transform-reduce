# babel-plugin-transform-reduce

Turns this

```js
const fn = () => {
  // do stuff

  return [1, 2, 3].filter(i => i > 1).map(i => i * 2)
}
```

Into this

```js
const fn = () => {
  // do stuff

  const _filterFn = function (i) {
    return i > 1;
  }

  const _mapFn = function (i) {
    return i * 2;
  }

  const _reducer = function(curr, next) {
    if(_filterFn(next)) {
      curr.push(_mapFn(next, curr.length))
    }

    return curr
  }

  return [1, 2, 3].reduce(_reducer, [])
}
```

Because it's [way faster](https://jsperf.com/reduce-filter-map/1), but less readable.
So I've created this plugin to deal with it: it transforms `.filter() + .map()` calls to `.reduce()` under the hood!

Usage:

```bash
yarn add babel-plugin-transform-reduce --dev
```

then, in your `.babelrc`:

```json
{
  "plugins": ["transform-reduce"]
}
```

You're all set!

# License

MIT
