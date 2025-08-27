<script setup lang="ts">
import {
  useCurrentUser,
  useCurrentUserProfile,
  useEditProfileSideBar,
  useAllCurrentStations,
  useIsLiveStream,
} from "~/composables/states"
import { trackClickEvent, initializeStationList } from "~/utilities/helpers"
import { useProfileApi } from "~/composables/useProfileApi"

const currentUser = useCurrentUser()
const currentUserProfile = useCurrentUserProfile()
const editProfileSideBar = useEditProfileSideBar()
const allCurrentStations = useAllCurrentStations()
const isLiveStream = useIsLiveStream()

const defaultStreamRef = ref(null)

// Profile API composable for member profile data
const {
  profile: profileData,
  loading: isLoading,
  getMembershipInfo,
  formatCurrency,
  formatDate,
} = useProfileApi()

// Check if user is authenticated with email (not social login)
const isEmail = computed(() => currentUser.value?.app_metadata?.provider === "email")
const isDisabled = computed(() => !isEmail.value)

// Account header info based on login provider
const accountHeader = computed(() => {
  switch (currentUser.value?.app_metadata?.provider) {
    case "google":
      return {
        label: "Google Account",
        icon: "mr-2 pi pi-google",
        type: "google",
      }
    case "apple":
      return { label: "Apple Account", icon: "mr-2 pi pi-apple", type: "apple" }
    default:
      return { label: "Account", icon: "", type: null }
  }
})

// Fire edit profile sidebar if the user clicks on a field
const editField = () => {
  if (!isDisabled.value) {
    editProfileSideBar.value = true
  }
}

// handles tracking the station change event
const onUpdateStation = (data) => {
  if (!isLiveStream.value) {
    updateLiveStream(data.slug)
  }
  trackClickEvent(
    "Click Tracking - Default stream",
    "Account Dashboard - Listening Preferences",
    data.station
  )
}

// handles the dropdown menu click event
const clickThisMenu = (ref) => {
  ref.toggleDrawer()
}

