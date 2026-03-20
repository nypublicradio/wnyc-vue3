<script setup>
const props = defineProps({
  profileData: {
    type: Object,
    default: null,
  },
})
const emit = defineEmits(["onDonateNow", "onGoToMemberCenter"])

const memberStatus = {
  CHECK: "check",
  ERROR: "error",
  LOCK: "lock",
  DEFAULT: "default",
}
const memberBrand = {
  WNYC: "wnyc",
  WQXR: "wqxr",
}

const donations = computed(() => {
  return props.profileData?.activeRecurringDonations ?? []
})

const hasPaymentFailed = computed(() => {
  return donations.value?.some((donation) => donation.status !== "Completed")
})
const isActiveSustainer = computed(() => {
  return props.profileData?.isActiveSustainer || donations.value?.length > 0
})

const getIconStatus = computed(() => {
  if (hasPaymentFailed.value) {
    return memberStatus.ERROR
  } else if (!isActiveSustainer.value) {
    return memberStatus.DEFAULT
  } else {
    return memberStatus.CHECK
  }
})
const getBrand = computed(() => {
  return memberBrand.WNYC
})

//centralized member center click emit
const goToMemberCenter = () => {
  emit("onGoToMemberCenter")
}
</script>

<template>
  <div class="member-card card">
    <div
      class="flex flex-wrap flex-nowrap align-items-start justify-content-start gap-3"
    >
      <MemberStatusIcon :brand="getBrand" :status="getIconStatus" />

      <div v-if="hasPaymentFailed">
        <p class="font-bold">Your membership needs to be updated</p>
        <div
          class="flex gap-3 mt-3 align-items-center justify-content-start flex-wrap"
        >
          <Button
            class="px-5 sm:w-auto"
            @click="goToMemberCenter"
            label="Member Center"
            size="small"
          />
        </div>
      </div>

      <div v-else-if="donations.length > 0">
        <p class="font-bold">Sustaining Member</p>
        <div
          class="flex gap-3 mt-3 align-items-center justify-content-start flex-wrap"
        >
          <Button
            class="px-5 sm:w-auto"
            @click="goToMemberCenter"
            label="Member Center"
            size="small"
          />
        </div>
      </div>

      <div v-else>
        <p class="font-bold">Support WNYC</p>
        <p>
          A monthly gift provides us steady support to help secure the future of
          public media.
        </p>
        <div
          class="flex gap-3 mt-3 align-items-center justify-content-start flex-wrap"
        >
          <Button
            class="px-5 sm:w-auto"
            @click="emit('onDonateNow')"
            label="Donate Now"
            size="small"
          />
          <Button
            class="link p-0 no-ripple border-noround"
            severity="secondary"
            variant="link"
            @click="emit('onGoToMemberCenter')"
            label="Member Center"
            size="small"
          ></Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.member-card {
  &.card {
    padding: 1rem 1.5rem 1rem 1rem !important;
    background-color: var(--s-box-background-color);
    border-radius: var(--p-border-radius-xl);
  }
}
</style>
