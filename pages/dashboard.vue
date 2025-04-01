<script setup lang="ts">
import { logOutUser } from "~/utilities/helpers"
</script>
<template>
  <section class="py-6">
    <h1>Dashboard</h1>
    <Button label="logout" @click="logOutUser" />
  </section>
</template>
