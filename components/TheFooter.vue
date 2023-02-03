<script setup>
import VShareTools from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VShareTools.vue'
import VShareToolsItem from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VShareToolsItem.vue'
//TO DO - populate links from CMS
const footerPrimaryNav = [
  {
    url: ['https://www.wnyc.org/resources/912769/fcc_eeo_public_file_report.pdf'],
    text: 'EEO Report',
    newWindow: true
  },
  {
    url: ['https://publicfiles.fcc.gov/fm-profile/wnyc-fm'],
    text: 'WNYC-FM FCC Public File',
    newWindow: true
  },
  {
    url: ['https://publicfiles.fcc.gov/am-profile/wnyc'],
    text: 'WNYC-AM FCC Public File',
    newWindow: true
  },
  {
    url: ['https://www.wnyc.org/support'],
    text: 'Support WNYC',
    newWindow: true
  },
  {
    url: ['https://www.wnyc.org/contact'],
    text: 'Contact Us',
    newWindow: true
  }
]
const footerSecondaryNav = [
  {
    url: ['https://www.wnyc.org/corrections/'],
    text: 'Corrections',
    newWindow: true
  },
  {
    url: ['https://www.wnyc.org/articles/wnyc-contest-rules'],
    text: 'Giveaway Rules',
    newWindow: true
  },
  {
    url: ['https://sponsorship.wnyc.org/'],
    text: 'Sponsorship',
    newWindow: true
  }
]
const year = new Date().getFullYear()
</script>

<template>
  <footer>
    <section>
      <div class="grid mb-2">
        <div class="col-12 lg:col-5">
          <a href="https://www.WNYC.org" target="_blank" rel="noopener">
            <wnyc-logo />
          </a>
          <p class="text-lg my-5">
            Listener-supported WNYC is the home for independent journalism and
            courageous conversation on air and online. Broadcasting live from
            New York City on 93.9 FM and AM 820 and available online and on the
            go.
          </p>
          <div class="flex mb-4">
            <p class="mr-2">WNYC is supported by the JLGreene Foundation</p>
            <a
              href="https://jlgreene.org/"
              rel="noopener"
              target="_blank"
              class="plain"
            >
              <jlgreene-logo />
            </a>
          </div>
        </div>
        <div class="hidden lg:flex lg:col-1" />
        <div class="col-12 lg:col-6">
          <a
            href="https://www.surveymonkey.com/r/LGP2Z96"
            rel="noopener"
            target="_blank"
            class="plain"
          >
            <Button label="Send Us Your Feedback" />
          </a>
          <h3 class="mt-5 mb-4">About Us</h3>
          <div class="grid mb-6">
            <div class="col-12 lg:col-6">
              <a
                v-for="(link, primaryIndex) in footerPrimaryNav"
                :key="primaryIndex"
                :href="link.url"
                :target="link.newWindow && '_blank'"
                rel="noopener"
                class="c-secondary-nav__link"
              >
                {{ link.text }}
              </a>
            </div>
            <div class="col-12 lg:col-6">
              <a
                v-for="(link, secondaryIndex) in footerSecondaryNav"
                :key="secondaryIndex"
                :href="link.url"
                :target="link.newWindow && '_blank'"
                rel="noopener"
                class="c-secondary-nav__link"
              >
                {{ link.text }}
              </a>
            </div>
          </div>
        </div>
      </div>
      <div class="grid align-items-center mb-6">
        <div class="col-12 lg:col-6">
          <nypr-logo />
        </div>
        <div class="col-12 lg:col-6">
          <v-share-tools label="Connect">
            <v-share-tools-item service="facebook" username="WNYC" />
            <v-share-tools-item service="twitter" username="WNYC" />
            <v-share-tools-item service="instagram" username="WNYC" />
            <v-share-tools-item
              service="youtube"
              username="UCbysmY4hyViQAAYEzOR-uCQ"
            />
          </v-share-tools>
        </div>
      </div>
      <div>
        <p>
          © {{ year }} New York Public Radio. All rights reserved.
          <a
            href="https://www.wnyc.org/terms"
            target="_blank"
            rel="noopener"
            class="ml-4"
          >
            Terms Of Use
          </a>
          <a
            href="https://www.wnyc.org/privacy"
            target="_blank"
            rel="noopener"
            class="ml-4"
          >
            Privacy Policy
          </a>
          <a
            href="https://media.wnyc.org/media/resources/2020/Oct/30/accessibility_policy_10.30.20.pdf"
            target="_blank"
            rel="noopener"
            class="ml-4"
          >
            Accessibility
          </a>
        </p>
      </div>
    </section>
  </footer>
</template>

<style lang="scss">
footer {
  background: linear-gradient(180deg, #203849 0%, #191716 100%), #191716;
  padding: 50px 0;
  margin-bottom: 0;
}

footer section {
  border-top: 2px solid RGB(255, 255, 255, 0.2);
  padding-top: 50px;
  padding-bottom: 50px;
}

footer .c-secondary-nav__link {
  display: block;
  width: fit-content;
  margin-bottom: 1rem;
  &:last-child {
    margin-bottom: 0;
  }
}
</style>