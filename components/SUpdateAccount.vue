<script setup>
import { useVuelidate } from '@vuelidate/core'
import {
  email,
  helpers,
  minLength,
  required,
  //sameAs,
} from '@vuelidate/validators'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Password from 'primevue/password'
import { computed, reactive, ref } from 'vue'
import { trackClickEvent } from '~/utilities/helpers'
import { useCurrentUser, useCurrentUserProfile } from '~/composables/states'

const props = defineProps({
  client: {
    default: null,
    type: Object,
  },
  config: {
    default: null,
    type: Object,
  },
  error: {
    default: '',
    type: String,
  },
  errorAlreadyRegistered: {
    default:
      'Looks like you already have an account! If you do not remember your password, you can retrieve it by clicking the "Forgot Password" link below.',
    type: String,
  },
  label: {
    default: 'Sign up with email',
    type: String,
  },
  slug: {
    default: '/dashboard',
    type: String,
  },
  success: {
    default: 'Account updated successfully!',
    type: String,
  },
  editMode: {
    default: false,
    type: Boolean,
  },
})

const emit = defineEmits([
  'submit-click',
  'submit-error',
  'submit-success',
  'login-success',
])

const client = useSupabaseClient()
const config = useRuntimeConfig()
const currentUser = useCurrentUser()
const currentUserProfile = useCurrentUserProfile()

const hasAtleastOneNumber = helpers.withMessage(
  'Must contain at least 1 number',
  (value) => /\d/.test(value)
)

const tempPassword = '**********'

const formData = reactive({
  email: currentUser.value.email,
  name: currentUserProfile.value.name,
  password: '',
})

const passwordRules = computed(() => {
  if (formData.password.length > 0) {
    return {
      hasAtleastOneNumber,
      minLength: minLength(8),
      required: helpers.withMessage('This field is required', required),
    }
  } else {
    return false
  }
})

const sbErrorMsg = ref('')
const sbSuccessMsg = ref('')

const rules = computed(() => {
  return {
    email: {
      email: helpers.withMessage('Invalid email format', email),
      required: helpers.withMessage('The email field is required', required),
    },
    name: {
      required: helpers.withMessage('Please add your name', required),
    },
    password: passwordRules.value,
    // password: {
    //   hasAtleastOneNumber,
    //   minLength: minLength(8),
    //   required: helpers.withMessage('This field is required', required),
    // },
  }
})

const v$ = useVuelidate(rules, formData)
// clears out the error messages after a delay
const clearMsg = (delay = 500) => {
  setTimeout(() => {
    sbErrorMsg.value = ''
    sbSuccessMsg.value = ''
  }, delay)
}

const submitForm = async () => {
  // clear the error message so the message re-animates on each submit
  clearMsg(0)
  emit('submit-click')
  v$.value.$validate()
  console.log('formData.password.length = ', formData.password.length)
  if (!v$.value.$error) {
    //success with Vuelidate

    // name
    const { error } = await client
      .from('profiles')
      .update({
        updated_at: new Date().toISOString(),
        name: formData.name,
      })
      .eq('id', currentUser.value.id)

    if (error) {
      emit('submit-error', error?.message)

      sbErrorMsg.value = props.error
        ? props.error
        : `Account update failed: ${error.message}`
    } else {
      emit('submit-success')
      sbSuccessMsg.value = props.success
      trackClickEvent(
        'Event Tracking - Account Updated',
        'Settings Sidebar - Account',
        formData
      )
      // update local state
      currentUserProfile.value.name = formData.name
    }

    console.log('GOOD TO GO', formData.name, currentUser.value)

    /* const sbError = await innerClient.value.auth.signUp({
      email: formData.email,
      options: {
        data: {
          name: formData.name,
        },
      },
      password: formData.password,
    })
    if (!sbError.error) {
      //success with Supabase
      emit('submit-success')
      sbSuccessMsg.value = props.success
    } else {
      // error with Supabase
      emit('submit-error', sbError?.error?.message)
      if (sbError?.error?.message.toString().includes('already registered')) {
        sbErrorMsg.value = props.errorAlreadyRegistered
      } else {
        sbErrorMsg.value = `${props.error} ${sbError?.error?.message}`
      }
    } */
  }
}
console.log('currentUserProfile.value - ', currentUserProfile.value)
</script>

<template>
  <div>
    <div v-if="sbSuccessMsg">
      <div>
        <Message class="mb-3" severity="success">
          <span v-html="sbSuccessMsg"></span>
        </Message>
        <slot name="success"> </slot>
      </div>
    </div>
    <template v-if="sbErrorMsg && sbErrorMsg !== undefined">
      <Message class="mb-3" severity="warning" @close="clearMsg()">
        <span v-html="sbErrorMsg"></span>
      </Message>
    </template>

    <div>
      <form v-if="formData" novalidate @submit.prevent="submitForm">
        <div class="grid mb-2">
          <div class="flex flex-column gap-2 col-12">
            <label for="first_name">Name</label>
            <InputText
              v-model="formData.name"
              type="text"
              name="first_name"
              class="w-full"
              :class="{
                'p-invalid': v$.name.$error && v$.name.$invalid,
              }"
              placeholder="Your name"
              required
              @update="v$.name.$touch"
            />
            <small class="p-error">
              <span v-for="err of v$.name.$errors" :key="err.$uid">
                {{ err.$message }} <br />
              </span>
            </small>
          </div>

          <div class="flex flex-column gap-2 col-12">
            <label for="email">Email</label>
            <InputText
              v-model="formData.email"
              type="text"
              name="email"
              class="w-full"
              :class="{ 'p-invalid': v$.email.$error && v$.email.$invalid }"
              placeholder="you@email.com"
              required
              @update="v$.email.$touch"
            />
            <small class="p-error">
              <span v-for="err of v$.email.$errors" :key="err.$uid">
                {{ err.$message }} <br />
              </span>
            </small>
          </div>

          <div class="flex flex-column gap-2 col-12">
            <label for="password">Password</label>
            <Password
              v-model="formData.password"
              type="password"
              name="password"
              :class="{
                'p-invalid': v$.password.$error && v$.password.$invalid,
              }"
              :placeholder="tempPassword"
              required
              :feedback="false"
              @update="v$.password.$touch"
            />
            <small class="p-error">
              <span v-for="err of v$.password.$errors" :key="err.$uid">
                {{ err.$message }}<br />
              </span>
              <p v-if="!v$.password.$errors.length > 0">
                must be at least 8 characters and 1 number
              </p>
            </small>
          </div>
        </div>
        <slot name="aboveSubmit" />
        <Button
          :label="props.label"
          v-bind="{ ...$attrs }"
          class="w-full mt-3"
          :aria-label="`${props.label} button`"
          type="submit"
        >
          <template #icon> <slot name="icon"></slot> </template>
        </Button>
        <slot name="belowSubmit" />
      </form>
    </div>
  </div>
</template>
editMode
