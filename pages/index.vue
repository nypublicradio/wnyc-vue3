<script setup></script>

<template>
  <div>
    <section class="py-6">
      <StreamSwitcher />
      <div class="grid gap-3">
        <div class="col">
          <main-player />
        </div>
        <div class="col-fixed ad300 hidden lg:block">
          <div class="htlad-wnyc_rectangle"></div>
        </div>
        <div class="col-12 ad300 lg:hidden">
          <div class="htlad-wnyc_rectangle"></div>
        </div>
      </div>
    </section>
    <section>
      <OnTodaysShow />
    </section>
    <section>
      <h2 class="font-bold font-meta mb-2">Top stories from Gothamist</h2>
      <top-stories class="pt-6" />
    </section>
  </div>
</template>

<style lang="scss">
.ad {
  background-color: #ccc;
  width: 100%;
  max-width: 300px;
  height: 250px;
  color: black;
}
</style>
