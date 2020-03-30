import {
  blockStatement,
  callExpression,
  Expression,
  expressionStatement,
  functionExpression,
  identifier,
  ifStatement,
  memberExpression,
  returnStatement,
  arrayExpression,
  arrowFunctionExpression,
  variableDeclaration,
  variableDeclarator,
  Identifier,
} from 'babel-types'

interface RenderReducer {
  filter: Expression
  map: Expression
  isArrowFunction: boolean
  accumulator: Identifier
  current: Identifier
}

export const renderReducer = ({
  filter,
  map,
  isArrowFunction,
  accumulator,
  current,
}: RenderReducer) => {
  const params = [accumulator, current]
  const body = blockStatement([
    ifStatement(
      callExpression(filter, [current]),
      blockStatement([
        expressionStatement(
          callExpression(memberExpression(accumulator, identifier('push')), [
            callExpression(map, [
              current,
              memberExpression(accumulator, identifier('length')),
            ]),
          ])
        ),
      ])
    ),
    returnStatement(accumulator),
  ])

  return isArrowFunction
    ? arrowFunctionExpression(params, body)
    : functionExpression(undefined, params, body)
}

interface RenderReduce {
  callee: Expression
  reducer: Expression
}

export const renderReduce = ({ callee, reducer }: RenderReduce) =>
  callExpression(memberExpression(callee, identifier('reduce')), [
    reducer,
    arrayExpression(),
  ])

export const constant = (...args: Parameters<typeof variableDeclarator>) =>
  variableDeclaration('const', [variableDeclarator(...args)])
