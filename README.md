# babel-plugin-transform-reduce

Turns this

```js
const fn = () => [1, 2, 3].filter(i => i > 1).map(i => i * 3)
```

Into this

```js
const fn = () => {
  const _filterFn = (i) => i > 1
  const _mapFn = (i) => i * 3

  const _reducer = (_acc, _curr) => {
    if (_filterFn(_curr)) {
      _acc.push(_mapFn(_curr, _acc.length))
    }

    return _acc
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
