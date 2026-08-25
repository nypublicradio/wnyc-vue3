import { describe, it, expect } from 'vitest'
import { transformCuratedContent } from '../../utilities/curatedContent'

const baseCuratedBlock = (listItems: any[]) => ([
  {
    id: 'curated-block-1',
    type: 'curated_list',
    value: {
      label: 'Test',
      layout: 'vertical-feature',
      list: {
        id: 1,
        title: 'Events List',
        listItems,
      },
    },
  },
])

describe('transformCuratedContent image normalization', () => {
  it('sets image for event items when only content.listingImage is present', async () => {
    const listingImage = {
      id: 330010,
      fileHash: '330010',
      width: 1860,
      height: 1046,
    }

    const curatedContent = baseCuratedBlock([
      {
        id: 151474,
        contentType: 'event_page',
        title: 'Event with content listing image',
        listingImage: null,
        image: null,
        content: {
          id: 151474,
          contentType: 'event_page',
          title: 'Event with content listing image',
          listingImage,
          startDatetime: '2026-03-25T19:00:00',
          eventLocation: 'The Greene Space',
        },
      },
    ])

    const transformed = await transformCuratedContent(curatedContent)
    const normalizedItem = transformed[0].value.list.listItems[0]

    expect(normalizedItem.cmsSource).toBe('wagtail')
    expect(normalizedItem.listingImage).toBeNull()
    expect(normalizedItem.image).toEqual(listingImage)
    expect(normalizedItem.image).not.toBeNull()
  })

  it('prefers item.listingImage for event cards when item.image is null', async () => {
    const listingImage = {
      id: 440001,
      fileHash: '440001',
      width: 1280,
      height: 720,
    }

    const curatedContent = baseCuratedBlock([
      {
        id: 151474,
        contentType: 'event_page',
        title: 'Event card',
        image: null,
        listingImage,
        content: {
          id: 151474,
          contentType: 'event_page',
          title: 'Event card',
          listingImage,
        },
      },
    ])

    const transformed = await transformCuratedContent(curatedContent)
    const eventItem = transformed[0].value.list.listItems[0]

    expect(eventItem.image).toEqual(listingImage)
    expect(eventItem.image).not.toBeNull()
  })

  it('does not fall back to default placeholder when listingImage exists', async () => {
    const listingImage = {
      id: 777001,
      fileHash: '777001',
      width: 112,
      height: 112,
    }

    const curatedContent = baseCuratedBlock([
      {
        id: 151475,
        contentType: 'event_page',
        title: 'Event with listing image',
        image: null,
        listingImage,
        content: {
          id: 151475,
          contentType: 'event_page',
          title: 'Event with listing image',
          listingImage,
        },
      },
    ])

    const transformed = await transformCuratedContent(curatedContent)
    const normalizedItem = transformed[0].value.list.listItems[0]

    expect(normalizedItem.image).toEqual(listingImage)
    expect(String(normalizedItem.image?.id ?? '')).not.toBe('344059')
  })
})
