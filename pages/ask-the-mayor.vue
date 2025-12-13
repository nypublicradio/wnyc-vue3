
<script setup>
import { useLoginSideBar, useSignupSideBar } from "~/composables/states"
import { useToast } from "primevue/usetoast"

const toast = useToast()
const loginSideBar = useLoginSideBar()
const signinSideBar = useSignupSideBar()

const user = useCurrentUser()
const bucketName = "media"
const subfolder = "atm"
const submissionTable = "atm_submissions"

const UploadMediaREF = ref(null)
const questionLimitReached = ref(false)
const hasFiles = ref(false)
const submitProgress = ref(null)
const recordTimeLimit = 30

// Submit Handler
const onFormSubmit = async (e) => {
  // if (e.valid) {
  try {
    // Upload Avatar if changed
    await UploadMediaREF.value?.uploadFiles()

    toast.add({
      severity: "success",
      summary: "Video uploaded successfully",
      life: 3000,
    })
  } catch (error) {
    console.error("Update error:", error)
    toast.add({
      severity: "error",
      summary: "Upload Failed",
      detail: error.message,
      life: 3000,
    })
  }
  // } else {
  //   toast.add({
  //     severity: "error",
  //     summary: "Validation Failed",
  //     detail: "Please check the highlighted fields.",
  //     life: 3000,
  //   });
  // }
}

const onUploadError = (event) => {}
const onUploadComplete = (event) => {
  // if (event.path) {
  //   // Construct the full public URL from the relative path
  //   const supabaseUrl = supabase.storage
  //     .from(bucketName)
  //     .getPublicUrl(event.path).data.publicUrl;
  //   initialValues.value.avatar_url = supabaseUrl;
  //   console.log("Avatar uploaded - relative path:", event.path);
  //   console.log("Avatar uploaded - full URL:", supabaseUrl);
  //   // Trigger validation
  //   const avatarInput = avatarREF.value?.$el;
  //   if (avatarInput) {
  //     avatarInput.value = supabaseUrl;
  //     avatarInput.dispatchEvent(new Event("input", { bubbles: true }));
  //   }
  // }
}

const onFilesUpdated = (files) => {
  // This is called when files are selected but not yet uploaded
  // We just use this to clear validation errors, actual path comes from onUpload
  // if (files && files.length > 0) {
  //   const avatarInput = avatarREF.value?.$el;
  //   if (avatarInput) {
  //     // Set a temporary value to pass validation
  //     avatarInput.value = "uploading";
  //     avatarInput.dispatchEvent(new Event("input", { bubbles: true }));
  //   }
  // }
}
const isSignupForm = ref(true)

const loginOrSignupStepLabel = computed(() => {
  return isSignupForm.value ? "Sign Up" : "Login"
})

onMounted(() => {
  // send GA page view
  const { $analytics } = useNuxtApp()
  $analytics.sendPageView({
    page_title: "Ask the Mayor",
    page_type: "ask_the_mayor",
    content_group: "ask_the_mayor",
  })
})
</script>

