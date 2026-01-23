<script setup>
import { useCurrentEpisode, useIsApp } from "~/composables/states";
// import { useTopStories } from "~/composables/useTopStories"
// const { topStories } = useTopStories()
import { brandCards } from "~/composables/globals.ts";
const config = useRuntimeConfig();
const currentEpisode = useCurrentEpisode();
const isApp = useIsApp();

const { data: latestNewsUpdatesData, error: error2 } = useLazyFetch(
  `${config.public.BFF_URL}/api/homepagelatestnewsupdates`
);

const {
  data: pagedata,
  error,
  status,
} = useLazyFetch(`${config.public.BFF_URL}/api/homepagecuration`);

const layoutComponents = {};
// dynamically import and Cache layout components to prevent re-creating them on each render
const getLayoutComponent = (layout) => {
  if (!layoutComponents[layout]) {
    layoutComponents[layout] = defineAsyncComponent(() =>
      import(`~/components/layouts/${layout}.vue`)
    );
  }
  return layoutComponents[layout];
};

definePageMeta({
  layout: "default",
  layoutTransition: {
    name: "login",
  },
});

onMounted(() => {
  // send GA page view
  const { $analytics } = useNuxtApp();
  $analytics.sendPageView({
    page_title: "Home",
    page_type: "home_page",
    content_group: "home",
  });
});
</script>

<template>
  <div>
    <Html lang="en">
      <Head>
        <Title
          >WNYC | New York Public Radio, Podcasts, Live Streaming Radio,
          News</Title
        >
        <Meta
          name="og:title"
          content="WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News"
        />
        <Meta
          name="twitter:title"
          content="WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News"
        />
      </Head>
    </Html>

    <section class="mb-4 pt-0 md:my-4 md:pt-4">
      <div class="home-top grid grid-nogutter gap-4">
        <LiveFeature class="col-12 lg:col -mx-4 md:mx-0 w-screen md:w-full" />

        <div class="latestNewsHolder col">
          <FetchError v-if="error || error2" />
          <h2 class="mt-4 mb-3 lg:mt-0 md:text-lg lg:text-xl">
            Latest News Updates
          </h2>
          <LatestNewsUpdates
            :localNewscast="latestNewsUpdatesData?.local_newscast"
            :nationalNewscast="latestNewsUpdatesData?.national_newscast"
          />
        </div>
      </div>
    </section>
    <!-- <pre>{{ pagedata?.new_home_template.curatedContent }}</pre> -->
    <story-htlAd layout="leaderboard" slotClass="htlad-wnyc_homepage_banner" />
    <div v-if="status === 'success'">
      <div
        v-for="section in pagedata?.new_home_template.curatedContent"
        :key="section?.id"
      >
        <section v-if="section?.value?.list?.listItems?.length">
          <component
            :is="getLayoutComponent(section?.value?.layout)"
            :list="section?.value?.list"
            square
          />
        </section>
      </div>
    </div>
    <section v-else>
      <Skeleton
        height="20px"
        width="226px"
        borderRadius="16px"
        style="margin-bottom: 4px; margin-top: 4px"
        class="mb-4"
      />
      <div class="grid">
        <skeleton-media-card
          class="col-12 lg:col-8 mb-3"
          is-horizontal
          is-feature
          imgCol="w-8"
          :size="{ xs: [369, 246], sm: [592, 395] }"
        />

        <div
          class="ad col mb-3 hidden lg:flex flex-column align-items-center justify-content-center"
        >
          <Skeleton
            height="250px"
            width="300px"
            borderRadius="0px"
            style="margin-bottom: 4px; margin-top: 4px"
          />
          <Skeleton
            height="12px"
            width="286px"
            borderRadius="16px"
            style="margin-bottom: 4px; margin-top: 4px"
          />
        </div>

        <skeleton-media-card
          v-for="index in 3"
          :key="`skeleton-1-${index}`"
          class="col-12 md:col-4 mb-3"
          :size="{ xs: [112, 112], md: [438, 292] }"
        />
      </div>
    </section>

    <!-- TEXT ONLY EXAMPLE -->
    <section
      v-if="
        pagedata?.new_home_template.curatedContent[2]?.value?.list?.listItems
          ?.length
      "
    >
      <layouts-text-only
        :list="pagedata?.new_home_template.curatedContent[2].value?.list"
      />
    </section>

    <section>
      <div class="grid grid-lggutter mobile-lggutter">
        <div
          v-for="brand in brandCards"
          class="station-holder desktop item col-6 md:col-4 xl:col-2"
          :key="brand.label"
        >
          <BrandCard :brand="brand" />
        </div>
      </div>
    </section>

    <!-- <pre class="text-xs overflow-hidden">{{ brandCards }}</pre> -->
    <!-- <pre class="text-xs overflow-hidden">{{
      pagedata?.new_home_template.curatedContent[2].value?.list
    }}</pre> -->

    <!-- <section>
      <div
        class="ad-holder col mb-6 flex lg:hidden align-items-center justify-content-center"
      >
        <story-htlAd
          layout="rectangle"
          slotClass="htlad-wnyc_homepage_rectangle"
          fineprint="WNYC is funded by sponsors and member donations"
        />
      </div>
      <h2 class="mb-3">WNYC Picks</h2>
      <TopStories :articles="topStories" />
      <div class="mx-auto sm:mb-6 md:mt-6" style="width: 300px">
        <story-htlAd
          layout="rectangle"
          slotClass="htlad-wnyc_homepage_rectangle"
          fineprint="WNYC is funded by sponsors and member donations"
        />
      </div>
    </section> -->

    <DonateBanner class="my-6" />

    <!-- <div v-for="section in pagedata?.home_template" :key="section.title">
      <div v-if="section.data.length">
        <section>
          <h2>{{ section.title }}</h2>
        </section>
        <section v-if="section.componentType === 'default'">
          <div class="grid">
            <MediaCard
              v-for="ep in section.data"
              :data="ep"
              :key="`home-${ep.id}`"
              showPlayButton
              :fallback-image="ep.headers.brand.logoImage.template"
              is-horizontal
              imgCol="w-7rem"
              :showBg="false"
              :showBgMobile="false"
              class="col-12 lg:col-6 xl:col-4 mb-3"
              @on-click="dynamicNavigation(ep)"
            />
          </div>
        </section>
        <WNYCFeatured v-else class="mt-2 mb-4" :articles="section.data" />
      </div>
    </div> -->

    <!-- <div v-if="pagedata?.npr_stories?.length">
      <section>
        <h2 class="my-3">NPR Stories</h2>
        <div
          v-for="(section, index) in pagedata?.npr_stories"
          :key="`NPR-content-${index}`"
        >
          <div v-if="section.componentType === 'default'">
            <div class="grid">
              <MediaCard
                class="col-12 lg:col-6 xl:col-4 mb-3"
                v-for="article in section.articles"
                :key="article.id"
                :data="article"
                is-horizontal
                imgCol="w-7rem"
                :index="index"
                :showBg="false"
                :showBgMobile="false"
                @on-click="dynamicNavigation(article)"
              />
            </div>
          </div>
          <WNYCFeatured v-else class="mt-2" :articles="section.articles" />
        </div>
      </section>
    </div> -->
    <SponsorBanner
      v-if="isApp"
      class="mt-4"
      :style="`margin-bottom:${currentEpisode ? '-20px' : '-5rem'}`"
    />
  </div>
</template>

<style lang="scss" scoped>
.home-top {
  .latestNewsHolder {
    width: 100%;
    max-width: 100%;

    @include media(">=lg") {
      max-width: 300px !important;
    }
  }
}
</style>
