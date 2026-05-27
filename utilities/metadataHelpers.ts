import {
  getFirstSentence,
  stripHtmlTags,
} from "~/utilities/helpers"

// Show Pages
export const getShowTitle = (show) => {
  return `${show.value?.title} | WNYC`
}

export const getShowDescription = (show) => {
  if (show.value?.aboutModule?.length) {
    return getFirstSentence(stripHtmlTags(show.value.aboutModule[0].value))
  }
}

export const getShowImage = (show) => {
  const image = show.value?.image
  if (image) {
    return {
      url: image.file,
      alt: show.value?.title,
      width: image.width,
      height: image.height,
    }
  }
}

// Event Pages
export const getEventTitle = (event) => {
  return `${event.value?.title} | WNYC`
}

export const getEventDescription = (event) => {
  return getFirstSentence(event.value?.description) ||
         getFirstSentence(stripHtmlTags(event.value?.body[0].value)) ||
         event.value?.title
}

export const getEventImage = (event) => {
  if (event?.image) {
    return event.image
  }
}

// NPR Pages
export const getNprTitle = (story) => {
  return `${story.value?.title} | WNYC`
}

export const getNprDescription = (story) => {
  return story.value?.description || getFirstSentence(stripHtmlTags(story.value?.body)) 
}

export const getNprImage = (story) => {
  const width = 512
  const image = story.value?.image?.replace("{width}", width)
      .replace("{quality}", 80)
      .replace("{format}", "jpg")
    if (image) {
    return {
      url: image,
      alt: story.value?.title,
      width: width,
      height: width,
    }
  }
}

// Aviary Story Pages
export const getAviaryStoryTitle = (story) => {
  return `${story.value?.title} | WNYC`
}

export const getAviaryStoryDescription = (story) => {
  return getFirstSentence(stripHtmlTags(story.value?.body[0].value))
}

export const getAviaryStoryImage = (story) => {
  if (story.value?.leadAsset?.type === 'lead_image' && story.value?.leadAsset?.value.image) {
    return story.value?.leadAsset?.value?.image
  }
}

// Publisher Story Pages
export const getPublisherStoryTitle = (story) => {
  return `${story.value?.title} | WNYC`
}

export const getPublisherStoryDescription = (story) => {
  return story.value?.description || story.value?.tease
}

export const getPublisherStoryImage = (story) => {
  if (story.value?.image) {
    return {
      url: story.value?.image.file,
      alt: story.value?.image.altText || story.value?.title,
      width: story.value?.image.w,
      height: story.value?.image.h,
    }
  }
}

export const getPublisherSocialImage = (story) => {
  if (story.value?.socialImage) {
    return {
      url: story.value?.socialImage.file,
      alt: story.value?.socialImage.altText || story.value?.title,
      width: story.value?.socialImage.w,
      height: story.value?.socialImage.h,
    }
  }
}

// Simplecast Episodes
export const getSimplecastEpisodeTitle = (episode) => {
  return `${episode.value?.title} | WNYC`
}

export const getSimplecastEpisodeDescription = (episode) => {
  return episode.value?.tease && getFirstSentence(stripHtmlTags(episode.value?.tease)) ||
  episode.value?.description && getFirstSentence(stripHtmlTags(episode.value?.description))
}

export const getSimplecastEpisodeImage = (episode, show) => {
  const image = episode.value?.listingImage || show.value?.image
  if (image) {
    return {
      url: image,
      alt: episode.value?.listingImage ? episode.value?.title : show.value?.title,
      width: 512,
      height: 512,
    }
  }
}