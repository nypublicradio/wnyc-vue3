<script lang="ts" setup>
import { allSocialData } from "~/composables/menuData"
import { trackClickEvent } from "~/utilities/helpers"
const { allNavigationData } = await useNavigationData()
</script>

<template>
  <section class="the-footer style-mode-dark py-5">
    <div class="grid">
      <div class="col-12 xl:col">
        <div class="flex gap-5 align-items-center">
          <div class="w-5rem flex-none">
            <WnycLogo class="wnyc-logo cursor-pointer" />
          </div>
          <p class="line-height-3 text-xs">
            Listener-supported WNYC is the home for independent journalism and courageous
            conversation on air and online. Broadcasting live from New York City on 93.9
            FM and AM 820 and available online and on the go.
          </p>
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
        <div class="menu pt-6 flex gap-4">
          <ExpandedMenuItem
            v-for="item in allNavigationData"
            :key="item.id"
            :item="item"
            :class="`menu-holder ${item.class}`"
            :menuData="item"
          />
        </div>
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
      min-width: 200px;
    }
  }
}
</style>
