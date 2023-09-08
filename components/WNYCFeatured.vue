<script async setup>
import {
  formatPublisherImageUrl,
  getMinutes,
  whenTime,
} from '~/utilities/helpers'
import VImagePublisher from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VImagePublisher'
import { ref, computed, onMounted } from 'vue'

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
//
//const emit = defineEmits(["change", "click"]);

// lifecycle hooks
onMounted(() => {})
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
            <div class="flex mt-1 justify-content-between">
              <PlayButton
                :label="getMinutes(item.attributes['estimated-duration'], 1)"
                @onClick="togglePlay"
              />
              <Dropdown
                title="Choose platform"
                v-model="selectedPlayService"
                :options="playServices"
                :panel-class="menuClass"
                option-label="name"
                aria-label="Select a service to play this episode"
                aria-labelledby="Select a service to play this episode"
              >
                <template #option="slotProps">
                  <div class="service-item">
                    <img
                      alt="icon"
                      :src="
                        '/play-service-icons/' + slotProps.option.icon + '.svg'
                      "
                    />
                    <div>{{ slotProps.option.name }}</div>
                    <div
                      class="hack-click"
                      @click="launchService(slotProps.option)"
                    ></div>
                  </div>
                </template>
              </Dropdown>
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
