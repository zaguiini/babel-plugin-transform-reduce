const _filterFn = function (i) {
  return i > 1
}

const _mapFn = function (i) {
  return i * 2
}

const _reducer = function (curr, next) {
  if (_filterFn(next)) {
    curr.push(_mapFn(next, curr.length))
  }

  return curr
}

;[1, 2, 3].reduce(_reducer, [])