onMounted(async () => {
  await getMembershipInfo()
})
</script>
<template>
  <div class="dashboard-page">
    <Html lang="en">
      <Head>
        <Title>
          User Account Dashboard | WNYC | New York Public Radio, Podcasts, Live Streaming
          Radio, News
        </Title>
        <Meta
          name="og:title"
          content="User Account Dashboard | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News"
        />
        <Meta
          name="twitter:title"
          content="User Account Dashboard | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News"
        />
      </Head>
    </Html>

    <section class="py-6">
      <!--   <h1>Dashboard</h1> -->

      <!-- User Profile Section -->
      <div v-if="currentUser" class="user-profile mb-6">
        <div class="">
          <SUser
            :disabled="isDisabled"
            :isEmail="isEmail"
            size="xlarge"
            text-size="text-lg md:text-4xl lg:text-5xl"
          />
        </div>
      </div>

      <h2 class="mb-4">Personal Information</h2>
      <!-- Account Information Section -->
      <div v-if="currentUser" class="account-info mb-6 grid grid-lggutter">
        <div class="col-12 md:col-6">
          <div class="card">
            <div class="flex justify-content-between flex-wrap align-items-end">
              <div>
                <p class="font-bold">Name</p>
                <p>{{ currentUserProfile?.name }}</p>
              </div>
              <Button
                v-if="!isDisabled"
                severity="secondary"
                variant="link"
                class="link -mb-1 -ml-2"
                @click="editField()"
                label="Update"
                size="small"
              ></Button>
            </div>
          </div>
        </div>
        <div class="col-12 md:col-6">
          <div class="card">
            <div class="flex justify-content-between flex-wrap align-items-end">
              <div>
                <p class="font-bold">
                  Email <span><i :class="`${accountHeader.icon}`"></i></span>
                </p>
                <p>{{ currentUserProfile?.email }}</p>
              </div>
              <Button
                v-if="!isDisabled"
                severity="secondary"
                variant="link"
                class="link -mb-1 -ml-2"
                @click="editField()"
                label="Update"
                size="small"
              ></Button>
            </div>
          </div>
        </div>
        <div class="col-12 md:col-6">
          <div class="card">
            <div class="flex justify-content-between flex-wrap align-items-end">
              <div>
                <p class="font-bold">Password</p>
                <p class="mt-2">••••••••••</p>
              </div>
              <Button
                v-if="!isDisabled"
                severity="secondary"
                variant="link"
                class="link -mb-1 -ml-2"
                @click="editField()"
                label="Update"
                size="small"
              ></Button>
            </div>
          </div>
        </div>
      </div>
      <!-- <pre>{{ profileData }}</pre> -->
      <!-- Member Profile Section -->
      <h2 class="mb-4">Member Center</h2>

      <div class="member-profile mb-6 grid grid-lggutter">
        <div v-if="currentUser && profileData && !isLoading" class="col-12 md:col-6">
          <div class="card">
            <div class="flex flex-wrap align-items-start gap-3">
              <img
                src="/cert.svg"
                alt="Membership certificate icon"
                class="max-w-4rem h-auto"
              />
              <div>
                <p class="font-bold">WNYC Member</p>
                <p>Last donation: {{ formatDate(profileData.lastDonationDate) }}</p>
                <Button
                  class="mt-3 px-3"
                  @click="editField()"
                  label="Manage Membership"
                  size="small"
                ></Button>
              </div>
            </div>
          </div>
        </div>
        <!-- loading skeleton for membership card -->
        <div v-else class="col-12 md:col-6">
          <div class="card">
            <div class="flex flex-wrap align-items-start gap-3">
              <Skeleton shape="circle" class="w-4rem h-4rem" />
              <div>
                <Skeleton width="7rem" class="mb-2" borderRadius="16px"></Skeleton>
                <Skeleton width="10rem" class="mb-1" borderRadius="16px"></Skeleton>
                <Skeleton
                  width="11rem"
                  height="2rem"
                  class="mt-3"
                  borderRadius="16px"
                ></Skeleton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- <div v-if="currentUser && profileData" class="member-profile mb-6">
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

      <h2 class="mb-4">Listening Preferences</h2>
      <div v-if="currentUser" class="account-info mb-6 grid grid-lggutter">
        <div class="col-12 md:col-6">
          <div class="card">
            <div class="flex justify-content-between flex-wrap align-items-end">
              <div>
                <p class="font-bold">Default Stream</p>
                <p>{{ currentUserProfile?.default_live_stream }}</p>
              </div>
              <Button
                v-if="!isDisabled"
                severity="secondary"
                variant="link"
                class="link -mb-1 -ml-2"
                @click="clickThisMenu(defaultStreamRef)"
                label="Update"
                size="small"
              ></Button>
            </div>
          </div>
          <DropupMenu
            v-if="currentUserProfile && allCurrentStations"
            ref="defaultStreamRef"
            id="default-stream"
            v-model="currentUserProfile.default_live_stream"
            :options="initializeStationList(allCurrentStations)"
            optionLabel="station"
            placeholder="Select a station"
            label="Default stream"
            width="auto"
            @change="onUpdateStation"
            checkMark
            blockClick
            class="hidden"
          />
        </div>
      </div>

      <!-- Edit Profile Sidebar -->
      <Drawer v-model="editProfileSideBar" position="right" class="edit-profile-sidebar">
        <EditProfile />
      </Drawer>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.dashboard-page {
  padding-bottom: 200px;
  background-color: var(--p-surface-25);
  section {
    max-width: $thinContentWidth;
    .card {
      background: var(--p-surface-0);
      border-radius: 10px;
      padding: 2rem 1.5rem;
    }

    .disabled {
      opacity: 60%;
      cursor: default !important;
      pointer-events: none;
      user-select: none;
    }

    .text-green-600 {
      color: #16a34a;
    }

    .text-gray-500 {
      color: #6b7280;
    }

    .actions {
      margin-top: 2rem;
    }
  }
}
</style>
