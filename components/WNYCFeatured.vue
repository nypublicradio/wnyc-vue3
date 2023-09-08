<script async setup>
import {
  formatPublisherImageUrl,
  getMinutes,
  whenTime,
} from '~/utilities/helpers'
import VImagePublisher from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VImagePublisher'
import { ref } from 'vue'

const props = defineProps({
  //   propVar: {
  //     type: Boolean,
  //     default: false,
  //   },
})

// const { data: bucket } = await useFetch(
//   'https://internal.wnyc.org/admin/touts/bucket/680249/'
// )

const { data: bucket } = await useFetch(
  'https://api.wnyc.org//api/v3/buckets/wnyc-home-middle/'
)
console.log(
  'bucket = ',
  bucket.value.data.attributes['bucket-items'][0].attributes
)

const menu = ref(false)
const menuItems = ref([
  {
    label: 'Options',
    items: [
      {
        label: 'Download',
        icon: 'pi pi-download',
        command: () => {
          window.open(props.episode['audio'], '_blank')
          //   createToast(
          //     {
          //       title: 'Download started...',
          //     },
          //     toastConfig.value
          //   )
          //   $analytics.sendEvent('click_tracking', {
          //     event_category: 'Click Tracking',
          //     component: 'Episode Tools',
          //     event_label: 'Download',
          //   })
        },
      },
      {
        label: 'Copy embed code',
        icon: 'pi pi-code',
      },
    ],
  },
])

const menuClick = (event) => {
  console.log(event)
}

const toggle = (event) => {
  console.log(event)
  menu.value.toggle(event)
}
const togglePlay = (event) => {
  console.log(event)
}
</script>

<template>
  <div>
    <div class="wnyc-featured">
      <HorizontalScrollFeature>
        <div
          class="card-large mb-4"
          v-for="item in bucket.data.attributes['bucket-items']"
        >
          <div class="top">
            <VImagePublisher
              :src="
                formatPublisherImageUrl(item.attributes['image-main'].template)
              "
              :width="248"
              :height="159"
            />
          </div>
          <div class="bottom flex flex-column gap-2">
            <div class="title text-sm font-bold font-meta line-height-2">
              {{ item.attributes.title }}
            </div>
            <div
              class="desc text-xs line-height-3"
              v-html="item.attributes.body"
            />
            <PipeData class="text-xs">
              <template #left>{{ item.attributes['show-title'] }}</template>
              <template #right>
                <span class="nobreak">{{ whenTime(item.attributes) }}</span>
              </template>
            </PipeData>
            <div class="flex justify-content-between align-items-center">
              <PlayButton
                :label="getMinutes(item.attributes['estimated-duration'], 1)"
                @onClick="togglePlay"
              />
              <DotMenu :items="menuItems" :data="item.attributes">
                <template #item="slotProps">
                  <a
                    class="flex"
                    v-bind="slotProps.props.action"
                    @click="menuClick"
                  >
                    <span v-bind="slotProps.props.icon" />
                    <span v-bind="slotProps.props.label">{{
                      slotProps.label
                    }}</span>
                  </a>
                </template>
                <template #end>
                  <div class="p-2 pb-0">
                    <Textarea
                      class="w-full text-xs"
                      v-model="item.attributes['embed-code']"
                      rows="5"
                    />
                  </div>
                </template>
              </DotMenu>
            </div>
          </div>
        </div>
      </HorizontalScrollFeature>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.wnyc-featured {
  .card-large {
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    overflow: hidden;
    max-width: 248px;
    background-color: var(--background2);
    .top {
    }
    .bottom {
      padding: 1rem;
      .title {
        @include truncate();
        @include t3lines();
      }
      .desc {
        @include truncate();
        @include t5lines();
      }
    }
  }
}
</style>
