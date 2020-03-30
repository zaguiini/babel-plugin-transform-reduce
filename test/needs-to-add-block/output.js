const fn = () => {
  const _filterFn = (i) => i > 1

  const _mapFn = (i) => i * 2

  const _reducer = (_acc, _curr) => {
    if (_filterFn(_curr)) {
      _acc.push(_mapFn(_curr, _acc.length))
    }

    return _acc
  }

  return [1, 2, 3].reduce(_reducer, [])
}

fn()
