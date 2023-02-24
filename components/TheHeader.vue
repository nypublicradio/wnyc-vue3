<script setup>
import VFlexibleLink from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VFlexibleLink.vue'
import { useNavigation } from '~/composables/states'
const navigation = useNavigation()
const headerNav = computed(() => navigation.value.primary_navigation)
const year = computed(() => navigation.value.copyright_year)
const legalNav = computed(() => navigation.value.legal_links)
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
              :to="link.value.url"
              :target="link.type ? 'external_link' : undefined"
              class="c-secondary-nav__link"
            >
              {{ link.value.title }}
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
        v-for="(link, sidebarNavIndex) in headerNav"
        raw
        :key="sidebarNavIndex"
        :to="link.value.url"
        :target="link.type ? 'external_link' : undefined"
        class="c-secondary-nav__link"
      >
        {{ link.value.title }}
      </v-flexible-link>
      <nypr-logo class="mt-8 mb-4" />
      <p class="mb-4">
        © {{ year }} New York Public Radio. All rights reserved.
      </p>
      <div>
        <v-flexible-link
          v-for="(link, legalNavIndex) in legalNav"
          raw
          :key="legalNavIndex"
          :to="link.value.url"
          :target="link.type ? 'external_link' : undefined"
          class="no-border text-sm font-bold m-2 inline-block"
        >
          {{ link.value.title }}
        </v-flexible-link>
      </div>
    </Sidebar>
  </header>
</template>

<style lang="scss">
header {
  background-color: transparentize(#de1e3d, 0.1);
  backdrop-filter: blur(5px);
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
