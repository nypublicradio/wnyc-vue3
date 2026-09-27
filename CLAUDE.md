# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single Nuxt 4 / Vue 3 codebase that ships as two products:

- **wnyc.org website**: SSR Nuxt server (Nitro) deployed to AWS ECS behind nginx, with Fly.io review apps per PR.
- **WNYC iOS/Android apps**: the same Nuxt app, statically generated as a SPA into `dist/` and wrapped with Capacitor 8 + Ionic.

Core stack: **Nuxt 4 / Vue 3**, **PrimeVue 4** (UI components and theming), **Capacitor 8** (native shell and device APIs) and **Supabase** (auth and user data such as profiles and notification topics).

Node `>=24.20.0` (see `.nvmrc`). Private `@nypublicradio/*` packages need a GitHub token in `.npmrc` (see `.npmrc.sample`).

## Commands

```bash
npm install            # also runs nuxt prepare (postinstall)
npm run dev            # dev server (--host), http://localhost:3000
npm run build          # SSR production build -> .output/
npm run start          # run the built SSR server
npm test               # vitest (watch mode); runs `nuxi prepare` first if .nuxt/ is missing
npx vitest run         # run all tests once (what CI effectively does)
npx vitest run tests/server/v2-show.spec.ts   # single file
npx vitest run -t "test name substring"       # single test
npm run coverage

# Mobile
npm run generate && npx cap sync && npx cap open ios   # or android
npm run generate-local   # SPA build pointed at demo BFF
npm run jwt token        # generate a local test JWT (see README "JWT Authentication")
npm run jwt secret

pre-commit run detect-secrets --all-files   # secret scan (baseline: .secrets.baseline)
```

There is no lint script. Prettier config: no semicolons, double quotes. `jest.config.js` is a leftover; tests run on Vitest (`vitest.config.ts`, jsdom, globals). CI (CircleCI) runs `npx nuxi prepare && npm run test` plus an `nginx -t` check.

Local Docker dev: `docker compose up` (uses `Dockerfile.dev`, reads `.env`). `start-local.sh` sets up AWS SSO credentials for server routes that read S3.

## SSR vs. app mode (the most important concept)

`nuxt.config.ts` branches on `isSsrEnabled = NUXT_SSR === "true" && FORCE_APP_MODE !== "true"`:

| | SSR / website (`NUXT_SSR=true`) | App / SPA (default) |
|---|---|---|
| `ssr` | true | false |
| `@nuxtjs/ionic` module | not loaded | loaded |
| `@nuxt/image` provider | `ipx` | `none` (original URLs) |
| Nitro output | `.output/` | `dist/` (Capacitor `webDir`) |
| `routeRules` caching | on in production | none |
| Supabase SSR cookies | on | off |

At runtime, `app.vue` sets two global states from `composables/states.ts`:
- `useIsNativeApp()`: true only when running inside Capacitor (`Capacitor.getPlatform() !== "web"`).
- `useIsApp()`: native app **or** `FORCE_APP_MODE=true`, so the app UI can be debugged in a browser.

Code must be SSR-safe: guard browser/Capacitor-only APIs with `import.meta.client` / `onMounted`, and name client-only plugins `*.client.ts`. `plugins/router-guards.client.js` (offline navigation blocking) only activates when `NUXT_SSR === "false"`.

## Data flow: pages -> BFF -> upstream CMSs

The Nitro server in `server/` is the **BFF** (backend-for-frontend). The native app has no server of its own, so pages always fetch via an absolute URL built from `config.public.BFF_URL` (e.g. `` `${config.public.BFF_URL}/api/v3/shows` ``). The website calls its own server; the app calls a deployed one (demo/prod). Keep this pattern for new page data so it works in both modes.

- Page-level fetches usually go through `composables/useFetchWrapper.ts`, a `useFetch` wrapper. In production it caches client-side for `maxAge` (default 5 min) on initial navigations only. It refreshes on mount when payload data came from build time (the generated app). It never caches when `ENV=local`.
- `server/api/**` aggregates several upstream sources, identified by `cmsSources` in `composables/globals.ts`: `wagtail` (NYPR CMS), `publisher` (legacy api.wnyc.org), `npr` (NPR CDS), `simplecast` (podcasts), `local`. Routes are commonly keyed by `[cmsSource]` (e.g. `server/api/pages/[cmsSource]`, `/api/v2/show/episode/[cmsSource]/[slug]`). There are versioned route families (`api/v2`, `api/v3`). Check which version the pages actually call before changing one.
- `composables/data/*` holds normalizers (`normalizeArticlePage`, `normalizeWagtailShow`, …) that turn upstream responses into view models. Server routes import them too.
- `server/utils/` has the shared server logic: `simplecastCache.ts` (in-memory TTL cache with request coalescing and a capped entry count), `salesforce.ts` (JWT-bearer auth, circuit breaker, typed `SalesforceError` sent to Sentry), `jwt.ts`, `rateLimiter.ts`, `cmsRedirect.ts`, `liveSchedule.ts`, `nyprdb.ts`.
- Show slug redirects happen twice: `server/middleware/01.show-slug-redirects.ts` on the server and `middleware/show-slug-redirects.global.ts` on the client. The client one fetches `/api/show-slug-redirects` from the BFF and caches the result.
- Live schedules: `server/api/schedule/[stationslug].get.ts` reads from S3, or from mock data in `server/data/schedules/` when `USE_MOCK_SCHEDULE=true`.

