<script setup>
import {
  trackClickEvent,
  getYear,
  setDarkMode,
  initializeStationList,
  capitalizeFirstLetter,
} from "~/utilities/helpers"
import { appMenuOptions } from "~/composables/globals"
import { useProfileSetting } from "~/composables/useProfileSetting"

const config = useRuntimeConfig()
const defaultStreamRef = ref(null)
const textSizeRef = ref(null)

const {
  currentUser,
  currentUserProfile,
  isApp,
  allCurrentStations,
  textSizeOptions,
  masterNotificationChannelsArray,
  isEmail,
  isDisabled,
  tempEmail,
  accountHeader,
  showNotificationTypes,
  customDefaultStationLabel,
  editField,
  onUpdateTextSize,
  onUpdateStation,
  onUpdateContinuousPlay,
  handleNotificationChange,
  handleNotificationChannelChange,
  onDeleteAccountClick,
  onNavButtons,
} = useProfileSetting()

// lets a click anywhere on the SBox row open its DropupMenu
const clickThisMenu = (ref, event) => {
  ref.toggleMenu(event)
}
</script>

<template>
  <div class="settings">
    <div class="user pl-4 pb-6 md:pl-0">
      <SUser
        :disabled="isDisabled"
        :isEmail="isEmail"
        size="xlarge"
        text-size="text-lg md:text-4xl lg:text-5xl"
      />
    </div>
    <div v-if="isApp" class="app-menu mb-5">
      <SBox
        v-for="item in appMenuOptions"
        :key="item.value"
        :is-route="false"
        :label="capitalizeFirstLetter(item.value)"
        :ripple="true"
        textClass="text-lg"
        @click="onNavButtons(item.slug)"
      />
    </div>
    <section v-if="currentUser" class="user-preferences p-0">
      <div class="flex s-title-holder align-items-center gap-2">
        <div class="s-title">{{ accountHeader.label }}</div>
        <i :class="`${accountHeader.icon}`"></i>
      </div>
      <div class="block md:hidden">
        <SBox
          v-if="currentUserProfile"
          label="Name"
          @click="editField('name')"
          :clickable="!isDisabled"
          :ripple="!isDisabled"
        >
          <p :class="[{ disabled: isDisabled }]">
            {{ currentUserProfile?.name || "User" }}
          </p>
        </SBox>
        <SBox
          label="Email"
          @click="editField('email')"
          :clickable="!isDisabled"
          :ripple="!isDisabled"
        >
          <p :class="[{ disabled: isDisabled }]">
            {{ tempEmail }}
          </p>
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
      <!-- >= md break point -->
      <div
        class="hidden md:flex account-info mb-6 grid grid-lggutter mobile-lggutter"
      >
        <div class="col-12 md:col-6">
          <div class="card">
            <div class="flex justify-content-between flex-wrap align-items-end">
              <div>
                <p class="font-bold">Name</p>
                <p>{{ currentUserProfile?.name || "User" }}</p>
              </div>
              <Button
                v-if="!isDisabled"
                severity="secondary"
                variant="link"
                class="link -mb-1 -ml-2"
                @click="editField('name')"
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
                <p>{{ tempEmail }}</p>
              </div>
              <Button
                v-if="!isDisabled"
                severity="secondary"
                variant="link"
                class="link -mb-1 -ml-2"
                @click="editField('email')"
                label="Update"
                size="small"
              ></Button>
            </div>
          </div>
        </div>
        <div v-if="isEmail" class="col-12 md:col-6">
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
                @click="editField('password')"
                label="Update"
                size="small"
              ></Button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Member Center Section -->
    <section v-if="currentUser" class="member-center p-0">
      <div class="flex s-title-holder">
        <div class="s-title">Member Center</div>
      </div>

      <!--  <SBoxEmpty :clickable="false" :ripple="false" class="py-2"> -->
      <MemberCenter class="px-3 md:px-0 m-0 grid-nogutter mx-0" />
      <!-- </SBoxEmpty> -->
    </section>

    <section class="listening-preferences p-0">
      <div class="flex s-title-holder">
        <div class="s-title">Listening Preferences</div>
      </div>
      <div v-if="currentUser">
        <SBox
          v-if="
            currentUserProfile?.default_live_stream &&
            allCurrentStations?.length > 0
          "
          label="Default stream"
          class="md:hidden cursor-pointer"
          @click="(e) => clickThisMenu(defaultStreamRef, e)"
        >
          <DropupMenu
            ref="defaultStreamRef"
            v-model="currentUserProfile.default_live_stream"
            :options="initializeStationList(allCurrentStations)"
            label="Default stream"
            @change="onUpdateStation"
            blockClick
            checkMark
          />
        </SBox>
        <div
          v-if="currentUserProfile?.default_live_stream"
          class="hidden md:flex account-info mb-6 grid grid-lggutter"
        >
          <div class="col-12 md:col-6">
            <div class="card">
              <div
                class="flex justify-content-between flex-wrap align-items-end"
              >
                <div>
                  <p class="font-bold">Default Stream</p>
                  <p>{{ customDefaultStationLabel }}</p>
                </div>

                <DropupMenu
                  v-model="currentUserProfile.default_live_stream"
                  :options="initializeStationList(allCurrentStations)"
                  label="Default stream"
                  @change="onUpdateStation"
                  checkMark
                >
                  <template #customButton>
                    <Button
                      v-if="!isDisabled"
                      severity="secondary"
                      variant="link"
                      class="link -mb-1 -ml-2"
                      label="Update"
                      size="small"
                    />
                  </template>
                </DropupMenu>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="currentUserProfile" class="md:col-6">
        <SBox label="Continuous play" :ripple="false" class="">
          <VToggleSwitch
            yes="ON"
            no="OFF"
            v-model:data="currentUserProfile.continuous_play"
            @change="onUpdateContinuousPlay"
          />
        </SBox>
      </div>
    </section>
    <section v-if="isApp" class="notifications p-0">
      <div class="flex s-title-holder">
        <div class="s-title">Notifications</div>
      </div>
      <SBox
        v-if="currentUserProfile?.receive_general_notifications !== undefined"
        label="Allow Notifications"
        :ripple="false"
      >
        <VToggleSwitch
          yes="ON"
          no="OFF"
          v-model:data="currentUserProfile.receive_general_notifications"
          @change="handleNotificationChange"
        />
      </SBox>
    </section>
    <section v-if="showNotificationTypes" class="notifications p-0">
      <div class="flex s-title-holder">
        <div class="s-title">Notification Types</div>
      </div>

      <SBox
        v-for="channel in masterNotificationChannelsArray"
        :label="channel.label"
        :description="channel.description"
        :key="channel.key"
        :ripple="false"
      >
        <VToggleSwitch
          yes="ON"
          no="OFF"
          v-model:data="
            currentUserProfile.one_signal_notification_channels.find(
              (c) => c.key === channel.key
            ).value
          "
          @change="handleNotificationChannelChange(channel)"
        />
      </SBox>
      <!-- 
      <SBox
        label="System options"
        :ripple="true"
        @click="
          () => {
            toSystemSettings()
            trackClickEvent(
              'Click Tracking - System options',
              'Settings Sidebar',
              'System options'
            )
          }
        "
      ></SBox> -->
    </section>
    <section v-if="isApp" class="display p-0">
      <div class="flex s-title-holder">
        <div class="s-title">Display</div>
      </div>
      <!-- <pre class="text-xs">{{ currentUserProfile }}</pre> -->
      <SBox
        v-if="currentUserProfile?.text_size"
        label="Text size"
        class="cursor-pointer"
        @click="(e) => clickThisMenu(textSizeRef, e)"
      >
        <DropupMenu
          ref="textSizeRef"
          v-model="currentUserProfile.text_size"
          :options="textSizeOptions"
          label="Text Size"
          blockClick
          checkMark
          @change="onUpdateTextSize"
        />
      </SBox>
      <SBox
        v-if="currentUserProfile?.dark_mode !== undefined"
        label="Dark theme"
        :ripple="false"
      >
        <VToggleSwitch
          yes="ON"
          no="OFF"
          v-model:data="currentUserProfile.dark_mode"
          @change="
            () => {
              setDarkMode(currentUserProfile.dark_mode)
              trackClickEvent(
                'Click Tracking - Dark theme',
                'Settings Sidebar - Display',
                currentUserProfile.dark_mode
              )
            }
          "
        />
      </SBox>
      <!-- <p><pre>{{ currentUserProfile }}</pre></p> -->
    </section>
    <section v-if="isApp" class="wnyc p-0">
      <div class="flex s-title-holder">
        <div class="s-title">WNYC</div>
      </div>
      <!-- <SBox
        label="Member Center"
        :link="memberCenterLink"
        @linkClick="
          (link) => {
            trackClickEvent(
              'Click Tracking - Member Center',
              'Settings Sidebar - links',
              link
            )
          }
        "
      ></SBox> -->
      <SBox
        label="Donate"
        :link="config.public.SETTINGS_MENU_DONATION_URL"
        :ripple="false"
        @linkClick="
          (link) => {
            trackClickEvent(
              'Click Tracking - Donate',
              'Settings Sidebar - links',
              link
            )
          }
        "
      ></SBox>
      <SBox
        label="Submit app feedback"
        link="https://www.surveymonkey.com/r/wnyc-app-feedback-settings-menu"
        :ripple="false"
        @linkClick="
          (link) => {
            trackClickEvent(
              'Click Tracking - Submit app feedback',
              'Settings Sidebar - links',
              link
            )
          }
        "
      ></SBox>
      <SBox
        label="Get tech support"
        link="https://newyorkpublicradio.my.site.com/wnyc/s/topic/0TO5f0000009Eq7GAE/website-app-help"
        :ripple="false"
        @linkClick="
          (link) => {
            trackClickEvent(
              'Click Tracking - Get tech support',
              'Settings Sidebar - links',
              link
            )
          }
        "
      ></SBox>
      <SBox
        label="Contact us"
        link="https://newyorkpublicradio.my.site.com/wnyc/s/"
        :ripple="false"
        @linkClick="
          (link) => {
            trackClickEvent(
              'Click Tracking - Contact Us',
              'Settings Sidebar - links',
              link
            )
          }
        "
      ></SBox>
      <SBox
        v-if="currentUser"
        :is-route="true"
        label="Delete account"
        :ripple="false"
        @click="onDeleteAccountClick"
      >
      </SBox>
    </section>
    <section v-if="isApp" class="footer mb-4">
      <WnycLogo style="fill: var(--bw-toggle)" />
      <p>© {{ getYear() }} New York Public Radio. All rights reserved.</p>
      <p>Version {{ config.public.APP_VERSION }}</p>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.settings {
  @include media(">=md") {
    padding: 0.75rem 1.5rem;
  }
  section {
    margin-bottom: 30px;
  }

  .s-title-holder {
    margin-bottom: 1rem;

    .s-title {
      @include font-config($type-header2);
      @include media("<md") {
        font-size: 1rem;
        padding-left: 1.25rem;
      }
    }

    .pi {
      color: var(--p-text-color);
    }
  }

  .user-preferences {
    p.disabled {
      opacity: 60%;
      cursor: default !important;
      pointer-events: none;
      user-select: none;
    }
  }

  .footer {
    text-align: center;

    .wnyc-logo {
      width: 60px;
      height: auto;
      margin-bottom: 10px;
      fill: var(--p-surface-950);
    }
  }

  .p-inplace {
    .p-inplace-display {
      @include font-config($type-paragraph1);
    }
  }

  .p-button.p-button-icon-only {
    width: 2.357rem;
    padding: 0.5rem 0;
  }

  .settings-message {
    position: absolute;
    top: calc(env(safe-area-inset-top) + 40px);
    left: 0;
    right: 0;
  }
  .card {
    height: 100%;
    background: var(--s-box-background-color);
    border-radius: var(--p-border-radius-xl);
    padding: 2rem 1.5rem;
    @include media("<md") {
      padding: 1rem 1.5rem;
    }
  }
}
</style>

<style lang="scss">
.settings {
  .p-inplace {
    margin-right: -1rem;
    width: 80%;

    .p-inplace-display {
      width: 100%;
      position: relative;
      display: block;
      text-align: right;
      @include font-config($type-paragraph1);
    }

    .p-inplace-content {
      display: flex;
      justify-content: flex-end;

      .p-inputtext {
        // text-align: right;
        // width: 100%;
        @include font-config($type-paragraph1);
      }
    }
  }

  .p-button.p-button-icon-only {
    width: 2.357rem;
    padding: 0.5rem 0;
  }
}
</style>