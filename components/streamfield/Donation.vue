<template>
  <div class="streamfield-donation p-4 my-2">
    <h2 class="mb-3">We rely on your support</h2>
    <p class="mb-3">
      Donations from listeners are the largest source of WNYC's funding for all
      the reporting and programs that keep you informed, engaged, and
      entertained.
    </p>
    <div class="text-center">
      <nuxt-link
        to="https://pledge.wnyc.org/support/wnyc?utm_source=wnyc_app&utm_medium=wnyc&utm_campaign=story-donate-button"
      >
        <Button label="Donate" />
      </nuxt-link>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.streamfield-donation {
  background: linear-gradient(180deg, #224256, #1c262c);
}
.streamfield-donation h2 {
  font-size: 26px;
  font-weight: 700;
  line-height: 27px;
  letter-spacing: -0.02em;
  color: white;
}
.streamfield-donation p {
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: white;
}
.streamfield-donation .p-button {
  width: 181px;
}
</style>
