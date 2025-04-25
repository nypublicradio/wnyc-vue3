<script setup lang="ts">
import { logOutUser } from "~/utilities/helpers"

const onLogout = () => {
  logOutUser()
  navigateTo("/home")
}
</script>
<template>
  <section class="py-6">
    <h1>Dashboard</h1>
    <Button label="logout" @click="onLogout" />
  </section>
</template>
