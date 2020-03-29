import * as utils from '@babel/helper-plugin-utils'

import { visitor } from './visitor'

const babelPluginTransformReduce = utils.declare((api) => {
  api.assertVersion(7)

  return {
    name: 'transform-reduce',
    visitor,
  }
})

export default babelPluginTransformReduce
