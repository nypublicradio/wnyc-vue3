<script setup>
import {
  useCurrentStreamStation,
  useAllCurrentStations,
  useCurrentEpisode,
  useCurrentEpisodeHolder,
  useIsEpisodePlaying,
} from '~/composables/states'
import { updateLiveStream } from '~/composables/data/liveStream'

const currentStreamStation = useCurrentStreamStation()
const currentEpisode = useCurrentEpisode()
const currentEpisodeHolder = useCurrentEpisodeHolder()
const allCurrentStations = useAllCurrentStations()
const isEpisodePlaying = useIsEpisodePlaying()

const selectedStation = ref(null)
const stationsMenuData = ref([])

watch(allCurrentStations, (val) => {
  const tempMenuData = []

  val.forEach((station) => {
    tempMenuData.push({
      label: station.title,
      name: station.title,
      station: station.station,
      code: station.title,
      slug: station.slug,
      image: station.image,
      times: `${station.timeStart} - ${station.timeEnd}`,
    })
  })

  stationsMenuData.value = tempMenuData

  // to set the initial station by updating "currentStreamStation" in states.ts to the slug you want to start with
  const initialStation = val.find(
    (station) => station.slug === currentStreamStation.value
  ).station

  selectedStation.value = initialStation
})

let initialNoPlayToggleFlag = false
const onDropdownChange = async (event) => {
  console.log('event = ', event)
  await updateLiveStream(event.value.slug)
  // update slug
  console.log('currentEpisodeHolder = ', currentEpisodeHolder)
  currentStreamStation.value = currentEpisodeHolder.value.slug
  if (isEpisodePlaying.value || initialNoPlayToggleFlag) {
    initialNoPlayToggleFlag = true
    currentEpisode.value = currentEpisodeHolder.value
  }
}
</script>

<template>
  <div>
    <div class="stream-switcher">
      <!--  <pre>{{ stationsMenuData }}</pre> -->
      <Dropdown
        :onChange="($event) => onDropdownChange($event)"
        :value="stationsMenuData[2]"
        v-model="selectedStation"
        :options="stationsMenuData"
        scrollHeight="400px"
        panelClass="stream-switcher-dropdown"
      >
        <template #value="slotProps">
          <p v-if="stationsMenuData.length > 0">
            {{
              typeof slotProps.value === 'object'
                ? slotProps.value.station
                : slotProps.value
            }}
          </p>
          <div v-else class="loading">
            <i
              class="pi pi-spin pi-spinner text-white text-lg"
              style="font-size: 2rem"
            ></i>
          </div>
        </template>
        <template #option="slotProps">
          <div class="station-info flex gap-3 align-items-center">
            <img
              :src="slotProps.option.image"
              :alt="`${slotProps.option.station} icon`"
            />
            <div class="flex flex-column">
              <div class="flex flex-row flex-wrap">
                <p>{{ slotProps.option.station }}:&nbsp;</p>
                <p>
                  {{ slotProps.option.name }}
                </p>
              </div>
              <p>{{ slotProps.option.times }}</p>
            </div>
          </div>
        </template>
      </Dropdown>
    </div>
  </div>
</template>

<style lang="scss">
.stream-switcher {
  margin-bottom: 1.5rem;
  .p-dropdown {
    padding: 0.3rem 0.5rem;
    background: linear-gradient(180deg, #354155, #1e2f39);
    color: #fff;
    color: RGB(var(--color-white));
    border: #191716;
    .p-dropdown-label p {
      font-weight: 700;
      text-transform: uppercase;
      font-feature-settings: 'lnum';
    }
    &:after {
      content: '';
      position: absolute;
      width: 0;
      bottom: -29px;
      height: 15px;
      left: 30px;
      z-index: 10;
      border-left: 20px solid transparent;
      border-right: 20px solid transparent;
      border-top: 15px solid #1e2f39;
      opacity: 1;
      transition: opacity 0.6s cubic-bezier(0, 0, 0.2, 1) 50ms;
      transition: opacity var(--animation-duration-slow)
        var(--animation-easing-incoming) 50ms;
    }
  }
}
.stream-switcher-dropdown {
  top: 126px !important;
  width: 100vw;
  max-width: fit-content;
  max-width: 440px;
  .p-dropdown-item {
    padding: 0.5rem 1.5rem 0.5rem 1rem !important;
    &:hover {
      background: #eef1f7 !important;
    }
    .station-info {
      white-space: normal;
      img {
        width: 50px;
        height: 50px;
      }
      p {
        color: var(--darkblue);
        line-height: normal;
        font-feature-settings: 'lnum';
        &:first-child {
          font-weight: 700;
        }
      }
    }
  }
}
</style>
