<script setup>
import VShareTools from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VShareTools.vue'
import VShareToolsItem from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VShareToolsItem.vue'
import VFlexibleLink from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VFlexibleLink.vue'
import { useNavigation } from '~/composables/states'
const navigation = useNavigation()
const description = computed(
  () => navigation.value.property_description
)
const footerPrimaryNav = computed(
  () => navigation.value.primary_footer_links
)
const footerSecondaryNav = computed(
  () => navigation.value.secondary_footer_links
)
const year = computed(
  () => navigation.value.copyright_year
)
const legalNav = computed(
  () => navigation.value.legal_links
)
</script>

<template>
  <footer>
    <section>
      <div class="grid mb-2">
        <div class="col-12 lg:col-5">
          <v-flexible-link to="https://www.WNYC.org">
            <wnyc-logo />
          </v-flexible-link>
          <p v-html="description" class="text-lg my-5" />
          <div class="flex flex-wrap row-gap-2 mb-4">
            <p class="mr-2">WNYC is supported by the JLGreene Foundation</p>
            <v-flexible-link raw class="no-border" to="https://jlgreene.org/">
              <jlgreene-logo />
            </v-flexible-link>
          </div>
        </div>
        <div class="hidden lg:flex lg:col-1" />
        <div class="col-12 lg:col-6">
          <v-flexible-link
            raw
            class="no-border"
            to="https://www.surveymonkey.com/r/LGP2Z96"
          >
            <Button label="Send Us Your Feedback" class="px-4 sm:px-5" />
          </v-flexible-link>
          <h3 class="mt-5 mb-4">About Us</h3>
          <div class="grid mb-6">
            <div class="col-12 lg:col-6">
              <v-flexible-link
                v-for="(link, primaryIndex) in footerPrimaryNav"
                raw
                :key="primaryIndex"
                :to="link.value.url"
                :target="link.type ? 'external_link' : undefined"
                class="c-secondary-nav__link"
              >
                {{ link.value.title }}
              </v-flexible-link>
            </div>
            <div class="col-12 lg:col-6">
              <v-flexible-link
                v-for="(link, secondaryIndex) in footerSecondaryNav"
                raw
                :key="secondaryIndex"
                :to="link.value.url"
                :target="link.type ? 'external_link' : undefined"
                class="c-secondary-nav__link"
              >
                {{ link.value.title }}
              </v-flexible-link>
            </div>
          </div>
        </div>
      </div>
      <div class="grid align-items-center mb-6">
        <div class="col-12 lg:col-6 text-center lg:text-left">
          <nypr-logo />
        </div>
        <div class="col-12 lg:col-6">
          <v-share-tools
            label="Connect"
            class="justify-content-center lg:justify-content-start"
          >
            <v-share-tools-item service="facebook" username="WNYC" />
            <v-share-tools-item service="twitter" username="WNYC" />
            <v-share-tools-item service="instagram" username="WNYC" />
            <v-share-tools-item
              service="youtube"
              username="UCbysmY4hyViQAAYEzOR-uCQ"
            />
          </v-share-tools>
        </div>
      </div>
      <div
        class="flex flex-wrap row-gap-2 column-gap-4 justify-content-center lg:justify-content-start"
      >
        <div>
          <p class="text-center">
            © {{ year }} New York Public Radio. All rights reserved.
          </p>
        </div>
        <div
          class="flex flex-wrap row-gap-3 column-gap-4 flex-column xs:flex-row"
        >
          <v-flexible-link
            v-for="(link, legalNavIndex) in legalNav"
            raw
            :key="legalNavIndex"
            :to="link.value.url"
            :target="link.type ? 'external_link' : undefined"
          >
            {{ link.value.title }}
          </v-flexible-link>
        </div>
      </div>
    </section>
  </footer>
</template>

<style lang="scss">
footer {
  background: linear-gradient(180deg, #203849 0%, #191716 100%), #191716;
  padding: 50px 0;
  margin-bottom: 0;
}

footer section {
  border-top: 2px solid RGB(255, 255, 255, 0.2);
  padding: 50px 0;
}

footer .c-secondary-nav__link {
  display: block;
  width: fit-content;
  margin-bottom: 1rem;
  cursor: pointer;
  &:last-child {
    margin-bottom: 0;
  }
}
</style>
