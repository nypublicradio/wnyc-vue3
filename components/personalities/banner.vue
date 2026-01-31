<script setup>
import { mediaTypeRoutes } from "~/composables/globals.ts"
const bannerData = [
  {
    id: "rl",
    name: "Radio Lab",
    photo: "/personalities/rl.webp",
    bg: "/personalities/rl-bg.webp",
    to: `${mediaTypeRoutes.show}radiolab`,
  },
  {
    id: "bls",
    name: "Brian Lehrer",
    photo: "/personalities/bls.webp",
    bg: "/personalities/bls-bg.webp",
    to: `${mediaTypeRoutes.show}bl`,
  },
  {
    id: "aoi",
    name: "All Of It",
    photo: "/personalities/aoi.webp",
    bg: "/personalities/aoi-bg.webp",
    to: `${mediaTypeRoutes.show}all-of-it`,
  },
  {
    id: "otm",
    name: "On The Media",
    photo: "/personalities/otm.webp",
    bg: "/personalities/otm-bg.webp",
    to: `${mediaTypeRoutes.show}otm`,
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
        <img :src="item.bg" :alt="item.name" class="bg" />
        <img :src="item.photo" :alt="item.name" class="photo" />
      </div>
    </VFlexibleLink>
  </div>
</template>

<style lang="scss" scoped>
.personality-banner {
  overflow: hidden;
  position: relative;
  border-radius: 10px;
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
      img {
        width: 100%;
        height: 100%;
        z-index: 2;
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
    min-height: 130px;
    .link {
      .holder {
        width: unset;
        img {
          &.bg {
            width: auto;
            margin-left: -20px;
          }
        }
      }
    }
  }
  @include media("<500px") {
    min-height: 100px;
  }
}
</style>
