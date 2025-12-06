<script setup>
import { useToast } from "primevue/usetoast";

const route = useRoute();
const slug = route.params.slug;
const supabase = useSupabaseClient();
const toast = useToast();

const submission = ref(null);
const videoUrl = ref(null);
const loading = ref(true);

onMounted(async () => {
    try {
        const { data: submissionData, error: submissionError } = await supabase
            .from('atm_submissions')
            .select('*')
            .eq('video_filename', slug)
            .single();
            
        if (submissionError) throw submissionError;

        // Fetch profile manually
        if (submissionData && submissionData.user_id) {
             const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', submissionData.user_id)
                .single();
            
            submissionData.profiles = profileData || null;
        }

        submission.value = submissionData;
        const data = submissionData; // Keep reference for videoUrl logic below
        
        if (data && data.video_filename) {
             const { data: urlData } = supabase.storage
                .from('media')
                .getPublicUrl(`atm/${data.video_filename}`);
            videoUrl.value = urlData.publicUrl;
        }
        
      const { $analytics } = useNuxtApp();
      $analytics.sendPageView({
        page_title: "Ask the Mayor Submission",
        page_type: "ask_the_mayor_submission",
        content_group: "ask_the_mayor",
      });

    } catch (e) {
        console.error("Error fetching submission", e);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Could not load submission', life: 3000 });
    } finally {
        loading.value = false;
    }
});
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
        
        <div v-if="loading">Loading...</div>
        <div v-else-if="submission" class="flex flex-column gap-4">
            <h1>Submission from {{ submission.profiles?.first_name }} {{ submission.profiles?.last_name }}</h1>
            <p class="text-sm text-500">{{ new Date(submission.created_at).toLocaleDateString() }} - {{ new Date(submission.created_at).toLocaleTimeString() }}</p>
            
            <div v-if="videoUrl" class="video-container surface-card p-4 border-round shadow-2" style="max-width: 800px">
                <video :src="videoUrl" controls class="w-full border-round"></video>
            </div>
            
            <Panel header="Transcript" toggleable>
                <p class="m-0 line-height-3">{{ submission.transcript || 'No transcript available.' }}</p>
            </Panel>
        </div>
        <div v-else>
            <p>Submission not found.</p>
        </div>
    </section>
  </div>
</template>
