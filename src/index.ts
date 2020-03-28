import { parse } from 'babylon'
import traverse, {NodePath} from 'babel-traverse'
import {
    arrowFunctionExpression,
    CallExpression, Expression, FunctionExpression, identifier,
    Identifier, isIdentifier,
    MemberExpression,
} from 'babel-types'
import generate from 'babel-generator'
import template from 'babel-template'

const code = `
const biggerThanOne = i => i > 1;

[1,2,3].filter(biggerThanOne).map(i => i * 2)
`

const reduceFilterPlaceholder = template(`
    const FILTER_EXPRESSION_ID = FILTER_EXPRESSION
`)

const reduceMapPlaceholder = template(`
    const MAP_EXPRESSION_ID = MAP_EXPRESSION
`)

const reducePlaceholder = template(`
    CALLED.reduce((curr, next) => {
        if(FILTER_EXPRESSION_ID(next)) {
            curr.push(MAP_EXPRESSION_ID(next, curr.length))
        }

        return curr
    }, [])
`)

const ast = parse(code)

type GetMapAndFilterExpression = {
    mapExpression: Expression | false
    filterExpression: Expression | false
}

const getMapAndFilterExpression = (path: NodePath): GetMapAndFilterExpression => {
    const callee = (path.node as CallExpression).callee as MemberExpression
    const isMap = (callee?.property as Identifier)?.name === 'map' ?? false
    const isFilter = (((callee?.object as CallExpression)?.callee as MemberExpression)?.property as Identifier)?.name === 'filter' ?? false

    if(isMap && isFilter) {
        const mapExpression = (path.node as CallExpression).arguments[0] as Expression
        const filterExpression = (((path.node as CallExpression).callee as MemberExpression).object as CallExpression).arguments[0] as Expression

        return {
            mapExpression,
            filterExpression
        }
    }

    return {
        mapExpression: false,
        filterExpression: false
    }
}

traverse(ast, {
    CallExpression: {
        enter: (path) => {
            const {
                mapExpression,
                filterExpression
            } = getMapAndFilterExpression(path)

            if(!mapExpression || !filterExpression) {
                return
            }

            const MAP_EXPRESSION_ID = isIdentifier(mapExpression) ?  identifier(mapExpression.name) : path.scope.generateUidIdentifier('mapFn')
            const FILTER_EXPRESSION_ID = isIdentifier(filterExpression) ? identifier(filterExpression.name) : path.scope.generateUidIdentifier('filterFn')

            const areBothIdentifiers = isIdentifier(mapExpression) && isIdentifier(filterExpression)

            if(!areBothIdentifiers) {
                if(!isIdentifier(filterExpression)) {
                    const { params, body } = filterExpression as FunctionExpression

                    path.parentPath.insertBefore(reduceFilterPlaceholder({
                        FILTER_EXPRESSION_ID,
                        FILTER_EXPRESSION: arrowFunctionExpression(params, body)
                    }))
                }

                if(!isIdentifier(mapExpression)) {
                    const { params, body } = mapExpression as FunctionExpression

                    path.parentPath.insertBefore(reduceMapPlaceholder({
                        MAP_EXPRESSION_ID,
                        MAP_EXPRESSION: arrowFunctionExpression(params, body)
                    }))
                }
            }

            path.replaceWith(reducePlaceholder({
                CALLED: ((((path.node as CallExpression).callee as MemberExpression).object as CallExpression).callee as MemberExpression).object,
                FILTER_EXPRESSION_ID,
                MAP_EXPRESSION_ID,
            }))
        }
    }
})

console.log(generate(ast, {}, code).code)
