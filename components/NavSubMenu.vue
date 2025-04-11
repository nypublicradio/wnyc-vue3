<script setup>
const props = defineProps({
  model: {
    type: Object,
    required: true,
  },
})

const menuRef = ref()

onMounted(() => {
  const menuItems = menuRef.value?.getElementsByClassName("p-menu-item")
  console.log("menuItems", menuItems)
  if (menuItems) {
    Array.from(menuItems).forEach((item) => {
      item.setAttribute("tabindex", "-1")
    })
  }
})

const emit = defineEmits(["emit-click"])
</script>

<template>
  <!-- <Menu :model="props.model" ref="menuRef">
    <template #item="{ item: itemMenu }"> -->
  <div class="nav-sub-menu">
    <VFlexibleLink
      v-for="itemMenu in props.model"
      :key="itemMenu.id"
      raw
      :to="itemMenu.url"
      @keydown.enter="() => navigateTo(itemMenu.url)"
      class="w-full menu-item"
      role="menuitem"
      @flexible-link-click="
        () => {
          emit('emit-click')
          trackClickEvent(
            `Click Tracking - Header ${itemMenu.label} Button`,
            'Header',
            `${itemMenu.label} Button`
          )
        }
      "
    >
      <Button
        raw
        class="submenu-btn"
        :label="itemMenu.label"
        :aria-label="`${itemMenu.label} button`"
        severity="secondary"
        size="small"
        variant="link"
        tabindex="-1"
      >
        <div class="flex align-items-center">
          <VImage
            v-if="itemMenu?.image && typeof itemMenu?.image === 'object'"
            class="flex-none mr-3"
            :alt="itemMenu.image.altText"
            :src="itemMenu.image.template"
            :height="60"
            :width="60"
            :ratio="[1, 1]"
            :srcset="[2]"
            style="height: 60px; width: 60px"
            isDecorative
          />
          <img
            v-else-if="itemMenu.image"
            :alt="itemMenu.label"
            :src="itemMenu.image"
            class="flex-none mr-3"
            style="width: 60px; height: 60px"
            tabindex="-1"
          />
          <div class="p-button-label">{{ itemMenu.label }}</div>
        </div>
      </Button>
    </VFlexibleLink>
  </div>
  <!-- </template>
  </Menu> -->
</template>

<style lang="scss">
.nav-sub-menu {
  position: absolute;
  border: none;
  -webkit-border-radius: 0 0 20px 20px;
  padding-bottom: 1rem;
  border-radius: 0 0 20px 20px;
  -webkit-box-shadow: 0 7px 5px 0 rgba(0, 0, 0, 0.2);
  box-shadow: 0 7px 5px 0 rgba(0, 0, 0, 0.2);
  background-color: var(--header-menu-background);
  z-index: 1;
  min-width: 250px;
  margin-top: 8px;
  padding-top: 9px;
  margin-left: -1rem;
  .menu-item {
    transition: background-color var(--p-transition-duration);
    -webkit-transition: background-color var(--p-transition-duration);
    display: block;
    &:hover,
    &:focus {
      background-color: var(--header-submenu-background);
    }
  }
  .submenu-btn {
    width: 100%;
    justify-content: flex-start;
    border-radius: 0;
    padding: 0.5rem 1rem;

    .p-button-label {
      font-weight: 400;
      text-align: left;
    }
  }
}
</style>
