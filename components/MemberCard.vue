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

const emit = defineEmits(["onDonateNow", "onCancelMembership", "onUpdateGiftAmount"])

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

const onTellUs = () => {
  // Handle the "Something missing? Tell us" click event
}
const onChangePaymentInfo = () => {
  // Handle the "Change payment info" click event
}
</script>

<template>
  <div class="member-card card">
    <div
      class="flex flex-wrap sm:flex-nowrap align-items-start justify-content-center sm:justify-content-start gap-3"
    >
      <MemberStatusIcon :brand="getBrand" :status="getStatus" />

      <div v-if="hasPaymentFailed">
        <p class="font-bold">Your membership needs to be updated</p>
        <p>We can’t process your donation. Please update your payment method.</p>
        <div
          class="flex gap-3 mt-3 align-items-center justify-content-center sm:justify-content-start flex-wrap"
        >
          <Button
            class="px-3 w-full sm:w-auto"
            @click="onChangePaymentInfo"
            label="Update payment info"
            size="small"
          />
        </div>
      </div>

      <div v-else-if="hasDonationHistory && isActiveSustainer">
        <p class="font-bold">
          {{
            props.profileData.isActiveSustainer
              ? `${getBrand.toUpperCase()} Sustaining Member`
              : `${getBrand.toUpperCase()} Member`
          }}
        </p>
        <p>
          Thank you for your {{ formatCurrency(props.donation?.amount) }} monthly gift!
          <br />
          Your next donation will process
          {{ formatDate(props.donation?.nextChargeDate) }}
        </p>
        <div
          class="flex gap-3 mt-3 align-items-center justify-content-center sm:justify-content-start flex-wrap"
        >
          <Button
            class="px-3 w-full sm:w-auto"
            @click="emit('onUpdateGiftAmount')"
            label="Update gift amount"
            size="small"
          />
          <Button
            class="link w-full sm:w-auto"
            severity="secondary"
            variant="link"
            @click="onChangePaymentInfo"
            label="Change payment info"
            size="small"
          ></Button>
          <Button
            class="link w-full sm:w-auto"
            severity="secondary"
            variant="link"
            @click="emit('onCancelMembership')"
            label="Cancel membership"
            size="small"
          ></Button>
        </div>
      </div>

      <div v-else-if="hasDonationHistory && !isActiveSustainer">
        <p class="font-bold">We need your support now more than ever</p>
        <p>
          Your last donation was {{ formatDate(props.profileData.lastDonationDate) }}.
          Become a WNYC Member now and help secure the future of public media.
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
          <Button
            class="link w-full sm:w-auto"
            severity="secondary"
            variant="link"
            @click="onTellUs"
            label="Not what you expected? Tell us"
            size="small"
            v-tooltip.bottom="'Enter your username'"
          ></Button>
        </div>
      </div>
      <div v-else>
        <p class="font-bold">Become a WNYC Member</p>
        <p>
          A monthly gift will provide us steady support to help secure the future of
          public media.
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
          <Button
            class="link w-full sm:w-auto"
            severity="secondary"
            variant="link"
            @click="onTellUs"
            label="Something missing? Tell us"
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
    padding: 2rem 2rem 2rem 1.5rem !important;
  }
}
</style>
