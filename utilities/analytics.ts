export interface PageViewEventOptions {
  currentUserId?: string | null
  deviceId?: unknown
  locationHref: string
  title: string
  params?: Record<string, unknown>
}

export interface AudioEventOptions {
  audioType: string
  audioTitle: string
  audioShow: string | null
  currentUserId?: string | null
  deviceId?: unknown
}

export interface ClickEventOptions {
  category: string
  component: string
  label: string
  currentUserId?: string | null
  deviceId?: unknown
}

export const getAnalyticsUserId = (
  currentUserId?: string | null,
  deviceId?: unknown
) => currentUserId ?? deviceId

export const buildPageViewEventParams = ({
  currentUserId,
  deviceId,
  locationHref,
  title,
  params = {},
}: PageViewEventOptions) => ({
  page_location: locationHref,
  page_title: title,
  user_id: getAnalyticsUserId(currentUserId, deviceId),
  ...params,
})

export const buildAudioEventParams = ({
  audioType,
  audioTitle,
  audioShow,
  currentUserId,
  deviceId,
}: AudioEventOptions) => ({
  audio_type: audioType,
  audio_title: audioTitle,
  audio_show: audioShow,
  user_id: getAnalyticsUserId(currentUserId, deviceId),
})

export const buildClickEventParams = ({
  category,
  component,
  label,
  currentUserId,
  deviceId,
}: ClickEventOptions) => ({
  event_category: category,
  component,
  event_label: label,
  user_id: getAnalyticsUserId(currentUserId, deviceId),
})
