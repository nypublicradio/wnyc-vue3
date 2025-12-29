<script setup>
import { useToast } from "primevue/usetoast"
import { useCurrentUser } from "~/composables/states.ts"
import { useAtmDashboard } from "~/composables/atm/useAtmDashboard"
useHead({
  bodyAttrs: {
    class: "no-bottom-padding hide-bottom-menu",
  },
})
const route = useRoute()
const slug = route.params.slug
const supabase = useSupabaseClient()
const toast = useToast()
const user = useCurrentUser()

const authToken = ref("")
const submission = ref(null)
const videoUrl = ref(null)
const isLoading = ref(true)

const config = useRuntimeConfig()
const {
  data: fetchedSubmission,
  error,
  execute: executeFetchSubmission,
} = await useFetch(`/api/atm/submission/${slug}`, {
  baseURL: config.public.BFF_URL,
  immediate: false,
  headers: computed(() => {
    return {
      Authorization: authToken.value ? `Bearer ${authToken.value}` : "",
    }
  }),
})

onMounted(async () => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    authToken.value = session?.access_token || ""

    await executeFetchSubmission()

    if (error.value) {
      throw error.value
    }

    submission.value = fetchedSubmission.value
    if (submission.value?.videoUrl) {
      videoUrl.value = submission.value.videoUrl
    }

    const { $analytics } = useNuxtApp()
    $analytics.sendPageView({
      page_title: "Ask the Mayor Submission",
      page_type: "ask_the_mayor_submission",
      content_group: "ask_the_mayor",
    })
  } catch (e) {
    console.error("Error fetching submission", e)
    // Handle specific error codes if needed
    if (e.statusCode === 403 || e.response?.status === 403) {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "You are not authorized to view this submission.",
        life: 3000,
      })
    } else {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "Could not load submission",
        life: 3000,
      })
    }
  } finally {
    isLoading.value = false
  }
})

const { toggleApproved, shareSubmission, downloadSubmission } =
  useAtmDashboard()
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
      <div class="flex align-items-center mb-4">
        <Button
          class="back-btn text-color -ml-4"
          icon="pi pi-chevron-left"
          rounded
          text
          severity="secondary"
          aria-label="back to previous page"
          @click="navigateTo('/ask-the-mayor-dashboard')"
          label="Back"
        />
      </div>

      <div v-if="isLoading">
        <WnycLoader class="mt-8 w-8rem mx-auto" />
      </div>

      <div v-else-if="!user">
        <div>
          <p>You are not authorized to view this page. Please log in.</p>
          <Login />
        </div>
      </div>

      <div v-else-if="submission">
        <div class="flex flex-column gap-4">
          <h1>
            Submission from
            {{
              submission.profiles?.name ||
              submission.profiles?.first_name ||
              "Unknown"
            }}
          </h1>
          <div class="flex flex-wrap row-gap-2 column-gap-4">
            <p v-if="submission.profiles?.email">
              Email:
              <a
                :href="`mailto:${submission.profiles.email}`"
                target="_blank"
                >{{ submission.profiles.email }}</a
              >
            </p>

            <p v-if="submission.instagram_handle">
              Instagram:
              <a
                :href="`https://instagram.com/${submission.instagram_handle}`"
                target="_blank"
                >@{{ submission.instagram_handle }}</a
              >
            </p>
          </div>
          <p class="text-sm text-500">
            {{ new Date(submission.created_at).toLocaleDateString() }} -
            {{ new Date(submission.created_at).toLocaleTimeString() }}
          </p>

          <div class="flex align-items-center gap-2">
            <Checkbox
              v-model="submission.approved_for_use"
              :binary="true"
              inputId="approved"
              @change="toggleApproved(submission)"
            />
            <label for="approved" class="cursor-pointer"
              >Approved for Use</label
            >
          </div>

          <div class="flex gap-2">
            <Button
              icon="pi pi-download"
              label="Download"
              @click="downloadSubmission(submission)"
            />
            <Button
              icon="pi pi-share-alt"
              label="Share"
              severity="secondary"
              @click="shareSubmission(submission)"
            />
          </div>

          <p class="flex align-items-center gap-1">
            <i class="pi pi-refresh"></i>{{ submission.retakes }} Retakes
          </p>
          <div
            v-if="videoUrl"
            class="video-container surface-card p-4 border-round shadow-2"
            style="max-width: 800px"
          >
            <video
              :src="videoUrl"
              controls
              class="w-full border-round"
              crossorigin="anonymous"
            ></video>
          </div>

          <Panel header="Transcript" toggleable>
            <p class="m-0 line-height-3">
              {{ submission.transcript || "No transcript available." }}
            </p>
          </Panel>
        </div>
      </div>
      <div v-else>
        <p>Submission not found.</p>
      </div>
    </section>
  </div>
</template>
