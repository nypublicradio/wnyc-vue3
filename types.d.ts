declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}

declare module 'h3' {
    interface H3EventContext {
        request: {
            url: string
            // Include any other properties you need
        }
    }
}

export default {}