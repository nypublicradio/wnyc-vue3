<script setup>
import VFlexibleLink from "@nypublicradio/nypr-design-system-vue3/v2/src/components/VFlexibleLink.vue"
import { useSignupSideBar, useLoginSideBar } from "~/composables/states"

const loginSideBar = useLoginSideBar()
const signupSideBar = useSignupSideBar()
const accountPromptSideBar = useAccountPromptSideBar()

const props = defineProps({
  styleMode: {
    type: String,
    default: "dark",
  },
})
</script>

<template>
  <div
    class="account-prompt-sidebar flex flex-column gap-3 py-5 px-4"
    :class="`style-mode-${props.styleMode}`"
  >
    <h1 class="font-tisa text-5xl line-height-1 mb-4">
      Save now,<br />
      listen later.
    </h1>
    <p class="text-base mb-3">
      Listen to the latest news, podcasts, and from WNYC while on the go!
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
      to your account to save articles for offline reading and podcasts for offline
      listening.
    </p>
    <p class="px-4">Don't have a login? Create a Free Account.</p>
    <Button
      label="Create Free Account"
      rounded
      size="small"
      severity="secondary"
      class="m-auto mt-3"
      aria-label="Create Free Account Button"
      @click="
        () => {
          accountPromptSideBar = false
          signupSideBar = true
        }
      "
    />
  </div>
</template>

<style lang="scss" scoped>
.account-prompt-sidebar {
  background: var(--background);
}
</style>
