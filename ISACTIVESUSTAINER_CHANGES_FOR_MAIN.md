# isActiveSustainer Feature - Changes Required for Main Branch

## Executive Summary

To implement the `isActiveSustainer` feature on the `main` branch, you need to make **minimal changes** to only **2 files** plus add **1 new file**. The `server/api/profile.post.ts` already exists on main with the `isActiveSustainer` field, so most of the backend work is done.

## Files Status

### ✅ Already on Main (No Changes Needed)
- `server/api/profile.post.ts` - Already has `isActiveSustainer` in the ProfileResponse interface and calculation logic
- `composables/globals.ts` - Changes are unrelated to isActiveSustainer (UI constants)
- `utilities/helpers.ts` - Changes are unrelated to isActiveSustainer (various utility refactors)

### ⚠️ Files That Need Changes

#### 1. **composables/states.ts** (Minor Change)
**Current Status on Main**: File exists but missing `isActiveSustainer` property

**Required Change**: Add ONE line
```typescript
const localUserProfileDefault: object = {
    autodownload: false,
    default_live_stream: "WNYC 93.9 FM",
    receive_general_notifications: false,
    one_signal_notification_channels: masterNotificationChannelsArray,
    text_size: "Normal",
    dark_mode: false,
    sleep_timer: 90,
    isActiveSustainer: false,  // ← ADD THIS LINE
}
```

**Why**: Sets the default value for `isActiveSustainer` in local storage

---

#### 2. **composables/useProfileApi.ts** (New File)
**Current Status on Main**: File does NOT exist

**Required**: Create entire file with 170 lines

**What it does**:
- Provides `fetchProfile()` to call `/api/profile` endpoint
- Provides `getMembershipInfo()` to orchestrate the profile fetch
- Saves `isActiveSustainer` to CapacitorStorage after fetching
- Includes utility functions: `formatCurrency()` and `formatDate()`

**Key dependencies**:
- Uses `useAuth()` composable for JWT authentication
- Uses `Preferences` from `@capacitor/preferences` for storage
- Uses `localUserProfileKey` from `composables/globals`

---

## Additional Changes on Your Branch (NOT needed for isActiveSustainer)

The following changes in your diffs are unrelated to the `isActiveSustainer` feature:

### composables/states.ts
- Added `useSettingsSideBarBrowser` state
- Removed `usePlayerSeek` state  
- Added `useFullDeviceInfo`, `useAppDownloadLink`, `usePreviewData` states
- Minor formatting changes (semicolons)

### composables/globals.ts
- Added `appMenuOptions` array
- Added `liveStationPreferences` array
- Added `brandCards` array
- Updated `showTopics` labels and added image paths
- Added EVENT media type
- Minor formatting (removed extra blank line)

### utilities/helpers.ts
- Many unrelated refactors and utility function changes
- Image processing function changes
- Date formatting updates
- Device info additions

**These can be ignored** if you only want the isActiveSustainer feature.

---

## Implementation Steps for Main Branch

### Step 1: Add isActiveSustainer to states.ts
```bash
# Edit composables/states.ts
# Add one line to localUserProfileDefault object:
isActiveSustainer: false,
```

### Step 2: Create useProfileApi.ts composable
```bash
# Create the file: composables/useProfileApi.ts
# Copy the entire file from your branch
```

You can get the exact file content by running:
```bash
git show wcolon/mc-integ:composables/useProfileApi.ts > composables/useProfileApi.ts
```

### Step 3: Test the Integration

1. **Login as a user** with a Salesforce ID
2. **Check the network tab** - should see POST to `/api/profile`
3. **Check CapacitorStorage** - `localUserProfile` should contain `isActiveSustainer: true/false`
4. **Use in components**:
   ```vue
   <script setup>
   const { profile, getMembershipInfo } = useProfileApi()
   
   onMounted(async () => {
     await getMembershipInfo()
   })
   </script>
   ```

---

## Dependencies Already on Main

These are required and should already be on main:
- ✅ JWT Authentication system (`composables/useAuth.ts`)
- ✅ Salesforce integration (`server/utils/salesforce.ts`)
- ✅ Profile API endpoint (`server/api/profile.post.ts`)
- ✅ Capacitor Preferences package
- ✅ `@vueuse/core` package (for `until` helper)

---

## Verification Checklist

Before deploying to main:

- [ ] `composables/states.ts` has `isActiveSustainer: false` in defaults
- [ ] `composables/useProfileApi.ts` file exists and compiles
- [ ] JWT authentication is working
- [ ] Salesforce connection is configured
- [ ] Test with real user who has active donations
- [ ] Test with user who has no active donations
- [ ] Verify `isActiveSustainer` saves to local storage
- [ ] Verify `isActiveSustainer` persists across app restarts
- [ ] Verify `isActiveSustainer` clears on logout

---

## Minimal Git Commands for Cherry-Picking

If you want to cherry-pick just the isActiveSustainer changes:

```bash
# Switch to main
git checkout main

# Create a new branch for the feature
git checkout -b feature/isActiveSustainer

# Cherry-pick just the needed file changes
# (You'll need to identify the specific commits that added these changes)
git show wcolon/mc-integ:composables/useProfileApi.ts > composables/useProfileApi.ts
git add composables/useProfileApi.ts

# Manually edit composables/states.ts to add the one line
# Then commit
git add composables/states.ts
git commit -m "Add isActiveSustainer to user profile storage

- Add useProfileApi composable to fetch membership data from Salesforce
- Save isActiveSustainer to CapacitorStorage after profile fetch
- Add isActiveSustainer default value to localUserProfile state"
```

---

## Testing the Feature

### Test Case 1: Active Sustainer
1. Login as user with active recurring donation in Salesforce
2. Navigate to member center or trigger `getMembershipInfo()`
3. Verify `isActiveSustainer: true` in API response
4. Check DevTools → Application → Storage → `localUserProfile`
5. Should see `"isActiveSustainer": true`

### Test Case 2: Non-Sustainer
1. Login as user with NO active recurring donations
2. Navigate to member center
3. Verify `isActiveSustainer: false` in API response
4. Check local storage - should see `"isActiveSustainer": false`

### Test Case 3: Logout/Login Cycle
1. Login and verify `isActiveSustainer` is set
2. Logout (calls `Preferences.clear()`)
3. Verify local storage is cleared
4. Login again
5. Verify `isActiveSustainer` is fetched and stored again

---

## Summary

**Minimum changes to get isActiveSustainer working on main:**

1. ✏️ Edit `composables/states.ts` - add 1 line
2. ➕ Create `composables/useProfileApi.ts` - new file
3. ✅ Test and verify

**Files that are already ready:**
- `server/api/profile.post.ts` - already has the logic ✅

**Total lines of code to add:** ~171 lines (170 in new file + 1 in states.ts)

This is a clean, focused change that adds the membership status tracking without bringing in any of the other UI/feature changes from your branch.
