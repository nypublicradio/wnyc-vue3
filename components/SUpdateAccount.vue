<script setup>
import { useVuelidate } from "@vuelidate/core"
import { email, helpers, minLength, required, sameAs } from "@vuelidate/validators"
import Button from "primevue/button"
import InputText from "primevue/inputtext"
import Password from "primevue/password"
import { computed, reactive, ref } from "vue"
import { trackClickEvent } from "~/utilities/helpers"
import {
  useCurrentUser,
  useCurrentUserProfile,
  useEditProfileSideBar,
} from "~/composables/states"
import { useToast } from "primevue/usetoast"

const toast = useToast()

const emit = defineEmits([
  "submit-click",
  "submit-error",
  "submit-success",
  "login-success",
])

const client = useSupabaseClient()
//const config = useRuntimeConfig()
const currentUser = useCurrentUser()
const currentUserProfile = useCurrentUserProfile()
const editProfileSideBar = useEditProfileSideBar()

const tempPassword = "••••••••••"

const formDataOriginal = {
  email: currentUser.value.email,
  name: currentUserProfile.value.name,
  password: "",
  email_confirm: "",
}

const formData = reactive({
  email: currentUser.value.email,
  name: currentUserProfile.value.name,
  password: "",
  email_confirm: "",
})

// for checking if the field has changed
const hasFieldChanged = (key) => {
  return toRaw(formData[key]) !== formDataOriginal[key]
}
// for checking if the field has changed
const hasAnyFieldsChanged = () => {
  //console.log('formDataOriginal= ', formDataOriginal)
  //console.log('toRaw(formData)= ', toRaw(formData))
  return JSON.stringify(toRaw(formData)) !== JSON.stringify(formDataOriginal)
}

// Vuelidate rule for having at least one number
const hasAtleastOneNumber = helpers.withMessage(
  "Must contain at least 1 number",
  (value) => /\d/.test(value)
)

// Vuelidate rule for password
const passwordRules = computed(() => {
  if (formData.password.length > 0) {
    return {
      hasAtleastOneNumber,
      minLength: minLength(8),
      required: helpers.withMessage("This field is required", required),
    }
  } else {
    return false
  }
})
// Vuelidate rule for email confirm
const emailRulesConfirm = computed(() => {
  if (hasFieldChanged("email")) {
    return {
      required: helpers.withMessage(
        "The email confirmation field is required ",
        required
      ),
      sameAs: helpers.withMessage("email addresses don't match", sameAs(formData.email)),
    }
  } else {
    return false
  }
})

// Vuelidate rules
const rules = computed(() => {
  return {
    email: {
      email: helpers.withMessage("Invalid email format", email),
      required: helpers.withMessage("The email field is required", required),
    },
    name: {
      required: helpers.withMessage("Please add your name", required),
    },
    password: passwordRules.value,
    email_confirm: emailRulesConfirm.value,
  }
})

const v$ = useVuelidate(rules, formData)

