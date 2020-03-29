import { NodePath } from 'babel-traverse'
import {
  CallExpression,
  identifier,
  isArrowFunctionExpression,
  isIdentifier,
  MemberExpression,
  variableDeclaration,
  variableDeclarator,
} from 'babel-types'

import {
  getMapAndFilterExpression,
  insertFunctionExpressionIntoBlock,
} from './helpers'
import { renderReduce, renderReducer } from './placeholders'

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

      const REDUCER_IDENTIFIER = path.scope.generateUidIdentifier('reducer')

      const REDUCER = renderReducer({
        filter: canWeInsertNewStatements
          ? FILTER_EXPRESSION_IDENTIFIER
          : filterExpression,
        map: canWeInsertNewStatements
          ? MAP_EXPRESSION_IDENTIFIER
          : mapExpression,
        isArrowFunction: isArrowFunctionExpression(filterExpression)
      })

      if (canWeInsertNewStatements) {
        path.parentPath.insertBefore(
          variableDeclaration('const', [
            variableDeclarator(REDUCER_IDENTIFIER, REDUCER),
          ])
        )
      }

      path.replaceWith(
        renderReduce({
          callee: (((path.node.callee as MemberExpression)
            .object as CallExpression).callee as MemberExpression).object,
          reducer: canWeInsertNewStatements ? REDUCER_IDENTIFIER : REDUCER,
        })
      )
    },
  },
}
