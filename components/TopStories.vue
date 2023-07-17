<script setup>
import VCard from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VCard.vue'
import VByline from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VByline.vue'
import { trackClickEvent } from '~/utilities/helpers'
// get the navigation data from Aviary
const config = useRuntimeConfig()
const { data: articles } = await useFetch(config.public.STORIES_API)

// returns an Aviary image template string
const getImageUrl = (article) => {
  //console.log('article - ', article)
  const listingImage =
    article.lead_asset?.[0]?.value?.image ??
    article.lead_asset?.[0]?.value?.default_image
  if (!listingImage) return ''
  return String(listingImage.id)
}

// returns the article link
const getArticleLink = (article) => {
  if (article.ancestry) {
    return `https://gothamist.com/${article.ancestry[0].slug}/${article.meta.slug}`
  } else if (article.path) {
    return article.path.replace('/home/', 'https://gothamist.com')
  }
  return 'https://gothamist.com'
}

const normalizeAuthor = (author) => {
  return {
    id: author.id,
    firstName: author.first_name,
    lastName: author.last_name,
    organization: author.contributing_organization?.name,
    organizationUrl: author.contributing_organization?.url,
    name: `${author.first_name} ${author.last_name}`,
    photoID: author.photo,
    jobTitle: author.job_title,
    biography: author.biography,
    website: author.website,
    email: author.email,
    slug: author.slug,
    url: author.slug && `https://gothamist.com/staff/${author.slug}`,
  }
}
//console.log(articles.value.items[0])
</script>

<template>
  <div v-if="articles" class="top-stories">
    <div v-for="(article, index) in articles.items" :key="index" class="mb-6">
      <VCard
        :src="getImageUrl(article)"
        :title="article.title"
        :blurb="article.description"
        loading="eager"
        :link="getArticleLink(article)"
        :maxWidth="article.listingImage?.width"
        :maxHeight="article.listingImage?.height"
        :sponsored="article.sponsoredContent"
        :width="318"
        :height="212"
        verticalMobile
        @title-click="
          trackClickEvent(
            'Click Tracking - Top Story',
            'Article Card Headline',
            $event
          )
        "
        @image-click="
          trackClickEvent(
            'Click Tracking - Top Story',
            'Article Card Image',
            $event
          )
        "
      >
        <template #belowBlurb>
          <div class="article-metadata" data-style-mode="dark">
            <VByline
              :authors="article.related_authors?.map(normalizeAuthor)"
              @name-click="
                trackClickEvent(
                  'Click Tracking - Top Story',
                  'Article Card Author Name',
                  $event.url
                )
              "
              @organization-click="
                trackClickEvent(
                  'Click Tracking - Top Story',
                  'Article Card Author Organization',
                  $event.url
                )
              "
            />
          </div>
        </template>
      </VCard>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.top-stories {
  border-top: 2px solid rgba(map-get($colors, 'coolwhite'), 0.2);
}
</style>
<style lang="scss">
.article-metadata .v-byline .flexible-link {
  border-bottom: none;
}
</style>
