interface CMSLink {
  id: string
  type: 'cms_page'
  value: {
    page: number
    title: string
    url: string
    slug: string
  }
}
interface ExternalLink {
  id: string
  type: 'external_link'
  value: {
    url: string
    title: string
  }
}

export interface InPageNavigationLink {
  id: string
  type: 'navigation_link'
  value: {
    link_text: string
    target_id: string
  }
}

type NavigationLink = CMSLink | ExternalLink
export type { NavigationLink }
