<script setup>
import { useProfileApi } from "~/composables/useProfileApi"

const props = defineProps({
  profileData: {
    type: Object,
  },
  donation: {
    type: Object,
  },
})

const memberStatus = {
  CHECK: "check",
  ERROR: "error",
  LOCK: "lock",
}
const memberBrand = {
  WNYC: "wnyc",
  WQXR: "wqxr",
}

const { formatCurrency, formatDate } = useProfileApi()

const hasDonationHistory = computed(() => {
  return props.profileData?.lastDonationDate !== null
})
const hasPaymentFailed = computed(() => {
  return props.donation?.paymentFailed
})
const isActiveSustainer = computed(() => {
  return props.profileData?.isActiveSustainer
})

const getStatus = computed(() => {
  if (!isActiveSustainer.value || !hasDonationHistory.value) {
    return memberStatus.LOCK
  } else if (hasPaymentFailed.value) {
    return memberStatus.ERROR
  } else {
    return props.profileData?.isActiveSustainer ? memberStatus.CHECK : memberStatus.LOCK
  }
})
const getBrand = computed(() => {
  return props.donation?.brand?.toLowerCase().includes(memberBrand.WNYC)
    ? memberBrand.WNYC
    : props.donation?.brand?.toLowerCase().includes(memberBrand.WQXR)
    ? memberBrand.WQXR
    : memberBrand.WNYC
})

const onSomethingMissing = () => {
  // Handle the "Something missing? Tell us" click event
}
const onDonateNow = () => {
  // Handle the "Donate Now" click event
}
const onUpdateGiftAmount = () => {
  // Handle the "Update gift amount" click event
}
const onChangePaymentInfo = () => {
  // Handle the "Change payment info" click event
}
const onCancelMembership = () => {
  // Handle the "Cancel membership" click event
}
const onUpdatePaymentInfo = () => {
  // Handle the "Update payment info" click event
}
</script>

<template>
  <div class="member-card card">
    <div v-if="hasPaymentFailed">
      <div class="flex align-items-start gap-3">
        <MemberStatusIcon :brand="getBrand" :status="getStatus" />
        <div>
          <p class="font-bold">Your membership needs to be updated</p>
          <p>We can’t process your donation. Please update your payment method.</p>
          <div class="flex gap-3 mt-3 align-items-center flex-wrap">
            <Button
              class="px-3"
              @click="onUpdatePaymentInfo"
              label="Update payment info"
              size="small"
            />
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="hasDonationHistory" class="flex flex-wrap align-items-start gap-3">
      <MemberStatusIcon :brand="getBrand" :status="getStatus" />
      <div>
        <p class="font-bold">
          {{
            props.profileData.isActiveSustainer
              ? `${getBrand.toUpperCase()} Sustaining Member`
              : `${getBrand.toUpperCase()} Member`
          }}
        </p>
        <p>
          Thank you for your {{ formatCurrency(props.donation.amount) }} monthly gift!
          <br />
          Your next donation will process {{ formatDate(props.donation.nextChargeDate) }}
        </p>
        <div class="flex gap-3 mt-3 align-items-center flex-wrap">
          <Button
            class="px-3"
            @click="onUpdateGiftAmount"
            label="Update gift amount"
            size="small"
          />
          <Button
            severity="secondary"
            variant="link"
            class="link"
            @click="onChangePaymentInfo"
            label="Change payment info"
            size="small"
          ></Button>
          <Button
            severity="secondary"
            variant="link"
            class="link"
            @click="onCancelMembership"
            label="Cancel membership"
            size="small"
          ></Button>
        </div>
      </div>
    </div>
    <div v-else>
      <div class="flex align-items-start gap-3">
        <MemberStatusIcon :brand="getBrand" :status="getStatus" />
        <div>
          <p class="font-bold">Become a WNYC Member</p>
          <p>
            A monthly gift will provide us steady support to help secure the future of
            public media.
          </p>
          <div class="flex gap-3 mt-3 align-items-center flex-wrap">
            <Button class="px-3" @click="onDonateNow" label="Donate Now" size="small" />
            <Button
              severity="secondary"
              variant="link"
              class="link"
              @click="onSomethingMissing"
              label="Something missing? Tell us"
              size="small"
            ></Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.member-card {
  &.card {
    padding: 2rem 2rem 2rem 1.5rem !important;
  }
}
</style>
