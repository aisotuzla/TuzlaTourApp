# Quest UI and Performance Design (Adaptive Android-Safe)

## Context

This design covers improvements for the quest game experience centered on `MapQuestView.tsx` and `ARGuide.tsx`.

Primary goals:
- Improve perceived smoothness (top priority)
- Improve UI quality and clarity
- Preserve Android battery and thermal safety

Constraints:
- Keep existing quest flow and reward mechanics intact
- Avoid regressions in offline behavior
- Keep manual user control over quality mode

## Success Criteria

- Users report fewer visible stutters in map + AR + scanner flow.
- Android sessions of 15-20 minutes avoid strong overheating compared to prior behavior.
- Auto quality mode protects runtime smoothly without rapid visual mode flipping.
- Manual quality override always takes precedence over auto decisions.

## Recommended Approach

Use an adaptive quality pipeline with one shared runtime policy consumed by both map and AR surfaces.

Why this approach:
- Keeps behavior consistent across components
- Centralizes tuning and maintenance
- Delivers smoothness gains without sacrificing premium UX on stronger devices

## Architecture

Introduce a shared runtime policy object:

`QuestRuntimePolicy`
- `qualityLevel`: `cinematic | balanced | utility`
- `uiFx`: animation/blend/shadow/blur budgets
- `mapFx`: 3D, pitch caps, marker complexity controls
- `arFx`: loop cadence, camera quality caps, marker density limits

Policy inputs:
- Device capability (`features.isAndroidLight`)
- Runtime health signals (battery/perf where available)
- User override (`Auto | Cinematic | Balanced | Saver`)

Policy behavior:
- Auto mode applies adaptive tiering
- Hysteresis/cooldown windows prevent rapid tier oscillation
- Override mode pins selected tier until user changes it

## UI Design Direction

Selected direction: Adaptive visuals with stronger devices staying rich, Android-light auto-shifting to efficient styling.

### Map Quest UI

- Keep current hierarchy (title, quest identity, key actions) but reduce heavy compositing in lower tiers.
- Tier styling:
  - Cinematic: existing high-fidelity visuals
  - Balanced: lighter blur, smaller shadows, fewer animated accents
  - Utility: flat surfaces, minimal blur, static emphasis

### Marker Design

- Replace high-cost animated marker effects at lower tiers with static SVG-centric markers.
- Reduce shadow spread and visual layers in balanced/utility tiers.
- Add distance/zoom decluttering to avoid dense marker overdraw and UI noise.

### Scanner UI

- Keep premium scanner treatment only in cinematic.
- Balanced/utility use static frame and low-cost motion accents.
- Retain all scanner functionality and reward clarity; lower visual overhead only.

### AR HUD

- Limit concurrent marker labels (show nearest/highest relevance first).
- Make pulse effects stage-based (near-target only), not always-on.
- Keep guidance arrows and state text stable to reduce visual churn.

## Performance and Thermal Strategy

### Adaptive Loop Budgets

- AR loop cadence by tier:
  - Cinematic: ~30 fps budget
  - Balanced: ~20-24 fps budget
  - Utility: ~12-15 fps budget
- Add idle throttling when no meaningful motion/sensor changes are detected.

### Sensor Budgeting

- Keep current dual geolocation strategy but add stronger hysteresis.
- Promote to high-accuracy only when proximity to active/selected target is sustained.
- Add lightweight heading smoothing (EMA) to reduce jitter while staying cheap.

### Camera Budgeting

- Keep camera on/off hysteresis model.
- Tie activation thresholds to tier:
  - Utility: later on, earlier off
  - Cinematic: earlier on for richer immersion
- Cap camera resolution/fps by tier to improve frame stability and thermals.

### Map GPU Budgeting

- Utility mode: cap pitch, reduce/disable 3D extrusion, simplify marker visuals.
- Avoid expensive frequent style mutations.
- Batch marker DOM/style updates where possible.

## Precision Strategy (Without Heat Increase)

Precision target is stability-first, not max-frequency updates.

- Stage-aware guidance:
  - Coarse guidance at long range
  - Precision behavior near target only
- Target-focused update priority:
  - Active/nearest target gets highest update budget
  - Other POIs receive reduced-cost updates
- Nearest target lock with debounce to prevent rapid target switching

## Data Flow

1. Runtime signal collectors evaluate device and session state.
2. Policy resolver computes `QuestRuntimePolicy`.
3. `MapQuestView` and `ARGuide` consume policy and render with tier-specific budgets.
4. UI reflects current mode and reason in Auto mode (subtle user-facing indicator).

## Error Handling and Fallbacks

Fallback ladder:
1. AR with camera
2. AR without camera
3. Horizon/compass guidance
4. Map-only navigation

Rules:
- Permission denial should not block quest progression.
- Orientation/camera failures provide one-tap recovery and degrade gracefully.
- Map/network/style failures should preserve quest functionality via offline-safe behavior.

## User Controls and Transparency

Expose mode control in quest UI:
- Auto
- Cinematic
- Balanced
- Saver

In Auto:
- Show subtle reason tags when downgraded (example: low battery, performance protection).

Behavior rules:
- Manual choice overrides auto
- Auto resumes only when user explicitly switches back to Auto

## Test Plan

### Unit Tests

- Policy resolver: tier selection, hysteresis windows, override precedence
- Heading smoothing stability behavior
- Stage transition behavior across distance thresholds

### Integration Tests

- `MapQuestView` and `ARGuide` both react correctly to policy transitions
- No rapid mode flicker under fluctuating signals
- Camera gating and AR loop cadence respond to tier changes as expected

### Device Validation (Android focus)

- 15-20 minute quest sessions
- Compare smoothness before/after (stutter frequency and severity)
- Verify thermal behavior does not regress
- Verify battery drain improves in balanced/utility tiers

### UX Validation

- Mode indicator is clear but unobtrusive
- Manual override discoverable and reliable
- Reduced mode still feels like the same quest product, not a degraded feature set

## Scope Boundaries

In scope:
- Runtime policy + adaptive tier wiring
- UI simplifications and marker/scanner/AR tuning
- Sensor/camera/map budget tuning

Out of scope:
- Redesign of quest mechanics or reward logic
- New quest content
- Backend/API changes

## Rollout Notes

- Implement behind a temporary feature flag if needed for safe A/B comparison.
- Start with balanced defaults for safety.
- Tune thresholds after first Android field validation pass.
