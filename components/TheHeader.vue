<script setup>
import { trackClickEvent, getDate } from "~/utilities/helpers"

import {
  useSettingSideBar,
  useIsNetworkConnected,
  useIsApp,
  useCurrentUser,
  useCurrentUserProfile,
} from "~/composables/states.ts"

const config = useRuntimeConfig()
const settingsSideBar = useSettingSideBar()
const isNetworkConnected = useIsNetworkConnected()
const isApp = useIsApp()
const currentUser = useCurrentUser()
const currentUserProfile = useCurrentUserProfile()

const donateButtonText = ref(null)
const donateButtonLink = ref(null)

const menuData = ref(null)

// get menu data from CMS
const { data } = await useFetch("https://cms.demo.nypr.digital/api/v2/navigation/3/")
if (data) {
  menuData.value = data.value
}
console.log("menuData", menuData.value.primary_navigation)
// check if donate button should be visible and get the button link and text
const { data: messageData } = await useFetch(`${config.public.SYSTEM_MESSAGES_API}`)
if (messageData.value?.product_banners?.length > 0) {
  messageData.value.product_banners.forEach((banner) => {
    if (banner.value?.title === "WNYC App Donate Button") {
      donateButtonText.value = banner.value?.button_text
      donateButtonLink.value = banner.value?.button_link
    }
  })
}

const handleLogoClick = () => {
  navigateTo("/home")
  trackClickEvent("Click Tracking - Header WNYC Logo", "Header", "WNYC Logo")
}

const items = ref([
  {
    label: "Live Radio",
    icon: "",
    items: [
      [
        {
          label: "Live Radio",
          items: [
            { label: "Accessories", url: "/live" },
            { label: "Armchair" },
            { label: "Coffee Table" },
            { label: "Couch" },
            { label: "TV Stand" },
          ],
        },
      ],
      [
        {
          label: "Kitchen",
          items: [{ label: "Bar stool" }, { label: "Chair" }, { label: "Table" }],
        },
        {
          label: "Bathroom",
          items: [{ label: "Accessories" }],
        },
      ],
      [
        {
          label: "Bedroom",
          items: [
            { label: "Bed" },
            { label: "Chaise lounge" },
            { label: "Cupboard" },
            { label: "Dresser" },
            { label: "Wardrobe" },
          ],
        },
      ],
      [
        {
          label: "Office",
          items: [
            { label: "Bookcase" },
            { label: "Cabinet" },
            { label: "Chair" },
            { label: "Desk" },
            { label: "Executive Chair" },
          ],
        },
      ],
    ],
  },
  {
    label: "Electronics",
    icon: "pi pi-mobile",
    items: [
      [
        {
          label: "Computer",
          items: [
            { label: "Monitor" },
            { label: "Mouse" },
            { label: "Notebook" },
            { label: "Keyboard" },
            { label: "Printer" },
            { label: "Storage" },
          ],
        },
      ],
      [
        {
          label: "Home Theater",
          items: [{ label: "Projector" }, { label: "Speakers" }, { label: "TVs" }],
        },
      ],
      [
        {
          label: "Gaming",
          items: [
            { label: "Accessories" },
            { label: "Console" },
            { label: "PC" },
            { label: "Video Games" },
          ],
        },
      ],
      [
        {
          label: "Appliances",
          items: [
            { label: "Coffee Machine" },
            { label: "Fridge" },
            { label: "Oven" },
            { label: "Vaccum Cleaner" },
            { label: "Washing Machine" },
          ],
        },
      ],
    ],
  },
  {
    label: "Sports",
    icon: "pi pi-clock",
    items: [
      [
        {
          label: "Football",
          items: [
            { label: "Kits" },
            { label: "Shoes" },
            { label: "Shorts" },
            { label: "Training" },
          ],
        },
      ],
      [
        {
          label: "Running",
          items: [
            { label: "Accessories" },
            { label: "Shoes" },
            { label: "T-Shirts" },
            { label: "Shorts" },
          ],
        },
      ],
      [
        {
          label: "Swimming",
          items: [
            { label: "Kickboard" },
            { label: "Nose Clip" },
            { label: "Swimsuits" },
            { label: "Paddles" },
          ],
        },
      ],
      [
        {
          label: "Tennis",
          items: [
            { label: "Balls" },
            { label: "Rackets" },
            { label: "Shoes" },
            { label: "Training" },
          ],
        },
      ],
    ],
  },
])
</script>

