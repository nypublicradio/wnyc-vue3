<script setup>
const props = defineProps({
  model: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(["emit-click"])

// handle the focus out event
const onFocusOut = (e, index, length) => {
  const checkTabbingBackward =
    e.relatedTarget &&
    e.relatedTarget.compareDocumentPosition(e.target) & Node.DOCUMENT_POSITION_PRECEDING
  const isTabbingBackward = !Boolean(checkTabbingBackward)

  const itemLength = length - 1
  const parentMenu =
    e.target.parentElement.parentElement.parentElement.parentElement.parentElement
  // tabbing forward
  if (itemLength === index && !isTabbingBackward) {
    if (parentMenu) {
      parentMenu.nextElementSibling.focus()
      //parentMenu.focus()
      const enterEvent = new KeyboardEvent("keydown", {
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        which: 13,
        bubbles: true,
      })
      parentMenu.dispatchEvent(enterEvent)
    }
  }

  // tabbing backward
  if (index === 0 && isTabbingBackward) {
    if (parentMenu) {
      parentMenu.previousElementSibling.focus()
      //parentMenu.focus()
      const enterEvent = new KeyboardEvent("keydown", {
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        which: 13,
        bubbles: true,
      })
      parentMenu.dispatchEvent(enterEvent)
    }
  }
}
</script>

<template>
  <div class="nav-sub-menu-holder">
    <div class="blank-spacer"></div>
    <div class="nav-sub-menu">
      <NavButton
        v-for="(itemMenu, index) in props.model"
        :label="itemMenu.label"
        :route="itemMenu.url"
        :key="itemMenu.id"
        class="w-full menu-item"
        :class="itemMenu.class"
        :rounded="false"
        @keydown.enter="() => navigateTo(itemMenu.url)"
        @focusout="onFocusOut($event, index, props.model.length)"
        buttonClass="nav-p-button"
        @emit-click="() => emit('emit-click', itemMenu)"
      >
        <template #icon>
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
        </template>
      </NavButton>
    </div>
  </div>
</template>

<style lang="scss">
.nav-sub-menu-holder {
  margin-left: -4px;

  .blank-spacer {
    height: 12px;
    width: 100%;
    background: transparent;
    min-width: 280px;
    margin-left: -12px;
    margin-top: 0;
  }

  .nav-sub-menu {
    position: absolute;
    border: none;
    -webkit-border-radius: 0 0 20px 20px;
    padding-bottom: 1rem;
    border-radius: 0 0 20px 20px;
    -webkit-box-shadow: 0px 5px 10px 2px rgba(0, 0, 0, 0.3);
    box-shadow: 0px 5px 10px 2px rgba(0, 0, 0, 0.3);
    background-color: var(--header-menu-background);
    z-index: 1;
    min-width: 280px;

    .menu-item {
      transition: background-color var(--p-transition-duration);
      -webkit-transition: background-color var(--p-transition-duration);
      display: block;
      min-height: 50px;
      display: flex;

      &:hover,
      &:focus {
        background-color: var(--header-submenu-background);

        .p-button-label {
          color: var(--p-button-link-hover-color);
          text-decoration: underline;
        }
      }
    }

    .p-button {
      width: 100%;
      justify-content: flex-start;
      border-radius: 0;
      padding: 0.5rem 1rem;

      .p-button-label {
        text-align: left;
      }
    }
  }
}
</style>
