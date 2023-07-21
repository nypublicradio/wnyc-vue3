<script setup>
import VFlexibleLink from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VFlexibleLink.vue'
import { ref, computed, onMounted } from 'vue'
import { useSettingsData, useAllCurrentStations } from '~/composables/states.ts'
const props = defineProps({
  data: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:data'])
const settingsData = useSettingsData()

const internalData = ref(props.data)

const toggleLogged = (e) => {
  internalData.value = !internalData.value
  emit('update:data', internalData.value)
}
</script>

<template>
  <div class="s-user flex gap-3">
    <Avatar
      icon="pi pi-user"
      size="large"
      style="background-color: #ffffff; color: var(--night)"
      shape="circle"
    />
    <div v-if="internalData" class="info flex flex-column gap-2">
      <h1>Hi, {{ settingsData.name }}</h1>
      <VFlexibleLink to="#" @click="toggleLogged(!internalData.value)"
        >Log out</VFlexibleLink
      >
    </div>
    <div v-else class="info flex flex-column gap-3">
      <h1>You are logged out.</h1>
      <Button
        label="Log in"
        rounded
        @click="toggleLogged(!internalData.value)"
        class="w-9rem"
      />

      <span
        >Don't have adn account yet?
        <VFlexibleLink to="/">Sign up</VFlexibleLink></span
      >
    </div>
  </div>
</template>

<style lang="scss" scoped>
.s-user {
}
</style>
