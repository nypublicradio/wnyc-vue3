<script lang="ts" setup>
import { getYear } from "~/utilities/helpers"
import { useCurrentEpisode } from "~/composables/states"
import { allSocialData } from "~/composables/navigationData.js"

const emit = defineEmits<(e: "submit", value: any) => void>()

const config = useRuntimeConfig()

const { footerNavigationData, footerLegalLinksData } = await useNavigationData()
const isCurrentEpisode = useCurrentEpisode()
const isSubmitting = ref(false)
const submissionStatus = ref(null)

// function for submitting the newsletter form
const submitForm = (email) => {
  isSubmitting.value = true
  submissionStatus.value = null
  $fetch(config.public.NEWSLETTER_API, {
    method: "POST",
    body: {
      source: "wnyc_footer",
      list: config.public.NEWSLETTER_MULTI_LIST_IDS,
      email,
    },
  })
    .then(() => {
      submissionStatus.value = "success"
      emit("submit", "success")
    })
    .catch(() => {
      submissionStatus.value = "error"
      isSubmitting.value = false
      emit("submit", "error")
    })
}
</script>

<template>
  <section class="the-footer style-mode-dark py-5 overflow-hidden relative">
    <div class="content" :class="[{ 'is-playing': isCurrentEpisode }]">
      <div class="grid content mb-5">
        <div class="col-12 xl:col mb-5">
          <div class="flex gap-5 flex-column">
            <div
              class="flex flex-column gap-2 align-items-start md:flex-row md:gap-5 md:align-items-start"
            >
              <div class="w-5rem flex-none md:mt-1">
                <WnycLogo class="wnyc-logo cursor-pointer" />
              </div>
              <div>
                <p class="blurb line-height-3 text-xs">
                  Listener-supported WNYC is the home for independent journalism and
                  courageous conversation on air and online. Broadcasting live from New
                  York City on 93.9 FM and AM 820 and available online and on the go.
                </p>
              </div>
            </div>
            <div class="flex gap-5 align-items-center">
              <div class="w-5rem flex-none hidden xl:block">
                <WnycLogo class="hidden" />
              </div>
              <div class="newsletter">
                <h2 class="mb-3">Sign up for our newsletter</h2>
                <p class="line-height-3 text-xs">
                  Sign up for for a weekly, behind-the-scenes update from the people
                  behind your favorite shows.
                  <VFlexibleLink to="https://cloud.lists.wnyc.org/Preferences"
                    >See More
                  </VFlexibleLink>
                </p>
                <email-collector-form
                  class="form mt-5"
                  @submit="submitForm"
                  :is-submitting="isSubmitting"
                  :submission-status="submissionStatus"
                >
                  By submitting your information, you're agreeing to receive
                  communications from New York Public Radio in accordance with our
                  <VFlexibleLink to="/terms"> Terms </VFlexibleLink>.
                </email-collector-form>
              </div>
            </div>
          </div>
        </div>
        <div class="hidden xl:block col-1"></div>
        <div class="col">
          <SocialButtons :data="allSocialData" />
          <div class="menu pt-6 flex flex-wrap md:flex-nowrap gap-4">
            <ExpandedMenuItem
              v-for="item in footerNavigationData"
              :key="item.id"
              :item="item"
              :class="`menu-holder ${item.class}`"
              :menuData="item"
            />
          </div>
        </div>
      </div>
      <div
        class="grid grid-nogutter gap-5 justify-content-between align-items-center mt-7"
      >
        <NyprLogosBracket />
      </div>
      <Divider class="mt-4" />
      <div
        class="grid justify-content-between align-items-center mt-4 gap-4 grid-nogutter"
      >
        <div v-if="footerLegalLinksData.length > 0" class="flex flex-wrap gap-3 -ml-2">
          <NavButton
            v-for="item in footerLegalLinksData"
            :key="item.id"
            :label="item.label"
            :route="item.url"
            class="footer-legal-links"
            :class="item.class"
            size="small"
          />
        </div>
        <p class="flex-none text-sm">
          &copy; {{ getYear() }} New York Public Radio. All rights reserved.
        </p>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.the-footer {
  max-width: 100%;
  background-color: var(--p-surface-950);
  .content {
    max-width: $contentWidth;
    margin: auto;
    .menu {
      .menu-holder {
        min-width: 170px;

        @include media(">xxl") {
          min-width: 200px;
        }

        @include media("<sm") {
          min-width: 150px;
        }
      }
    }

    .blurb {
      max-width: 430px;
    }

    .newsletter {
      max-width: 420px;
    }

    .logo3d {
      position: absolute;
      top: 0;
      right: -20vw;
      z-index: 0;
      opacity: 1;
      height: 100%;
      width: 80vw;
      opacity: 0.05;
      pointer-events: none;
    }
  }
}
</style>

<style lang="scss">
.the-footer {
  transition: margin var(--p-transition-duration);
  -webkit-transition: margin var(--p-transition-duration);

  .footer-legal-links {
    .p-button .p-button-label {
      text-decoration: underline;
    }
  }

  .is-playing {
    padding-bottom: var(--persistent-player-height);
  }
}
</style>
