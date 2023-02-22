<script setup>
import VCard from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VCard.vue'
import VByline from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VByline.vue'

// get the navigation data from Aviary
const config = useRuntimeConfig()
const { data: articles } = await useFetch(config.STORIES_API)

// returns an Aviary image template string
const getImageUrl = (article) => {
  const listingImage =
    article.lead_asset?.[0]?.value?.image ??
    article.lead_asset?.[0]?.value?.default_image
  if (!listingImage) return ''
  const imageUrlTemplate = `${config.IMAGE_BASE_URL}${listingImage.id}/fill-%width%x%height%|format-webp|webpquality-%quality%`
  return imageUrlTemplate
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
</script>

<template>
  <div v-if="articles" class="top-stories">
    <div v-for="(article, index) in articles.items" :key="index" class="mb-6">
      <v-card
        :image="getImageUrl(article)"
        :title="article.title"
        loading="eager"
        :titleLink="getArticleLink(article)"
        :maxWidth="article.listingImage?.width"
        :maxHeight="article.listingImage?.height"
        :sponsored="article.sponsoredContent"
        :quality="80"
        :ratio="[3, 2]"
        :sizes="[1, 2]"
        :width="318"
        :height="212"
        responsive
        bp="md"
      >
        <p>
          {{ article.description }}
        </p>
        <div class="article-metadata">
          <v-byline
            :authors="article.related_authors?.map(normalizeAuthor)"
            class="mt-3"
          />
        </div>
      </v-card>
    </div>
  </div>
</template>

<style lang="scss">
.top-stories {
  border-top: 2px solid RGB(255, 255, 255, 0.2);
  padding: 50px 0 0;
}

.top-stories .h2 {
  font-size: 24px;
  font-weight: 500;
  line-height: 1.2;
}

.top-stories .flexible-link:not(.raw):not(.null):hover *,
.top-stories .flexible-link:not(.raw):not(.null) {
  color: white !important;
  text-decoration: none;
}
</style>
