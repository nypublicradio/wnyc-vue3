import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import PlayButton from '@/components/PlayButton.vue'

// Mock the composables
const mockIsEpisodePlaying = ref(false)
const mockCurrentEpisode = ref(null)
const mockIsStreamLoading = ref(false)
const mockCurrentEpisodeDuration = ref(100)
const mockCurrentEpisodeProgress = ref(50)

vi.mock('~/composables/states', () => ({
    useIsEpisodePlaying: () => mockIsEpisodePlaying,
    useCurrentEpisode: () => mockCurrentEpisode,
    useIsStreamLoading: () => mockIsStreamLoading,
    useCurrentEpisodeDuration: () => mockCurrentEpisodeDuration,
    useCurrentEpisodeProgress: () => mockCurrentEpisodeProgress,
}))

// Mock child components
vi.mock('~/components/icons/PlayIcon.vue', () => ({
    default: { template: '<div data-testid="play-icon">Play</div>' }
}))

vi.mock('~/components/icons/PauseIcon.vue', () => ({
    default: { template: '<div data-testid="pause-icon">Pause</div>' }
}))

vi.mock('~/components/CircularProgressBar.vue', () => ({
    default: {
        template: '<div data-testid="progress-bar" :progress="progress"></div>',
        props: ['progress']
    }
}))

// Mock PrimeVue Button component
const ButtonStub = {
    template: '<button @click="$emit(\'click\', $event)" :class="$attrs.class"><slot /></button>',
    emits: ['click']
}

describe('PlayButton', () => {
    beforeEach(() => {
        // Reset mocks before each test
        mockIsEpisodePlaying.value = false
        mockCurrentEpisode.value = null
        mockIsStreamLoading.value = false
        mockCurrentEpisodeDuration.value = 100
        mockCurrentEpisodeProgress.value = 50
    })

    it('renders correctly with default props', () => {
        const wrapper = mount(PlayButton, {
            global: {
                stubs: {
                    Button: ButtonStub,
                    Transition: { template: '<div><slot /></div>' }
                }
            }
        })

        expect(wrapper.exists()).toBe(true)
        expect(wrapper.find('[data-testid="play-icon"]').exists()).toBe(true)
    })

    it('shows play icon when not playing', () => {
        const wrapper = mount(PlayButton, {
            global: {
                stubs: {
                    Button: ButtonStub,
                    Transition: { template: '<div><slot /></div>' }
                }
            }
        })

        expect(wrapper.find('[data-testid="play-icon"]').exists()).toBe(true)
        expect(wrapper.find('[data-testid="pause-icon"]').exists()).toBe(false)
    })

    it('shows pause icon when playing', async () => {
        const episodeData = { id: '123' }
        mockCurrentEpisode.value = episodeData
        mockIsEpisodePlaying.value = true

        const wrapper = mount(PlayButton, {
            props: {
                data: episodeData
            },
            global: {
                stubs: {
                    Button: ButtonStub,
                    Transition: { template: '<div><slot /></div>' }
                }
            }
        })

        await wrapper.vm.$nextTick()
        expect(wrapper.find('[data-testid="pause-icon"]').exists()).toBe(true)
        expect(wrapper.find('[data-testid="play-icon"]').exists()).toBe(false)
    })

    it('emits on-click event when button is clicked', async () => {
        const wrapper = mount(PlayButton, {
            global: {
                stubs: {
                    Button: ButtonStub,
                    Transition: { template: '<div><slot /></div>' }
                }
            }
        })

        await wrapper.find('button').trigger('click')
        expect(wrapper.emitted('on-click')).toHaveLength(1)
    })

    it('calculates progress correctly', () => {
        mockCurrentEpisodeProgress.value = 25
        mockCurrentEpisodeDuration.value = 100

        const wrapper = mount(PlayButton, {
            global: {
                stubs: {
                    Button: ButtonStub,
                    Transition: { template: '<div><slot /></div>' }
                }
            }
        })

        // The component should calculate 25% progress
        expect(wrapper.vm.getProgress).toBe(25)
    })

    it('shows loading spinner when stream is loading', () => {
        mockIsStreamLoading.value = true

        const wrapper = mount(PlayButton, {
            global: {
                stubs: {
                    Button: ButtonStub,
                    Transition: { template: '<div><slot /></div>' }
                }
            }
        })

        expect(wrapper.find('.pi-spinner').exists()).toBe(true)
    })

    it('applies circle class when label is empty', () => {
        const wrapper = mount(PlayButton, {
            props: {
                label: ''
            },
            global: {
                stubs: {
                    Button: ButtonStub,
                    Transition: { template: '<div><slot /></div>' }
                }
            }
        })

        expect(wrapper.find('.small-play.circle').exists()).toBe(true)
    })

    it('sets aria-disabled when stream is loading', () => {
        mockIsStreamLoading.value = true

        const wrapper = mount(PlayButton, {
            global: {
                stubs: {
                    Button: ButtonStub,
                    Transition: { template: '<div><slot /></div>' }
                }
            }
        })

        expect(wrapper.find('button').attributes('aria-disabled')).toBe('true')
    })
})
