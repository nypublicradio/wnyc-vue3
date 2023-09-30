<script setup>
import { trackClickEvent, whenTime, getMinutes } from '~/utilities/helpers'
import { useTogglePlayTrigger, useCurrentEpisode } from '~/composables/states'

// TEMP fix to make ripple work
import { usePrimeVue } from 'primevue/config'
const $primevue = usePrimeVue()
defineExpose({
  $primevue,
})
// TEMP fix to make ripple work

const togglePlayTrigger = useTogglePlayTrigger()
const currentEpisode = useCurrentEpisode()

const national = {
  type: 'media-file',
  id: '235725',
  first_published_at: '2023-09-06T05:00:50.783506-04:00',
  updated_date: null,
  bitrate: 128,
  error: 'g',
  duration: 178000,
  filename: 'news_latest_npr.mp3',
  title: 'National News',
  image: 'https://media.wnyc.org/i/%s/%s/%s/%s/2023/09/npr-news-now.jpeg',
  'id3-size': 15111,
  file: 'https://chrt.fm/track/53A61E/pdst.fm/e/dts.podtrac.com/pts/redirect.mp3/waaa.wnyc.org/newscast/news_latest_npr.mp3',
  details: '<p>Latest news from NPR.</p>',
  state: 'done',
  onTodaysShowImageTemplate:
    'https://media.wnyc.org/i/%s/%s/%s/%s/2023/09/twelfth_night_photo_for_nypl.jpg',
  onTodaysShowHeadline:
    'This is an example of todays show headline. It is a very long headline that will wrap to the next line.',
  onTodaysShowImageCaption: 'Sample image caption',
  episodeBody:
    '<h1>HTML Ipsum Presents</h1> <p><strong>Pellentesque habitant morbi tristique</strong> senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. <em>Aenean ultricies mi vitae est.</em> Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, <code>commodo vitae</code>, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. <a href="#">Donec non enim</a> in turpis pulvinar facilisis. Ut felis.</p> <h2>Header Level 2</h2> <ol> <li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li> <li>Aliquam tincidunt mauris eu risus.</li> </ol> <blockquote><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus magna. Cras in mi at felis aliquet congue. Ut a est eget ligula molestie gravida. Curabitur massa. Donec eleifend, libero at sagittis mollis, tellus est malesuada tellus, at luctus turpis elit sit amet quam. Vivamus pretium ornare est.</p></blockquote> <h3>Header Level 3</h3> <ul> <li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li> <li>Aliquam tincidunt mauris eu risus.</li> </ul> <pre><code> #header h1 a { display: block; width: 300px; height: 80px; } </code></pre>',
  onTodaysShowHosts: [
    {
      url: '/people/paul-cavalconte/',
      image:
        'https://media.wnyc.org/i/%s/%s/%s/%s/2019/12/WQXR_Headshots_JukeBox_PaulCavalconte.jpg',
      'last-name': 'Cavalconte',
      'first-name': 'Paul',
    },
    {
      url: '/people/paul-cavalconte/',
      image: '',
      'last-name': 'NoImage',
      'first-name': 'Jim',
    },
    {
      url: '/people/paul-cavalconte/',
      image:
        'https://media.wnyc.org/i/%s/%s/%s/%s/2019/12/WQXR_Headshots_JukeBox_PaulCavalconte.jpg',
      'last-name': 'Gibbons',
      'first-name': 'Peter',
    },
  ],
  episodeTranscript:
    "<p><strong>LATIF NASSER:</strong><span> Hey, it's Latif. Feels like all anyone is talking about these days is AI. We have a few new AI stories in the pipeline that I'm excited about, but in the meantime I wanted to play you this one. It's a rerun from the, you know, old Jad and Robert days, but it's actually not just a rerun, it's a rerun embedded in another rerun, which sounds confusing but it's actually fascinating because in addition to all the baseline interesting stuff in the episode about ethics and human nature, the experience of hearing these stacked reruns actually helps you feel the speed of technology.</span></p> <p><strong>LATIF:</strong><span> Like, how fast newfangled things become old hat, and then how despite that, despite all that rapid technological change, how the things we all need to think about, the kind of fundamental questions that we struggle with as humans pretty much stay the same. And that's—I don't know, that's sort of—it's kind of interesting to hear. And it's pretty humbling, actually. Take a listen, I hope you enjoy. This episode is called `The Driverless Dilemma.`</span></p> <p><span>[RADIOLAB INTRO]</span></p> <p><strong>JAD ABUMRAD:</strong><span> I'm Jad Abumrad.</span></p> <p><strong>ROBERT KRULWICH:</strong><span> I'm Robert Krulwich. And you know what this is.</span></p> <p><strong>JAD: </strong><span>This is Radiolab. [laughs]</span></p> <p><strong>ROBERT: </strong><span>Yeah.</span></p> <p><strong>JAD: </strong><span>Okay, so we're gonna play you a little bit of tape first just to set up the—what we're gonna do today. About a month ago, we were doing the thing about the fake news.</span></p> <p><strong>ROBERT: </strong><span>Yeah, we were very worried about a lot of fake news—a lot of people are. But in the middle of doing that report, we were talking with a fellow from Vanity Fair.</span></p> <p><strong><em>NICK BILTON: </em></strong><em><span>My name is Nick Bilton. I'm a special correspondent for Vanity Fair.</span></em></p> <p><strong>ROBERT: </strong><span>And in the course of our conversation, Nick—and this had nothing to do with what we were talking about, by the way—Nick just got into a sort of a—well, he went into a kind of nervous reverie, I'd say.</span></p> <p><strong>JAD: </strong><span>Yeah, he was like, `You know, you guys want to talk about fake news, but that's not actually what's eating at me.`</span></p> <p><strong><em>NICK BILTON: </em></strong><em><span>The thing that I've been pretty obsessed with lately is actually not fake news, but it's automation and artificial intelligence and driverless cars. Because it's going to have a larger effect on society than any technology that I think has ever been created in the history of mankind. I know that's kind of a bold statement, but ...</span></em></p> <p><strong><em>ROBERT: </em></strong><em><span>[laughs]</span></em></p> <p><strong><em>JAD: </em></strong><em><span>Quite bold!</span></em></p> <p><strong><em>NICK BILTON: </em></strong><em><span>But you've got to imagine that—you know, that there will be in the next 10 years, 20 to 50 million jobs that will just vanish. That's automation. You've got, you know, a million truckers that will lose their jobs, the—but it's not—we think about, like, automation and driverless cars, and we think about the fact that they are going to—the people that just drive the cars, like the taxi drivers and the truckers, are gonna lose their jobs.</span></em></p> <p><strong><em>NICK BILTON: </em></strong><em><span>What we don't realize is that there are entire industries that are built around just cars. So for example, if you are not driving the car, why do you need insurance? There's no parking tickets because your driverless car knows where it can and cannot park and goes and finds a spot and moves and so on. If there are truckers that are no longer using rest stops because driverless cars don't have to stop and pee or take a nap, then all of those little rest stops all across America are affected. People aren't stopping to use the restrooms. They're not buying burgers. They're not staying in these hotels, and so on and so forth.</span></em></p> <p><strong><em>NICK BILTON: </em></strong><em><span>And then if you look at driverless cars to a next level, the whole concept of what a car is is going to change. So for example, right now a car has five seats and a wheel, but if I'm not driving, what's the point of having five seats and a wheel? You could imagine that you take different cars, so maybe when I was on my way here to this interview, I wanted to work out, so I called a driverless gym car. Or I have a meeting out in Santa Monica after this, and it's an hour, so I call a movie car to watch a movie on the way out there. Or office car, and I pick up someone else and we have a meeting on the way.</span></em></p> <p><strong><em>",
}
const local = {
  type: 'media-file',
  id: '235724',
  first_published_at: '2023-08-24T05:00:50.783506-04:00',
  updated_date: '2023-09-07T13:10:50',
  bitrate: 128,
  error: 'g',
  duration: 124000,
  filename: 'news_latest_newscast.mp3',
  title: 'Local NYC News',
  image: 'https://media.wnyc.org/i/60/60/l/85/1/WNYC_news.png',
  'id3-size': 15111,
  file: 'https://chrt.fm/track/53A61E/pdst.fm/e/dts.podtrac.com/pts/redirect.mp3/waaa.wnyc.org/newscast/news_latest_newscast.mp3',
  details: "<p>Here are the stories we're following today.</p>",
  state: 'done',
}