<template>
  <div>
    <Html lang="en">
      <Head>
        <Title
          >WNYC | New York Public Radio, Podcasts, Live Streaming Radio,
          News</Title
        >
        <Meta
          name="og:title"
          content="WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News"
        />
        <Meta
          name="twitter:title"
          content="WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News"
        />
      </Head>
    </Html>

    <section>
      <div class="flex align-items-center">
        <Button
          class="back-btn text-color -ml-4"
          icon="pi pi-chevron-left"
          rounded
          text
          severity="secondary"
          aria-label="back to previous page"
          @click="navigateTo('/home')"
          label="Back"
        />
      </div>
      <h1>Ask the Mayor</h1>

      <!-- <p>Information about this feature</p>
      <p>You can record up to {{ recordTimeLimit }} seconds</p> -->

      <div class="card flex justify-center w-full">
        <Stepper value="1" class="w-full">
          <StepList>
            <Step value="1">{{ loginOrSignupStepLabel }}</Step>
            <Step value="2">Header II</Step>
            <Step value="3">Header III</Step>
          </StepList>
          <StepPanels>
            <StepPanel v-slot="{ activateCallback }" value="1">
              <div class="flex flex-col h-48">
                <div
                  class="border-2 border-dashed border-surface-200 dark:border-surface-700 rounded bg-surface-50 dark:bg-surface-950 flex-auto flex justify-center items-center font-medium"
                >
                  Content I
                </div>
              </div>
              <!-- <div class="flex pt-6 justify-end">
                <Button
                  label="Next"
                  icon="pi pi-arrow-right"
                  iconPos="right"
                  @click="activateCallback('2')"
                />
              </div> -->
            </StepPanel>
            <StepPanel v-slot="{ activateCallback }" value="2">
              <div class="flex flex-col h-48">
                <div
                  class="border-2 border-dashed border-surface-200 dark:border-surface-700 rounded bg-surface-50 dark:bg-surface-950 flex-auto flex justify-center items-center font-medium"
                >
                  Content II
                </div>
              </div>
              <!-- <div class="flex pt-6 justify-between">
                <Button
                  label="Back"
                  severity="secondary"
                  icon="pi pi-arrow-left"
                  @click="activateCallback('1')"
                />
                <Button
                  label="Next"
                  icon="pi pi-arrow-right"
                  iconPos="right"
                  @click="activateCallback('3')"
                />
              </div> -->
            </StepPanel>
            <StepPanel v-slot="{ activateCallback }" value="3">
              <div class="flex flex-col h-48">
                <div
                  class="border-2 border-dashed border-surface-200 dark:border-surface-700 rounded bg-surface-50 dark:bg-surface-950 flex-auto flex justify-center items-center font-medium"
                >
                  Content III
                </div>
              </div>
              <!-- <div class="pt-6">
                <Button
                  label="Back"
                  severity="secondary"
                  icon="pi pi-arrow-left"
                  @click="activateCallback('2')"
                />
              </div> -->
            </StepPanel>
          </StepPanels>
        </Stepper>
      </div>

      <div v-if="!user" class="flex flex-column gap-2 my-4">
        <p>Must login/create an account to use this feature</p>
        <!-- <Button label="Login" @click="loginSideBar = true" />
        <Button label="Create Account" @click="signinSideBar = true" /> -->
      </div>
      <!-- Have to return the user back to the ATM page after logging in / signing up -->
      <!-- will we have limits per user? once a day? -->

      <!-- :invalid="$form.avatar_url?.invalid" -->
      <div
        v-else-if="!questionLimitReached"
        class="flex flex-column gap-2 my-4"
      >
        <atm-upload-media
          ref="UploadMediaREF"
          :invalid="false"
          :bucket="bucketName"
          :subfolder="subfolder"
          :submissionTable="submissionTable"
          header="Capture/Upload Video"
          :uploadButton="false"
          :videoButton="true"
          :cameraButton="false"
          :fileButton="false"
          :audioButton="false"
          :browseButton="false"
          :maxFiles="1"
          @upload-complete="onUploadComplete"
          @upload-error="onUploadError"
          @files-updated="onFilesUpdated"
          @has-files="hasFiles = $event"
          @upload-progress="submitProgress = $event"
          :user="user"
          :recordTimeLimit="recordTimeLimit"
        />
        <p v-if="submitProgress">{{ submitProgress }}</p>
        <Button
          v-if="hasFiles && !submitProgress"
          label="Submit video"
          @click="onFormSubmit"
        />
      </div>
      <div v-else class="flex flex-column gap-2 my-4">
        <p>Question limit reached. Please try again tomorrow.</p>
      </div>
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <p>End of Page</p>
    </section>
  </div>
</template>
<style lang="scss">
.ask-the-mayor {
  .p-stepper {
    .p-steplist {
      overflow: visible;
      height: 90px;
      align-items: flex-start;
      .p-step {
        .p-step-header {
          flex-direction: column;
          pointer-events: none;
          .p-step-number {
            &:after {
              content: "";
              width: 1rem;
              height: 1rem;
              background-color: var(--p-stepper-step-number-active-background);
              box-shadow: none;
            }
          }
          .p-step-title {
            position: absolute;
            display: inline-table;
            top: 38px;
            z-index: 1;
            overflow: visible;
          }
        }
        &.p-step-active {
          .p-step-title {
            font-weight: 700;
          }
          .p-step-number {
            &:after {
              background-color: var(--p-sky-500);
            }
          }
        }
      }
    }
  }
}
</style>