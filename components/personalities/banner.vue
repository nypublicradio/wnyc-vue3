<script setup>
import { mediaTypeRoutes } from "~/composables/globals.ts"
const bannerData = [
  {
    id: "rl",
    name: "Radio Lab",
    photo: "/personalities/rl.webp",
    bg: "/personalities/rl-bg.webp",
    bgSm: "/personalities/rl-bg-sm.webp",
    text: "/personalities/rl-text.webp",
    to: `${mediaTypeRoutes.show}radiolab`,
  },
  {
    id: "bls",
    name: "Brian Lehrer",
    photo: "/personalities/bls.webp",
    bg: "/personalities/bls-bg.webp",
    bgSm: "/personalities/bls-bg-sm.webp",
    text: "/personalities/bls-text.webp",
    to: `${mediaTypeRoutes.show}brian-lehrer-show`,
  },
  {
    id: "aoi",
    name: "All Of It",
    photo: "/personalities/aoi.webp",
    bg: "/personalities/aoi-bg.webp",
    bgSm: "/personalities/aoi-bg-sm.webp",
    text: "/personalities/aoi-text.webp",
    to: `${mediaTypeRoutes.show}all-of-it`,
  },
  {
    id: "otm",
    name: "On The Media",
    photo: "/personalities/otm.webp",
    bg: "/personalities/otm-bg.webp",
    bgSm: "/personalities/otm-bg-sm.webp",
    text: "/personalities/otm-text.webp",
    to: `${mediaTypeRoutes.show}on-the-media`,
  },
  {
    id: "nycnow",
    name: "NYC Now",
    photo: "/personalities/nycnow.webp",
    bg: "/personalities/nycnow-bg.webp",
    bgSm: "/personalities/nycnow-bg-sm.webp",
    text: "/personalities/nycnow-text.webp",
    to: `${mediaTypeRoutes.show}nyc-now`,
  },
]

// gsap looping animation cross fade code
const itemRefs = ref([])
const { $gsap } = useNuxtApp()

const tl = $gsap.timeline({ repeat: -1 })
onMounted(() => {
  const items = itemRefs.value.map((i) => i.$el || i)
  if (!items.length) return

  // Initialize
  // We assume the first item is visible via CSS/style initially, but let's enforce
  $gsap.set(items, { autoAlpha: 0 })
  $gsap.set(items[0], { autoAlpha: 1 })

  items.forEach((item, index) => {
    const nextItem = items[(index + 1) % items.length]

    tl.to(item, { autoAlpha: 0, duration: 1 })
      .set(nextItem.querySelector(".photo"), { scale: 1.1 }, "<")
      .to(
        nextItem.querySelector(".photo"),
        { scale: 1, duration: 5, transformOrigin: "right" },
        "<"
      )
      .to(nextItem, { autoAlpha: 1, duration: 1 }, "<")
  })
})
onUnmounted(() => {
  tl.kill()
})
</script>

<template>
  <div class="personality-banner">
    <VFlexibleLink
      v-for="(item, index) in bannerData"
      :key="item.id"
      :to="item.to"
      raw
      class="link p-ripple"
      v-ripple
      :alt="item.name"
      :ref="(el) => (itemRefs[index] = el)"
    >
      <div class="holder flex">
        <div class="bg-holder">
          <img
            :src="item.bg"
            :alt="item.name"
            class="bg hidden sm:block"
            :class="item.id"
          />
          <img
            :src="item.bgSm"
            :alt="item.name"
            class="bg block sm:hidden"
            :class="item.id"
          />
          <img
            :src="item.text"
            :alt="item.name"
            class="text absolute left-0 top-0"
            :class="item.id"
          />
        </div>
        <img
          :src="item.photo"
          :alt="item.name"
          class="photo"
          :class="item.id"
        />
      </div>
    </VFlexibleLink>
  </div>
</template>

<style lang="scss" scoped>
.personality-banner {
  overflow: hidden;
  position: relative;
  border-radius: var(--p-border-radius-xl);
  width: 100%;
  aspect-ratio: 2752/740;

  .link {
    position: absolute !important;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    .holder {
      width: 100%;
      height: 100%;
      overflow: hidden;
      .bg-holder {
        z-index: 2;
      }
      img {
        width: 100%;
        height: 100%;
        &.photo {
          position: absolute;
          z-index: 1;
          right: 0;
          top: 0%;
          height: 100%;
          width: auto;
        }
      }
    }
    :deep(.p-ink) {
      z-index: 3;
    }
  }
  @include media("<md") {
    min-height: 200px;
    .link {
      .holder {
        width: unset;
        img {
          &.bg {
            width: auto;
            margin-left: calc(40vw - 385px);
            width: auto;
          }
          @include media("<sm") {
            &.bg {
              width: auto;
              margin-left: 0;
              width: auto;
            }
          }
          &.photo {
            width: auto;

            &.otm {
              right: calc(15.48vw - 80px);
            }
            &.rl {
              right: calc(15.48vw - 145px);
            }
            &.bls {
              right: calc(15.48vw - 115px);
            }
            &.aoi {
              right: calc(15.48vw - 130px);
            }
            &.nycnow {
              right: calc(15.48vw - 130px);
            }
          }
          &.text {
            width: auto;
            margin-left: -55px;
            height: 180px;
          }
        }
      }
    }
  }
  @include media("<xs") {
    min-height: 50vw;
    .link {
      .holder {
        img {
          &.text {
            height: 50vw;
          }
        }
      }
    }
  }
}
</style>
