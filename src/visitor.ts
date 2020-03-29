import { NodePath } from 'babel-traverse'
import {
  blockStatement,
  CallExpression, Expression, FunctionExpression,
  identifier,
  isArrowFunctionExpression, isCallExpression,
  isIdentifier,
  returnStatement,
  variableDeclaration,
  variableDeclarator,
} from 'babel-types'

import {
  getMapAndFilterExpression,
  insertFunctionExpressionBefore,
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

      const bodyOfParent = (path.parent as FunctionExpression)
      const canWeInsertNewStatements = !isCallExpression(bodyOfParent.body)
      const callee = (path.get('callee.object.callee.object') as NodePath<Expression>).node

      let statement = path.parentPath
      const REDUCER_IDENTIFIER = path.scope.generateUidIdentifier('reducer')

      const reducer = renderReduce({
        callee,
        reducer: REDUCER_IDENTIFIER,
      })

      if(!canWeInsertNewStatements) {
        bodyOfParent.body = blockStatement([
          returnStatement(reducer)
        ])

        statement = (path.parentPath.get('body.body') as NodePath[])[0]
      } else {
        path.replaceWith(reducer)
      }

      if (!isIdentifier(filterExpression)) {
        insertFunctionExpressionBefore(
            statement,
            FILTER_EXPRESSION_IDENTIFIER,
            filterExpression
        )
      }

      if (!isIdentifier(mapExpression)) {
        insertFunctionExpressionBefore(
            statement,
            MAP_EXPRESSION_IDENTIFIER,
            mapExpression
        )
      }

      const REDUCER = renderReducer({
        filter: FILTER_EXPRESSION_IDENTIFIER,
        map: MAP_EXPRESSION_IDENTIFIER,
        isArrowFunction: isArrowFunctionExpression(filterExpression)
      })

      statement.insertBefore(
          variableDeclaration('const', [
            variableDeclarator(REDUCER_IDENTIFIER, REDUCER),
          ])
      )
    },
  },
}
