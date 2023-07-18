<script setup>
import VShareTools from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VShareTools.vue'
import VShareToolsItem from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VShareToolsItem.vue'
import VFlexibleLink from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VFlexibleLink.vue'
import { useNavigation } from '~/composables/states'
import { trackClickEvent } from '~/utilities/helpers'
const navigation = useNavigation()
const description = computed(() => navigation.value.property_description)
const footerPrimaryNav = computed(() => navigation.value.primary_footer_links)
const footerSecondaryNav = computed(
  () => navigation.value.secondary_footer_links
)
const year = computed(() => navigation.value.copyright_year)
const legalNav = computed(() => navigation.value.legal_links)

const trackSocialFollow = (social) => {
  trackClickEvent(
    `Click Tracking - Footer Social Follow`,
    'Footer Social Follow',
    social
  )
}
</script>

<template>
  <footer>
    <section data-style-mode="dark">
      <div class="grid mb-2">
        <div class="col-12 lg:col-5">
          <VFlexibleLink
            to="https://www.WNYC.org"
            @emit-flexible-link="
              trackClickEvent(
                'Click Tracking - footer WNYC Logo',
                'footer WNYC Logo',
                'https://www.WNYC.org'
              )
            "
          >
            <WnycLogo />
          </VFlexibleLink>
          <p v-html="description" class="text-lg my-5" />
          <div class="flex flex-wrap row-gap-2 mb-4">
            <p class="mr-2">WNYC is supported by the JLGreene Foundation</p>
            <VFlexibleLink
              raw
              class="no-border"
              to="https://jlgreene.org/"
              @emit-flexible-link="
                trackClickEvent(
                  'Click Tracking - footer JLGreene Logo',
                  'footer JLGreene Logo',
                  'https://jlgreene.org/'
                )
              "
            >
              <JlgreeneLogo />
            </VFlexibleLink>
          </div>
        </div>
        <div class="hidden lg:flex lg:col-1" />
        <div class="col-12 lg:col-6">
          <VFlexibleLink
            raw
            class="no-border"
            to="https://www.surveymonkey.com/r/LGP2Z96"
            @emit-flexible-link="
              trackClickEvent(
                'Click Tracking - footer Send Us Your Feedback Button',
                'footer Send Us Your Feedback Button',
                'https://www.surveymonkey.com/r/LGP2Z96'
              )
            "
          >
            <Button label="Send Us Your Feedback" class="px-4 sm:px-5" />
          </VFlexibleLink>
          <h3 class="mt-5 mb-4">About Us</h3>
          <div class="grid mb-6">
            <div class="col-12 lg:col-6">
              <VFlexibleLink
                v-for="(link, primaryIndex) in footerPrimaryNav"
                :key="primaryIndex"
                :to="link.value.url"
                :target="link.type ? 'external_link' : undefined"
                class="c-secondary-nav__link"
                @emit-flexible-link="
                  trackClickEvent(
                    `Click Tracking - footer primary navigation - ${link.value.title}`,
                    'footer primary navigation',
                    link.value.url
                  )
                "
              >
                {{ link.value.title }}
              </VFlexibleLink>
            </div>
            <div class="col-12 lg:col-6">
              <VFlexibleLink
                v-for="(link, secondaryIndex) in footerSecondaryNav"
                :key="secondaryIndex"
                :to="link.value.url"
                :target="link.type ? 'external_link' : undefined"
                class="c-secondary-nav__link"
                @emit-flexible-link="
                  trackClickEvent(
                    `Click Tracking - footer secondary navigation - ${link.value.title}`,
                    'footer secondary navigation',
                    link.value.url
                  )
                "
              >
                {{ link.value.title }}
              </VFlexibleLink>
            </div>
          </div>
        </div>
      </div>
      <div class="grid align-items-center mb-6">
        <div class="col-12 lg:col-6 text-center lg:text-left">
          <NyprLogo />
        </div>
        <div class="col-12 lg:col-6">
          <VShareTools
            label="Connect"
            class="justify-content-center lg:justify-content-start"
          >
            <VShareToolsItem
              service="facebook"
              username="WNYC"
              @follow="trackSocialFollow"
            />
            <VShareToolsItem
              service="twitter"
              username="WNYC"
              @follow="trackSocialFollow"
            />
            <VShareToolsItem
              service="instagram"
              username="WNYC"
              @follow="trackSocialFollow"
            />
            <VShareToolsItem
              service="youtube"
              username="UCbysmY4hyViQAAYEzOR-uCQ"
              @follow="trackSocialFollow"
            />
          </VShareTools>
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
          <VFlexibleLink
            v-for="(link, legalNavIndex) in legalNav"
            :key="legalNavIndex"
            :to="link.value.url"
            :target="link.type ? 'external_link' : undefined"
            @emit-flexible-link="
              trackClickEvent(
                `Click Tracking - footer legal navigation - ${link.value.title}`,
                'footer legal navigation',
                link.value.url
              )
            "
          >
            {{ link.value.title }}
          </VFlexibleLink>
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
  padding-top: 50px;
  padding-bottom: 50px;
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
