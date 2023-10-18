<script setup>
import VImage from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VImage.vue'
import { templatizePublisherImageUrl } from '~/utilities/helpers'
// navigate back to home and track it
const route = useRoute()
const router = useRouter()
const backHome = () => {
  router.go(-1)
}

console.log('route = ', route)
console.log('router = ', router.options.history.state.back)

const tempShowData = {
  title: 'Death, Sex & Money',
  image: 'https://media.wnyc.org/i/%s/%s/%s/%s/2019/07/NYPR.DSM_1400.jpg',
  tease:
    'Anna Sale explores the big questions and hard choices that are often left out of polite conversation.',
  episodes: [
    {
      id: 1,
      title: 'Feeling Lost or Stuck? Try Craigslist, says John Wilson.',
      slug: 'feeling-lost-or-stuck-try-craigslist-says-john-wilson',
      image:
        'https://media.wnyc.org/i/%s/%s/%s/%s/2023/10/john-wilson_4_g4FI99t.png',
      downloaded: false,
      tease:
        'The filmmaker behind HBO’s How To with John Wilson shares how his hobbies, like checking Craigslist ads obsessively, make him feel more deeply connected.',
      summary:
        '<p><span>Documentary filmmaker John Wilson is the </span><span>writer, director, cameraman, producer, and narrator of </span><a href="https://www.hbo.com/how-to-with-john-wilson"><span>the HBO docu-comedy series </span><em><span>How To with John Wilson</span></em></a><span> which just finished its third and final season last month. In his show, John showcases the everyday lives of fellow New Yorkers, </span><a href="https://www.vox.com/culture/23811186/how-to-john-wilson-season-3-review"><span>managing to be both wildly absurd and achingly sweet in his portrayal of them</span></a><span>, while also always treating them – and their obsessions – with dignity. In this episode, John gives Anna </span><span>a peek inside how his brain works, and why building a life around his hobbies, like journaling and checking Craigslist ads obsessively, gives him a deeper understanding of himself and the world around him. </span></p>',
      transcript:
        '<blockquote> <p class="p1"><em>ADONIS WILLIAMS: Yeah, I’m 6’4, 248 pounds. My employees use the word ’brolic’ a lot when they see me pick up stuff. Like, I literally would just pick a sofa up over my head while two of them are struggling with it and I’ll just say, ’I got it.’ And I’ll just pick up the sofa bed over my head and start walking with it and they go, ’Oh my god, he’s so brolic!’[laughs]</em></p > </blockquote > <p class="p4"><em>[Death, Sex &amp; Money theme music starts]</em><span>&nbsp;</span></p> <p class="p5"><strong>ANNA SALE: This is Death, Sex &amp; Money, the show from WNYC about the things we think about a lot and need to talk about more. I’m Anna Sale.<span>&nbsp;</span></strong></p> <p class="p4"><em>[Death, Sex &amp; Money theme music ends]</em></p> <p class="p5"><strong>ANNA SALE: Adonis Williams is a mover in New York City, a job he started more than 20 years ago when he saw a woman crying on the subway. She had two kids with her and all their stuff in trash bags.<span>&nbsp;</span></strong></p> <blockquote> <p class="p2"><em>ADONIS:</em><strong><em><span>&nbsp;</span></em></strong><em> I asked her what was wrong. She explained that she had to make a choice between leaving the bags of clothes and carrying the kids.</em></p> </blockquote> <p class="p5"><strong>ANNA SALE: Adonis had a van and he offered to move her for free.<span>&nbsp;</span></strong></p> <blockquote> <p class="p2"><em>ADONIS: I’m that way. Even on the way here, I stopped to get me a cup of coffee and it was a mother with her daughter in Dunkin Donuts— true story. And the little girl was crying because she wanted the strawberry sprinkled donut. And her mother was just going in to get a coffee, and I said, ’Ma’am, I’m gonna pay for your coffee. I’m gonna pay for her donut.’ And that’s just the way I am. If I see people sad or crying— but I do have one rule. I don’t take care of the homeless in other states. I travel too much, but if somebody comes up to me in a window in Texas or Tennessee, I don’t give any money. I know it’s sad, but I just can’t take care of the world. But in New York City, if you come up to my window, I’ll give you $2, $5, and that’s everyday all day, anybody.</em></p>',
      duration: 3000,
      file: 'https://www.podtrac.com/pts/redirect.mp3/audio.wnyc.org/deathsexmoney/deathsexmoney062321_pod.mp3',
      date: '2023-10-18T14:01:49+00:00',
      previous_progress: 150,
    },
    {
      id: 2,
      title: 'A New York City Mover Who Carries More Than Your Boxes.',
      slug: 'a-new-york-city-mover-who-carries-more-than-your-boxes',
      image:
        'https://media.wnyc.org/i/%s/%s/%s/%s/2023/09/AdonisEp_J2CZZil.png',
      downloaded: true,
      tease:
        'Over the past 20 years, Adonis Williams has moved thousands of people in and out of New York City. With each move, he catches a glimpse of a life in transition. ',
      summary:
        '<p><span>Adonis Williams has been a mover in New York City for 20 years. He says he’s moved about 3,500 people, and with each move, he catches a glimpse of a life in transition. There are the happy moves: getting a bigger place, couples moving in together, kids going off to college. There are also the sad moves: divorce, breakups, eviction. Adonis says he talks with his customers about it all. ’You become the bartender or the taxi driver that they need to vent to.” In this episode, Adonis explains why he didn’t charge any money for the first five years of being a mover, and what he’s observed on the job about relationships, family and cost of living in New York.</span></p>',
      transcript:
        '<blockquote> <p class="p1"><em>ADONIS WILLIAMS: Yeah, I’m 6’4, 248 pounds. My employees use the word ’brolic’ a lot when they see me pick up stuff. Like, I literally would just pick a sofa up over my head while two of them are struggling with it and I’ll just say, ’I got it.’ And I’ll just pick up the sofa bed over my head and start walking with it and they go, ’Oh my god, he’s so brolic!’[laughs]</em></p > </blockquote > <p class="p4"><em>[Death, Sex &amp; Money theme music starts]</em><span>&nbsp;</span></p> <p class="p5"><strong>ANNA SALE: This is Death, Sex &amp; Money, the show from WNYC about the things we think about a lot and need to talk about more. I’m Anna Sale.<span>&nbsp;</span></strong></p> <p class="p4"><em>[Death, Sex &amp; Money theme music ends]</em></p> <p class="p5"><strong>ANNA SALE: Adonis Williams is a mover in New York City, a job he started more than 20 years ago when he saw a woman crying on the subway. She had two kids with her and all their stuff in trash bags.<span>&nbsp;</span></strong></p> <blockquote> <p class="p2"><em>ADONIS:</em><strong><em><span>&nbsp;</span></em></strong><em> I asked her what was wrong. She explained that she had to make a choice between leaving the bags of clothes and carrying the kids.</em></p> </blockquote> <p class="p5"><strong>ANNA SALE: Adonis had a van and he offered to move her for free.<span>&nbsp;</span></strong></p> <blockquote> <p class="p2"><em>ADONIS: I’m that way. Even on the way here, I stopped to get me a cup of coffee and it was a mother with her daughter in Dunkin Donuts— true story. And the little girl was crying because she wanted the strawberry sprinkled donut. And her mother was just going in to get a coffee, and I said, ’Ma’am, I’m gonna pay for your coffee. I’m gonna pay for her donut.’ And that’s just the way I am. If I see people sad or crying— but I do have one rule. I don’t take care of the homeless in other states. I travel too much, but if somebody comes up to me in a window in Texas or Tennessee, I don’t give any money. I know it’s sad, but I just can’t take care of the world. But in New York City, if you come up to my window, I’ll give you $2, $5, and that’s everyday all day, anybody.</em></p>',
      duration: 2700,
      file: 'https://www.podtrac.com/pts/redirect.mp3/audio.wnyc.org/deathsexmoney/deathsexmoney062321_pod.mp3',
      date: '2023-10-18T14:01:49+00:00',
      previous_progress: 150,
    },
  ],
}

const goToEpisodePage = (show) => {
  navigateTo(`/shows/episodes/${route.params.slug}`)
}
</script>

<template>
  <section class="shows-page">
    <div class="flex align-items-center">
      <Button
        class="back-btn text-color -ml-3"
        icon="pi pi-chevron-left"
        rounded
        text
        severity="secondary"
        aria-label="back to previous page"
        @click="backHome"
      />
      <h2>Browse</h2>
    </div>

    <VImage
      :src="templatizePublisherImageUrl(tempShowData.image)"
      :alt="`${tempShowData.title} show image`"
      :width="144"
      :height="144"
      class="show-image max-w-9rem m-auto"
      :ratio="[1, 1]"
      style="min-height: 144px"
    />
    <h2 class="text-lg mt-2">{{ tempShowData.title }}</h2>
    <p class="text-sm mt-2">{{ tempShowData.tease }}</p>
    <h2 class="mt-4">Episodes</h2>
    <div class="flex flex-column gap-4 mt-2">
      <EpisodeItem
        v-for="show in tempShowData.episodes"
        :show="show"
        :key="show.title"
        @onClick="goToEpisodePage(show)"
      />
    </div>
  </section>
</template>

<style lang="scss">
.shows-page {
}
</style>
