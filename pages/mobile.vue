<template>
  <section class="">
    <div class="app-landing-page">
      <div class="app-landing-page-content">
        <h1>Tap into the New York conversation</h1>
        <h2>Download the WNYC app now</h2>
        <div class="flex gap-4 flex-wrap">
          <a
            href="https://itunes.apple.com/app/apple-store/id470219771?pt=407475&amp;ct=wnyc_mobile_page&amp;mt=8"
            ><img
              class="app-landing-page-badge is-loaded"
              src="https://media.demo.nypr.digital/i/raw/2024/05/app-store-badge.png"
              alt="apple app store badge"
          /></a>
          <a
            href="https://play.google.com/store/apps/details?id=org.wnyc.android&amp;referrer=utm_source%3Dwnyc%26utm_medium%3Dwnyc_mobile_page%26utm_campaign%3Dwebsite"
            ><img
              class="app-landing-page-badge is-loaded"
              src="https://media.demo.nypr.digital/i/raw/2024/05/google-play-badge.png"
              alt="google play badge"
          /></a>
        </div>
      </div>
      <div class="app-landing-page-image">
        <img
          src="https://media.demo.nypr.digital/i/raw/2024/05/mobile-landing-page-phone_N2UGbgN.png"
          alt="image of the wnyc app on an iphone"
        />
      </div>
    </div>
    <!-- <NuxtLink to="/home">GO back home</NuxtLink> -->
  </section>
</template>

<style lang="scss" scoped>
.app-landing-page {
  height: 889px;
  width: 100%;
  background: url(https://media.demo.nypr.digital/i/1860/1275/l/80/2024/05/mobile-landing-page-large-bg_SQITXG7.png)
    no-repeat top left;
  background-size: cover;
  display: flex;

  h1 {
    max-width: 325px;
    color: #fff;
    font-family: var(--font-family-tisa);
    font-size: 50px;
    font-weight: 700;
    line-height: 65px;
    margin: 0 0 40px;
    @include media("<md") {
      font-size: 30px;
      line-height: 45px;
    }
  }
  h2 {
    color: #fff;
    font-family: var(--font-family);
    font-size: 34px;
    font-weight: 400;
    line-height: 45px;
    margin: 0 0 60px;
    @include media("<md") {
      font-size: 18px;
      line-height: 20px;
    }
  }
  .app-landing-page-content {
    padding: 130px;
    @include media("<lg") {
      padding: 80px;
    }
    @include media("<md") {
      padding: 40px;
    }
  }
  .app-landing-page-image {
    @include media("<lg") {
      display: none;
    }
    img {
      width: 600px;
      left: -250px;
      position: relative;
      @include media("<xl") {
        left: -250px;
      }
      @include media(">xl") {
        left: -150px;
      }
    }
  }
}
</style>
