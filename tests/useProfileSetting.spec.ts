import { nextTick, ref } from "vue"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const state = vi.hoisted(() => ({}) as Record<string, any>)
const preferencesSet = vi.hoisted(() => vi.fn())
const toggleOneSignalUserTag = vi.hoisted(() => vi.fn())

vi.mock("~/composables/states.ts", () => {
  const use = (key: string) => () => state[key]
  return {
    useAllCurrentStations: use("allCurrentStations"),
    useTextSizeOption: use("textSizeOptions"),
    useCurrentUser: use("currentUser"),
    useCurrentUserProfile: use("currentUserProfile"),
    useEditProfileSideBar: use("editProfileSideBar"),
    useIsLiveStream: use("isLiveStream"),
    useIsApp: use("isApp"),
    useAccountDeleteSideBar: use("accountDeleteSideBar"),
    useSettingSideBar: use("settingSideBar"),
    useGlobalToast: use("globalToast"),
    useMasterNotificationChannelsArray: use("masterNotificationChannelsArray"),
  }
})
vi.mock("~/utilities/helpers", () => ({
  trackClickEvent: vi.fn(),
  setFontSize: vi.fn(),
  toggleAskNotificationPermissions: vi.fn(),
  getCustomStationLabel: vi.fn(),
}))
vi.mock("~/composables/globals", () => ({ localUserProfileKey: "localUserProfile" }))
vi.mock("~/composables/data/liveStream", () => ({ updateLiveStream: vi.fn() }))
vi.mock("~/composables/useOneSignal", () => ({ default: () => ({ toggleOneSignalUserTag }) }))
vi.mock("~/composables/useMembership", () => ({ useMembership: () => ({ dialogProps: {} }) }))
vi.mock("~/composables/useBreakpoints", () => ({ useBreakpoints: () => ({ isMobileBreakpoint: ref(false) }) }))
vi.mock("primevue/usedialog", () => ({ useDialog: () => ({ open: vi.fn() }) }))
vi.mock("@capacitor/preferences", () => ({ Preferences: { set: preferencesSet } }))

const { useProfileSetting } = await import("~/composables/useProfileSetting")

const profile = () => ({
  name: "Jo",
  default_live_stream: "wnyc-fm939",
  continuous_play: true,
  dark_mode: false,
  receive_general_notifications: true,
  one_signal_notification_channels: [{ key: "news", value: false }],
  text_size: "medium",
  autodownload: false,
})

const mockSupabase = (error: unknown = null) => {
  const match = vi.fn().mockResolvedValue({ error })
  const upsert = vi.fn(() => ({ match }))
  const from = vi.fn(() => ({ upsert }))
  vi.stubGlobal("useSupabaseClient", () => ({ from }))
  return { from, upsert }
}

beforeEach(() => {
  ;(process as any).client = true
  vi.stubGlobal("navigateTo", vi.fn())
  Object.assign(state, {
    allCurrentStations: ref([]),
    textSizeOptions: ref([]),
    currentUser: ref(null),
    currentUserProfile: ref(profile()),
    editProfileSideBar: ref(false),
    isLiveStream: ref(false),
    isApp: ref(true),
    accountDeleteSideBar: ref(false),
    settingSideBar: ref(true),
    globalToast: ref(null),
    masterNotificationChannelsArray: ref([{ key: "news" }]),
  })
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe("useProfileSetting", () => {
  it("upserts a logged-in user's profile change to supabase and toasts success", async () => {
    const { from, upsert } = mockSupabase()
    state.currentUser.value = { id: "u1", app_metadata: { provider: "email" } }
    useProfileSetting()

    state.currentUserProfile.value.continuous_play = false
    await nextTick()
    await Promise.resolve()

    expect(from).toHaveBeenCalledWith("profiles")
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({ id: "u1", continuous_play: false, text_size: "medium" })
    )
    expect(state.globalToast.value).toMatchObject({ severity: "success", summary: "Settings updated." })
  })

  it("toasts an error when the supabase upsert fails", async () => {
    mockSupabase({ message: "nope" })
    state.currentUser.value = { id: "u1", app_metadata: { provider: "email" } }
    useProfileSetting()

    state.currentUserProfile.value.dark_mode = true
    await nextTick()
    await Promise.resolve()

    expect(state.globalToast.value).toMatchObject({ severity: "error", summary: "Settings update failed." })
  })

  it("persists a logged-out profile change to local preferences, then toasts", async () => {
    vi.useFakeTimers()
    const { from } = mockSupabase()
    useProfileSetting()

    state.currentUserProfile.value.continuous_play = false
    await nextTick()
    await Promise.resolve()

    expect(from).not.toHaveBeenCalled()
    expect(preferencesSet).toHaveBeenCalledWith({
      key: "localUserProfile",
      value: JSON.stringify({ ...profile(), continuous_play: false }),
    })
    expect(state.globalToast.value).toBeNull()
    vi.advanceTimersByTime(1000)
    expect(state.globalToast.value).toMatchObject({ severity: "success" })
  })

  it("does not save when the profile first loads", async () => {
    const { from } = mockSupabase()
    state.currentUserProfile.value = null
    useProfileSetting()

    state.currentUserProfile.value = profile()
    await nextTick()

    expect(from).not.toHaveBeenCalled()
    expect(preferencesSet).not.toHaveBeenCalled()
  })

  it("syncs a notification channel's current value to OneSignal", () => {
    mockSupabase()
    const { handleNotificationChannelChange } = useProfileSetting()

    state.currentUserProfile.value.one_signal_notification_channels[0].value = true
    handleNotificationChannelChange({ key: "news" })

    expect(toggleOneSignalUserTag).toHaveBeenCalledWith("news", true)
  })

  it("only lets email accounts edit their profile", () => {
    mockSupabase()
    state.currentUser.value = { app_metadata: { provider: "google" } }
    const { isEmail, isDisabled, accountHeader, editField } = useProfileSetting()

    editField("name")

    expect(isEmail.value).toBe(false)
    expect(isDisabled.value).toBe(true)
    expect(accountHeader.value.type).toBe("google")
    expect(state.editProfileSideBar.value).toBe(false)
  })
})
