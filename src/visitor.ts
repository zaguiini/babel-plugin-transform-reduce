import { NodePath } from 'babel-traverse'
import {
  blockStatement,
  CallExpression,
  Expression,
  identifier,
  isArrowFunctionExpression,
  isBlockStatement,
  isIdentifier,
  Node,
  returnStatement,
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

      if (
        isArrowFunctionExpression(path.parent) &&
        !isBlockStatement(path.parent.body)
      ) {
        path.replaceWith(blockStatement([returnStatement(path.node)]))
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
        constant(
          REDUCER_IDENTIFIER,
          renderReducer({
            filter: FILTER_EXPRESSION_IDENTIFIER,
            map: MAP_EXPRESSION_IDENTIFIER,
            isArrowFunction:
              isArrowFunctionExpression(filterExpression) ||
              isArrowFunctionExpression(mapExpression),
            accumulator: path.scope.generateUidIdentifier('acc'),
            current: path.scope.generateUidIdentifier('curr'),
          })
        ),
      ]

      if (!isIdentifier(mapExpression)) {
        statements.unshift(constant(MAP_EXPRESSION_IDENTIFIER, mapExpression))
      }

      if (!isIdentifier(filterExpression)) {
        statements.unshift(
          constant(FILTER_EXPRESSION_IDENTIFIER, filterExpression)
        )
      }

      path.getStatementParent().insertBefore(statements)
      path.replaceWith(
        renderReduce({
          callee,
          reducer: REDUCER_IDENTIFIER,
        })
      )
    },
  },
}
