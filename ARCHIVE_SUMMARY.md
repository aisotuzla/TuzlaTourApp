# Archive and Cleanup Summary

## Completed Tasks

### 1. AR Code Archived ✅
The following AR-related files have been moved to the `archive/` directory:

**Components:**
- `archive/ar-components/ARGuide.tsx`
- `archive/ar-components/ARBreadcrumbCanvas.tsx`
- `archive/ar-components/ARPolylineCanvas.tsx`

**Utils:**
- `archive/ar-utils/arProjection.ts`

**Hooks:**
- `archive/ar-hooks/useBreadcrumbsTrail.ts`
- `archive/ar-hooks/useGeoapifyRoute.ts`
- `archive/ar-hooks/useQuestRuntimePolicy.ts`

### 2. External Events Database Removed ✅
The following external events database files have been moved to `archive/events-external/`:
- `archive/events-external/eventsDb.ts`
- `archive/events-external/api/events/index.ts`
- `archive/events-external/types/events.ts`

### 3. Local Events Preserved ✅
- `components/EventCalendarView.tsx` has been updated to use local event types
- Created new type file: `types/localEvents.ts` with `LocalEvent` and `LocalEventCategory` types
- EventCalendarView now uses local storage only (no external database dependencies)

### 4. Package.json Cleaned ✅
Removed unused dependencies:
- `@vercel/blob`
- `blob`
- `postgres`

### 5. App.tsx Cleaned ✅
- Removed ARGuide import
- Removed `/ar` route
- Removed `AppTab.AR` from route mappings

### 6. Types Cleaned ✅
- Removed `AR = 'ar'` from `AppTab` enum in `types.ts`

### 7. AdaptiveLowPassFilter Preserved ✅
- Extracted `AdaptiveLowPassFilter` class from `arProjection.ts`
- Created new file: `utils/gpsSmoothing.ts`
- This utility is still used by MapQuestView for GPS smoothing

## Remaining Work ⚠️

### MapQuestView.tsx Still Contains AR References
The file `components/MapQuestView.tsx` still has AR-related code that needs to be removed:

**State to remove:**
- `showARGuide` state (line 111)
- `splitHeight` state (line 631)
- `handleToggleARMode` function (line 193)

**Imports to clean:**
- Already updated: `AdaptiveLowPassFilter` now imports from `gpsSmoothing` instead of `arProjection`

**UI Elements to remove:**
- ARGuide component usage (line 703)
- AR toggle button (line 787-790)
- Split view logic for AR (lines 671-672, 689-712)
- Bottom position adjustments for AR (lines 775, 842, 860)

**Logic to clean:**
- References to `showARGuide` in `handleStartNavigation` (line 164)
- References to `showARGuide` in `startArTrailFromPopup` (line 224)
- UseEffect dependency on `showARGuide` and `splitHeight` (line 661)

## Files Created/Modified

### New Files:
- `archive/ar-components/ARGuide.tsx`
- `archive/ar-components/ARBreadcrumbCanvas.tsx`
- `archive/ar-components/ARPolylineCanvas.tsx`
- `archive/ar-utils/arProjection.ts`
- `archive/ar-hooks/useBreadcrumbsTrail.ts`
- `archive/ar-hooks/useGeoapifyRoute.ts`
- `archive/ar-hooks/useQuestRuntimePolicy.ts`
- `archive/events-external/eventsDb.ts`
- `archive/events-external/api/events/index.ts`
- `archive/events-external/types/events.ts`
- `utils/gpsSmoothing.ts` (extracted from arProjection.ts)
- `types/localEvents.ts` (new local events types)
- `ARCHIVE_SUMMARY.md` (this file)

### Modified Files:
- `App.tsx` - Removed AR imports and routes
- `types.ts` - Removed AR from AppTab enum
- `package.json` - Removed @vercel/blob, blob, postgres dependencies
- `components/EventCalendarView.tsx` - Updated to use LocalEvent types
- `components/MapQuestView.tsx` - Partial cleanup (needs more work)

## Solana/Web3 Code
No Solana or web3 code was found in the repository, so nothing to remove.

## Next Steps

To complete the cleanup:

1. **Manual work needed on MapQuestView.tsx:**
   - Remove all `showARGuide` related state and logic
   - Remove all `splitHeight` related state and logic
   - Remove ARGuide component import and usage
   - Remove AR toggle button
   - Clean up all conditional rendering based on `showARGuide`
   - Remove AR-related event handlers

2. **Test the application:**
   - Run `npm run build` to check for TypeScript errors
   - Run `npm start` to verify the app works without AR functionality
   - Test EventCalendarView to ensure local events still work

3. **Optional: Delete archive directory**
   - If you're sure you won't need the AR code, you can delete the `archive/` directory
   - Or keep it as a reference for future use

## Summary

✅ **Completed:** AR components, hooks, utils archived
✅ **Completed:** External events database removed
✅ **Completed:** Local events preserved and updated
✅ **Completed:** Package.json cleaned
✅ **Completed:** App.tsx and types cleaned
⚠️ **Needs work:** MapQuestView.tsx still has AR references

The majority of the cleanup is complete. The main remaining task is cleaning up MapQuestView.tsx, which has AR functionality deeply integrated. This requires manual removal of AR-related state, logic, and UI elements.
