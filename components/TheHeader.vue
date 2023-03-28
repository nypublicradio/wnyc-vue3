<script setup>
import VFlexibleLink from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VFlexibleLink.vue'
import { useNavigation } from '~/composables/states'
import { trackClickEvent } from '~/utilities/helpers'
const navigation = useNavigation()
const headerNav = computed(() => navigation.value.primary_navigation)
const year = computed(() => navigation.value.copyright_year)
const legalNav = computed(() => navigation.value.legal_links)
const visibleLeft = ref(false)

const wnycHomepage = 'https://www.WNYC.org'
</script>

<template>
  <header>
    <section class="full-width">
      <div class="flex justify-content-between align-items-center">
        <div class="flex">
          <Button
            icon="pi pi-bars"
            class="p-button-text mr-2 sm:mr-4"
            @click="
              () => {
                visibleLeft = true
                trackClickEvent(
                  'Click Tracking - Hamburger Menu',
                  'Hamburger Menu',
                  ``
                )
              }
            "
          />
          <VFlexibleLink
            raw
            :to="wnycHomepage"
            class="c-main-header__branding plain mr-4"
            @emit-flexible-link="
              trackClickEvent(
                'Click Tracking - WNYC Logo',
                'WNYC Logo',
                wnycHomepage
              )
            "
          >
            <WnycLogo class="w-6rem sm:w-auto" />
          </VFlexibleLink>
          <div class="c-secondary-nav__list align-self-end hidden lg:block">
            <VFlexibleLink
              v-for="(link, headerNavIndex) in headerNav"
              raw
              :key="headerNavIndex"
              :to="link.value.url"
              :target="link.type ? 'external_link' : undefined"
              class="c-secondary-nav__link"
              @emit-flexible-link="
                trackClickEvent(
                  `Click Tracking - header navigation - ${link.value.title}`,
                  'header navigation',
                  link.value.url
                )
              "
            >
              {{ link.value.title }}
            </VFlexibleLink>
          </div>
        </div>
        <VFlexibleLink
          raw
          class="no-border"
          to="https://pledge3.wnyc.org/donate/main/onestep/?utm_medium=partnersite&utm_source=w3k&utm_campaign=brandheader"
          @emit-flexible-link="
            trackClickEvent(
              `Click Tracking - Header Donate Button`,
              'Header Donate Button',
              ''
            )
          "
        >
          <Button label="Donate" class="px-3 sm:px-5" />
        </VFlexibleLink>
      </div>
    </section>
    <Sidebar
      v-model:visible="visibleLeft"
      :baseZIndex="10000"
      position="left"
      class="text-center"
    >
      <VFlexibleLink
        raw
        :to="wnycHomepage"
        class="mb-6"
        @emit-flexible-link="
          trackClickEvent(
            'Click Tracking - sidebar WNYC Logo',
            'sidebar WNYC Logo',
            wnycHomepage
          )
        "
      >
        <WnycLogo />
      </VFlexibleLink>
      <VFlexibleLink
        v-for="(link, sidebarNavIndex) in headerNav"
        raw
        :key="sidebarNavIndex"
        :to="link.value.url"
        :target="link.type ? 'external_link' : undefined"
        class="c-secondary-nav__link"
        @emit-flexible-link="
          trackClickEvent(
            `Click Tracking - sidebar navigation - ${link.value.title}`,
            'sidebar navigation',
            link.value.url
          )
        "
      >
        {{ link.value.title }}
      </VFlexibleLink>
      <nypr-logo class="mt-8 mb-4" />
      <p class="mb-4">
        © {{ year }} New York Public Radio. All rights reserved.
      </p>
      <div>
        <VFlexibleLink
          v-for="(link, legalNavIndex) in legalNav"
          raw
          :key="legalNavIndex"
          :to="link.value.url"
          :target="link.type ? 'external_link' : undefined"
          class="no-border text-sm font-bold m-2 inline-block"
          @emit-flexible-link="
            trackClickEvent(
              `Click Tracking - sidebar legal navigation - ${link.value.title}`,
              'sidebar legal navigation',
              link.value.url
            )
          "
        >
          {{ link.value.title }}
        </VFlexibleLink>
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
