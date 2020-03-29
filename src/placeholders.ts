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
} from 'babel-types'

interface RenderReducer {
  filter: Expression
  map: Expression
  isArrowFunction: boolean
}

export const renderReducer = ({
  filter,
  map,
  isArrowFunction,
}: RenderReducer) => {
  const params = [identifier('curr'), identifier('next')]
  const body = blockStatement([
    ifStatement(
      callExpression(filter, [identifier('next')]),
      blockStatement([
        expressionStatement(
          callExpression(
            memberExpression(identifier('curr'), identifier('push')),
            [
              callExpression(map, [
                identifier('next'),
                memberExpression(identifier('curr'), identifier('length')),
              ]),
            ]
          )
        ),
      ])
    ),
    returnStatement(identifier('curr')),
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
