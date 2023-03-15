export default {
  modules: ['@nuxtjs/ionic', '@nuxtjs/device'],
  ssr: process.env.ISAPP === 'false' ? true : false,
  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'msapplication-TileColor', content: '#de1e3d' },
        { name: 'theme-color', content: '#de1e3d' }
      ],
      link: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          href: 'https://media.wnyc.org/static/img/favicon_wnyc.ico?_=1553611630'
        }
      ]
    }
  },
  css: [
    '@nypublicradio/nypr-design-system-vue3/src/assets/themes/wnyc/fonts/fonts.css',
    'primeflex/primeflex.css',
    '@nypublicradio/nypr-design-system-vue3/src/assets/themes/wnyc/wnyc.min.css',
    'primevue/resources/primevue.min.css',
    'primeicons/primeicons.css',
  ],
  serverMiddleware: ['~/search/algolia-index'],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // be sure to mirror theses imports in the vitest.config.ts
          additionalData: `@import "@nypublicradio/nypr-design-system-vue3/src/assets/themes/wnyc/variables.scss"; @import "@nypublicradio/nypr-design-system-vue3/src/assets/themes/wnyc/_mixins.scss"; @import "~/assets/scss/global.scss";`,
        },
      },
      postcss: {
        plugins: [
          {
            postcssPlugin: 'internal:charset-removal',
            AtRule: {
              charset: (atRule) => {
                if (atRule.name === 'charset') {
                  atRule.remove();
                }
              }
            }
          }
        ]
      }
    },
  },
  imports: {
    dirs: [
      'composables', // top-level modules
      'composables/*/index.{ts,js,mjs,mts}' // one level directories's index.js,
    ]
  },
  build: {
    transpile: [
      'primevue'
    ]
  },
  runtimeConfig: {
    public: {
      // SENTRY_DSN: process.env['SENTRY_DSN'],
      ENV: process.env['ENV'] || 'demo',
      // HTL_CSS: process.env['HTL_CSS'] || 'https://htlbid.com/stage/v3/wnyc.com/htlbid.css',
      // HTL_JS: process.env['HTL_JS'] || 'https://htlbid.com/stage/v3/wnyc.com/htlbid.js',
      // HTL_IS_TESTING: process.env['HTL_IS_TESTING'] || 'yes',
      LIVESTREAM_URL: process.env['LIVESTREAM_URL'] || 'https://api.prod.nypr.digital/api/v4/whats_on/',
      NAVIGATION_API: process.env['NAVIGATION_API'] || 'https://cms.demo.nypr.digital/api/v2/navigation/3/',
      STORIES_API: process.env['STORIES_API'] || 'https://cms.demo.nypr.digital/api/v2/pages/?type=news.ArticlePage&fields=ancestry%2Cdescription%2Clead_asset%2Clegacy_id%2Clisting_image%2Cpublication_date%2Cshow_as_feature%2Csponsored_content%2Ctags%2Cupdated_date%2Curl%2Cuuid%2Clisting_title%2Clisting_summary%2Crelated_authors&order=-publication_date&show_on_index_listing=true&limit=5&show_as_feature=true&sponsored_content=false',
      IMAGE_BASE_URL: process.env['IMAGE_BASE_URL'] || 'https://cms.demo.nypr.digital/images/',
      GA_MEASUREMENT_ID: process.env['GA_MEASUREMENT_ID'] || 'G-ZV3N92G65W',
      GTM_ID: process.env['GTM_ID'] || 'GTM-TKFJ684',
    }
  }
}