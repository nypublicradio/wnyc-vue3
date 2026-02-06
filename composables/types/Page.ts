import type { StreamfieldBlock } from './StreamfieldBlock'
import type Author from './Author'
import type ContributingOrganization from './ContributingOrganization'
import type Image from './Image'
import type Slide from './Slide'
import type Sponsor from './Sponsor'
import type Tag from './Tag'
import type NavigationLink from './NavigationLink'

export interface CuratedListItem {
  content: any[]
  contentType: string
  title: string
  subtitle: string
  url: string | null
  image: Image | null
  body: string
}

export interface CuratedList {
  title: string
  listItems: CuratedListItem[]
}

export interface CuratedContent {
  id: string
  type: string
  value: {
    label: string
    layout: string
    list: CuratedList
    seeMoreLink: string | null
  }
}

export interface Page {
  id: number
  title: string
  uuid: string
  type: string

  tease?: string
  listingTitle?: string
  listingDescription?: string
  listingImage?: Image

  preventSearchIndexing?: boolean

  socialTitle?: string
  socialDescription?: string
  socialImage?: Image

  seoTitle?: string
  searchDescription?: string
}

export interface ArticlePage extends Page {
  description: string
  tease: string
  image?: Image
  imageFullWidth?: number
  imageFullHeight?: number
  link: string
  leadImageCaption?: string
  imageLink?: string
  cmsSource?: string
  sortDate?: Date
  leadAsset?: any[]
  leadImage?: Image
  leadGallery?: any
  gallerySlides?: any[]
  legacyId?: string
  meta: {
    firstPublishedAt: string
    slug: string
  }
  publicationDate: Date
  publishAt: Date
  updatedDate: Date | null
  showAsFeature?: boolean
  show?: string
  showId?: string
  showTitle?: string
  sensitiveContent?: boolean
  provocativeContent?: boolean
  sponsoredContent?: boolean
  relatedLinks?: NavigationLink[]
  tags?: Tag[]
  url?: string
  uuid: string
  section?: Tag
  body?: StreamfieldBlock[] | string
  rawBody?: string
  audio?: string
  hasAudio?: boolean
  estimatedDuration?: number
  readingTime?: number
  authors?: Author[]
  relatedAuthors?: Author[]
  contributingOrganizations?: ContributingOrganization[]
  sponsors?: Sponsor[]
  curatedContent?: CuratedContent[]
  disableComments?: string
  commentId?: string
  headers?: any
  segments?: any
  transcript?: string
  embedCode?: string

  // Event-specific fields
  contentType?: string
  subtitle?: string
  eventDate?: string
  endDate?: string | null
  startTime?: string
  endTime?: string | null
  duration?: string
  ticketUrl?: string
  price?: string
  eventLocation?: string
  venueName?: string
  eventUrl?: string
  startDatetime?: string
  endDatetime?: string | null
}

export interface InformationPage extends Page {
  body: StreamfieldBlock[]
}

export interface StaffPage extends Page {
  headerImage: Image
  topPageZone: StreamfieldBlock[]
  midPageZone: StreamfieldBlock[]
}

export interface TagPage extends Page {
  headerImage: Image
  topPageZone: StreamfieldBlock[]
  midPageZone: StreamfieldBlock[]
}

export interface GalleryPage extends Page {
  description: string
  url: string

  slides: Slide[]

  authors: Author[]
  contributingOrganizations: ContributingOrganization[]
  relatedArticles: ArticlePage[]
  articleTitle: string
  articleLink: string

  listingImage: Image
  socialImage: Image
}
