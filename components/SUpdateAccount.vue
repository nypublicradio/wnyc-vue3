<script setup>
import { useVuelidate } from '@vuelidate/core'
import { email, helpers, minLength, required } from '@vuelidate/validators'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Password from 'primevue/password'
import { computed, reactive, ref } from 'vue'
import { trackClickEvent } from '~/utilities/helpers'
import {
  useCurrentUser,
  useCurrentUserProfile,
  useEditProfileSideBar,
} from '~/composables/states'
import { useToast } from 'primevue/usetoast'

const toast = useToast()

const emit = defineEmits([
  'submit-click',
  'submit-error',
  'submit-success',
  'login-success',
])

const client = useSupabaseClient()
//const config = useRuntimeConfig()
const currentUser = useCurrentUser()
const currentUserProfile = useCurrentUserProfile()
const editProfileSideBar = useEditProfileSideBar()

const tempPassword = '••••••••••'

const formDataOriginal = {
  email: currentUser.value.email,
  name: currentUserProfile.value.name,
  password: '',
}

const formData = reactive({
  email: currentUser.value.email,
  name: currentUserProfile.value.name,
  password: '',
})

const hasFieldChanged = (key) => {
  return formData[key] !== formDataOriginal[key]
}

const hasAtleastOneNumber = helpers.withMessage(
  'Must contain at least 1 number',
  (value) => /\d/.test(value)
)
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
  }
})

const v$ = useVuelidate(rules, formData)

const submitForm = async () => {
  emit('submit-click')
  v$.value.$validate()

  if (!v$.value.$error) {
    //success with Vuelidate

    // name supabase update
    if (hasFieldChanged('name')) {
      const { errorName } = await client
        .from('profiles')
        .update({
          updated_at: new Date().toISOString(),
          name: formData.name,
        })
        .eq('id', currentUser.value.id)

      if (errorName) {
        emit('submit-error', errorName?.message)
        toast.add({
          severity: 'error',
          summary: `Name update failed: ${errorName.message}`,
          life: 3000,
        })
      } else {
        emit('submit-success')
        toast.add({
          severity: 'success',
          summary: `Name updated successfully!`,
          life: 3000,
        })
        trackClickEvent(
          'Event Tracking - Account Name Updated',
          'Settings Sidebar - Account',
          formData.name
        )
        // update local state
        currentUserProfile.value.name = formData.name
      }
    }

    // email supabase update
    if (hasFieldChanged('email')) {
      const { errorEmail } = await client.auth.updateUser({
        email: formData.email,
      })

      if (errorEmail) {
        // error with Supabase
        emit('submit-error', errorEmail?.message)
        if (errorEmail?.message.toString().includes('already registered')) {
          toast.add({
            severity: 'error',
            summary:
              'Looks like this email address is already used by another account.',
            life: 3000,
          })
        } else {
          toast.add({
            severity: 'error',
            summary: errorEmail?.message,
            life: 3000,
          })
        }
      } else {
        //success with Supabase
        emit('submit-success')
        toast.add({
          severity: 'success',
          summary:
            'Email updated: A confirmation email has been sent to your inbox.',
          life: 6000,
        })
        trackClickEvent(
          'Event Tracking - Account email updated',
          'Settings Sidebar - Account',
          formData.email
        )
        // update local state
        currentUserProfile.value.email = formData.email
      }
    }

    // password supabase update
    if (hasFieldChanged('password')) {
      const { errorPassword } = await client.auth.updateUser({
        password: formData.password,
      })

      if (errorPassword) {
        // error with Supabase
        emit('submit-error', errorPassword?.message)

        toast.add({
          severity: 'error',
          summary: errorPassword?.message,
          life: 6000,
        })
      } else {
        //success with Supabase
        emit('submit-success')
        toast.add({
          severity: 'success',
          summary: 'Password updated!',
          life: 3000,
        })
        trackClickEvent(
          'Event Tracking - Account password updated',
          'Settings Sidebar - Account',
          'Password data private'
        )
      }
    }
  }
}
</script>

<template>
  <div>
    <div class="mt-6">
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
          label="Save"
          v-bind="{ ...$attrs }"
          class="w-full mt-3"
          aria-label="Save button"
          type="submit"
        >
          <template #icon> <slot name="icon"></slot> </template>
        </Button>
        <Button
          label="Cancel"
          link
          class="mt-4 w-full"
          @click="editProfileSideBar = false"
        />
      </form>
    </div>
  </div>
</template>
