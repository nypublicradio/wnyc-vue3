<script async setup>
import VLoginWithEmail from '@nypublicradio/nypr-design-system-vue3/v2/src/components/supabase/VLoginWithEmail.vue'
import VLoginWithProvider from '@nypublicradio/nypr-design-system-vue3/v2/src/components/supabase/VLoginWithProvider.vue'
import VFlexibleLink from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VFlexibleLink.vue'

import { useEditProfileSideBar } from '~/composables/states'

const editProfileSideBar = useEditProfileSideBar()
</script>

<template>
  <div>
    <section class="login">
      <div class="flex mb-4">
        <Button
          class="back-btn text-color -ml-3"
          icon="pi pi-chevron-left"
          rounded
          text
          severity="secondary"
          aria-label="back to previous page"
          @click="
            () => {
              editProfileSideBar = false
            }
          "
        />
        <h1>Account</h1>
      </div>
    </section>
  </div>
</template>
