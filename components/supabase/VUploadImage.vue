<script setup>
import Button from "primevue/button"
import FileUpload from "primevue/fileupload"
import Message from "primevue/message"
import ProgressSpinner from "primevue/progressspinner"
import { computed, ref, shallowRef } from "vue"
const props = defineProps({
  accept: {
    default: "image/*",
    type: String,
  },
  bucket: {
    default: "avatars",
    type: String,
  },
  userId: {
    default: "user-id",
    type: String,
  },
  client: {
    default: null,
    type: Object,
  },
  config: {
    default: null,
    type: Object,
  },
  currentUser: {
    default: null,
    type: Object,
  },
  currentUserProfile: {
    default: null,
    type: Object,
  },
  fileLimit: {
    default: 1,
    type: Number,
  },
  image: {
    default: "",
    required: true,
    type: [String, null],
  },
  label: {
    default: "Upload Image",
    type: String,
  },
  maxFileSize: {
    default: 1000000,
    type: Number,
  },
  success: {
    default: "<p>Success! <br/> Your changes have been saved.</p>",
    type: String,
  },
  table: {
    default: "profiles",
    type: String,
  },
})

const emit = defineEmits(["image-uploaded", "close-dialog"])

const innerClient = ref(props.client)
const innerConfig = ref(props.config)
// fallback incase the parent component doesn't pass in the client and config
if (!props.client && !props.config) {
  innerClient.value = useSupabaseClient()
  innerConfig.value = useRuntimeConfig()
}

const supabase = innerClient.value

const uploading = shallowRef(false)
const errorMessage = shallowRef()
const successMessage = shallowRef()
const imageUrl = shallowRef(props.image)

// resize the image to a max of 600x600
const resizeImage = (file, maxWidth, maxHeight) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          reject(new Error("Failed to get canvas context"))
          return
        }

        // Calculate aspect ratio to preserve image quality
        const aspectRatio = img.width / img.height
        let width = maxWidth
        let height = maxWidth / aspectRatio

        if (height > maxHeight) {
          height = maxHeight
          width = maxHeight * aspectRatio
        }

        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob((blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, { type: "image/jpeg" })
            resolve(resizedFile)
          } else {
            reject(new Error("Failed to create blob from canvas"))
          }
        }, "image/jpeg")
      }
      img.onerror = reject
      img.src = event.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// upload the image to supabase storage and handle messaging
const uploadImage = async (event) => {
  try {
    uploading.value = true
    const file = event.files[0]
    const resizedBlob = await resizeImage(file, 600, 600)
    const newFile = new File([resizedBlob], file.name, { type: file.type })
    newFile.objectURL = URL.createObjectURL(resizedBlob)
    // the resizer makes it a JPG
    const fileExt = "jpg"
    const filePath = `${props.userId}-${Math.random()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from(props.bucket)
      .upload(filePath, newFile)

    if (uploadError) throw uploadError

    const { data: imagePublicUrl } = await supabase.storage
      .from(props.bucket)
      .getPublicUrl(filePath)

    imageUrl.value = imagePublicUrl.publicUrl

    const { error } = await supabase
      .from(props.table)
      .upsert({
        avatar_image_url: imageUrl.value,
        id: props.currentUser.id,
        updated_at: new Date().toISOString(),
      })
      .match({ id: props.currentUser.id })
    if (error) {
      errorMessage.value = `Error: ${error?.error ?? error}`
    } else {
      successMessage.value = props.success
      emit("image-uploaded", imageUrl.value)
    }
  } catch (error) {
    errorMessage.value = `Error: ${error?.error ?? error}`
  } finally {
    uploading.value = false
  }
}

// delete the image from the database and storage
const deleteImage = async () => {
  const { error } = await supabase
    .from("profiles")
    .upsert({
      avatar_image_url: null,
      id: props.currentUser.id,
      updated_at: new Date().toISOString(),
    })
    .match({ id: props.currentUser.id })
  if (error) {
    //console.log(error)
    errorMessage.value = `Error: ${error}`
  } else {
    successMessage.value = "Success! Your file has been deleted."
    imageUrl.value = null
    emit("image-uploaded", null)
  }
}

const uploadLabel = computed(() => {
  return imageUrl.value ? "Upload new image" : props.label
})

const fileUpload = ref(null)
// trigger the file upload dialog
function triggerFileUpload() {
  const fileInput = fileUpload.value.$el.querySelector('input[type="file"]')
  const clickEvent = new MouseEvent("click", {
    bubbles: true,
    cancelable: true,
    view: window,
  })
  fileInput.dispatchEvent(clickEvent)
}
</script>

<template>
  <div class="upload-image flex flex-column align-items-center">
    <ProgressSpinner v-if="uploading" class="inline-block mb-4" />
    <Button
      v-else-if="imageUrl"
      rounded
      text
      class="mb-4 p-0 border-circle"
      @click="triggerFileUpload"
    >
      <img :src="imageUrl" alt="profile photo" />
    </Button>
    <template v-if="errorMessage">
      <Message :sticky="false" :life="6000" class="mt-0 text-only error" severity="error">
        <div class="text-center" v-html="errorMessage"></div>
      </Message>
    </template>
    <template v-if="successMessage">
      <Message :sticky="false" :life="6000" class="mt-0 text-only" severity="success">
        <div class="text-center" v-html="successMessage"></div>
      </Message>
    </template>
    <slot v-else name="above-button"> </slot>
    <Button
      v-if="imageUrl"
      label="Done"
      class="mb-3 w-full"
      @click="() => emit('close-dialog')"
    />
    <div class="flex w-full">
      <FileUpload
        ref="fileUpload"
        :class="[{ 'p-button-secondary': imageUrl }]"
        class="w-full"
        mode="basic"
        :custom-upload="true"
        :accept="props.accept"
        :max-file-size="props.maxFileSize"
        :file-limit="props.fileLimit"
        :choose-label="uploadLabel"
        :auto="true"
        @uploader="uploadImage"
      />
    </div>
    <Button
      v-if="imageUrl"
      label="Remove Image"
      icon="pi pi-trash"
      text
      class="p-button-danger my-4"
      @click="deleteImage"
    />

    <slot name="below-button"></slot>
  </div>
</template>

<style lang="scss" scoped>
.upload-image {
  width: 250px;
  img {
    height: 150px;
    width: 150px;
    border-radius: 50%;
    object-fit: cover;
  }
  .p-fileupload {
    width: 100%;
  }
}
</style>
<style lang="scss">
.upload-image {
  .p-fileupload {
    width: 100%;
    .p-button {
      border: 1px solid var(--p-button-secondary-hover-border-color);
      &:hover {
        color: var(--p-button-secondary-color);
        background: var(--p-button-secondary-hover-background);
      }
    }
  }
}
</style>
