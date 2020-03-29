import { NodePath } from 'babel-traverse'
import {
  CallExpression,
  identifier,
  isArrowFunctionExpression,
  isIdentifier,
  MemberExpression,
} from 'babel-types'

import {
  getMapAndFilterExpression,
  insertFunctionExpressionIntoBlock,
} from './helpers'
import { reducePlaceholder } from './placeholders'

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

      const areBothIdentifiers =
        isIdentifier(mapExpression) && isIdentifier(filterExpression)
      const canWeInsertNewStatements = !isArrowFunctionExpression(
        path.parentPath
      )

      if (!areBothIdentifiers && canWeInsertNewStatements) {
        if (!isIdentifier(filterExpression)) {
          insertFunctionExpressionIntoBlock(
            path.parentPath,
            FILTER_EXPRESSION_IDENTIFIER,
            filterExpression
          )
        }

        if (!isIdentifier(mapExpression)) {
          insertFunctionExpressionIntoBlock(
            path.parentPath,
            MAP_EXPRESSION_IDENTIFIER,
            mapExpression
          )
        }
      }

      path.replaceWith(
        reducePlaceholder({
          CALLED: ((((path.node as CallExpression).callee as MemberExpression)
            .object as CallExpression).callee as MemberExpression).object,
          FILTER_EXPRESSION_IDENTIFIER: canWeInsertNewStatements
            ? FILTER_EXPRESSION_IDENTIFIER
            : filterExpression,
          MAP_EXPRESSION_IDENTIFIER: canWeInsertNewStatements
            ? MAP_EXPRESSION_IDENTIFIER
            : mapExpression,
        })
      )
    },
  },
}
