<script setup>
import { useToast } from "primevue/usetoast"
//import { FilterMatchMode } from "@primevue/core/api"
import { useCurrentUser } from "~/composables/states.ts"
import { useAtmDashboard } from "~/composables/atm/useAtmDashboard"
useHead({
  bodyAttrs: {
    class: "no-bottom-padding hide-bottom-menu",
  },
})
const toast = useToast()
const user = useCurrentUser()
const supabase = useSupabaseClient()
const isAdmin = ref(false)
const isLoading = ref(true)

const config = useRuntimeConfig()
const {
  data: submissions,
  status,
  error,
  execute: executeFetchSubmissions,
} = await useFetch("/api/atm/submissions", {
  baseURL: config.public.BFF_URL,
  immediate: false,
  headers: computed(() => {
    return {
      Authorization: authToken.value ? `Bearer ${authToken.value}` : "",
    }
  }),
  watch: false, // We manually trigger
})

const authToken = ref("")

const expandedRows = ref({})
// const filters = ref({
//   global: { value: null, matchMode: FilterMatchMode.CONTAINS },
// })

const groupedSubmissions = computed(() => {
  const groups = {}
  // Ensure submissions.value is an array before iterating
  if (!submissions.value) return []

  submissions.value.forEach((submission) => {
    const date = new Date(submission.created_at).toLocaleDateString()
    if (!groups[date]) {
      groups[date] = {
        date,
        submissions: [],
        approvedCount: 0,
      }
    }
    groups[date].submissions.push(submission)
    if (submission.approved_for_use) {
      groups[date].approvedCount++
    }
  })
  return Object.values(groups).sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  )
})

// handle fetch submissions
const fetchSubmissions = async () => {
  isLoading.value = true
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    authToken.value = session?.access_token || ""

    // execute the fetch
    await executeFetchSubmissions()

    if (error.value) {
      throw error.value
    }

    isAdmin.value = true

    if (submissions.value && submissions.value.length > 0) {
      await nextTick()
      if (groupedSubmissions.value.length > 0) {
        const firstDate = groupedSubmissions.value[0].date
        expandedRows.value = { [firstDate]: true }
      }
    }
  } catch (err) {
    console.error("Error fetching submissions:", err)
    isAdmin.value = false
    // useFetch error object might be wrapped
    if (err.statusCode === 403 || err.response?.status === 403) {
      // expected for non-admins
    } else {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "Failed to fetch submissions",
        life: 3000,
      })
    }
  } finally {
    isLoading.value = false
  }
}

const { toggleApproved, shareSubmission, downloadSubmission } =
  useAtmDashboard()

// handle navigate to slug page
const navigateToSlug = (event) => {
  const submission = event.data
  navigateTo(`/ask-the-mayor-dashboard/${submission.video_filename}`)
}

onMounted(async () => {
  // send GA page view
  const { $analytics } = useNuxtApp()
  $analytics.sendPageView({
    page_title: "Ask the Mayor Dashboard",
    page_type: "ask_the_mayor_page",
    content_group: "ask_the_mayor",
  })

  // Initial Check
  const { data } = await supabase.auth.getSession()
  if (data.session) {
    await fetchSubmissions()
  } else {
    isLoading.value = false
  }
})

// check if th euser is an admin
// check if the user is an admin by fetching submissions
watch(
  () => user.value,
  () => {
    if (user.value) {
      fetchSubmissions()
    } else {
      isAdmin.value = false
      submissions.value = []
      isLoading.value = false
    }
  }
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

    <section class="full-width">
      <SHeader
        class="pb-4"
        label="Ask the Mayor Dashboard"
        @close-sidebar="() => navigateTo('/home')"
      />

      <!-- 1. Always show loader initially or when loading -->
      <div v-if="isLoading">
        <WnycLoader class="mt-8 w-8rem mx-auto" />
      </div>

      <!-- 2. If done loading and NO user -->
      <div v-else-if="!user">
        <div>
          <p>You are not authorized to view this page. Please log in.</p>
          <Login />
        </div>
      </div>

      <!-- 3. If done loading, user exists, but NOT admin -->
      <div v-else-if="!isAdmin">
        <div>
          <p>
            You are not authorized to view this page. Contact an administrator
            to provide access.
          </p>
        </div>
      </div>

      <!-- 4. If done loading, user exists, IS admin -->
      <div v-else>
        <DataTable
          v-model:expandedRows="expandedRows"
          :value="groupedSubmissions"
          dataKey="date"
          tableStyle="min-width: 60rem"
          :loading="status === 'pending'"
        >
          <Column expander style="width: 5rem" />
          <Column field="date" header="Date"></Column>
          <Column field="submissions.length" header="Submissions"></Column>
          <Column field="approvedCount" header="Approvals"></Column>
          <template #expansion="slotProps">
            <div class="p-4">
              <h5>Submissions for {{ slotProps.data.date }}</h5>
              <DataTable
                :value="slotProps.data.submissions"
                selectionMode="single"
                @rowSelect="navigateToSlug"
              >
                <Column field="profiles.name" header="Submitter" sortable>
                  <template #body="slotProps">
                    {{
                      slotProps.data.profiles?.name ||
                      slotProps.data.profiles?.first_name ||
                      "N/A"
                    }}
                  </template>
                </Column>
                <Column field="profiles.email" header="Contact" sortable>
                  <template #body="slotProps">
                    <div>
                      <VFlexibleLink
                        v-if="slotProps.data.profiles?.email"
                        :to="`mailto:${slotProps.data.profiles.email}`"
                        target="_blank"
                        @click.stop
                      >
                        {{ slotProps.data.profiles.email }}
                      </VFlexibleLink>
                      <span v-else>N/A </span>
                    </div>
                    <div>
                      <VFlexibleLink
                        v-if="slotProps.data.instagram_handle"
                        :to="`https://instagram.com/${slotProps.data.instagram_handle}`"
                        target="_blank"
                        @click.stop
                      >
                        @{{ slotProps.data.instagram_handle }}
                      </VFlexibleLink>
                    </div>
                  </template>
                </Column>
                <Column
                  field="transcript"
                  header="Transcript"
                  sortable
                ></Column>
                <Column field="approved_for_use" header="Approved" sortable>
                  <template #body="slotProps">
                    <Checkbox
                      v-model="slotProps.data.approved_for_use"
                      :binary="true"
                      @change="toggleApproved(slotProps.data)"
                      @click.stop
                    />
                  </template>
                </Column>
                <Column field="retakes" header="Retakes" sortable> </Column>
                <Column header="Actions">
                  <template #body="slotProps">
                    <div class="flex gap-2">
                      <Button
                        icon="pi pi-download"
                        text
                        rounded
                        aria-label="Download"
                        @click="
                          (event) => downloadSubmission(slotProps.data, event)
                        "
                      />
                      <Button
                        icon="pi pi-share-alt"
                        text
                        rounded
                        aria-label="Share"
                        @click="
                          (event) => shareSubmission(slotProps.data, event)
                        "
                      />
                    </div>
                  </template>
                </Column>
              </DataTable>
            </div>
          </template>
        </DataTable>
      </div>
    </section>
  </div>
</template>
