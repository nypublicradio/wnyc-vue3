<script setup>
import useNavigationData from "~/composables/useNavigationData"

import { useCurrentUser } from "~/composables/states.ts"

const currentUser = useCurrentUser()

const { headerNavigationData } = await useNavigationData()

const emit = defineEmits(["emit-click"])
</script>

<template>
  <div v-if="headerNavigationData" class="bottom hidden lg:block">
    <section class="full-width py-0 -mt-2">
      <Divider class="my-0" />
    </section>
    <section
      class="content full-width"
      :class="[{ 'logged-in': currentUser, 'logged-out': !currentUser }]"
    >
      <NavButton
        v-for="item in headerNavigationData"
        :key="item.id"
        :index="item.id"
        class="inline relative"
        :class="item.class"
        size="normal"
        :label="item.label"
        trackingLocation="header main nav"
        :route="item.url"
        fontWeight="600"
      >
        <template #menu v-if="item.items">
          <NavSubMenu :model="item?.items[0]" @emit-click="emit('emit-click', event)" />
        </template>
      </NavButton>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.bottom {
  //height: var(--header-bottom-height);
  background: var(--header-background);

  .content {
    margin-left: -12px;
    display: flex;
    gap: 0rem 1rem;
    flex-wrap: wrap;

    &.logged-out {
      .saved {
        display: none !important;
      }
    }

    &.logged-in {
    }
  }
}
</style>
