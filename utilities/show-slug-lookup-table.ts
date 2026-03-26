// isolates the slug from the end of a url
export const isolateSlug = (slug: string) => {
    return slug.split("/").pop()
}

export const redirects = [
    { from: "/browse/shows/10-things-scare-me", to: "/browse/shows/10-things-that-scare-me" },
    { from: "/browse/shows/dopequeens", to: "/browse/shows/2-dope-queens" },
    { from: "/browse/shows/aftereffect", to: "/browse/shows/the-latest-episodes-from-aftereffect" },
    { from: "/browse/shows/atc", to: "/browse/shows/all-things-considered" },
    { from: "/browse/shows/bl", to: "/browse/shows/brian-lehrer-show" },
    { from: "/browse/shows/the-brian-lehrer-show", to: "/browse/shows/brian-lehrer-show" },
    { from: "/browse/shows/bl-daily-politics-podcast", to: "/browse/shows/brian-lehrer-a-daily-politics-podcast" },
    { from: "/browse/shows/caught", to: "/browse/shows/the-latest-episodes-from-caught" },
    { from: "/browse/shows/come-through", to: "/browse/shows/come-through-with-rebecca-carroll" },
    { from: "/browse/shows/dead-end", to: "/browse/shows/dead-end-a-new-jersey-political-murder-mystery" },
    { from: "/browse/shows/documentaryweek", to: "/browse/shows/documentary-of-the-week" },
    { from: "/browse/shows/experiment", to: "/browse/shows/the-experiment-wnyc" },
]