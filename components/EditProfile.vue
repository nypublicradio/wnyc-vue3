<script async setup>
//import VSignupWithEmail from '@nypublicradio/nypr-design-system-vue3/v2/src/components/supabase/VSignupWithEmail.vue'
//import VFlexibleLink from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VFlexibleLink.vue'

import { useEditProfileSideBar } from '~/composables/states'
const editProfileSideBar = useEditProfileSideBar()
</script>

<template>
  <div class="login">
    <section>
      <SHeader label="Account" @close-sidebar="editProfileSideBar = false" />
    </section>
    <section>
      <SUpdateAccount label="Save">
        <template #belowSubmit>
          <Button
            label="Cancel"
            link
            class="mt-4 w-full"
            @click="editProfileSideBar = false"
          />
        </template>
      </SUpdateAccount>
    </section>
  </div>
</template>
