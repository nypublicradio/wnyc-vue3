<script setup>
//TO DO - populate links from CMS
const headerNav = [
    {
      url: 'https://www.wnyc.org/schedule/',
      text: 'Schedule',
      newWindow: true
    },
    {
      url: 'https://www.wnyc.org/streams',
      text: 'All Streams',
      newWindow: true
    },
    {
      url: 'https://www.wnyc.org/shows',
      text: 'Shows',
      newWindow: true
    }
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
            class="p-button-text mr-4"
            @click="visibleLeft = true"
          />
          <a
            href="https://www.WNYC.org"
            target="_blank"
            rel="noopener"
            class="c-main-header__branding plain mr-6"
          >
            <wnyc-logo />
          </a>
          <div class="c-secondary-nav__list align-self-end hidden lg:block">
            <a
              v-for="(link, headerNavIndex) in headerNav"
              :key="headerNavIndex"
              :href="link.url"
              :target="link.newWindow && '_blank'"
              rel="noopener"
              class="c-secondary-nav__link"
            >
              {{ link.text }}
            </a>
          </div>
        </div>
        <Button
          href="https://pledge3.wnyc.org/donate/main/onestep/?utm_medium=partnersite&utm_source=w3k&utm_campaign=brandheader"
          target="_blank"
          label="Donate"
        />
      </div>
    </section>
    <Sidebar
      v-model:visible="visibleLeft"
      :baseZIndex="10000"
      position="left"
      class="text-center"
    >
      <a
        href="https://www.WNYC.org"
        target="_blank"
        rel="noopener"
        class="mb-6"
      >
        <wnyc-logo />
      </a>
      <a
        href="https://www.wnyc.org/schedule/"
        target="_blank"
        rel="noopener"
        class="c-secondary-nav__link"
      >
        Schedule
      </a>
      <a
        href="https://www.wnyc.org/streams"
        target="_blank"
        rel="noopener"
        class="c-secondary-nav__link"
      >
        All Streams
      </a>
      <a
        href="https://www.wnyc.org/shows"
        target="_blank"
        rel="noopener"
        class="c-secondary-nav__link"
      >
        Shows
      </a>
      <nypr-logo class="mt-8 mb-4" />
      <p class="mb-4">
        © {{ year }} New York Public Radio. All rights reserved.
      </p>
      <div class="flex justify-content-center">
        <a
          href="https://www.wnyc.org/terms"
          target="_blank"
          rel="noopener"
          class="plain text-sm font-bold mx-4"
        >
          TERMS OF USE
        </a>
        <a
          href="https://www.wnyc.org/privacy"
          target="_blank"
          rel="noopener"
          class="plain text-sm font-bold mx-4"
        >
          PRIVACY POLICY
        </a>
      </div>
      <p class="flex justify-content-center">
        <a
          href="https://media.wnyc.org/media/resources/2020/Oct/30/accessibility_policy_10.30.20.pdf"
          target="_blank"
          rel="noopener"
          class="plain text-sm font-bold mx-4 flex"
        >
          ACCESSIBILITY
        </a>
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