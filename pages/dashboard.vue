<script setup lang="ts">
import { logOutUser, getAndSetUserProfile } from "~/utilities/helpers"
import {
  useCurrentUser,
  useCurrentUserProfile,
  useEditProfileSideBar,
} from "~/composables/states"
import { useProfileApi } from "~/composables/useProfileApi"

const currentUser = useCurrentUser()
const currentUserProfile = useCurrentUserProfile()
const editProfileSideBar = useEditProfileSideBar()

// Profile API composable for member profile data
const { profileData, isLoading, error, fetchProfile, formatCurrency, formatDate } = useProfileApi()

// Handler for the logout button
const onLogout = () => {
  logOutUser()
  navigateTo("/home")
}

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
const editField = (field) => {
  if (!isDisabled.value) {
    editProfileSideBar.value = true
  }
}

// Fetch user profile and member data on mount
onMounted(async () => {
  if (currentUser.value) {
    await getAndSetUserProfile()
    
    console.log('🐛 Dashboard Debug - User Profile:', currentUserProfile.value)
    console.log('🐛 Dashboard Debug - Has Salesforce ID:', !!currentUserProfile.value?.salesforce_id)
    console.log('🐛 Dashboard Debug - Salesforce ID Value:', currentUserProfile.value?.salesforce_id)
    
    // Fetch profile data from /api/profile if user has a Salesforce ID
    if (currentUserProfile.value?.salesforce_id) {
      console.log('🐛 Dashboard Debug - Fetching profile with Salesforce ID:', currentUserProfile.value.salesforce_id)
      await fetchProfile(currentUserProfile.value.salesforce_id)
    } else if (currentUser.value?.email) {
      console.log('🐛 Dashboard Debug - No Salesforce ID, trying email lookup:', currentUser.value.email)
      await fetchProfile(undefined, currentUser.value.email)
    } else {
      console.log('🐛 Dashboard Debug - No Salesforce ID or email found. Member profile data will not be available.')
    }
  }
})
</script>
<template>
  <section class="py-6">
    <h1>Dashboard</h1>
    
    <!-- User Profile Section -->
    <div v-if="currentUser" class="user-profile mb-6">
      <div class="card">
        <SUser :disabled="isDisabled" :isEmail="isEmail" />
      </div>
    </div>

    <!-- Account Information Section -->
    <div v-if="currentUser" class="account-info mb-6">
      <div class="card">
        <div class="flex align-items-center mb-4">
          <i :class="`${accountHeader.icon}`"></i>
          <h2 class="ml-2 mb-0">{{ accountHeader.label }}</h2>
        </div>
        
        <SBox
          v-if="currentUserProfile?.name"
          label="Name"
          @click="editField('name')"
          :clickable="!isDisabled"
          :ripple="!isDisabled"
        >
          <p :class="[{ disabled: isDisabled }]">{{ currentUserProfile?.name }}</p>
        </SBox>
        
        <SBox
          label="Email"
          @click="editField('email')"
          :clickable="!isDisabled"
          :ripple="!isDisabled"
        >
          <p :class="[{ disabled: isDisabled }]">{{ currentUser?.email }}</p>
        </SBox>
        
        <SBox
          label="Password"
          v-if="isEmail"
          @click="editField('password')"
          :clickable="!isDisabled"
          :ripple="!isDisabled"
        >
          <p :class="[{ disabled: isDisabled }]">*********</p>
        </SBox>
      </div>
    </div>

    <!-- Member Profile Section -->
    <div v-if="currentUser && profileData" class="member-profile mb-6">
      <div class="card">
        <div class="flex align-items-center mb-4">
          <i class="mr-2 pi pi-user"></i>
          <h2 class="mb-0">Member Profile</h2>
        </div>
        
        <SBox label="Member Name" :ripple="false">
          <p>{{ profileData.name || 'N/A' }}</p>
        </SBox>
        
        <SBox label="Active Sustainer" :ripple="false">
          <p :class="profileData.isActiveSustainer ? 'text-green-600' : 'text-gray-500'">
            {{ profileData.isActiveSustainer ? 'Yes' : 'No' }}
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
        
        <div v-if="profileData.activeRecurringDonations && profileData.activeRecurringDonations.length > 0">
          <SBox 
            v-for="(donation, index) in profileData.activeRecurringDonations" 
            :key="donation.springboardId"
            :label="`Active Donation ${index + 1}`" 
            :ripple="false"
          >
            <div class="text-right">
              <p class="font-medium">{{ donation.brand }}</p>
              <p>{{ formatCurrency(donation.amount) }}</p>
              <p class="text-sm opacity-75">Next charge: {{ formatDate(donation.nextChargeDate) }}</p>
              <p class="text-xs opacity-60">Member since: {{ formatDate(donation.membershipStartDate) }}</p>
            </div>
          </SBox>
        </div>
      </div>
    </div>
    
    <!-- Loading state for member profile -->
    <div v-else-if="currentUser && isLoading" class="member-profile mb-6">
      <div class="card">
        <div class="flex align-items-center mb-4">
          <i class="mr-2 pi pi-user"></i>
          <h2 class="mb-0">Member Profile</h2>
        </div>
        <p>Loading member profile...</p>
      </div>
    </div>

    <!-- Actions -->
    <div class="actions">
      <Button label="Logout" @click="onLogout" severity="secondary" />
    </div>

    <!-- Edit Profile Sidebar -->
    <Drawer v-model:visible="editProfileSideBar" position="right" class="edit-profile-sidebar">
      <EditProfile />
    </Drawer>
  </section>
</template>

<style lang="scss" scoped>
.card {
  background: var(--p-surface-0);
  border: 1px solid var(--p-surface-border);
  border-radius: var(--p-border-radius);
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.user-profile,
.account-info,
.member-profile {
  max-width: 600px;
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
</style>
