
<script setup>
const UploadMediaREF = ref(null);
const bucketName = "media";
const subfolder = "atm";
const profileTable = "profiles";

// Submit Handler
const onFormSubmit = async (e) => {
  if (e.valid) {
    try {
      // Upload Avatar if changed
      await UploadMediaREF.value?.uploadFiles();

      const updates = {
        id: user.value.sub,
        updated_at: new Date(),
        avatar_url: initialValues.value.avatar_url,
      };

      // Cleanup
      delete updates.address2;
      // delete updates.email // Don't update email here

      const { error } = await supabase.from(profileTable).upsert(updates);
      if (error) throw error;

      toast.add({
        severity: "success",
        summary: "Profile Updated",
        life: 3000,
      });
    } catch (error) {
      console.error("Update error:", error);
      toast.add({
        severity: "error",
        summary: "Update Failed",
        detail: error.message,
        life: 3000,
      });
    }
  } else {
    toast.add({
      severity: "error",
      summary: "Validation Failed",
      detail: "Please check the highlighted fields.",
      life: 3000,
    });
  }
};

const onAvatarUpload = (event) => {
  if (event.path) {
    // Construct the full public URL from the relative path
    const supabaseUrl = supabase.storage
      .from(bucketName)
      .getPublicUrl(event.path).data.publicUrl;
    initialValues.value.avatar_url = supabaseUrl;

    console.log("Avatar uploaded - relative path:", event.path);
    console.log("Avatar uploaded - full URL:", supabaseUrl);

    // Trigger validation
    const avatarInput = avatarREF.value?.$el;
    if (avatarInput) {
      avatarInput.value = supabaseUrl;
      avatarInput.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }
};

const onFilesUpdated = (files) => {
  // This is called when files are selected but not yet uploaded
  // We just use this to clear validation errors, actual path comes from onAvatarUpload
  if (files && files.length > 0) {
    const avatarInput = avatarREF.value?.$el;
    if (avatarInput) {
      // Set a temporary value to pass validation
      avatarInput.value = "uploading";
      avatarInput.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }
};

onMounted(() => {
  // send GA page view
  const { $analytics } = useNuxtApp();
  $analytics.sendPageView({
    page_title: "Ask the Mayor",
    page_type: "ask_the_mayor",
    content_group: "ask_the_mayor",
  });
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
  </div>
  <section>
    <h1>Ask the Mayor</h1>
    <!-- :invalid="$form.avatar_url?.invalid" -->
    <atm-upload-media
      ref="UploadMediaREF"
      :bucket="bucketName"
      :subfolder="subfolder"
      header="Capture/Upload Video"
      :uploadButton="false"
      :videoButton="true"
      :cameraButton="false"
      :fileButton="false"
      :imageButton="false"
      :audioButton="false"
      :browseButton="false"
      :maxFiles="1"
      @upload-complete="onAvatarUpload"
      @files-updated="onFilesUpdated"
      :patientId="user?.sub"
    />
    <Button label="Submit" @click="onFormSubmit" />
  </section>
</template>

<style>
</style>