<script setup>
import { useProfileApi } from "~/composables/useProfileApi"

const props = defineProps({
  profileData: {
    type: Object,
    default: null,
  },
})

console.log("props.profileData", props.profileData)

const donations = computed(() => {
  return props.profileData?.activeRecurringDonations
})

const emit = defineEmits(["onDonateNow", "onChangePaymentInfo"])

const memberStatus = {
  CHECK: "check",
  ERROR: "error",
  LOCK: "lock",
}
const memberBrand = {
  WNYC: "wnyc",
  WQXR: "wqxr",
}

const hasPaymentFailed = computed(() => {
  return donations.value?.some((donation) => donation.status !== "Completed")
})
const isActiveSustainer = computed(() => {
  return props.profileData?.isActiveSustainer
})

const getIconStatus = computed(() => {
  if (!isActiveSustainer.value) {
    return memberStatus.LOCK
  } else if (hasPaymentFailed.value) {
    return memberStatus.ERROR
  } else {
    return memberStatus.CHECK
  }
})
const getBrand = computed(() => {
  return memberBrand.WNYC
})

const goToMemberCenter = () => {
  emit("onChangePaymentInfo", props.profileData.queryStringEncrypted)
}
</script>

<template>
  <div class="member-card card">
    <div
      class="flex flex-wrap sm:flex-nowrap align-items-start justify-content-center sm:justify-content-start gap-3"
    >
      <MemberStatusIcon :brand="getBrand" :status="getIconStatus" />

      <div v-if="hasPaymentFailed">
        <p class="font-bold">Your membership needs to be updated</p>
        <div
          class="flex gap-3 mt-3 align-items-center justify-content-center sm:justify-content-start flex-wrap"
        >
          <Button
            class="px-3 w-full sm:w-auto"
            @click="goToMemberCenter"
            label="Member Center"
            size="small"
          />
        </div>
      </div>

      <div v-if="donations.length > 0">
        <p class="font-bold">Sustaining Member</p>
        <div
          class="flex gap-3 mt-3 align-items-center justify-content-center sm:justify-content-start flex-wrap"
        >
          <Button
            class="px-3 w-full sm:w-auto"
            @click="goToMemberCenter"
            label="Member Center"
            size="small"
          />
        </div>
      </div>

      <div v-else>
        <p class="font-bold">Become a WNYC Member</p>
        <p>
          A monthly gift will provide us steady support to help secure the
          future of public media.
        </p>
        <div
          class="flex gap-3 mt-3 align-items-center justify-content-center sm:justify-content-start flex-wrap"
        >
          <Button
            class="px-5 w-full sm:w-auto"
            @click="emit('onDonateNow')"
            label="Donate Now"
            size="small"
          />
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
    border-radius: 10px;
  }
}
</style>
