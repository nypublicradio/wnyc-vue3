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
const currentSteamStation = useCurrentSteamStation()
const allCurrentStations = useAllCurrentStations()
const currentEpisode = useCurrentEpisode()
const currentEpisodeHolder = useCurrentEpisodeHolder()

const selectedStation = ref(null)
const stationsMenuData = ref([])
onBeforeMount(async () => {
  updateAllLiveStreams().then(() => {
    allCurrentStations.value.forEach((station) => {
      stationsMenuData.value.push({
        label: station.attributes.name,
        icon: 'icon',
        slug: station.attributes.slug,
        image: station.attributes['image-logo'],
        command: async () => {
          //slug.value = stream.attributes.slug
          await updateLiveStream(station.attributes.slug)
          currentEpisode.value = currentEpisodeHolder.value
        },
      })
    })
    // set initial station
    selectedStation.value = stationsMenuData.value[0].label
  })
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
        <Dropdown
          v-model="selectedStation"
          :options="stationsMenuData"
          optionLabel="label"
          optionValue="label"
          placeholder="Select a Station"
        >
          <template #value="slotProps">
            <p>{{ slotProps.value }}</p>
          </template>
          <template #option="slotProps">
            <div class="country-item">
              <img
                src="https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png"
              />
              <div>{{ slotProps.option.label }}</div>
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
