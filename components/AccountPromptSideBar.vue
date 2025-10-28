<script setup>
import { useSignupSideBar, useLoginSideBar } from "~/composables/states"
import { useIsApp } from "~/composables/states"

const props = defineProps({
  styleMode: {
    type: [String, Promise],
    default: "dark",
  },
  bgColor: {
    type: [String, Promise],
    default: "var(--p-surface-950)",
  },
})

const loginSideBar = useLoginSideBar()
const signupSideBar = useSignupSideBar()
const accountPromptSideBar = useAccountPromptSideBar()
const isApp = useIsApp()

const bgColorRef = ref(props.bgColor)
</script>

<template>
  <div class="account-prompt-sidebar">
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
          :to="!isApp ? '/login' : '#'"
          @click="
            () => {
              accountPromptSideBar = false
              if (isApp) {
                loginSideBar = true
              }
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
            if (isApp) {
              signupSideBar = true
            } else {
              navigateTo('/signup')
            }
          }
        "
      />
    </section>
  </div>
</template>

<style lang="scss" scoped>
.account-prompt-sidebar {
  background: v-bind(bgColorRef);
  .content {
    max-width: 520px;
  }
}
</style>
