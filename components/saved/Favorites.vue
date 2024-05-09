<script setup>
import PlayIcon from "~/components/icons/PlayIcon.vue"
import ReadIcon from "~/components/icons/ReadIcon.vue"
const user = useCurrentUser()
const filterOptions = ref([
  { label: "All", value: null },
  { label: "Episodes", value: [mediaTypes.EPISODE, mediaTypes.SEGMENTS] },
  // { label: "Segments", value: mediaTypes.SEGMENT },
  {
    label: "Articles",
    value: [mediaTypes.ARTICLE_PAGE, mediaTypes.ARTICLE, mediaTypes.STORY],
  },
  /*  { label: "Shows", value: mediaTypes.SHOW }, */
])
const selectedFilterOption = ref(filterOptions.value[0])

// fire the command located in the menuItems data object above when the user clicks on the menu item
const onMenuChange = (e) => {
  e.value.command()
}

// set the items for the Dot menu
const getDotMenuItems = () => {
  return [
    {
      label: "All",
      icon: "pi pi-star-fill",
      command: () => {
        selectedFilterOption.value = filterOptions.value[0]
      },
    },
    {
      label: "Episodes",
      customIcon: PlayIcon,
      command: () => {
        selectedFilterOption.value = filterOptions.value[1]
      },
    },
    {
      label: "Articles",
      customIcon: ReadIcon,
      command: () => {
        selectedFilterOption.value = filterOptions.value[2]
      },
    },
  ]
}
</script>
<template>
  <div v-if="user" class="favorites">
    <DotMenu
      :menuItems="getDotMenuItems()"
      label=""
      @changeEmit="onMenuChange"
      class="z-1 mt-3"
      width="auto"
    >
      <template #myCustomButton="{ slotProps }">
        <Button
          :label="selectedFilterOption.label"
          icon="pi pi-chevron-down"
          iconPos="right"
          text
          rounded
          severity="secondary"
          aria-label="options menu"
          type="button"
          aria-haspopup="true"
          aria-controls="overlay_menu"
          class="-ml-2"
        />
      </template>
    </DotMenu>
    <section>
      <saved-dynamic-list
        table="favorited"
        :typeFilter="selectedFilterOption.value"
        :excludeFilter="mediaTypes.SHOW"
      >
        <template #empty>
          <div class="empty flex flex-column gap-3 text-center mt-8">
            <h2>Favorites will appear here!</h2>
            <div class="max-w-15rem m-auto">
              <p class="line-height-3">
                Use the <strong>favorite</strong> button
                <StarIcon class="w-2rem -mb-3" />
              </p>
              <p class="line-height-3">
                to save your favorite episodes, articles and more— so you can return to
                them over and over.
              </p>
            </div>
            <Button
              label="Browse Shows"
              aria-label="Browse Shows"
              text
              severity="secondary"
              class="underline"
              size="small"
              @click="navigateTo('/browse')"
            />
          </div>
        </template>
      </saved-dynamic-list>
    </section>
  </div>
  <section v-else class="favorites">You must be logged in to see your favorites.</section>
</template>

<style lang="scss" scoped>
.favorites {
  .p-dropdown {
    border: none;
    background: transparent;
  }
}
</style>
