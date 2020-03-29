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
} from 'babel-types'

interface RenderReducer {
  filter: Expression
  map: Expression
}

export const renderReducer = ({ filter, map }: RenderReducer) =>
  functionExpression(
    undefined,
    [identifier('curr'), identifier('next')],
    blockStatement([
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
  )

interface RenderReduce {
  callee: Expression
  reducer: Expression
}

export const renderReduce = ({ callee, reducer }: RenderReduce) =>
  callExpression(memberExpression(callee, identifier('reduce')), [
    reducer,
    arrayExpression(),
  ])
