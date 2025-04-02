<script lang="ts" setup>
import { getYear } from "~/utilities/helpers"
import { useIsEpisodePlaying } from "~/composables/states"
import { allSocialData } from "~/composables/navigationData.js"
import { trackClickEvent } from "~/utilities/helpers"
const { footerNavigationData, footerLegalLinksData } = await useNavigationData()
const isEpisodePlaying = useIsEpisodePlaying()
// placeholder function for submitting the form
const submitForm = (event) => {
  event.preventDefault()
}
</script>

<template>
  <section class="the-footer style-mode-dark py-5 overflow-hidden relative">
    <LogoWnyc3d class="logo3d" />
    <div :class="[{ 'is-playing': isEpisodePlaying }]">
      <div class="grid content mb-5">
        <div class="col-12 xl:col mb-5">
          <div class="flex gap-5 flex-column">
            <div class="flex gap-5 align-items-center">
              <div class="w-5rem flex-none">
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
                  <VFlexibleLink to="/newsletter">See More </VFlexibleLink>
                </p>
                <email-collector-form class="form mt-5" @submit="submitForm">
                  By submitting your information, you're agreeing to receive
                  communications from New York Public Radio in accordance with our
                  <VFlexibleLink to="https://www.wnyc.org/terms/"> Terms </VFlexibleLink>.
                </email-collector-form>
              </div>
            </div>
          </div>
        </div>
        <div class="hidden xl:block col-1"></div>
        <div class="col">
          <div class="social flex gap-3 align-items-center">
            <p>Connect with us!</p>
            <VFlexibleLink
              v-for="item in allSocialData"
              raw
              :to="item.url"
              :key="item.id"
              @flexible-link-click="
                () => {
                  trackClickEvent(
                    `Click Tracking - ${item.label} social Button`,
                    'footer',
                    `${item.label} social Button`
                  )
                }
              "
            >
              <Button :icon="item.icon" severity="secondary" size="large" rounded />
            </VFlexibleLink>
          </div>
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
        <div class="flex align-items-center gap-3">
          <p class="flex-none">WNYC is supported by</p>
          <JLGreene class="w-7rem text-color-fill" />
        </div>
      </div>
      <Divider class="mt-4" />
      <div
        class="grid justify-content-between align-items-center mt-4 gap-4 grid-nogutter"
      >
        <div class="flex flex-wrap gap-3 -ml-2">
          <VFlexibleLink
            v-for="item in footerLegalLinksData"
            :key="item.id"
            raw
            :to="item.url"
            class="footer-legal-links"
            :class="item.class"
            @flexible-link-click="
              () => {
                trackClickEvent(
                  `Click Tracking - ${item.label} Button`,
                  'hamburger menu',
                  `${item.label} Button`
                )
              }
            "
          >
            <Button
              raw
              :label="item.label"
              :aria-label="`${item.label} button`"
              severity="secondary"
              size="small"
              variant="link"
            />
          </VFlexibleLink>
        </div>
        <p class="flex-none mt-1">
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

  .social {
    .p-button {
      width: 30px;
      height: 30px;
    }
  }

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
</style>

<style lang="scss">
.the-footer {
  transition: margin var(--p-transition-duration);
  -webkit-transition: margin var(--p-transition-duration);

  .footer-legal-links {
    .p-button {
      text-decoration: underline;

      .p-button-label {
        font-weight: 400;
      }
    }
  }

  .is-playing {
    padding-bottom: $playerHeight;
  }
}
</style>
