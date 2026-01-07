
<script setup>
import { useToast } from "primevue/usetoast"
import { useIsActive, useIsApp } from "~/composables/states"
import OneSignal from "onesignal-cordova-plugin"
import { formatDate, trackClickEvent } from "~/utilities/helpers"
useHead({
  bodyAttrs: {
    class: "no-bottom-padding hide-bottom-menu",
  },
})
const toast = useToast()

const user = useCurrentUser()
const bucketName = "media"
const subfolder = "atm"
const submissionTable = "atm_submissions"
const isLoading = ref(true)
const UploadMediaREF = ref(null)
const hasFiles = ref(false)
const submitProgress = ref(null)
const uploadCompleted = ref(false)
const recordTimeLimit = 30
const activeStep = ref(1)
const questionLimitReached = ref(false)
const questionLimitDays = ref(1) // only submit a question once per day
const isSignupForm = ref(false)
const isActiveGlobal = useIsActive()
const isApp = useIsApp()
const miscData = ref({
  instagramHandle: "",
})
const supabase = useSupabaseClient()
const authToken = ref("")

const config = useRuntimeConfig()

const {
  data: limitData,
  execute: executeLimitData,
  refresh: refreshLimitData,
} = await useFetch("/api/atm/check-limit", {
  params: {
    days: questionLimitDays,
  },
  watch: [user, authToken, questionLimitDays],
  headers: computed(() => {
    return {
      Authorization: authToken.value ? `Bearer ${authToken.value}` : "",
    }
  }),
  baseURL: config.public.BFF_URL,
  immediate: false,
}) // user is watched, so it will re-fetch on change

const { data } = await supabase.auth.getSession()
if (data.session) {
  authToken.value = data.session.access_token
}
executeLimitData()

// Submit Handler
const onFormSubmit = async () => {
  try {
    // scroll the user to the top
    setTimeout(() => {
      window.scrollTo(0, 0)
    }, 250)

    await UploadMediaREF.value?.uploadFiles()

    // update OneSignal tags for App env only
    if (isApp.value) {
      try {
        await OneSignal.User.addTags({
          "ask-the-mayor": "true",
          "ask-the-mayor-date": formatDate(null, "MM/dd/yyyy h:mm a"),
        })
      } catch (osError) {
        console.error("OneSignal Tag Error:", osError)
      }
    }

    toast.add({
      severity: "success",
      summary: "Video uploaded successfully",
      life: 3000,
    })
    trackClickEvent(
      "Click Tracking - Submit Success",
      "Ask the Mayor",
      "Submit"
    )
  } catch (error) {
    console.error("Update error:", error)
    toast.add({
      severity: "error",
      summary: "Upload Failed",
      detail: error.message,
      life: 3000,
    })
    trackClickEvent("Click Tracking - Submit Error", "Ask the Mayor", "Submit")
  }
}
// handle upload error, not used for now
//const onUploadError = (/* event*/) => {}
// handle upload complete
const onUploadComplete = async (/*event*/) => {
  await refreshLimitData()
  questionLimitReached.value = true
  uploadCompleted.value = true
}
// handle files updated, not used for now
//const onFilesUpdated = (/*files*/) => {}

const loginOrSignupStepLabel = computed(() => {
  return isSignupForm.value ? "Sign Up" : "Login"
})
// handle login click
const onLoginClick = () => {
  isSignupForm.value = false
}
// handle signup click
const onSignupClick = () => {
  isSignupForm.value = true
}

onMounted(() => {
  // send GA page view
  const { $analytics } = useNuxtApp()
  $analytics.sendPageView({
    page_title: "Ask the Mayor Submission Page",
    page_type: "ask_the_mayor_page",
    content_group: "ask_the_mayor",
  })
})

watch(limitData, (val) => {
  if (val) {
    questionLimitReached.value = val.questionLimitReached
    isLoading.value = false
  }
})

watch(
  user,
  () => {
    if (user.value) {
      activeStep.value = 2
    }
  },
  { immediate: true }
)

