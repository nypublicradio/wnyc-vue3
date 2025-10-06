<script async setup>
import { useIsApp } from "~/composables/states.ts"
import ModalCloseBtn from "./account-modals/ModalCloseBtn.vue"
const updateAccountRef = ref(null)
const emit = defineEmits(["close"])
const isApp = useIsApp()
</script>

<template>
  <div class="edit-profile">
    <section>
      <ModalCloseBtn
        v-if="!isApp"
        @clickEmit="updateAccountRef.beforeYouLeave()"
        class="absolute right-0 top-0 p-2"
      />
      <SHeader
        :showButton="isApp"
        label="Account"
        @close-sidebar="updateAccountRef.beforeYouLeave()"
      />
      <SUpdateAccount ref="updateAccountRef" @close="emit('close')" />
    </section>
  </div>
</template>
