<script setup>
import VImage from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VImage.vue'
// TEMP fix to make ripple work
import { usePrimeVue } from 'primevue/config'
import {
  deleteFavorite,
  saveFavorite
} from '~/utilities/helpers'

const $primevue = usePrimeVue()
defineExpose({
  $primevue,
})

const emit = defineEmits(['onClick'])

const props = defineProps({
  show: {
    type: Object,
    default: {},
    required: true,
  },
})

// if user is logged in, check if item is already favorited
const client = useSupabaseClient()
const isFavorited = ref(false)
const user = useCurrentUser()
if (user.value) {
  const { data, error } = await client
    .from('favorited')
    .select('*')
    .eq('uid', user.value.id)
    .eq('media_slug', props.show.slug)
    if(data?.length > 0){
      isFavorited.value = true
    }
    if(error){
      console.log('favorited items error', error)
    }
}

// add item to favorites
const addFavorite = async () => {
  saveFavorite(props.show, 'show')
  isFavorited.value = true
}

// remove item from favorites
const removeFavorite = async () => {
  deleteFavorite(props.show, 'show')
  isFavorited.value = false
}
</script>

<template>
  <div
    class="browse-item flex justify-content-between align-items-center p-ripple"
  >
    <div class="flex gap-3 w-full" v-ripple @click.prevent="emit('onClick')">
      <VImage
        :src="props.show.image.template"
        :height="72"
        :width="72"
        :ratio="[1, 1]"
        :srcset="[2]"
        class="flex-none"
        style="
          min-height: 72px;
          min-width: 72px;
          background-color: var(--background2);
        "
      />
      <div class="flex gap-1 flex-column align-items-start">
        <!-- <LiveBadge v-if="props.show.isLive" class="mb-1" /> -->
        <h2>{{ props.show.title }}</h2>
        <p v-for="org in props.show?.producingOrganizations" :key="org.name">
          {{ org.name }}
        </p>
      </div>
    </div>
    <Button v-if="user" text plain rounded class="flex-none">
      <template #icon>
        <StarIcon v-if="isFavorited" class="h-2rem" :active="true" @click="removeFavorite" />
        <StarIcon v-else class="h-2rem" :active="false" @click="addFavorite" />
      </template>
    </Button>
  </div>
</template>

<style lang="scss" scoped>
.browse-item {
}
</style>
