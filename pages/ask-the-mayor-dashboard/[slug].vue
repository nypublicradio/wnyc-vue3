<script setup>
import { useToast } from "primevue/usetoast"
import { useCurrentUser } from "~/composables/states.ts"
import { useAtmDashboard } from "~/composables/atm/useAtmDashboard"
const route = useRoute()
const slug = route.params.slug
const supabase = useSupabaseClient()
const toast = useToast()
const user = useCurrentUser()

const submission = ref(null)
const videoUrl = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const { data: submissionData, error: submissionError } = await supabase
      .from("atm_submissions")
      .select("*")
      .eq("video_filename", slug)
      .single()

    if (submissionError) throw submissionError

    // Fetch profile manually
    if (submissionData && submissionData.user_id) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", submissionData.user_id)
        .single()

      submissionData.profiles = profileData || null
    }

    submission.value = submissionData
    const data = submissionData // Keep reference for videoUrl logic below

    if (data && data.video_filename) {
      const path = data.subfolder_date
        ? `atm/${data.subfolder_date}/${data.video_filename}`
        : `atm/${data.video_filename}`

      const { data: urlData } = supabase.storage
        .from("media")
        .getPublicUrl(path)
      videoUrl.value = urlData.publicUrl
      console.log("Video URL:", videoUrl.value)
    }

    const { $analytics } = useNuxtApp()
    $analytics.sendPageView({
      page_title: "Ask the Mayor Submission",
      page_type: "ask_the_mayor_submission",
      content_group: "ask_the_mayor",
    })
  } catch (e) {
    console.error("Error fetching submission", e)
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Could not load submission",
      life: 3000,
    })
  } finally {
    loading.value = false
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

      <div v-if="user">
        <div v-if="loading">Loading...</div>
        <div v-else-if="submission" class="flex flex-column gap-4">
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
        <div v-else>
          <p>Submission not found.</p>
        </div>
      </div>
      <div v-else>
        <p>You are not authorized to view this page. Please log in.</p>
        <Login />
      </div>
    </section>
  </div>
</template>