Avoid Nitro `swr` route rules on unbounded URL spaces. They previously leaked memory and crashed the server; see the comments in `nuxt.config.ts` `routeRules`, which emit `cache-control` headers for CloudFront instead.

## State, auth, and user profile

- Global state is `useState` wrappers exported from `composables/states.ts` (current episode, stream station, user profile, network status, toasts, etc.). Storage keys and constants live in `composables/globals.ts`.
- `utilities/helpers.ts` is a large shared module (playback toggling, analytics click tracking, profile lifecycle `getAndSetUserProfile` / `handleUserLogout`, `refreshData`, slug lookups). Check it before writing a new helper.
- Auth: Supabase (`@nuxtjs/supabase`, `redirect: false`) for login. After login, `/confirm` exchanges the Supabase session for a short-lived app JWT via `server/api/auth/session-to-jwt.post.ts`. `composables/useAuth.ts` stores the JWT, refreshes it in the background, and exposes `authenticatedFetch`. Protect pages with `definePageMeta({ middleware: 'auth' })`. Protect server routes by verifying the JWT (`server/utils/jwt.ts`) and rate-limiting.
- Membership: `composables/useProfileApi.ts` -> `POST /api/profile` -> Salesforce computes `isActiveSustainer`, which is persisted to Capacitor Preferences under `localUserProfile`. The README has the full flow.

## Native / Capacitor specifics

- Audio playback uses `@nypublicradio/capacitor-remote-streamer` (see `components/AudioPlayer.vue`, `utilities/media-session.js`, `composables/useSleepTimer.ts`). It also receives `BFF_URL` via `capacitor.config.ts`.
- Push notifications: OneSignal (`composables/useOneSignal.ts`), which also handles deep links (`appUrlOpen`). Analytics: Firebase (`plugins/firebase.client.js`, `utilities/analytics.ts`). Web analytics: GTM (`utilities/gtm.ts`).
- `bp-capacitor-background-mode` (Android sleep timer) has no Capacitor 7/8 release; `package.json` `overrides` lets it install against the current `@capacitor/core`. Android edge-to-edge is handled by Capacitor 8's SystemBars plugin, which relies on `viewport-fit=cover` being in the initial HTML (`nuxt.config.ts` `app.head.viewport`).
- Native builds and releases use fastlane (`android/fastlane`, `ios/App/fastlane`) and run on CircleCI. Running in Xcode locally uses the `AppLocal` target.

## Conventions

- Components, `components/icons`, and `components/logos` are auto-imported. Composables in `composables/`, `composables/icons`, and `composables/*/index.ts` are auto-imported too, but most code imports from `~/composables/states` explicitly.
- UI uses PrimeVue 4 with a custom preset (`assets/wnyc-theme.js`, dark mode via the `.style-mode-dark` class) and PrimeFlex utility classes. `assets/scss/_global.scss` is injected into every SCSS block, so it should contain only variables and mixins. Font-size scale tokens (`--font-size-0` … `--font-size-20`) are listed at the bottom of the README.
- TypeScript is non-strict (`strict: false`) and JS files are mixed in. From `.github/copilot-instructions.md`: prefer functional style, interfaces for data shapes, `const`/readonly, and `?.`/`??`.
- Tests live in `tests/` (client) and `tests/server/` (BFF route and util tests). Server tests import route handlers directly and `vi.mock` their dependencies (`axios`, `~/composables/globals`, `~/server/utils/*`) rather than spinning up Nuxt.
- Runtime config: add new env vars to `nuxt.config.ts` `runtimeConfig`. For them to exist at build time in deployed images, also add them as `ARG` and `ENV` in `Dockerfile` (and `docker-compose.yml` for local Docker). `.env_sample` lists the expected variables.
