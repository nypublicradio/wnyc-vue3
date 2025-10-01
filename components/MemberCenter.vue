<script setup>
import { useCurrentUser } from "~/composables/states"
import { useProfileApi } from "~/composables/useProfileApi"
import { useMembership } from "~/composables/useMembership"

// Profile API composable for member profile data
const { profile: profileData, loading: isLoading, getMembershipInfo } = useProfileApi()
const {
  onCancelMembership,
  onUpdateGiftAmount,
  onDonateNow,
  onContactListenerServices,
  onChangePaymentInfo,
} = useMembership()
const currentUser = useCurrentUser()

const profileDataTemp2 = ref({
  name: "Susan Manning",
  lastDonationDate: "2024-09-04",
  lastDonationAmount: 8,
  isActiveSustainer: false,
  activeRecurringDonations: [],
  queryStringEncrypted: "placeholder",
})
const profileDataTemp = ref({
  name: "Susan Manning",
  lastDonationDate: "2025-09-04",
  lastDonationAmount: 8,
  isActiveSustainer: true,
  activeRecurringDonations: [
    {
      paymentFailed: false,
      springboardId: "4517921",
      brand: "WQXR Membership",
      amount: 79.8,
      nextChargeDate: "2025-09-30",
      membershipStartDate: "2023-03-31",
    },
    {
      paymentFailed: true,
      springboardId: "4732223",
      brand: "WNYC Membership",
      amount: 82.8,
      nextChargeDate: "2025-09-11",
      membershipStartDate: "2023-04-11",
    },
    {
      paymentFailed: false,
      springboardId: "5480905",
      brand: "WNYC Membership",
      amount: 20,
      nextChargeDate: "2025-09-13",
      membershipStartDate: "2023-06-13",
    },
    {
      paymentFailed: false,
      springboardId: "5505076",
      brand: "WNYC Membership",
      amount: 10,
      nextChargeDate: "2025-09-17",
      membershipStartDate: "2023-06-17",
    },
    {
      paymentFailed: false,
      springboardId: "5669615",
      brand: "WNYC Membership",
      amount: 20,
      nextChargeDate: "2025-10-02",
      membershipStartDate: "2023-07-02",
    },
    {
      paymentFailed: false,
      springboardId: "5972390",
      brand: "WNYC Membership",
      amount: 12,
      nextChargeDate: "2025-10-01",
      membershipStartDate: "2023-08-01",
    },
    {
      paymentFailed: false,
      springboardId: "6054666",
      brand: "WNYC Membership",
      amount: 15,
      nextChargeDate: "2025-10-03",
      membershipStartDate: "2023-08-03",
    },
    {
      paymentFailed: false,
      springboardId: "6181081",
      brand: "WNYC Membership",
      amount: 10,
      nextChargeDate: "2025-09-13",
      membershipStartDate: "2023-08-13",
    },
    {
      paymentFailed: false,
      springboardId: "6183940",
      brand: "WNYC Membership",
      amount: 12,
      nextChargeDate: "2025-09-13",
      membershipStartDate: "2023-08-13",
    },
    {
      paymentFailed: false,
      springboardId: "6189001",
      brand: "WNYC Membership",
      amount: 12,
      nextChargeDate: "2025-09-15",
      membershipStartDate: "2023-08-15",
    },
    {
      paymentFailed: false,
      springboardId: "6192388",
      brand: "WNYC Membership",
      amount: 15,
      nextChargeDate: "2025-09-15",
      membershipStartDate: "2023-08-15",
    },
    {
      paymentFailed: false,
      springboardId: "6224074",
      brand: "WNYC Membership",
      amount: 16.2,
      nextChargeDate: "2025-09-20",
      membershipStartDate: "2023-08-20",
    },
    {
      paymentFailed: false,
      springboardId: "6241075",
      brand: "WNYC Membership",
      amount: 12,
      nextChargeDate: "2025-09-21",
      membershipStartDate: "2023-08-21",
    },
    {
      paymentFailed: false,
      springboardId: "6250930",
      brand: "WNYC Membership",
      amount: 8,
      nextChargeDate: "2025-09-23",
      membershipStartDate: "2023-08-23",
    },
    {
      paymentFailed: false,
      springboardId: "6271750",
      brand: "WNYC Membership",
      amount: 18,
      nextChargeDate: "2025-09-25",
      membershipStartDate: "2023-08-25",
    },
    {
      paymentFailed: false,
      springboardId: "6523657",
      brand: "WNYC Membership",
      amount: 10,
      nextChargeDate: "2025-09-13",
      membershipStartDate: "2023-09-13",
    },
    {
      paymentFailed: false,
      springboardId: "7180402",
      brand: "WNYC Membership",
      amount: 8,
      nextChargeDate: "2025-10-04",
      membershipStartDate: "2023-11-04",
    },
    {
      paymentFailed: false,
      springboardId: "7684024",
      brand: "WNYC Membership",
      amount: 12,
      nextChargeDate: "2025-09-20",
      membershipStartDate: "2023-12-20",
    },
    {
      paymentFailed: false,
      springboardId: "7729045",
      brand: "WNYC Membership",
      amount: 12,
      nextChargeDate: "2025-09-25",
      membershipStartDate: "2023-12-25",
    },
    {
      paymentFailed: false,
      springboardId: "7735522",
      brand: "WNYC Membership",
      amount: 12,
      nextChargeDate: "2025-09-25",
      membershipStartDate: "2023-12-25",
    },
    {
      paymentFailed: false,
      springboardId: "7740484",
      brand: "WNYC Membership",
      amount: 15,
      nextChargeDate: "2025-09-26",
      membershipStartDate: "2023-12-26",
    },
    {
      paymentFailed: false,
      springboardId: "7763341",
      brand: "WQXR Membership",
      amount: 8,
      nextChargeDate: "2025-09-28",
      membershipStartDate: "2023-12-28",
    },
    {
      paymentFailed: false,
      springboardId: "7982983",
      brand: "WNYC Membership",
      amount: 8,
      nextChargeDate: "2025-09-09",
      membershipStartDate: "2024-01-09",
    },
    {
      paymentFailed: false,
      springboardId: "7985377",
      brand: "WNYC Membership",
      amount: 12,
      nextChargeDate: "2025-09-09",
      membershipStartDate: "2024-01-09",
    },
    {
      paymentFailed: false,
      springboardId: "7986724",
      brand: "WNYC Membership",
      amount: 10,
      nextChargeDate: "2025-09-09",
      membershipStartDate: "2024-01-09",
    },
    {
      paymentFailed: false,
      springboardId: "8120344",
      brand: "WNYC Membership",
      amount: 12,
      nextChargeDate: "2025-09-28",
      membershipStartDate: "2024-01-28",
    },
    {
      paymentFailed: false,
      springboardId: "8131333",
      brand: "WNYC Membership",
      amount: 15,
      nextChargeDate: "2025-09-29",
      membershipStartDate: "2024-01-29",
    },
    {
      paymentFailed: false,
      springboardId: "8208139",
      brand: "WNYC Membership",
      amount: 15,
      nextChargeDate: "2025-10-02",
      membershipStartDate: "2024-02-02",
    },
    {
      paymentFailed: false,
      springboardId: "8245963",
      brand: "WNYC Membership",
      amount: 15,
      nextChargeDate: "2025-10-03",
      membershipStartDate: "2024-02-03",
    },
    {
      paymentFailed: false,
      springboardId: "8294197",
      brand: "WNYC Membership",
      amount: 15,
      nextChargeDate: "2025-09-04",
      membershipStartDate: "2024-02-04",
    },
    {
      paymentFailed: false,
      springboardId: "8295175",
      brand: "WNYC Membership",
      amount: 15,
      nextChargeDate: "2025-09-04",
      membershipStartDate: "2024-02-04",
    },
    {
      paymentFailed: false,
      springboardId: "8295622",
      brand: "WNYC Membership",
      amount: 10,
      nextChargeDate: "2025-09-04",
      membershipStartDate: "2024-02-04",
    },
    {
      paymentFailed: false,
      springboardId: "8326522",
      brand: "WNYC Patrons",
      amount: 97.8,
      nextChargeDate: "2025-09-09",
      membershipStartDate: "2024-02-09",
    },
    {
      paymentFailed: false,
      springboardId: "8433004",
      brand: "WNYC Membership",
      amount: 10,
      nextChargeDate: "2025-09-25",
      membershipStartDate: "2024-02-25",
    },
    {
      paymentFailed: false,
      springboardId: "8852806",
      brand: "WNYC Patrons",
      amount: 105,
      nextChargeDate: "2025-09-29",
      membershipStartDate: "2024-03-29",
    },
    {
      paymentFailed: false,
      springboardId: "8982019",
      brand: "WNYC Patrons",
      amount: 118,
      nextChargeDate: "2025-10-04",
      membershipStartDate: "2024-04-04",
    },
    {
      paymentFailed: false,
      springboardId: "11742304",
      brand: "WNYC Membership",
      amount: 13,
      nextChargeDate: "2025-10-03",
      membershipStartDate: "2024-12-03",
    },
    {
      paymentFailed: false,
      springboardId: "12153232",
      brand: "WNYC Patrons",
      amount: 130,
      nextChargeDate: "2025-09-05",
      membershipStartDate: "2025-01-05",
    },
    {
      paymentFailed: false,
      springboardId: "12154219",
      brand: "WNYC Membership",
      amount: 12,
      nextChargeDate: "2025-09-05",
      membershipStartDate: "2025-01-05",
    },
    {
      paymentFailed: false,
      springboardId: "12194092",
      brand: "WNYC Membership",
      amount: 45,
      nextChargeDate: "2025-09-12",
      membershipStartDate: "2025-01-12",
    },
    {
      paymentFailed: false,
      springboardId: "12203956",
      brand: "WNYC Patrons",
      amount: 140,
      nextChargeDate: "2025-09-14",
      membershipStartDate: "2025-01-14",
    },
    {
      paymentFailed: false,
      springboardId: "12299620",
      brand: "WQXR Membership",
      amount: 10,
      nextChargeDate: "2025-09-25",
      membershipStartDate: "2025-01-25",
    },
    {
      paymentFailed: false,
      springboardId: "12315529",
      brand: "WNYC Membership",
      amount: 8,
      nextChargeDate: "2025-09-27",
      membershipStartDate: "2025-01-27",
    },
    {
      paymentFailed: false,
      springboardId: "12480388",
      brand: "WNYC Patrons",
      amount: 153,
      nextChargeDate: "2025-09-05",
      membershipStartDate: "2025-02-05",
    },
    {
      paymentFailed: false,
      springboardId: "12497035",
      brand: "WQXR Membership",
      amount: 15,
      nextChargeDate: "2025-09-07",
      membershipStartDate: "2025-02-07",
    },
    {
      paymentFailed: false,
      springboardId: "12536392",
      brand: "WNYC Patrons",
      amount: 94.8,
      nextChargeDate: "2025-09-15",
      membershipStartDate: "2025-02-15",
    },
    {
      paymentFailed: false,
      springboardId: "12571546",
      brand: "WNYC Patrons",
      amount: 168,
      nextChargeDate: "2025-09-20",
      membershipStartDate: "2025-02-20",
    },
    {
      paymentFailed: false,
      springboardId: "12627481",
      brand: "WQXR Membership",
      amount: 15,
      nextChargeDate: "2025-09-25",
      membershipStartDate: "2025-02-25",
    },
    {
      paymentFailed: false,
      springboardId: "12800401",
      brand: "WQXR Membership",
      amount: 15,
      nextChargeDate: "2025-10-04",
      membershipStartDate: "2025-03-04",
    },
    {
      paymentFailed: false,
      springboardId: "12861607",
      brand: "WNYC Membership",
      amount: 15,
      nextChargeDate: "2025-09-06",
      membershipStartDate: "2025-03-06",
    },
    {
      paymentFailed: false,
      springboardId: "13303945",
      brand: "WQXR Membership",
      amount: 10,
      nextChargeDate: "2025-09-15",
      membershipStartDate: "2025-04-15",
    },
    {
      paymentFailed: false,
      springboardId: "13304008",
      brand: "WNYC Membership",
      amount: 15,
      nextChargeDate: "2025-09-15",
      membershipStartDate: "2025-04-15",
    },
    {
      paymentFailed: false,
      springboardId: "13332796",
      brand: "WNYC Membership",
      amount: 10,
      nextChargeDate: "2025-09-19",
      membershipStartDate: "2025-04-19",
    },
    {
      paymentFailed: false,
      springboardId: "13554895",
      brand: "WNYC Membership",
      amount: 12,
      nextChargeDate: "2025-10-04",
      membershipStartDate: "2025-05-04",
    },
    {
      paymentFailed: false,
      springboardId: "13563790",
      brand: "WNYC Membership",
      amount: 8,
      nextChargeDate: "2025-09-04",
      membershipStartDate: "2025-05-04",
    },
    {
      paymentFailed: false,
      springboardId: "13576168",
      brand: "WNYC Membership",
      amount: 13,
      nextChargeDate: "2025-09-04",
      membershipStartDate: "2025-05-04",
    },
    {
      paymentFailed: false,
      springboardId: "13587904",
      brand: "WNYC Membership",
      amount: 10,
      nextChargeDate: "2025-09-05",
      membershipStartDate: "2025-05-05",
    },
    {
      paymentFailed: false,
      springboardId: "13642060",
      brand: "WNYC Membership",
      amount: 12,
      nextChargeDate: "2025-09-11",
      membershipStartDate: "2025-05-11",
    },
    {
      paymentFailed: false,
      springboardId: "13832647",
      brand: "WQXR Patrons",
      amount: 88,
      nextChargeDate: "2025-09-29",
      membershipStartDate: "2025-05-29",
    },
    {
      paymentFailed: false,
      springboardId: "13835341",
      brand: "WQXR Membership",
      amount: 10,
      nextChargeDate: "2025-09-29",
      membershipStartDate: "2025-05-29",
    },
    {
      paymentFailed: false,
      springboardId: "13887253",
      brand: "WQXR Patrons",
      amount: 98,
      nextChargeDate: "2025-10-02",
      membershipStartDate: "2025-06-02",
    },
    {
      paymentFailed: false,
      springboardId: "14854483",
      brand: "WQXR Membership",
      amount: 10,
      nextChargeDate: "2025-09-21",
      membershipStartDate: "2025-08-21",
    },
  ],
  queryStringEncrypted: "placeholder",
})