// handles play button click that updates the currentEpisode if it is a different file and togglePlayTrigger states
const togglePlay = (media) => {
  if (currentEpisode.value?.file !== media.file) {
    currentEpisode.value = media
  }
  togglePlayTrigger.value = !togglePlayTrigger.value
  trackClickEvent(
    'Click Tracking - Latest News Updates',
    media.title,
    'toggle play'
  )
}
</script>

<template>
  <div>
    <div class="latest-news-updates grid">
      <div class="col-6">
        <div class="card-small p-ripple" @click="togglePlay(local)" v-ripple>
          <Badge :label="local.title" />
          <div class="news-title">
            <div class="font-bold">Current Headlines</div>
            <PipeData>
              <template #left>WNYC</template>
              <template #right>
                <span class="nobreak">{{ whenTime(local) }}</span>
              </template>
            </PipeData>
          </div>
          <PlayButton :label="getMinutes(local.duration)" :episode="local" />
        </div>
      </div>

      <div class="col-6">
        <div class="card-small p-ripple" @click="togglePlay(national)" v-ripple>
          <Badge
            :label="national.title"
            color="var(--background-500)"
            bg-color="var(--indigo-500)"
          />
          <div class="news-title">
            <div class="font-bold">11AM Update</div>
            <PipeData>
              <template #left>NPR</template>
              <template #right>
                <span class="nobreak">{{ whenTime(national) }}</span>
              </template>
            </PipeData>
          </div>
          <PlayButton
            :label="getMinutes(national.duration)"
            :episode="national"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.latest-news-updates {
  .card-small {
    background-color: var(--background2);
    padding: 10px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    cursor: pointer;
    .news-title {
      font-size: 0.813rem;
    }
  }
}
</style>
