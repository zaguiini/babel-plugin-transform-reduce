import {
  CallExpression,
  FunctionExpression,
  Identifier,
  MemberExpression,
  functionExpression,
  returnStatement,
  variableDeclaration,
  variableDeclarator,
  blockStatement,
  isBinaryExpression,
} from 'babel-types'
import { NodePath } from 'babel-traverse'

type GetMapAndFilterExpression = {
  mapExpression: FunctionExpression | false
  filterExpression: FunctionExpression | false
}

export const getMapAndFilterExpression = (
  path: NodePath<CallExpression>
): GetMapAndFilterExpression => {
  const callee = path.node.callee as MemberExpression
  const isMap = (callee?.property as Identifier)?.name === 'map' ?? false
  const isFilter =
    (((callee?.object as CallExpression)?.callee as MemberExpression)
      ?.property as Identifier)?.name === 'filter' ?? false

  if (isMap && isFilter) {
    const mapExpression = (path.node as CallExpression)
      .arguments[0] as FunctionExpression
    const filterExpression = (((path.node as CallExpression)
      .callee as MemberExpression).object as CallExpression)
      .arguments[0] as FunctionExpression

    return {
      mapExpression,
      filterExpression,
    }
  }

  return {
    mapExpression: false,
    filterExpression: false,
  }
}

export const insertFunctionExpressionIntoBlock = (
  block: NodePath,
  identifier: Identifier,
  expression: FunctionExpression
) => {
  block.insertBefore(
    variableDeclaration('const', [
      variableDeclarator(
        identifier,
        functionExpression(
          undefined,
          expression.params,
          isBinaryExpression(expression.body)
            ? blockStatement([returnStatement(expression.body)])
            : expression.body
        )
      ),
    ])
  )
}