export default {
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
      LIVESTREAM_URL: process.env['LIVESTREAM_URL'] || 'https://api.demo.nypr.digital/api/v4/whats_on/',
    }
  }
}