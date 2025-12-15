<script setup>
import { trackClickEvent } from "~/utilities/helpers"
import { useToast } from "primevue/usetoast"
import { FilterMatchMode } from "@primevue/core/api"
import { useCurrentUser } from "~/composables/states.ts"
import { useAtmDashboard } from "~/composables/atm/useAtmDashboard"

const toast = useToast()
const user = useCurrentUser()
const supabase = useSupabaseClient()

const submissions = ref([])
const expandedRows = ref({})
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const groupedSubmissions = computed(() => {
  const groups = {}
  submissions.value.forEach((submission) => {
    const date = new Date(submission.created_at).toLocaleDateString()
    if (!groups[date]) {
      groups[date] = {
        date,
        submissions: [],
      }
    }
    groups[date].submissions.push(submission)
  })
  return Object.values(groups).sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  )
})

const fetchSubmissions = async () => {
  try {
    // Fetch submissions
    const { data: submissionsData, error: submissionsError } = await supabase
      .from("atm_submissions")
      .select("*")
      .order("created_at", { ascending: false })

    if (submissionsError) throw submissionsError

    // Extract unique user IDs
    const userIds = [
      ...new Set(submissionsData.map((s) => s.user_id).filter(Boolean)),
    ]

    // Fetch profiles for these users
    let profilesMap = {}
    if (userIds.length > 0) {
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", userIds)

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError)
      } else {
        profilesData.forEach((p) => {
          profilesMap[p.id] = p
        })
      }
    }

    // Attach profile data to submissions
    submissions.value = submissionsData.map((s) => ({
      ...s,
      profiles: profilesMap[s.user_id] || null,
    }))

    // Auto-expand first date
    if (groupedSubmissions.value.length > 0) {
      const firstDate = groupedSubmissions.value[0].date
      expandedRows.value = { [firstDate]: true }
    }
  } catch (error) {
    console.error("Error fetching submissions:", error)
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Failed to fetch submissions",
      life: 3000,
    })
  }
}

const { toggleApproved, shareSubmission, downloadSubmission } =
  useAtmDashboard()

const navigateToSlug = (event) => {
  const submission = event.data
  navigateTo(`/ask-the-mayor-dashboard/${submission.video_filename}`)
}

onMounted(() => {
  fetchSubmissions()
  // send GA page view
  const { $analytics } = useNuxtApp()
  $analytics.sendPageView({
    page_title: "Ask the Mayor Dashboard",
    page_type: "ask_the_mayor_dashboard",
    content_group: "ask_the_mayor_dashboard",
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

    <section class="full-width">
      <div class="flex align-items-center mb-4">
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
      <h1 class="mb-4">Ask the Mayor Dashboard</h1>
      <div v-if="user">
        <DataTable
          v-model:expandedRows="expandedRows"
          :value="groupedSubmissions"
          dataKey="date"
          tableStyle="min-width: 60rem"
        >
          <Column expander style="width: 5rem" />
          <Column field="date" header="Date"></Column>
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
                <Column field="profiles.email" header="Email" sortable>
                  <template #body="slotProps">
                    <a
                      v-if="slotProps.data.profiles?.email"
                      :href="`mailto:${slotProps.data.profiles.email}`"
                      @click.stop
                      >{{ slotProps.data.profiles.email }}</a
                    >
                    <span v-else>N/A</span>
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
      <div v-else>
        <p>You are not authorized to view this page. Please log in.</p>
        <Login />
      </div>
    </section>
  </div>
</template>
<style>
</style>
