declare module '@babel/helper-plugin-utils' {
    interface API {
        assertVersion: (version: number) => void
    }

    type DeclareCallback = (api: API) => void
    export const declare: (callback: DeclareCallback) => void
}