<template>
  <div class="the-header">
    <div class="top">
      <section class="full-width">
        <div class="flex justify-content-between align-items-center">
          <div class="flex align-items-center">
            <WnycLogo class="wnyc-logo cursor-pointer" @click="handleLogoClick" />

            <span v-if="isApp" class="head-date font-meta ml-3">{{ getDate() }}</span>
          </div>
          <div class="flex gap-3 sm:gap-4 align-items-center">
            <VFlexibleLink
              v-if="!isApp"
              class="get-app-button"
              raw
              to="/mobile"
              @flexible-link-click="
                trackClickEvent(
                  `Click Tracking - Header Get the App Button`,
                  'Header',
                  'Get the App Button'
                )
              "
            >
              <Button
                label="Get the App"
                aria-label="Get the App button"
                size="small"
                variant="link"
              >
                <template #icon>
                  <DevicesIcon />
                </template>
              </Button>
            </VFlexibleLink>
            <VFlexibleLink
              v-if="!isApp"
              class="hidden md:block"
              :class="{ 'user-logged-in': currentUser }"
              raw
              to="/login"
              @flexible-link-click="
                trackClickEvent(
                  `Click Tracking - Header Log in/Sign up Button`,
                  'Header',
                  'Log in/Sign up Button'
                )
              "
            >
              <Button
                :label="`${
                  currentUser ? 'Hi, ' + currentUserProfile.name : 'Log in/Sign up'
                }`"
                aria-label="Log in/Sign up button"
                severity="secondary"
                size="small"
                variant="link"
                :disabled="currentUser"
              >
                <template #icon>
                  <UserIcon />
                </template>
              </Button>
            </VFlexibleLink>
            <VFlexibleLink
              v-if="donateButtonText && donateButtonLink"
              raw
              :to="donateButtonLink"
              @flexible-link-click="
                trackClickEvent(
                  `Click Tracking - Header Donate Button`,
                  'Header',
                  'Donate Button'
                )
              "
            >
              <Button
                :label="donateButtonText"
                aria-label="donate"
                class="px-3 sm:px-5 -mr-2"
              />
            </VFlexibleLink>

            <Button
              :disabled="!isNetworkConnected"
              icon="pi pi-bars"
              class="p-button-text -mr-2"
              severity="secondary"
              aria-label="settings menu"
              @click="
                () => {
                  settingsSideBar = true
                  trackClickEvent(
                    'Click Tracking - Header Hamburger Menu',
                    'Header',
                    `Open Sidebar`
                  )
                }
              "
            />
          </div>
        </div>
      </section>
    </div>
    <div v-if="!isApp && menuData" class="bottom hidden lg:block">
      <section class="full-width py-0 -mt-2">
        <Divider class="my-0" />
      </section>
      <section class="content full-width py-1">
        <MegaMenu :model="items">
          <template #item="{ item, index }">
            <VFlexibleLink
              :key="index"
              raw
              :to="item.url"
              @flexible-link-click="
                trackClickEvent(
                  `Click Tracking - Header ${item.label} Button`,
                  'Header',
                  `${item.label} Button`
                )
              "
            >
              <Button
                raw
                :label="item.label"
                :aria-label="`${item.label} button`"
                severity="secondary"
                size="small"
                variant="link"
              />
            </VFlexibleLink>
            <!-- <div v-if="activeItemIndex === index && item.items">
                <div v-for="(column, colIndex) in item.items" :key="colIndex">
                  <div v-for="(subItem, subIndex) in column" :key="subIndex">
                    {{ subItem.label }}
                    <div v-if="subItem.items">
                      <div
                        v-for="(nestedItem, nestedIndex) in subItem.items"
                        :key="nestedIndex"
                      >
                        <a :href="nestedItem.to">
                          {{ nestedItem.label }}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div> -->
          </template>
        </MegaMenu>
        <!-- <div class="flex gap-3">
          <VFlexibleLink
            v-for="(item, index) in menuData.primary_navigation"
            :key="index"
            raw
            :to="item.value.url"
            @flexible-link-click="
              trackClickEvent(
                `Click Tracking - Header ${item.value.title} Button`,
                'Header',
                `${item.value.title} Button`
              )
            "
          >
            <Button
              raw
              :label="item.value.title"
              :aria-label="`${item.value.title} button`"
              severity="secondary"
              size="small"
              variant="link"
            />
          </VFlexibleLink>
        </div> -->
      </section>
    </div>
  </div>
</template>

<style lang="scss">
.the-header {
  background: var(--header-background);
  backdrop-filter: blur(4px);
  border: 1px solid var(--stroke-toggle-color);
  .top {
    height: var(--header-height);
    display: flex;
    .pi-bars {
      font-size: var(--font-size-8);
    }
    .head-date {
      font-family: var(--font-family-header);
      line-height: 1rem;
      font-size: 0.9rem;
      @include media("<xs") {
        display: none;
      }
    }
    .wnyc-logo {
      width: 120px;
      @include media("<lg") {
        width: 100px;
      }
      @include media("<md") {
        width: 75px;
      }
    }
    .get-app-button {
      @include media("<425px") {
        display: none;
      }
    }
    .user-logged-in {
      .p-button {
        opacity: 1;
      }
    }
  }
  .bottom {
    height: var(--header-bottom-height);
    .content {
      margin-left: -12px;
      .p-button-label {
        font-weight: 700;
      }
    }
  }
}
</style>
