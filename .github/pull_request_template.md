# Pull Request

## Summary

Describe the change and the user impact. Add links to issues.

## Mobile-First Checklist

Confirm each item (phones/tablets) or explain deviations.

- [ ] Navigation: Bottom Navigation on phones; concise App Bar; mobile drawer is swipeable.
- [ ] Breakpoints: Layout adapts at xs/sm; drawer variant switches at sm/md.
- [ ] Touch targets: 48–56 px for interactive elements (Button, IconButton, ListItemButton).
- [ ] Typography: Responsive font sizes enabled; legibility verified on phones/tablets.
- [ ] Tabs: `variant="fullWidth"` on phones; `scrollable` when many tabs; ARIA semantics intact.
- [ ] Forms: Full-width stacked fields; correct `type`/`inputMode` (email/number/phone); concise helper text; bottom primary action.
- [ ] Content: Prefer lists/cards on phones; tables reserved for md+; skeletons on data load.
- [ ] Gestures: iOS discovery disabled if conflicting; `SwipeableDrawer` uses `keepMounted` for performance.
- [ ] Accessibility: CssBaseline applied; focus states and keyboard navigation verified; labels/roles present.
- [ ] Performance: Lazy-load heavy content; avoid blocking main thread on mobile.

## Deviations & Rationale

List any unchecked items and briefly explain why they do not apply or how they’ll be addressed.

## Screenshots

Add mobile/tablet screenshots or short clips for key flows.

## References

- Mobile-first guidelines: docs/mobile-first-guidelines.md
- Checklist: docs/mobile-first-checklist.md
- MUI component patterns: Drawer, SwipeableDrawer, Bottom Navigation, App Bar, Tabs, Text Fields
