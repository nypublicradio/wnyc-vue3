<script setup>
import AccountModalHeader from "./AccountModalHeader.vue"
const dialogRef = inject("dialogRef")
</script>

<template>
  <div class="contact-listener-services">
    <AccountModalHeader>Contact Listener Services</AccountModalHeader>
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
