<script setup>
const props = defineProps({
  model: {
    type: Object,
    default: null,
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
    if (parentMenu && parentMenu.nextElementSibling) {
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
    if (parentMenu && parentMenu.previousElementSibling) {
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
    <div class="blank-spacer" tabindex="-1"></div>
    <div class="nav-sub-menu">
      <div v-if="props.model">
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
            <div v-if="itemMenu?.image" class="image-holder mr-2 flex-none">
              <VImage
                class="the-img flex-none"
                :alt="itemMenu.image.altText"
                :src="itemMenu.image"
                :height="60"
                :width="60"
                :ratio="[1, 1]"
                :srcset="[2]"
                style="height: 60px; width: 60px"
                isDecorative
              />
            </div>
          </template>
        </NavButton>
      </div>
      <div v-else>
        <slot />
      </div>
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
    cursor: default;
  }

  .nav-sub-menu {
    padding-top: 20px;
    position: absolute;
    border: none;
    -webkit-border-radius: 0 0 20px 20px;
    padding-bottom: 1rem;
    border-radius: 0 0 20px 20px;
    -webkit-box-shadow: 0px 10px 10px 0px rgba(0, 0, 0, 0.3);
    box-shadow: 0px 10px 10px 0px rgba(0, 0, 0, 0.3);
    background-color: var(--header-menu-background);
    z-index: 1;
    min-width: 280px;

    .menu-item {
      transition: background-color var(--p-transition-duration);
      -webkit-transition: background-color var(--p-transition-duration);
      display: block;
      min-height: 60px;
      display: flex;

      &:focus-visible {
        outline-offset: 0;
      }

      .image-holder {
        //overflow: unset !important;
        display: flex;
        width: 60px;
        height: 60px;
        .the-img {
          transition: transform var(--p-transition-duration);
          -webkit-transition: transform var(--p-transition-duration);
        }
      }
      &:hover,
      &:focus {
        .image-holder {
          .the-img {
            transform: scale(1.15);
          }
        }

        .p-button-label {
          color: var(--p-button-link-hover-color);
          text-decoration: underline;
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
  &.login-signup {
    .blank-spacer {
      height: 15px;
    }
  }
}
</style>
