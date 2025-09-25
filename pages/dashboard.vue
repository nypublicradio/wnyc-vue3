<script setup lang="ts">
import {
  useCurrentUser,
  useCurrentUserProfile,
  useEditProfileSideBar,
  useAllCurrentStations,
  useIsLiveStream,
} from "~/composables/states"
import { trackClickEvent, initializeStationList } from "~/utilities/helpers"

const currentUser = useCurrentUser()
const currentUserProfile = useCurrentUserProfile()
const editProfileSideBar = useEditProfileSideBar()
const allCurrentStations = useAllCurrentStations()
const isLiveStream = useIsLiveStream()

const defaultStreamRef = ref(null)

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
    <!-- <md break point -->
    <div class="py-5 block md:hidden">
      <!--   <h1>Dashboard</h1> -->
      <Settings v-if="currentUser" />
    </div>
    <!-- >= md break point -->
    <section class="py-6 hidden md:block">
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
      <div
        v-if="currentUser"
        class="account-info mb-6 grid grid-lggutter mobile-lggutter"
      >
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
      <!-- Member Profile Section -->
      <h2 class="mb-4">Member Center</h2>
      <MemberCenter />

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
      @include media("<md") {
        padding: 1rem 1.5rem;
      }
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
