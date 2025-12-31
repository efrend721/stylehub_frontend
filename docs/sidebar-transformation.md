# Sidebar Transformation: Hide Rail & Fix Main Overflow

Date: 2025-12-28

## Goal

- Remove the mini-rail (icons-only) behavior so the sidebar is fully hidden when collapsed.
- Ensure the main content stays full-width and does not overflow when rotating devices (vertical ↔ horizontal).

## Summary of Changes

- Always render a single MUI `Drawer` for the sidebar:
  - Mobile/tablet (`md` and below): `variant="temporary"` (overlays the content).
  - Desktop (`md` and above): `variant="persistent"` (pushes content when open).
- When the drawer is closed on desktop, set the nav container width to `0` so the main content fills the screen.
- Simplify `MainContentStyled` to avoid negative margins and forced width reductions when the drawer is closed.
- Remove usage of the mini-rail (`MiniDrawerStyled`).

## Files Changed

- Sidebar behavior: [src/layout/MainLayout/Sidebar/index.tsx](../src/layout/MainLayout/Sidebar/index.tsx)
- Main content layout: [src/layout/MainLayout/MainContentStyled.ts](../src/layout/MainLayout/MainContentStyled.ts)

## Key Implementation Notes

- `Sidebar/index.tsx`:
  - Removed `MiniDrawerStyled` import and rendering.
  - `Drawer` is used for both mobile and desktop.
  - `onClose` sets the drawer state to `false` to ensure a clean collapse.
  - Desktop nav width becomes `0` when closed to prevent icon rail and allow full-width content.
- `MainContentStyled.ts`:
  - When `open=false`, keep `width: 100%` (no negative `marginLeft`, no `calc(100% - drawerWidth)`).
  - When `open=true` on desktop, set `width: calc(100% - drawerWidth)` so content adjusts properly.

## Behavior After Change

- Mobile/tablet vertical & horizontal:
  - Sidebar is hidden when closed and overlays content when opened.
  - Main content remains full-width when closed; no overflow on rotation.
- Desktop:
  - Closed sidebar → content is full-width.
  - Open sidebar → content width is reduced by `drawerWidth`.

## Related State & Toggle

- Toggle button in header triggers `handlerDrawerOpen(!drawerOpen)`.
  - Button: [src/layout/MainLayout/Header/index.tsx](../src/layout/MainLayout/Header/index.tsx)
  - State source & mutation via SWR: [src/api/menu.ts](../src/api/menu.ts)

## Verification

1. Run the app and resize the viewport.
2. Rotate device or use DevTools to simulate orientation changes.
3. Confirm main content fills the screen when the drawer is closed.
4. Confirm drawer overlays on mobile and is persistent on desktop when open.

## Notes

- This change favors a clean UI in horizontal orientation on small devices by avoiding the icon rail.
- Consider adding a tooltip to the header toggle button for accessibility.
