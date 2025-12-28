# Mobile-First Checklist

Use this checklist for new screens/components targeting tablets and phones.

- Navigation: Bottom Navigation (phones), App Bar actions; mobile drawer is swipeable.
- Breakpoints: Layout adapts at xs/sm; drawer variant switches at sm/md.
- Touch targets: 48–56px for interactive elements; avoid dense lists on phones.
- Typography: Responsive font sizes enabled; verify legibility on small screens.
- Tabs: `fullWidth` on phones; `scrollable` when many tabs; ARIA semantics intact.
- Forms: Full-width stacked fields; correct `type`/`inputMode`; concise helper text; bottom primary action.
- Content: Prefer lists/cards on phones; tables reserved for md+; skeletons on data load.
- Gestures: iOS discovery disabled for swipeable drawers if conflicting; keepMounted for performance.
- Accessibility: CssBaseline applied; focus states and keyboard navigation verified; labels and roles present.
- Performance: Lazy-load heavy content; avoid blocking main thread on mobile.

Add deviations and rationale to the PR description if any item cannot be met.
