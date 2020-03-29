import { NodePath } from 'babel-traverse'
import {
  blockStatement,
  CallExpression,
  Expression,
  FunctionExpression,
  identifier,
  isArrowFunctionExpression,
  isCallExpression,
  isIdentifier,
  Node,
  returnStatement,
  Statement,
  variableDeclaration,
  variableDeclarator,
} from 'babel-types'

import { getMapAndFilterExpression } from './helpers'
import { constant, renderReduce, renderReducer } from './placeholders'

export const visitor = {
  CallExpression: {
    enter: (path: NodePath<CallExpression>) => {
      const { mapExpression, filterExpression } = getMapAndFilterExpression(
        path
      )

      if (!mapExpression || !filterExpression) {
        return
      }

      const MAP_EXPRESSION_IDENTIFIER = isIdentifier(mapExpression)
        ? identifier(mapExpression.name)
        : path.scope.generateUidIdentifier('mapFn')
      const FILTER_EXPRESSION_IDENTIFIER = isIdentifier(filterExpression)
        ? identifier(filterExpression.name)
        : path.scope.generateUidIdentifier('filterFn')

      const callee = (path.get('callee.object.callee.object') as NodePath<
        Expression
      >).node
      const REDUCER_IDENTIFIER = path.scope.generateUidIdentifier('reducer')

      const statements: Node[] = [
        variableDeclaration('const', [
          variableDeclarator(
            REDUCER_IDENTIFIER,
            renderReducer({
              filter: FILTER_EXPRESSION_IDENTIFIER,
              map: MAP_EXPRESSION_IDENTIFIER,
              isArrowFunction: isArrowFunctionExpression(filterExpression),
            })
          ),
        ]),
        renderReduce({
          callee,
          reducer: REDUCER_IDENTIFIER,
        }),
      ]

      if (!isIdentifier(mapExpression)) {
        statements.unshift(constant(MAP_EXPRESSION_IDENTIFIER, mapExpression))
      }

      if (!isIdentifier(filterExpression)) {
        statements.unshift(
          constant(FILTER_EXPRESSION_IDENTIFIER, filterExpression)
        )
      }

      const parent = path.parent as FunctionExpression
      const canWeInsertNewStatements = !isCallExpression(parent.body)

      if (canWeInsertNewStatements) {
        path.replaceWithMultiple(statements)
      } else {
        statements[statements.length - 1] = returnStatement(
          statements[statements.length - 1] as CallExpression
        )
        parent.body = blockStatement(statements as Statement[])
      }
    },
  },
}
