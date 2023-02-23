<script setup>
import {
  useCurrentSteamStation,
  useAllCurrentStations,
  useCurrentEpisode,
  useCurrentEpisodeHolder,
} from '~/composables/states'
import {
  updateLiveStream,
  updateAllLiveStreams,
} from '~/composables/data/liveStream'
import { formatTime } from '~/utilities/helpers'
const currentSteamStation = useCurrentSteamStation()
const currentEpisode = useCurrentEpisode()
const currentEpisodeHolder = useCurrentEpisodeHolder()
const allCurrentStations = useAllCurrentStations()

const selectedStation = ref(null)
const stationsMenuData = ref([])

watch(allCurrentStations, (val) => {
  const tempMenuData = []
  val.forEach((station) => {
    console.log('station: ', station)
    const attributes = station.data.data[0].attributes
    const showTitle = station.data.included.find(
      (include) => include.type === 'show'
    ).attributes.title
    const showTimes = station.data.included.find(
      (include) => include.type === 'show-schedule'
    ).attributes
    tempMenuData.push({
      label: showTitle,
      name: showTitle,
      station: attributes.name,
      code: attributes.name,
      slug: attributes.slug,
      image: attributes['image-logo'],
      times: `${formatTime(showTimes['iso-start-time'])} - ${formatTime(
        showTimes['iso-end-time']
      )}`,
      command: async () => {
        //slug.value = attributes.slug
        await updateLiveStream(attributes.slug)
        currentEpisode.value = currentEpisodeHolder.value
      },
    })
  })
  stationsMenuData.value = tempMenuData
  console.log('tempMenuData: ', tempMenuData)
  //set initial station
  selectedStation.value = tempMenuData[0].station
})

onBeforeMount(() => {
  //updateAllLiveStreams().then(() => {
  //allCurrentStations.value.forEach((station) => {
  //console.log('station: ', station)
  // stationsMenuData.value.push({
  //   label: station.data[0].attributes.name,
  //   show: station.data[0].attributes.name,
  //   icon: 'icon',
  //   slug: station.data[0].attributes.slug,
  //   image: station.data[0].attributes['image-logo'],
  //   command: async () => {
  //     //slug.value = stream.attributes.slug
  //     await updateLiveStream(station.attributes.slug)
  //     currentEpisode.value = currentEpisodeHolder.value
  //   },
  // })
  //})
  // set initial station
  //selectedStation.value = stationsMenuData.value[0].label
  //})
})
</script>

<template>
  <div>
    <section class="pb-8">
      <h1 class="pb-6">now playing: {{ currentSteamStation }}</h1>
      <div class="stream-switcher">
        <!-- <TabMenu class="mb-4" :model="stationsMenuData">
          <template #item="{ item }">
            <Button class="tab">{{ item.label }}</Button>
          </template>
        </TabMenu> -->
        <!-- <pre>{{ stationsMenuData }}</pre> -->
        <Dropdown
          v-model="selectedStation"
          :options="stationsMenuData"
          placeholder="Select a Station"
          scrollHeight="400px"
          panelClass="stream-switcher-dropdown"
        >
          <template #value="slotProps">
            <p>{{ slotProps.value }}</p>
          </template>
          <template #option="slotProps">
            <div class="station-info flex">
              <img :src="slotProps.option.image" />
              <div>
                <p>{{ slotProps.option.name }}</p>
                <p>{{ slotProps.option.show }}</p>
                <p>{{ slotProps.option.times }}</p>
              </div>
            </div>
          </template>
        </Dropdown>
      </div>
      <!-- <div class="stream-switcher flex flex-column" v-if="allCurrentStations">
        <div
          v-for="(station, index) in allCurrentStations"
          :key="`${station.attributes.name} station`"
          class="tab"
        >
          {{ station.attributes.name }}
        </div>
      </div> -->
      <div class="grid gap-3">
        <div class="col">
          <main-player />
        </div>
        <div class="col-fixed ad300 hidden lg:block">
          <div class="ad p-3">Ad Goes here</div>
        </div>
        <div class="col-12 ad300 lg:hidden">
          <div class="ad p-3 mx-auto">Ad Goes here</div>
        </div>
      </div>
    </section>
    <section>
      <p>episode data goes here</p>
    </section>
    <section>
      <top-stories />
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
      bottom: -30px;
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
</style>