watch(
  hasFiles,
  () => {
    if (hasFiles.value) {
      activeStep.value = 3
    } else if (user.value) {
      activeStep.value = 2
    } else {
      activeStep.value = 1
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="ask-the-mayor submission">
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
      <SHeader
        class="pb-4"
        label="Ask the Mayor"
        @close-sidebar="() => navigateTo('/ask-the-mayor')"
      />
      <!-- <NuxtLink to="/ask-the-mayor-dashboard">Temp Dashboard Link</NuxtLink> -->
      <div v-if="isLoading">
        <WnycLoader class="mt-8 w-8rem mx-auto" />
      </div>
      <div v-else>
        <!-- <Button label="step 1" @click="activeStep = 1" />
        <Button label="step 2" @click="activeStep = 2" />
        <Button label="step 3" @click="activeStep = 3" /> -->
        <div v-if="uploadCompleted" class="my-2 text-center">
          <i
            class="pi pi-check-circle text-5xl my-4"
            style="color: var(--p-sky-500)"
          ></i>
          <h2>Thank you!</h2>
        </div>
        <div
          v-if="questionLimitReached"
          class="mt-4 max-w-22rem mx-auto flex flex-column gap-3"
        >
          <p class="line-height-3">
            We have received your video. You are limited to one submission per
            day. You will be able to submit another question soon.
          </p>
          <!-- <p class="line-height-3">
          You are limited to a submission every {{ questionLimitDays }} days.
          You will be able to submit another question after
          {{ getNextSubmissionDate }}.
          </p> -->
          <p class="line-height-3">
            In the meantime, your video will be reviewed and you will be
            contacted if your question is selected for the mayor's response.
          </p>
          <Button
            class="mt-4 w-16rem mx-auto block"
            label="Back to home"
            @click="navigateTo('/home')"
          />
        </div>
        <div v-else>
          <div class="card flex justify-center w-full">
            <Stepper
              v-if="submitProgress === null"
              v-model:value="activeStep"
              class="w-full flex flex-column-reverse gap-4"
            >
              <StepList class="px-5">
                <Step :value="1" :class="{ completed: activeStep > 1 }">
                  {{ loginOrSignupStepLabel }}
                </Step>
                <Step :value="2" :class="{ completed: activeStep > 2 }"
                  >Create Video</Step
                >
                <Step :value="3" :class="{ completed: activeStep > 3 }"
                  >Review</Step
                >
              </StepList>
              <StepPanels>
                <StepPanel :value="1">
                  <div class="flex flex-col">
                    <div class="step-content">
                      <div class="flex flex-column gap-1">
                        <h2>
                          {{ isSignupForm ? "Sign up" : "Log in" }} for a WNYC
                          account
                        </h2>
                        <p>Submit your question in the 3 easy steps</p>
                      </div>
                    </div>
                  </div>
                </StepPanel>
                <StepPanel :value="2">
                  <div class="flex flex-col h-48">
                    <div class="step-content">
                      <div class="flex flex-column gap-1">
                        <h2>Create Video</h2>
                        <p>Record yourself asking the mayor a question.</p>
                      </div>
                    </div>
                  </div>
                </StepPanel>
                <StepPanel :value="3">
                  <div class="flex flex-col">
                    <div class="step-content">
                      <div class="flex flex-column gap-1">
                        <h2>Review & Submit</h2>
                        <p>Tab submit when you're ready to send it.</p>
                      </div>
                    </div>
                  </div>
                </StepPanel>
              </StepPanels>
            </Stepper>
          </div>
          <div class="stepper flex justify-center w-full">
            <div v-if="activeStep === 1" class="step-1 w-full">
              <div class="">
                <div class="step-content">
                  <div class="w-full">
                    <Signup
                      v-if="isSignupForm"
                      returnRoute="/ask-the-mayor/submission"
                    >
                      <template #header>
                        <p>
                          Already have an account?
                          <VFlexibleLink
                            aria-label="log in"
                            @flexible-link-click="onLoginClick"
                          >
                            Log in
                          </VFlexibleLink>
                        </p>
                      </template>
                    </Signup>
                    <Login v-else returnRoute="/ask-the-mayor/submission">
                      <template #header>
                        <p>
                          Don't have an account yet?
                          <VFlexibleLink
                            aria-label="sign up"
                            @flexible-link-click="onSignupClick"
                          >
                            Sign up
                          </VFlexibleLink>
                        </p>
                      </template>
                    </Login>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="step-2 step-3 w-full">
              <div class="flex w-full">
                <div class="step-content w-full">
                  <div class="flex flex-column gap-1">
                    <div
                      v-if="isActiveGlobal || activeStep === 3"
                      class="flex flex-column gap-2"
                    >
                      <atm-upload-media
                        ref="UploadMediaREF"
                        :invalid="false"
                        :bucket="bucketName"
                        :subfolder="subfolder"
                        :submissionTable="submissionTable"
                        :header="null"
                        :uploadButton="false"
                        :videoButton="true"
                        :cameraButton="false"
                        :fileButton="false"
                        :audioButton="false"
                        :browseButton="false"
                        :maxFiles="1"
                        autoSelect="video"
                        @upload-complete="onUploadComplete"
                        @has-files="hasFiles = $event"
                        @upload-progress="submitProgress = $event"
                        @close-capture="navigateTo('/ask-the-mayor')"
                        :user="user"
                        :recordTimeLimit="recordTimeLimit"
                        :miscData="miscData"
                      />
                      <!-- @upload-error="onUploadError" -->
                      <!-- @files-updated="onFilesUpdated" -->
                      <p
                        v-if="submitProgress"
                        class="text-center w-full flex items-items-center justify-content-center"
                      >
                        <i
                          class="pi pi-spinner pi-spin"
                          style="color: var(--p-sky-500)"
                        ></i>
                        <span class="ml-2">{{ submitProgress }}</span>
                      </p>
                      <div
                        v-if="hasFiles && !submitProgress"
                        class="flex flex-column gap-2 mt-4"
                      >
                        <div
                          class="flex flex-column gap-2 max-w-21rem w-full m-auto"
                        >
                          <label for="insta-username" class="text-xs font-bold"
                            >Instagram handle (optional)</label
                          >
                          <InputText
                            id="insta-username"
                            type="text"
                            v-model="miscData.instagramHandle"
                            placeholder="username"
                          />
                        </div>

                        <Button
                          label="Submit"
                          class="w-16rem m-auto my-3"
                          @click="onFormSubmit"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
<style lang="scss">
.ask-the-mayor.submission {
  @mixin upload-media-styles {
    .capture-component-container {
      border: none;
      margin-bottom: 0;
      padding: 0;
      .capture-video-audio {
        padding: 0;
        background-color: transparent;
      }
    }
  }

  .stepper {
    .step-2,
    .step-3 {
      background-color: transparent;
      padding: 0;
      .p-panel {
        background: var(--p-sky-50);
        border: 2px dotted var(--p-sky-500);
        .p-panel-header {
          display: none;
        }
        .p-panel-content {
          padding: 1rem;
          .filepond--root {
            margin-bottom: 0;
            .filepond--file {
              .filepond--file-action-button,
              .filepond--file-info {
                display: none;
              }
            }
          }
        }
      }
      @include upload-media-styles;
    }
  }
}
</style>