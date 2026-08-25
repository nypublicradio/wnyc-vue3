<script setup lang="ts">
import { watch } from "vue"

const props = defineProps({
  showNoThanks: {
    type: Boolean,
    default: false,
  },
  dark: {
    type: Boolean,
    default: false,
  },
  outlined: {
    type: Boolean,
    default: false,
  },
  isSubmitting: {
    type: Boolean,
    default: false,
  },
  altDesign: {
    type: Boolean,
    default: false,
  },
  submissionStatus: {
    type: String,
    default: null,
  },
  submitButtonText: {
    type: String,
    default: "Sign up",
  },
  submitButtonIcon: {
    type: String,
    default: null,
  },
  thanksMessage: {
    type: String,
    default: "Thank you for signing up!",
  },
})

const emit = defineEmits(["submit", "noThanksClick"])

const email = ref("")
const checked = ref(true)
const submitButtonRef = ref(null)

const emailErrorText = ref(null)

// function to check if the email is a valid format and to set the error text
function validateEmail() {
  // See also isValidEmail in useNewsletterSignup.ts
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email#basic_validation
  const validRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  emailErrorText.value = null
  if (validRegex.test(email.value)) {
    return true
  } else {
    emailErrorText.value = "Please enter a valid email address."
    return false
  }
}

// watches for changes in the submissionStatus prop and sets error messages accordingly
watch(
  () => props.submissionStatus,
  () => {
    emailErrorText.value = null
    switch (props.submissionStatus) {
      case "success":
        break
      case "error":
        emailErrorText.value =
          "Sorry, there was an error with your submission. Please try again!"
        break
      default:
    }
  }
)

// submit the email value through the emit if the email is valid
function submitForm() {
  if (validateEmail()) emit("submit", email.value)
}
</script>

<template>
  <div>
    <div class="email-collector-form">
      <!-- when the submissionStatus is 'success' it will hide the form and show Thank you message -->
      <span
        v-if="submissionStatus !== 'success'"
        class="flex flex-column lg:flex-row"
        style="gap: 1rem"
      >
        <div class="flex-grow-1">
          <p class="mb-2" :class="emailErrorText ? 'p-error' : ''" for="email">
            Email address
          </p>
          <div class="flex align-items-center w-full gap-2">
            <div class="field m-0 flex flex-grow-1">
              <InputText
                v-model="email"
                :disabled="isSubmitting"
                class="w-full"
                :class="[
                  { 'p-invalid': emailErrorText },
                  { 'alt-design': altDesign },
                  { dark },
                ]"
                type="email"
                placeholder="your@email.com"
                aria-label="sign up"
                aria-describedby="email-address-field"
                autocomplete="email"
                name="email"
                @keypress.enter="submitForm"
              />
            </div>
            <i
              ref="submitButtonRef"
              class="submit-icon flex-none"
              :class="[{ altDesignIcon: altDesign && submitButtonIcon }]"
              :data-style-mode="dark ? 'dark' : 'default'"
            >
              <Button
                :disabled="isSubmitting || !checked"
                class="submit-btn p-button-rounded"
                :class="[{ 'p-button-outlined': outlined, disabled: !checked }]"
                s
                :icon="submitButtonIcon ? `pi ${submitButtonIcon}` : null"
                icon-pos="right"
                :label="submitButtonIcon ? null : submitButtonText"
                :aria-label="submitButtonText"
                @click="submitForm"
              >
                <i
                  v-if="isSubmitting"
                  class="pi pi-spin pi-spinner"
                  aria-hidden="true"
                />
              </Button>
            </i>
          </div>
          <Transition name="fade">
            <small
              v-if="emailErrorText"
              id="email-address-field"
              class="p-error mt-1 block"
              >{{ emailErrorText }}</small
            >
          </Transition>
          <ClientOnly>
            <div class="field-checkbox mt-3 mb-0">
              <Checkbox
                v-model="checked"
                aria-label="Toggle agreement to the terms"
                :disabled="isSubmitting"
                :binary="true"
              />
              <label for="binary">
                <slot />
              </label>
            </div>
          </ClientOnly>
        </div>
        <div v-if="showNoThanks" class="flex justify-content-start">
          <div>
            <Button
              class="no-thanks-btn p-button-link"
              label="No thanks"
              :style="isSubmitting ? 'visibility: hidden' : ''"
              @click="emit('noThanksClick')"
            />
          </div>
        </div>
      </span>
      <p v-else class="type-paragraph3">
        {{ thanksMessage }}
      </p>
    </div>
  </div>
</template>

<style lang="scss">
.email-collector-form .submit-btn {
  background-color: #ffffff1a;
  border-color: #737373;
  width: 92px;
  &:hover {
    background-color: var(--p-primary-color);
    border-color: var(--p-primary-color);
  }
  &.disabled {
    &:hover {
      background-color: #ffffff1a;
      border-color: #737373;
    }
  }
}

.email-collector-form .pi-spinner {
  font-size: 1.25rem;
  color: var(--black);
  margin: auto;
}

.email-collector-form .no-thanks-btn {
  margin-left: -1rem;
  width: 110px;
  margin-top: 8px;
  text-decoration: underline;

  @include media("<md") {
    margin-top: -1rem;
  }
}

.email-collector-form {
  .field-checkbox {
    .p-checkbox {
      align-self: flex-start;

      &.p-checkbox-checked {
        .p-checkbox-box {
          background-color: var(--p-surface-0);
          border-color: var(--p-surface-200);

          .p-checkbox-icon {
            color: var(--p-surface-950);
          }
        }
      }
    }

    label {
      @include font-config($type-fineprint);
    }
  }

  .p-error {
    color: var(--p-red-400);
    text-align: left;
  }
}
</style>
