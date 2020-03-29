import pluginTester from 'babel-plugin-tester'
import babelPluginTransformReduce from "../src";

pluginTester({
    plugin: babelPluginTransformReduce,
    pluginName: 'transform-reduce',
    fixtures: __dirname
})
