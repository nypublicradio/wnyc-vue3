declare module 'h3' {
    interface H3EventContext {
        request: {
            url: string;
            // Include any other properties you need
        };
    }
}

export default {};