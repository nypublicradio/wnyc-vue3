import { sentryVitePlugin } from "@sentry/vite-plugin"
import MyPreset from "./assets/wnyc-theme.js"

export default defineNuxtConfig({
  modules: [
    "@nuxtjs/supabase",
    "@nuxtjs/ionic",
    "@nuxtjs/device",
    "@nuxt/image",
    "@hypernym/nuxt-gsap",
    "@vueuse/nuxt",
    "@primevue/nuxt-module",
  ],

  primevue: {
    options: {
      ripple: true,
      theme: {
        preset: MyPreset,
        options: {
          darkModeSelector: ".style-mode-dark",
          cssLayer: true,
        },
      },
    },
  },

  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    redirect: false,
  },

  image: {
    dir: "public/",
    screens: {
      xs: 390,
      sm: 640,
      md: 767,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
      "2xl": 1920,
    },
    wagtail: {
      baseURL: process.env.IMAGE_BASE_URL,
      screens: {
        xs: 390,
        sm: 640,
        md: 767,
        lg: 1024,
        xl: 1280,
        xxl: 1536,
        "2xl": 1920,
      },
    },
  },

  /* ssr: process.env.ISAPP === 'false' ? true : false, */
  ssr: false,

  ionic: {
    integrations: {
      router: false,
    },
    css: {
      core: false,
      basic: false,
    },
  },

  app: {
    //pageTransition: { name: 'rotate', mode: 'out-in' },
    pageTransition: {
      name: "page",
      mode: "out-in", // default
    },
    layoutTransition: true,
    head: {
      title: "WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News",
      meta: [
        {
          name: "viewport",
          content:
            "viewport-fit=cover, width=device-width, initial-scale=1, maximum-scale=1",
        },
        // { name: 'msapplication-TileColor', content: '#ffffff' },
        // { name: 'theme-color', content: '#ffffff' }
      ],
      link: [
        {
          rel: "icon",
          type: "image/x-icon",
          href: "https://media.wnyc.org/static/img/favicon_wnyc.ico?_=1553611630",
        },
      ],
    },
  },

  css: [
    "~/assets/scss/fonts/fonts.css",
    "~/assets/scss/primeflex-xxl.min.css",
    "primeicons/primeicons.css",
    "~/assets/scss/_main.scss",
  ],

  //serverMiddleware: ['~/search/algolia-index'],

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // be sure to mirror theses imports in the vitest.config.ts
          additionalData: '@import "~/assets/scss/_global.scss";',
        },
      },
      postcss: {
        plugins: [
          {
            postcssPlugin: "internal:charset-removal",
            AtRule: {
              charset: (atRule: { name: string; remove: () => void }) => {
                if (atRule.name === "charset") {
                  atRule.remove()
                }
              },
            },
          },
        ],
      },
    },
    plugins: [
      process.env.SENTRY_ENV === "development"
        ? null
        : sentryVitePlugin({
          include: ".nuxt/dist",
          ignore: ["node_modules", "nuxt.config.ts"],
          org: "nypublicradio",
          project: "wnyc-vue3",
          authToken: process.env.SENTRY_AUTH_TOKEN,
        }),
    ],
  },

  sourcemap: {
    client: true,
    server: true,
  },

  components: ["~/components", "~/components/icons", "~/components/logos"],

  imports: {
    dirs: [
      "composables", // top-level modules
      "composables/icons",
      "composables/*/index.{ts,js,mjs,mts}", // one level directories's index.js,
    ],
  },

  build: {
    transpile: ["primevue"],
  },

  plugins: [
    "~/plugins/router-guards.js",
    "~/plugins/error-handler.js",
    "~/plugins/firebase.js",
  ],

  experimental: {
    crossOriginPrefetch: true,
  },

  runtimeConfig: {
    public: {
      SENTRY_DSN: process.env["SENTRY_DSN"],
      SENTRY_ENV: process.env.SENTRY_ENV ?? "development",
      ENV: process.env.ENV ?? "prod",
      HTL_CSS: process.env.HTL_CSS ?? "https://htlbid.com/stage/v3/wnyc.org/htlbid.css",
      HTL_JS: process.env.HTL_JS ?? "https://htlbid.com/stage/v3/wnyc.org/htlbid.js",
      HTL_IS_TESTING: process.env.HTL_IS_TESTING ?? "yes",
      LIVESTREAM_URL:
        process.env.LIVESTREAM_URL ?? "https://api.prod.nypr.digital/api/v4/whats_on/",
      HEADER_NAVIGATION_API:
        process.env.HEADER_NAVIGATION_API ??
        "https://cms.prod.nypr.digital/api/v2/navigation/3/",
      SYSTEM_MESSAGES_API:
        process.env.SYSTEM_MESSAGES_API ??
        "https://cms.prod.nypr.digital/api/v2/system_messages/3/",
      SYSTEM_NAVIGATION_API:
        process.env.SYSTEM_NAVIGATION_API ??
        "https://cms.prod.nypr.digital/api/v2/navigation/3/",
      STORIES_API:
        process.env.STORIES_API ??
        "https://cms.prod.nypr.digital/api/v2/pages/?type=news.ArticlePage&fields=ancestry%2Cdescription%2Clead_asset%2Clegacy_id%2Clisting_image%2Cpublication_date%2Cshow_as_feature%2Csponsored_content%2Ctags%2Cupdated_date%2Curl%2Cuuid%2Clisting_title%2Clisting_summary%2Crelated_authors&order=-publication_date&show_on_index_listing=true&limit=3&show_as_feature=true&sponsored_content=false",
      PUBLISHER_BASE_API: process.env.PUBLISHER_BASE_API ?? "https://api.wnyc.org/api/",
      AVIARY_BASE_API:
        process.env.AVIARY_BASE_API ?? "https://cms.prod.nypr.digital/api/v2/",
      IMAGE_BASE_URL:
        process.env.IMAGE_BASE_URL ?? "https://cms.prod.nypr.digital/images/",
      FEATURED_SHOWS:
        process.env.FEATURED_SHOWS ?? "https://www.wnyc.org/api/v2/discover/shows/",
      FB_MEASUREMENT_ID: process.env.FB_MEASUREMENT_ID,
      FB_API_KEY_WEB: process.env.FB_API_KEY_WEB,
      FB_API_KEY_IOS: process.env.FB_API_KEY_IOS,
      FB_API_KEY_ANDROID: process.env.FB_API_KEY_ANDROID,
      FB_AUTH_DOMAIN: process.env.FB_AUTH_DOMAIN,
      FB_PROJECT_ID: process.env.FB_PROJECT_ID,
      FB_STORAGE_BUCKET: process.env.FB_STORAGE_BUCKET,
      FB_MESSAGING_SENDER_ID: process.env.FB_MESSAGING_SENDER_ID,
      FB_APP_ID_WEB: process.env.FB_APP_ID_WEB,
      FB_APP_ID_IOS: process.env.FB_APP_ID_IOS,
      FB_APP_ID_ANDROID: process.env.FB_APP_ID_ANDROID,
      ONESIGNAL_APP_ID: process.env.ONESIGNAL_APP_ID,
      BFF_URL: process.env.BFF_URL ?? "https://demo.native-app.wnyc.org",
      GTM_ID: process.env.GTM_ID ?? "GTM-TKFJ684",
      environment: process.env.environment ?? "prod",
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
      supabaseAuthSignInRedirectTo: process.env.SUPABASE_AUTH_SIGN_IN_REDIRECT_TO,
      supabaseAuthTokenName: process.env.SUPABASE_AUTH_TOKEN_NAME,
      OPENWEB_SPOT_ID: process.env["OPENWEB_SPOT_ID"],
      NPR_CDS_API: process.env.NPR_CDS_API ?? "https://content.api.npr.org",
      WNYC_NOW_FEED_URL:
        process.env.WNYC_NOW_FEED_URL ?? "https://feeds.simplecast.com/ysE9ORt_-VYpSuDO",
      WNYC_SHOW_SHARE_BASE_URL:
        process.env.WNYC_SHOW_SHARE_BASE_URL ?? "https://www.wnyc.org/shows/",
      ARTICLE_STREAMFIELD_DONATION_URL:
        process.env.ARTICLE_STREAMFIELD_DONATION_URL ??
        "https://pledge.wnyc.org/support/wnyc-app/?utm_medium=wnyc-app&utm_source=donation-block&utm_campaign=article-block",
      SETTINGS_MENU_DONATION_URL:
        process.env.SETTINGS_MENU_DONATION_URL ??
        "https://pledge.wnyc.org/support/wnyc-app/?utm_medium=wnyc-app&utm_source=donation-button&utm_campaign=settings_menu",
      APP_VERSION: process.env.APP_VERSION ?? "x.x.x",
    },
  },

  compatibilityDate: "2024-07-16",
})
