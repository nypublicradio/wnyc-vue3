<script setup>
import { useCurrentUser } from "~/composables/states"
import { useProfileApi } from "~/composables/useProfileApi"
import { useMembership } from "~/composables/useMembership"

// Profile API composable for member profile data
const {
  profile: profileData,
  loading: isLoading,
  getMembershipInfo,
} = useProfileApi()
const {
  onCancelMembership,
  onUpdateGiftAmount,
  onDonateNow,
  onContactListenerServices,
  onChangePaymentInfo,
  onGoToMemberCenter,
} = useMembership()
const currentUser = useCurrentUser()

const profileDataTempNoDonations = ref({
  name: "LaFontaine Oliver",
  lastDonationDate: "2025-12-27",
  lastDonationAmount: 216,
  isActiveSustainer: false,
  activeRecurringDonations: [],
  queryStringEncrypted: "xxx",
  oneTime: {
    sb_CGS_Last_One_Time_Gift_Amount__c: null,
    sb_CGS_Last_One_Time_Gift_Date__c: null,
  },
})
const profileDataTempActive = ref({
  name: "LaFontaine Oliver",
  lastDonationDate: "2025-12-27",
  lastDonationAmount: 216,
  isActiveSustainer: true,
  activeRecurringDonations: [
    {
      springboardId: "2616220",
      brand: "WNYC Patrons",
      amount: 216,
      nextChargeDate: "2026-01-27",
      membershipStartDate: "2022-10-27",
      status: "Completed",
    },
  ],
  queryStringEncrypted: "xxx",
  oneTime: {
    sb_CGS_Last_One_Time_Gift_Amount__c: null,
    sb_CGS_Last_One_Time_Gift_Date__c: null,
  },
})
const profileDataTempError = ref({
  name: "LaFontaine Oliver",
  lastDonationDate: "2025-12-27",
  lastDonationAmount: 216,
  isActiveSustainer: true,
  activeRecurringDonations: [
    {
      springboardId: "2616220",
      brand: "WNYC Patrons",
      amount: 216,
      nextChargeDate: "2026-01-27",
      membershipStartDate: "2022-10-27",
      status: "failed",
    },
  ],
  queryStringEncrypted: "xxx",
  oneTime: {
    sb_CGS_Last_One_Time_Gift_Amount__c: null,
    sb_CGS_Last_One_Time_Gift_Date__c: null,
  },
})
// lifecycle hooks
onMounted(async () => {
  await getMembershipInfo()
})
</script>

<template>
  <div class="member-center grid grid-lggutter">
    <div v-if="currentUser && profileData && !isLoading" class="col-12">
      <MemberCardBasic
        :profileData="profileData"
        class="mb-3"
        @onDonateNow="onDonateNow"
        @onContactListenerServices="onContactListenerServices()"
        @onGoToMemberCenter="onGoToMemberCenter($event)"
      />
      <MemberCardBasic
        :profileData="profileDataTempNoDonations"
        class="mb-3"
        @onDonateNow="onDonateNow"
        @onContactListenerServices="onContactListenerServices()"
        @onGoToMemberCenter="onGoToMemberCenter($event)"
      />
      <MemberCardBasic
        :profileData="profileDataTempActive"
        class="mb-3"
        @onDonateNow="onDonateNow"
        @onContactListenerServices="onContactListenerServices()"
        @onGoToMemberCenter="onGoToMemberCenter($event)"
      />
      <MemberCardBasic
        :profileData="profileDataTempError"
        class="mb-3"
        @onDonateNow="onDonateNow"
        @onContactListenerServices="onContactListenerServices()"
        @onGoToMemberCenter="onGoToMemberCenter($event)"
      />

      <!-- TEMP to show no donation history -->
      <!-- <MemberCard
        :donation="null"
        :profileData="profileDataTemp2"
        class="mb-3"
        @onDonateNow="onDonateNow"
        @onContactListenerServices="onContactListenerServices()"
        @onChangePaymentInfo="
          onChangePaymentInfo(profileDataTemp.queryStringEncrypted)
        "
      />
      <MemberCard
        :donation="null"
        :profileData="profileData"
        class="mb-3"
        @onDonateNow="onDonateNow"
        @onContactListenerServices="onContactListenerServices()"
        @onChangePaymentInfo="
          onChangePaymentInfo(profileDataTemp.queryStringEncrypted)
        "
      /> -->
      <!-- TEMP to show no donation history -->
      <!-- <div
        v-if="profileDataTemp.activeRecurringDonations.length > 0"
        class="flex flex-column gap-3"
      >
        <MemberCard
          v-for="(donation, index) in profileDataTemp.activeRecurringDonations"
          :key="donation.springboardId"
          :donation="donation"
          :profileData="profileDataTemp"
          @onDonateNow="onDonateNow"
          @onCancelMembership="
            onCancelMembership(donation.springboardId, donation.amount)
          "
          @onUpdateGiftAmount="onUpdateGiftAmount(donation.amount)"
          @onContactListenerServices="onContactListenerServices()"
          @onChangePaymentInfo="
            onChangePaymentInfo(profileDataTemp.queryStringEncrypted)
          "
        />
      </div>
      <MemberCard v-else :donation="null" :profileData="profileData" /> -->
    </div>
    <!-- loading skeleton for membership card -->
    <div v-else class="col-12">
      <SkeletonMemberCard />
    </div>
  </div>
</template>
