import template from 'babel-template'

export const reducePlaceholder = template(`
    CALLED.reduce((curr, next) => {
        if(FILTER_EXPRESSION_IDENTIFIER(next)) {
            curr.push(MAP_EXPRESSION_IDENTIFIER(next, curr.length))
        }

        return curr
    }, [])
`)
