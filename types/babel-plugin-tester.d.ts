declare module 'babel-plugin-tester' {
    interface PluginTester {
        plugin: void
        pluginName: string
        fixtures: string
    }

    const pluginTester: (options: PluginTester) => void
    export default pluginTester
}
