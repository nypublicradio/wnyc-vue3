<script setup>
import { useCurrentUser } from "~/composables/states"
import { useProfileApi } from "~/composables/useProfileApi"
import { useMembership } from "~/composables/useMembership"
import { set } from "date-fns"

// Profile API composable for member profile data
const {
  profile: profileData,
  loading: isLoading,
  getMembershipInfo,
} = useProfileApi()
const {
  //onCancelMembership,
  //onUpdateGiftAmount,
  //onContactListenerServices,
  //onChangePaymentInfo,
  onDonateNow,
  onGoToMemberCenter,
} = useMembership()
const currentUser = useCurrentUser()

// lifecycle hooks
onMounted(async () => {
  await getMembershipInfo()
})
</script>

<template>
  <div class="member-center grid grid-lggutter">
    <div
      v-if="currentUser && profileData && !isLoading"
      class="col-12 flex flex-column gap-3"
    >
      <MemberCardBasic
        :profileData="profileData"
        @onDonateNow="onDonateNow"
        @onGoToMemberCenter="onGoToMemberCenter"
      />
    </div>
    <!-- loading skeleton for membership card -->
    <div v-else class="col-12">
      <SkeletonMemberCard />
    </div>
  </div>
</template>
