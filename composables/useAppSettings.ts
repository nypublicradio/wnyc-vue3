// composable to handle the app settings
export default function useAppSettings () {
    const settings = useState('app_settings', () => null)
    const client = useSupabaseClient()

    const getAppSettings = async () => {
        // if we already have the settings, return them
        if (settings.value) {
            return settings.value
        }

        // fetch from supabase
        const { data, error } = await client
            .from('app_settings')
            .select('*')
            .limit(1)
            .single()

        if (error) {
            console.error('Error fetching app settings:', error)
            return null
        }

        settings.value = data
        return data
    }

    return { getAppSettings, settings }
}