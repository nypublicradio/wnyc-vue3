<script setup>
import { requestAccountDeletion } from "~/utilities/helpers"
</script>

<template>
  <section class="terms-page">
    <h1 class="mb-4">Are you sure you want your account to be deleted?</h1>
    <Button @click="requestAccountDeletion()">Request Account Deletion</Button>
  </section>
</template>
