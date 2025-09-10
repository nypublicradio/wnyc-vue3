<script setup>
import ModalCloseBtn from "./ModalCloseBtn.vue"
const dialogRef = inject("dialogRef")
</script>

<template>
  <div class="contact-listener-services">
    <div class="flex justify-content-between align-items-center mb-2">
      <div class="font-meta text-2xl font-bold">Contact Listener Services</div>
      <ModalCloseBtn class="-mr-2" @clickEmit="dialogRef.close()" />
    </div>
    <p>
      <strong
        ><VFlexibleLink
          @click="dialogRef.close()"
          to="https://newyorkpublicradio.my.site.com/wnyc/s/"
          >Reach out to us
        </VFlexibleLink></strong
      >for any questions or assistance regarding your membership. We're here to help!
    </p>
    <div class="flex flex-column gap-3 align-items-center mt-3">
      <Button
        class="w-full px-3 max-w-15rem"
        @click="dialogRef.close()"
        label="Close"
        size="small"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.contact-listener-services {
}
</style>
