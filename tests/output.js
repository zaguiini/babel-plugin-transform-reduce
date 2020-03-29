const fn = () =>
  [1, 2, 3].reduce(function (curr, next) {
    if (((i) => i > 1)(next)) {
      curr.push(((i) => i * 2)(next, curr.length))
    }
        return curr
  }, [])
