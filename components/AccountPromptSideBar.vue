<script setup>
import VFlexibleLink from "@nypublicradio/nypr-design-system-vue3/v2/src/components/VFlexibleLink.vue"
import { useSignupSideBar, useLoginSideBar } from "~/composables/states"

const props = defineProps({
  styleMode: {
    type: String,
    default: "dark",
  },
  bgColor: {
    type: String,
    default: null,
  },
})

const loginSideBar = useLoginSideBar()
const signupSideBar = useSignupSideBar()
const accountPromptSideBar = useAccountPromptSideBar()

const bgColorRef = ref(props.bgColor)
</script>

<template>
  <div class="account-prompt-sidebar" :class="[{ 'bg-color': bgColorRef }]">
    <section
      class="content flex flex-column gap-3 py-5 px-4"
      :class="`style-mode-${props.styleMode}`"
    >
      <h1 class="font-tisa text-5xl line-height-1 mb-4">
        Save now, <span class="no-wrap">listen later.</span>
      </h1>
      <p class="text-base mb-3">
        Save your favorite podcast episodes, news stories, and more— so you can return to
        them over and over.
      </p>
      <p class="px-4">
        <VFlexibleLink
          to="#"
          @click="
            () => {
              accountPromptSideBar = false
              loginSideBar = true
            }
          "
        >
          Login
        </VFlexibleLink>
        to your account to start saving & following.
      </p>
      <p class="px-4">Don't have a login? Create a <strong>free</strong> account.</p>
      <Button
        label="Create Free Account"
        rounded
        size="small"
        severity="secondary"
        class="m-auto mt-3"
        aria-label="Create Free Account"
        @click="
          () => {
            accountPromptSideBar = false
            signupSideBar = true
          }
        "
      />
    </section>
  </div>
</template>

<style lang="scss" scoped>
.account-prompt-sidebar {
  background: var(--solid-bg-color);
  &.bg-color {
    background: v-bind(bgColorRef);
  }
  .content {
    max-width: 520px;
  }
}
</style>