// submit the form
const submitForm = async () => {
  emit("submit-click")
  //console.log('submit')
  v$.value.$validate()

  if (!v$.value.$error) {
    //console.log('validated')
    //success with Vuelidate

    // if nothing has changed, then abort and ckose the sidebar
    if (!hasAnyFieldsChanged()) {
      editProfileSideBar.value = false
      return
    }

    // name supabase update
    if (hasFieldChanged("name")) {
      const { errorName } = await client
        .from("profiles")
        .update({
          updated_at: new Date().toISOString(),
          name: formData.name,
        })
        .eq("id", currentUser.value.id)

      if (errorName) {
        emit("submit-error", errorName?.message)
        toast.add({
          severity: "error",
          summary: `Name update failed: ${errorName.message}`,
          life: 3000,
        })
      } else {
        emit("submit-success")
        trackClickEvent(
          "Event Tracking - Account Name Updated",
          "Settings Sidebar - Account",
          formData.name
        )
        // update local state
        currentUserProfile.value.name = formData.name
        editProfileSideBar.value = false
      }
    }

    // email supabase update
    if (hasFieldChanged("email")) {
      //console.log('updating supabase email')
      const { errorEmail } = await client.auth.updateUser({
        email: formData.email,
      })

      if (errorEmail) {
        // error with Supabase
        emit("submit-error", errorEmail?.message)
        if (errorEmail?.message.toString().includes("already registered")) {
          toast.add({
            severity: "error",
            summary: "Looks like this email address is already used by another account.",
            life: 3000,
          })
        } else {
          toast.add({
            severity: "error",
            summary: errorEmail?.message,
            life: 3000,
          })
        }
      } else {
        //success with Supabase
        emit("submit-success")
        toast.add({
          severity: "success",
          summary: "Email updated: A confirmation email has been sent to your inbox.",
          life: 6000,
        })
        trackClickEvent(
          "Event Tracking - Account email updated",
          "Settings Sidebar - Account",
          formData.email
        )
        // update local state
        currentUserProfile.value.email = formData.email
        editProfileSideBar.value = false
      }
    }

    // password supabase update
    if (hasFieldChanged("password")) {
      const { errorPassword } = await client.auth.updateUser({
        password: formData.password,
      })

      if (errorPassword) {
        // error with Supabase
        emit("submit-error", errorPassword?.message)

        toast.add({
          severity: "error",
          summary: errorPassword?.message,
          life: 6000,
        })
      } else {
        //success with Supabase
        emit("submit-success")
        toast.add({
          severity: "success",
          summary: "Password updated",
          life: 6000,
        })
        trackClickEvent(
          "Event Tracking - Account password updated",
          "Settings Sidebar - Account",
          "Password data private"
        )
        editProfileSideBar.value = false
      }
    }
  }
}

const beforeYouLeaveDialog = ref(false)

// handles the before you leave dialog. If there are changes, then show the dialog, otherwise close the sidebar
const beforeYouLeave = () => {
  if (hasAnyFieldsChanged()) {
    beforeYouLeaveDialog.value = true
  } else {
    editProfileSideBar.value = false
  }
}
</script>

<template>
  <div>
    <div>
      <SHeader label="Account" @close-sidebar="beforeYouLeave" />
      <form v-if="formData" class="mt-6" novalidate @submit.prevent="submitForm">
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

          <div v-if="hasFieldChanged('email')" class="flex flex-column gap-2 col-12">
            <label for="email">Email confirm</label>
            <InputText
              v-model="formData.email_confirm"
              type="text"
              name="email"
              class="w-full"
              :class="{
                'p-invalid': v$.email_confirm.$error && v$.email_confirm.$invalid,
              }"
              required
              @update="v$.email_confirm.$touch"
            />
            <small class="p-error">
              <span v-for="err of v$.email_confirm.$errors" :key="err.$uid">
                {{ err.$message }}<br />
              </span>
              <!-- <p v-if="!v$.email_confirm.$errors.length > 0">
                email addresses must match
              </p> -->
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
        <Button label="Save" class="w-full mt-3" aria-label="Save" type="submit">
          <template #icon> <slot name="icon"></slot> </template>
        </Button>
        <Button
          label="Cancel"
          link
          class="mt-4 w-full"
          aria-label="cancel"
          @click="beforeYouLeave"
        />
      </form>
      <Dialog
        v-model:visible="beforeYouLeaveDialog"
        modal
        dismissableMask
        :draggable="false"
        header="Unsaved changes"
        :style="{ width: '70vw' }"
      >
        <p class="text-base">
          Are you sure you want to leave this page? Changes you made will not be saved.
        </p>
        <template #footer>
          <div class="flex justify-content-between">
            <Button
              label="Cancel"
              aria-label="cancel"
              @click="beforeYouLeaveDialog = false"
            />
            <Button
              text
              label="Leave"
              aria-label="leave"
              @click="
                () => {
                  beforeYouLeaveDialog = false
                  editProfileSideBar = false
                }
              "
              autofocus
            />
          </div>
        </template>
      </Dialog>
    </div>
  </div>
</template>
