import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import {
  buildAudioEventParams,
  buildClickEventParams,
  buildPageViewEventParams,
} from '~/utilities/analytics'

beforeAll(() => {
  vi.stubGlobal('defineNuxtPlugin', (plugin) => plugin)
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('analytics payload builders', () => {
  it('builds page view payloads with user id fallback', () => {
    expect(buildPageViewEventParams({
      currentUserId: null,
      deviceId: 'device-123',
      locationHref: 'https://www.wnyc.org/home',
      title: 'Home',
      params: {
        page_type: 'home_page',
        content_group: 'home',
      },
    })).toEqual({
      page_location: 'https://www.wnyc.org/home',
      page_title: 'Home',
      page_type: 'home_page',
      content_group: 'home',
      user_id: 'device-123',
    })
  })

  it('builds click tracking payloads', () => {
    expect(buildClickEventParams({
      category: 'Header',
      component: 'Nav',
      label: 'Home',
      currentUserId: 'user-123',
      deviceId: 'device-123',
    })).toEqual({
      event_category: 'Header',
      component: 'Nav',
      event_label: 'Home',
      user_id: 'user-123',
    })
  })

  it('builds audio tracking payloads', () => {
    expect(buildAudioEventParams({
      audioType: 'on_demand',
      audioTitle: 'Episode title',
      audioShow: 'Show title',
      currentUserId: null,
      deviceId: 'device-123',
    })).toEqual({
      audio_type: 'on_demand',
      audio_title: 'Episode title',
      audio_show: 'Show title',
      user_id: 'device-123',
    })
  })
})

describe('analytics plugin API', () => {
  it('sends anonymous page views immediately', async () => {
    const { createAnalyticsApi } = await import('~/plugins/analytics.client')
    const logEvent = vi.fn().mockResolvedValue()
    const analytics = createAnalyticsApi({
      getCurrentUserId: () => null,
      getDeviceId: () => 'device-123',
      getLocationHref: () => 'https://www.wnyc.org/home',
      getDocumentTitle: () => 'Home',
      logEvent,
    })

    await analytics.sendPageView({
      page_type: 'home_page',
      content_group: 'home',
    })

    expect(logEvent).toHaveBeenCalledTimes(1)
    expect(logEvent).toHaveBeenCalledWith({
      name: 'page_view',
      params: {
        page_location: 'https://www.wnyc.org/home',
        page_title: 'Home',
        page_type: 'home_page',
        content_group: 'home',
        user_id: 'device-123',
      },
    })
  })

  it('forwards arbitrary analytics events', async () => {
    const { createAnalyticsApi } = await import('~/plugins/analytics.client')
    const logEvent = vi.fn().mockResolvedValue()
    const analytics = createAnalyticsApi({
      getCurrentUserId: () => 'user-123',
      getDeviceId: () => 'device-123',
      getLocationHref: () => 'https://www.wnyc.org/home',
      getDocumentTitle: () => 'Home',
      logEvent,
    })

    await analytics.sendEvent('click_tracking', { event_label: 'Home' })

    expect(logEvent).toHaveBeenCalledWith({
      name: 'click_tracking',
      params: {
        event_label: 'Home',
      },
    })
  })
})
