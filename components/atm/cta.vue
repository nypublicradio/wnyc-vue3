<script setup>
import { useLoginSideBar } from "~/composables/states";
import { useToast } from "primevue/usetoast";

const user = useCurrentUser();

const loginSideBar = useLoginSideBar();
const toast = useToast();

const routeToPage = () => {
  if (!user.value) {
    loginSideBar.value = true;
    setTimeout(() => {
      toast.add({
        severity: "error",
        summary: "You must be logged in to ask the mayor",
        closable: true,
        life: 6000,
      });
    }, 200);
    return;
  } else {
    navigateTo("/ask-the-mayor");
  }
};
</script>
<template>
  <div
    class="atm-cta flex items-center w-full cursor-pointer"
    @click="routeToPage"
  >
    <nuxt-img
      src="/atm/mayor.png"
      loading="eager"
      :quality="100"
      :width="90"
      :height="90"
    />
    <div
      class="flex flex gap-2 p-2 justify-content-between align-items-center w-full"
    >
      <div class="content flex flex-column justify-content-center">
        <h2>Zohran K. Mamdani</h2>
        <p class="text-xs">Mayor-elect of New York City</p>
      </div>
      <Button
        label="Ask the Mayor"
        icon="pi pi-video"
        size="small"
        @click.stop="routeToPage"
      />
    </div>
  </div>
</template>


<style lang="scss" scoped>
.atm-cta {
  background-color: var(--p-surface-25);
  background-image: url("/atm/bg2.jpg");
  background-size: cover;
  border-radius: 10px;
  //border: 1px solid var(--p-surface-50);
  padding: 0;
  .content * {
    color: var(--p-surface-950);
  }
}
</style>