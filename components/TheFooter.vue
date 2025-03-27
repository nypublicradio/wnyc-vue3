<script lang="ts" setup>
import { allSocialData } from "~/composables/menuData"
import { trackClickEvent } from "~/utilities/helpers"
const { footerNavigationData, footerLegalLinksData } = await useNavigationData()

const submitForm = (event) => {
  event.preventDefault()
}

</script>

<template>
  <section class="the-footer style-mode-dark py-5">
    <div class="grid content mb-5">
      <div class="col-12 xl:col mb-5">
        <div class="flex gap-5 flex-column">
          <div class="flex gap-5 align-items-center">
            <div class="w-5rem flex-none">
              <WnycLogo class="wnyc-logo cursor-pointer" />
            </div>
            <div>
              <p class="line-height-3 text-xs">
                Listener-supported WNYC is the home for independent journalism and courageous
                conversation on air and online. Broadcasting live from New York City on 93.9
                FM and AM 820 and available online and on the go.
              </p>
            </div>
          </div>
          <div class="flex gap-5 align-items-center">
            <div class="w-5rem flex-none hidden xl:block">
              <WnycLogo class="hidden" />
            </div>
            <div>
              <h2 class="mb-3">
                Sign up for our newsletter
              </h2>
              <p class="line-height-3 text-xs">
                Sign up for for a weekly, behind-the-scenes update from the people behind your favorite shows.
                <VFlexibleLink to="/newsletter">See More
                </VFlexibleLink>
              </p>
              <email-collector-form class="mt-3" @submit="submitForm">
                By submitting your information, you're agreeing to receive
                communications from New York Public Radio in accordance with our
                <VFlexibleLink to="https://www.wnyc.org/terms/">
                  Terms
                </VFlexibleLink>.
              </email-collector-form>
            </div>
          </div>
        </div>
      </div>
      <div class="hidden xl:block col-1"></div>
      <div class="col">
        <div class="social flex gap-3 align-items-center">
          <p>Connect with us!</p>
          <VFlexibleLink v-for="item in allSocialData" raw :to="item.url" @flexible-link-click="
            () => {
              trackClickEvent(
                `Click Tracking - ${item.label} social Button`,
                'footer',
                `${item.label} social Button`
              )
            }
          ">
            <Button :icon="item.icon" severity="secondary" size="large" rounded />
          </VFlexibleLink>
        </div>
        <div class="menu pt-6 flex flex-wrap md:flex-nowrap gap-4">
          <ExpandedMenuItem v-for="item in footerNavigationData" :key="item.id" :item="item"
            :class="`menu-holder ${item.class}`" :menuData="item" />
        </div>
      </div>
    </div>
    <div class="flex justify-content-between align-items-center mt-7">
      <NyprLogosBracket />
      <div class="flex align-items-center gap-3">
        <p class="flex-none">WNYC is supported by</p>
        <JLGreene class="w-7rem text-color-fill" />
      </div>
    </div>
    <Divider />
    <div class="grid justify-content-between align-items-center mt-4 gap-4 grid-nogutter">
      <div class="flex flex-wrap gap-3 -ml-2">
        <VFlexibleLink v-for="item in footerLegalLinksData" :key="item.id" raw :to="item.url" class="footer-legal-links"
          :class="item.class" @flexible-link-click="
            () => {
              trackClickEvent(
                `Click Tracking - ${item.label} Button`,
                'hamburger menu',
                `${item.label} Button`
              )
            }
          ">
          <Button raw :label="item.label" :aria-label="`${item.label} button`" severity="secondary" size="small"
            variant="link" />
        </VFlexibleLink>
      </div>
      <p class="flex-none mt-1 ">&copy; 2025 New York Public Radio. All rights reserved.</p>
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
}
</style>

<style lang="scss">
.the-footer {
  .footer-legal-links {
    .p-button {
      text-decoration: underline;

      .p-button-label {
        font-weight: 400;
        ;
      }
    }
  }
}
</style>
