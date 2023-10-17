//Global vars for the browser top color
export const useBrowserTopColor = () => useState('browserTopColor', () => '#ffffff')
//Global vars for the browser top color or Darkmode
export const useBrowserTopColorDarkMode = () => useState('browserTopColorDarkMode', () => '#1f2741')

//Global vars for the browser top color or Darkmode
export const useShowTopics = () => useState('showTopics', () => [
    {
        label: 'Arts & Culture',
        value: 'arts-and-culture',
        color: 'var(--red)',
    },
    {
        label: 'Tech & Media',
        value: 'tech-and-media',
        color: 'var(--info)',
    },
    {
        label: 'Local News',
        value: 'local-news',
        color: 'var(--purple)',
    },
    {
        label: 'Storytelling',
        value: 'storytelling',
        color: 'var(--success)',
    },
])


// const imageShape = {
//     alt: "A choreographer working with dancers in a studio",
//     caption: "Alexei Ratmansky, center, rehearsing with American Ballet Theatre dancers.",
//     collection: 1,
//     created_at: "2022-07-13T11:30:39.745683-04:00",
//     credit: "Rosalie O'Connor/American Ballet Theatre",
//     creditLink: "",
//     expiryDate: null,
//     file: "https://cdn.cms.prod.nypr.digital/original_images/Ratmansky_splash.jpg",
//     template: "https://media.wnyc.org/i/%s/%s/%s/%s/2023/09/philmurphy.jpg",
//     fileHash: "e660e2855473fa54fb7c3959a1d9510323df3c07",
//     file_size: 341654,
//     focalPointHeight: null,
//     focalPointWidth: null,
//     focalPointX: null,
//     focalPointY: null,
//     height: 650,
//     id: 332655,
//     source: {
//         name: "AP Images",
//         url: "",
//     },
//     title: "Ratmansky_splash.jpg",
//     type: "aviary/publisher/other",
//     uploadedByUser: 127,
//     usageLimitations: "",
//     width: 900,
// }
