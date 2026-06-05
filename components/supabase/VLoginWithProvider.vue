<script setup>
import Button from "primevue/button"
import Message from "primevue/message"
import { ref } from "vue"

const errorMessage = ref("")

const props = defineProps({
  client: {
    default: null,
    type: Object,
  },
  config: {
    default: null,
    type: Object,
  },
  label: {
    default: null,
    type: String,
  },
  provider: {
    default: null,
    required: true,
    type: String,
  },
  redirectUrl: {
    default: "http://localhost:3000",
    type: String,
  },
})
const innerClient = ref(props.client)
const innerConfig = ref(props.config)
const isNativeApp = useIsNativeApp()

// fallback incase the parent component doesn't pass in the client and config
if (!props.client && !props.config) {
  innerClient.value = useSupabaseClient()
  innerConfig.value = useRuntimeConfig()
}

const emit = defineEmits(["submit-click", "submit-error", "submit-success"])

// method triggered by the form submit to handle supabase login logic
const login = async () => {
  emit("submit-click")

  // On native apps, redirect back via custom scheme so the OS returns to the app
  // On web, use the runtime config value or the prop
  let redirectTo = ""
  if (isNativeApp.value) {
    redirectTo = "wnycalpha://confirm"
  } else {
    const configRedirectTo =
      innerConfig.value.public?.supabaseAuthSignInRedirectTo
    redirectTo =
      props.redirectUrl !== "http://localhost:3000"
        ? props.redirectUrl
        : configRedirectTo || props.redirectUrl
  }

  const res = await innerClient.value.auth.signInWithOAuth({
    options: {
      redirectTo,
    },
    provider: props.provider,
  })
  if (res.error) {
    emit("submit-error", res.error)
    errorMessage.value = res.error
  } else {
    emit("submit-success")
    // after apple or google auth returns the user back to the site, the App.addListener("appUrlOpen") listener in the App.vue file. That will trigger the handleAppUrlOpen(event) method in the useOneSignal composable
    // that will check if there is a return route and if so, navigate to it, and clear the authReturnRoute preference/local storage
  }
}
// capitalise the first letter of a string
const capFirstChar = (str) => {
  return str[0].toUpperCase() + str.slice(1)
}
</script>

<template>
  <div>
    <template v-if="errorMessage">
      <Message
        class="center mb-4"
        severity="error"
        :closable="false"
        icon="pi pi-times-circle"
      >
        Sorry, there was a problem logging in to your
        {{ capFirstChar(props.provider) }} account:
        {{ errorMessage }}
      </Message>
    </template>
    <Button
      class="w-full"
      :label="props.label ?? `Log in with ${capFirstChar(props.provider)}`"
      :aria-label="`${props.provider} login button`"
      v-bind="{ ...$attrs }"
      @click="login"
    >
      <template #icon>
        <slot name="icon">
          <i :class="`pi pi-${props.provider}`"></i>
        </slot>
      </template>
    </Button>
  </div>
</template>
