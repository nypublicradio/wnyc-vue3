import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import useSleepTimer from '@/composables/useSleepTimer'

// Mock all the external dependencies
vi.mock('@nypublicradio/capacitor-remote-streamer', () => ({
    RemoteStreamer: {
        stop: vi.fn(),
    }
}))

vi.mock('@capacitor/preferences', () => ({
    Preferences: {
        set: vi.fn(),
        get: vi.fn(),
    }
}))

vi.mock('worker-timers', () => ({
    clearInterval: vi.fn(),
    setInterval: vi.fn(() => 123), // Return a mock interval ID
}))

vi.mock('~/utilities/helpers', () => ({
    trackClickEvent: vi.fn(),
}))

// Mock all the state composables
const mockStates = {
    useCurrentEpisode: vi.fn(() => ref(null)),
    useIsEpisodePlaying: vi.fn(() => ref(false)),
    useTogglePlayTrigger: vi.fn(() => ref(false)),
    useSleepTimerRunning: vi.fn(() => ref(false)),
    useSleepTimerPaused: vi.fn(() => ref(false)),
    useSleepTimerSideBar: vi.fn(() => ref(false)),
    useSleepTimerCurrentTime: vi.fn(() => ref(0)),
    useSleepTimerInterval: vi.fn(() => ref(null)),
    useSleepTimerSelectedTime: vi.fn(() => ref({ entry: { value: 300, label: '5 minutes' } })),
    useGlobalToast: vi.fn(() => ref(null)),
    useCurrentUserProfile: vi.fn(() => ref(null)),
}

vi.mock('~/composables/states', () => mockStates)

vi.mock('~/composables/globals', () => ({
    localUserProfileKey: 'test-key'
}))

describe('useSleepTimer', () => {
    beforeEach(() => {
        // Reset all mocks before each test
        vi.clearAllMocks()
    })

    describe('formattedTime computed property', () => {
        it('formats time correctly for seconds only', () => {
            const mockCurrentTime = ref(45) // 45 seconds
            mockStates.useSleepTimerCurrentTime.mockReturnValue(mockCurrentTime)

            const { formattedTime } = useSleepTimer()

            expect(formattedTime.value).toBe('00:45')
        })

        it('formats time correctly for minutes and seconds', () => {
            const mockCurrentTime = ref(125) // 2 minutes 5 seconds
            mockStates.useSleepTimerCurrentTime.mockReturnValue(mockCurrentTime)

            const { formattedTime } = useSleepTimer()

            expect(formattedTime.value).toBe('02:05')
        })

        it('formats time correctly for hours, minutes and seconds', () => {
            const mockCurrentTime = ref(3665) // 1 hour 1 minute 5 seconds
            mockStates.useSleepTimerCurrentTime.mockReturnValue(mockCurrentTime)

            const { formattedTime } = useSleepTimer()

            expect(formattedTime.value).toBe('1:01:05')
        })

        it('formats time correctly for exact hours', () => {
            const mockCurrentTime = ref(7200) // 2 hours exactly
            mockStates.useSleepTimerCurrentTime.mockReturnValue(mockCurrentTime)

            const { formattedTime } = useSleepTimer()

            expect(formattedTime.value).toBe('2:00:00')
        })

        it('formats time correctly for zero', () => {
            const mockCurrentTime = ref(0)
            mockStates.useSleepTimerCurrentTime.mockReturnValue(mockCurrentTime)

            const { formattedTime } = useSleepTimer()

            expect(formattedTime.value).toBe('00:00')
        })

        it('pads single digits correctly', () => {
            const mockCurrentTime = ref(305) // 5 minutes 5 seconds
            mockStates.useSleepTimerCurrentTime.mockReturnValue(mockCurrentTime)

            const { formattedTime } = useSleepTimer()

            expect(formattedTime.value).toBe('05:05')
        })
    })

    describe('timer functions', () => {
        it('clearTheInterval function exists and can be called', () => {
            const { clearTheInterval } = useSleepTimer()

            expect(typeof clearTheInterval).toBe('function')
            expect(() => clearTheInterval()).not.toThrow()
        })

        it('startTimer function exists and can be called', () => {
            const { startTimer } = useSleepTimer()

            expect(typeof startTimer).toBe('function')
            expect(() => startTimer()).not.toThrow()
        })

        it('pauseTimer function exists and can be called', () => {
            const { pauseTimer } = useSleepTimer()

            expect(typeof pauseTimer).toBe('function')
            expect(() => pauseTimer()).not.toThrow()
        })

        it('resetTimer function exists and can be called', () => {
            const { resetTimer } = useSleepTimer()

            expect(typeof resetTimer).toBe('function')
            expect(() => resetTimer()).not.toThrow()
        })
    })
})