// lifecycle hooks
onMounted(async () => {
  await getMembershipInfo()
})
</script>

<template>
  <div class="member-center grid grid-lggutter">
    <!-- {{ isLoading }}
    <pre class="text-xs">{{ profileData }}</pre>
    <pre class="text-xs">{{ currentUser }}</pre> -->
    <div v-if="currentUser && profileData && !isLoading" class="col-12">
      <!-- TEMP to show no donation history -->
      <MemberCard
        :donation="null"
        :profileData="profileDataTemp2"
        class="mb-3"
        @onDonateNow="onDonateNow"
        @onContactListenerServices="onContactListenerServices()"
        @onChangePaymentInfo="onChangePaymentInfo(profileDataTemp.queryStringEncrypted)"
      />
      <MemberCard
        :donation="null"
        :profileData="profileData"
        class="mb-3"
        @onDonateNow="onDonateNow"
        @onContactListenerServices="onContactListenerServices()"
        @onChangePaymentInfo="onChangePaymentInfo(profileDataTemp.queryStringEncrypted)"
      />
      <!-- TEMP to show no donation history -->
      <div
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
          @onChangePaymentInfo="onChangePaymentInfo(profileDataTemp.queryStringEncrypted)"
        />
      </div>
      <MemberCard v-else :donation="null" :profileData="profileData" />
      <!-- <pre>{{ profileData }}</pre> -->
      <!-- <pre>{{ profileDataTemp }}</pre> -->
    </div>
    <!-- loading skeleton for membership card -->
    <div v-else class="col-12">
      <div class="p-4">
        <div class="flex flex-wrap align-items-start gap-3">
          <Skeleton shape="circle" class="w-4rem h-4rem" />
          <div class="flex flex-column gap-2 flex-grow-1">
            <Skeleton width="35%" borderRadius="16px"></Skeleton>
            <Skeleton width="50%" height="0.75rem" borderRadius="16px"></Skeleton>
            <Skeleton width="70%" height="0.75rem" borderRadius="16px"></Skeleton>
            <div class="flex gap-4 flex-grow-1 align-items-center mt-3">
              <Skeleton
                width="11rem"
                height="2rem"
                class="flex-none"
                borderRadius="16px"
              ></Skeleton>
              <Skeleton height="1rem" borderRadius="16px"></Skeleton>
              <Skeleton height="1rem" borderRadius="16px"></Skeleton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- Member Profile Section -->
  <!-- <div v-if="currentUser && profileData" class="member-center mb-6">
        <div class="card">
          <div class="flex align-items-center mb-4">
            <i class="mr-2 pi pi-user"></i>
            <h2 class="mb-0">Member Profile</h2>
          </div>

          <SBox label="Member Name" :ripple="false">
            <p>{{ profileData.name || "N/A" }}</p>
          </SBox>

          <SBox label="Active Sustainer" :ripple="false">
            <p
              :class="profileData.isActiveSustainer ? 'text-green-600' : 'text-gray-500'"
            >
              {{ profileData.isActiveSustainer ? "Yes" : "No" }}
            </p>
          </SBox>

          <SBox v-if="profileData.lastDonationDate" label="Last Donation" :ripple="false">
            <div class="text-right">
              <p>{{ formatDate(profileData.lastDonationDate) }}</p>
              <p v-if="profileData.lastDonationAmount" class="text-sm opacity-75">
                {{ formatCurrency(profileData.lastDonationAmount) }}
              </p>
            </div>
          </SBox>

          <div
            v-if="
              profileData.activeRecurringDonations &&
              profileData.activeRecurringDonations.length > 0
            "
          >
            <SBox
              v-for="(donation, index) in profileData.activeRecurringDonations"
              :key="donation.springboardId"
              :label="`Active Donation ${index + 1}`"
              :ripple="false"
            >
              <div class="text-right">
                <p class="font-medium">{{ donation.brand }}</p>
                <p>{{ formatCurrency(donation.amount) }}</p>
                <p class="text-sm opacity-75">
                  Next charge: {{ formatDate(donation.nextChargeDate) }}
                </p>
                <p class="text-xs opacity-60">
                  Member since: {{ formatDate(donation.membershipStartDate) }}
                </p>
              </div>
            </SBox>
          </div>
        </div>
      </div> -->
  <!-- Member Profile Section -->
</template>

<style lang="scss" scoped>
.member-center {
}
</style>
