
<script setup>
import { useToast } from "primevue/usetoast"

const toast = useToast()

const user = useCurrentUser()
const bucketName = "media"
const subfolder = "atm"
const submissionTable = "atm_submissions"

const UploadMediaREF = ref(null)
const questionLimitReached = ref(false)
const hasFiles = ref(false)
const submitProgress = ref(null)
const recordTimeLimit = 30
const activeStep = ref(1)

// Submit Handler
const onFormSubmit = async (e) => {
  try {
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
}

const onUploadError = (event) => {}
const onUploadComplete = (event) => {}

const onFilesUpdated = (files) => {}
const isSignupForm = ref(true)

const loginOrSignupStepLabel = computed(() => {
  return isSignupForm.value ? "Sign Up" : "Login"
})

const onLoginClick = () => {
  isSignupForm.value = false
}

const onSignupClick = () => {
  isSignupForm.value = true
}

onMounted(() => {
  // send GA page view
  const { $analytics } = useNuxtApp()
  $analytics.sendPageView({
    page_title: "Ask the Mayor",
    page_type: "ask_the_mayor",
    content_group: "ask_the_mayor",
  })
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

      <Button label="step 1" @click="activeStep = 1" />
      <Button label="step 2" @click="activeStep = 2" />
      <Button label="step 3" @click="activeStep = 3" />

      <!-- <p>Information about this feature</p>
      <p>You can record up to {{ recordTimeLimit }} seconds</p> -->

      <div class="card flex justify-center w-full mt-4">
        <Stepper
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
                    <h2>Sign up for a WNYC account</h2>
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

      <div class="card flex justify-center w-full">
        <Stepper v-model:value="activeStep" class="w-full">
          <StepPanels>
            <StepPanel :value="1" class="step-1">
              <div class="">
                <div class="step-content">
                  <div>
                    <Signup v-if="isSignupForm" :returnRoute="'/ask-the-mayor'">
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
                    <Login v-else :returnRoute="'/ask-the-mayor'">
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
            </StepPanel>
            <StepPanel
              v-for="step in [2, 3]"
              :key="step"
              :value="step"
              :class="`step-${step}`"
            >
              <div class="flex w-full">
                <div class="step-content w-full">
                  <div class="flex flex-column gap-1">
                    <div class="flex flex-column gap-2">
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
                  </div>
                </div>
              </div>
            </StepPanel>
          </StepPanels>
        </Stepper>
      </div>

      <!-- <div v-else class="flex flex-column gap-2 my-4">
        <p>Question limit reached. Please try again tomorrow.</p>
      </div> -->
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

  .p-stepper {
    .p-steppanels {
      .p-steppanel {
        border-radius: 8px;
        padding: 1rem;
        &.step-1 {
          padding: 0;
          background-color: transparent;
          section {
            padding-left: 0;
            padding-right: 0;
          }
        }
        &.step-2,
        &.step-3 {
          background-color: var(--p-sky-100);
          padding: 0;
          .p-panel {
            background: transparent;
            border: 2px dotted var(--p-sky-500);
            .p-panel-header {
              display: none;
            }
            .p-panel-content {
              padding: 1rem;
            }
          }
          @include upload-media-styles;
        }
      }
    }
    .p-steplist {
      overflow: visible;
      height: 90px;
      align-items: flex-start;
      .p-step {
        .p-step-header {
          flex-direction: column;
          pointer-events: none;
          .p-step-number {
            border-width: 2px;
            min-width: 1.5rem;
            height: 1.5rem;
            font-size: 0;
            &:after {
              content: "";
              width: 0.85rem;
              height: 0.85rem;
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
        //ACTIVE
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
        &.completed {
          .p-step-number {
            background-color: var(--p-sky-500);
            &:before {
              content: "\e909";
              color: var(--p-surface-0);
              font-family: "primeicons";
              font-size: 0.8rem;
              font-weight: 900;
              z-index: 1;
            }
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