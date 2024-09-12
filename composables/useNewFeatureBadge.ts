import { ref, onMounted } from 'vue';
import { Preferences } from '@capacitor/preferences';

// composable to handle the new feature badge
export const useNewFeatureBadge = () => {
    const isNewFeature = ref(true);
    const sessionCount = ref(0);
    const sessionLimit = 10

    onMounted(async () => {
        const storedSessionCount = await Preferences.get({ key: 'new_feature_session_count' });
        if (storedSessionCount.value) {
            sessionCount.value = parseInt(storedSessionCount.value, 10);
            // Check if it's still a new feature
            isNewFeature.value = Boolean(sessionCount.value < sessionLimit);
        }
    });

    // Initialize the session count
    const initFeatureSessionCount = (async () => {
        // Fetch session count from local storage, or initialize it if it doesn't exist
        const storedSessionCount = await Preferences.get({ key: 'new_feature_session_count' });

        if (storedSessionCount.value) {
            sessionCount.value = parseInt(storedSessionCount.value, 10);

            // has already reahed the session limit, no need to update the session count
            if (sessionCount.value >= sessionLimit) {
                return
            }
            // increment the session count
            sessionCount.value++
            //set the session count
            await Preferences.set({ key: 'new_feature_session_count', value: String(sessionCount.value) });
        } else {
            // init the session count
            sessionCount.value = 0;
            await Preferences.set({ key: 'new_feature_session_count', value: '0' });
        }

        // Check if it's still a new feature
        isNewFeature.value = Boolean(sessionCount.value < sessionLimit);
    });

    // Handle the click event to fulfull the session count
    const handleFeatureClick = async () => {
        if (sessionCount.value < sessionLimit) {
            await Preferences.set({ key: 'new_feature_session_count', value: String(sessionLimit) });

            // Remove the badge
            isNewFeature.value = false;
        }
    };

    return {
        isNewFeature,
        handleFeatureClick,
        initFeatureSessionCount
    };
};
