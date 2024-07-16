<script setup>
import { requestAccountDeletion } from "~/utilities/helpers"
import { useCurrentUserProfile } from "~/composables/states.ts"
import VFlexibleLink from "@nypublicradio/nypr-design-system-vue3/v2/src/components/VFlexibleLink.vue"
const currentUserProfile = useCurrentUserProfile()
</script>

<template>
  <div>
    <Html lang="en">
      <Head>
        <Title
          >Delete Account | WNYC | New York Public Radio, Podcasts, Live Streaming Radio,
          News</Title
        >
        <Meta
          name="og:title"
          content="Delete Account | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News"
        />
        <Meta
          name="twitter:title"
          content="Delete Account | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News"
        />
      </Head>
    </Html>
    <section>
      <div class="flex">
        <VFlexibleLink to="/home">
          <Button
            class="back-btn text-color -ml-3"
            icon="pi pi-chevron-left"
            rounded
            text
            severity="secondary"
            aria-label="back to home page"
          />
        </VFlexibleLink>
        <h1>Are you sure?</h1>
      </div>
    </section>
    <section class="flex flex-column">
      <p class="text-base mb-0">
        Are you sure you want to delete your WNYC account? You will be logged off and your
        saved content will be lost.
      </p>
      <div class="text-center">
        <div class="s-user my-8">
          <Avatar
            v-if="currentUserProfile?.avatar_image_url"
            :image="currentUserProfile?.avatar_image_url"
            size="large"
            shape="circle"
          />
          <div v-else class="p-avatar">
            <UserIcon />
          </div>
        </div>
        <Button class="px-8 mb-4" @click="requestAccountDeletion()" label="Delete" />
        <div class="mb-4 w-6 m-auto">
          <VFlexibleLink to="/home" aria-label="back to home page" class=""
            ><p class="p-3">Go back</p></VFlexibleLink
          >
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.s-user {
  .p-avatar {
    width: 123px;
    height: 123px;
    position: relative;
    flex: none;
    background-color: #ffffff;
    color: var(--night--500);
    border-radius: 50%;
    img {
      object-fit: cover;
    }
    svg {
      width: 80%;
      height: 80%;
    }
  }
}
</style>
<style lang="scss">
.s-user {
  .p-avatar {
    svg {
      path {
        fill: var(--night--500) !important;
      }
    }
  }
}
</style>
