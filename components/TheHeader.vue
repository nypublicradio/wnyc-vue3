<script setup>
import VFlexibleLink from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VFlexibleLink.vue'
//TO DO - populate links from CMS
const headerNav = [
  {
    url: 'https://www.wnyc.org/schedule/',
    text: 'Schedule',
    newWindow: true,
  },
  {
    url: 'https://www.wnyc.org/streams',
    text: 'All Streams',
    newWindow: true,
  },
  {
    url: 'https://www.wnyc.org/shows',
    text: 'Shows',
    newWindow: true,
  },
]
const year = new Date().getFullYear()
const visibleLeft = ref(false)
</script>

<template>
  <header>
    <section class="full-width">
      <div class="flex justify-content-between align-items-center">
        <div class="flex">
          <Button
            icon="pi pi-bars"
            class="p-button-text mr-2 sm:mr-4"
            @click="visibleLeft = true"
          />
          <v-flexible-link
            raw
            to="https://www.WNYC.org"
            class="c-main-header__branding plain mr-4"
          >
            <wnyc-logo class="w-6rem sm:w-auto" />
          </v-flexible-link>
          <div class="c-secondary-nav__list align-self-end hidden lg:block">
            <v-flexible-link
              v-for="(link, headerNavIndex) in headerNav"
              raw
              :key="headerNavIndex"
              :to="link.url"
              :target="link.newWindow ? '_blank' : undefined"
              class="c-secondary-nav__link"
            >
              {{ link.text }}
            </v-flexible-link>
          </div>
        </div>
        <v-flexible-link
          raw
          class="no-border"
          to="https://pledge3.wnyc.org/donate/main/onestep/?utm_medium=partnersite&utm_source=w3k&utm_campaign=brandheader"
        >
          <Button label="Donate" class="px-3 sm:px-5" />
        </v-flexible-link>
      </div>
    </section>
    <Sidebar
      v-model:visible="visibleLeft"
      :baseZIndex="10000"
      position="left"
      class="text-center"
    >
      <v-flexible-link raw to="https://www.WNYC.org" class="mb-6">
        <wnyc-logo />
      </v-flexible-link>
      <v-flexible-link
        raw
        to="https://www.wnyc.org/schedule/"
        class="c-secondary-nav__link"
      >
        Schedule
      </v-flexible-link>
      <v-flexible-link
        raw
        to="https://www.wnyc.org/streams"
        class="c-secondary-nav__link"
      >
        All Streams
      </v-flexible-link>
      <v-flexible-link
        raw
        to="https://www.wnyc.org/shows"
        class="c-secondary-nav__link"
      >
        Shows
      </v-flexible-link>
      <nypr-logo class="mt-8 mb-4" />
      <p class="mb-4">
        © {{ year }} New York Public Radio. All rights reserved.
      </p>
      <div class="flex justify-content-center">
        <v-flexible-link
          raw
          to="https://www.wnyc.org/terms"
          class="no-border text-sm font-bold mx-4"
        >
          TERMS OF USE
        </v-flexible-link>
        <v-flexible-link
          raw
          to="https://www.wnyc.org/privacy"
          class="no-border text-sm font-bold mx-4"
        >
          PRIVACY POLICY
        </v-flexible-link>
      </div>
      <p class="flex justify-content-center">
        <v-flexible-link
          raw
          to="https://media.wnyc.org/media/resources/2020/Oct/30/accessibility_policy_10.30.20.pdf"
          class="no-border text-sm font-bold mx-4 flex"
        >
          ACCESSIBILITY
        </v-flexible-link>
      </p>
    </Sidebar>
  </header>
</template>

<style lang="scss">
header {
  background-color: var(--red);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

header .p-button .p-button-label {
  color: var(--red);
}

header .pi-bars {
  color: white;
  font-size: var(--font-size-9);
}

header .c-secondary-nav__list {
  margin-bottom: 0.75rem;
}

header .c-secondary-nav__link {
  font-size: var(--font-size-7);
  font-weight: 700;
  margin-right: 1.5rem;
}

.p-sidebar {
  background: var(--almostblack);
  opacity: 1;
  font-size: var(--font-size-9);
}

.p-sidebar a {
  display: block;
  width: fit-content;
  margin: 0 auto 1rem;
}
</style>
