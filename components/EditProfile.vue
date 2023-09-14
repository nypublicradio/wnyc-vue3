<script async setup>
import VLoginWithEmail from '@nypublicradio/nypr-design-system-vue3/v2/src/components/supabase/VLoginWithEmail.vue'
import VLoginWithProvider from '@nypublicradio/nypr-design-system-vue3/v2/src/components/supabase/VLoginWithProvider.vue'
import VFlexibleLink from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VFlexibleLink.vue'

import { useEditProfileSideBar } from '~/composables/states'

const editProfileSideBar = useEditProfileSideBar()
</script>

<template>
  <div class="login">
    <section>
      <SHeader label="Account" @close-sidebar="editProfileSideBar = false" />
    </section>
  </div>
</template>
