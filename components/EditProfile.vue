<script async setup>
import ModalCloseBtn from "./account-modals/ModalCloseBtn.vue"
import { useBreakpoints } from "~/composables/useBreakpoints"
const updateAccountRef = ref(null)
const emit = defineEmits(["close"])
const { isMobileBreakpoint } = useBreakpoints()
</script>

<template>
  <div class="edit-profile">
    <section>
      <ModalCloseBtn
        v-if="!isMobileBreakpoint"
        @clickEmit="updateAccountRef.beforeYouLeave()"
        class="absolute right-0 top-0 p-2"
      />
      <SHeader
        :showButton="isMobileBreakpoint"
        label="Account"
        @close-sidebar="updateAccountRef.beforeYouLeave()"
      />
      <SUpdateAccount ref="updateAccountRef" @close="emit('close')" />
    </section>
  </div>
</template>
