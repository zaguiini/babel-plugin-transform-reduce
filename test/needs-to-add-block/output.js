const fn = () => {
  const _filterFn = (i) => i > 1

  const _mapFn = (i) => i * 2

  const _reducer = (curr, next) => {
    if (_filterFn(next)) {
      curr.push(_mapFn(next, curr.length))
    }

    return curr
  }

  return [1, 2, 3].reduce(_reducer, [])
}
