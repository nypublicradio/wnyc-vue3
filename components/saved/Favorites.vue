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
    value: [
      mediaTypes.ARTICLE_PAGE,
      mediaTypes.ARTICLE,
      mediaTypes.STORY,
      mediaTypes.NPR_ARTICLE,
    ],
  },
  /*  { label: "Shows", value: mediaTypes.SHOW }, */
])
const selectedFilterOption = ref(filterOptions.value[0])

// fire the command located in the menuItems data object above when the user clicks on the menu item
const onMenuChange = (e) => {
  e?.value?.command()
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
  <section v-if="user" class="favorites">
    <DotMenu
      :menuItems="getDotMenuItems()"
      label=""
      @changeEmit="onMenuChange"
      class="z-1"
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
          class="-ml-2 mb-2"
        />
      </template>
    </DotMenu>

    <saved-dynamic-list
      table="favorited"
      :typeFilter="selectedFilterOption.value"
      :excludeFilter="mediaTypes.SHOW"
    >
      <template #empty>
        <saved-empty
          icon="StarIcon"
          linkText="Browse Shows"
          linkRoute="/browse"
        >
          Use the <strong>favorite</strong> button to save your favorite
          episodes, articles and more— so you can return to them over and over.
        </saved-empty>
      </template>
    </saved-dynamic-list>
  </section>
  <section v-else class="favorites">
    You must be logged in to see your favorites.
  </section>
</template>

<style lang="scss" scoped>
.favorites {
  .p-dropdown {
    border: none;
    background: transparent;
  }
}
</style>
