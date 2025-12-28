# Mobile-First UI Guidelines

This project prioritizes tablets and phones. New UI must adhere to these patterns, aligned with Berry React and MUI.

## Navigation

- Phones: Bottom Navigation for primary sections; concise App Bar.
- Drawers: SwipeableDrawer on mobile (disableDiscovery on iOS; keepMounted for performance). Use temporary drawer for xs/sm.
- Tablets/desktop: Mini/persistent drawer at md+; shallow menu hierarchy.

## Layout & Breakpoints

- Use MUI Grid/Stack, Container, and `useMediaQuery` to adapt.
- Keep MUI defaults (xs/sm/md) unless a documented custom scheme is needed.
- Switch drawer variants at `sm/md`; avoid multi-column layouts on phones.

## Touch Targets & Density

- Minimum touch size 48–56px for ListItemButton, Button, IconButton.
- Avoid dense lists on mobile; apply compact density only to data-heavy tablet/desktop views.

## Typography

- Enable responsive font sizes; ensure body/caption legibility on xs/sm.
- Maintain contrast and readable line length on handhelds.

## Tabs & Sections

- Use `variant="fullWidth"` for tabs on phones.
- When tabs overflow, use `variant="scrollable"` and `allowScrollButtonsMobile`; preserve ARIA semantics.

## Forms

- Full-width, stacked TextFields; avoid multi-column forms on phones.
- Set proper `type`/`inputMode` for email, number, phone; concise helper text.
- Place primary actions at the bottom or use a FAB where appropriate.

## Lists, Cards, Tables

- Prefer lists/cards for phones to improve scanability.
- Use tables on md+; optionally dense rows and virtualization; add skeleton loaders for perceived speed.

## Gestures & Feedback

- Drawer gestures: visible edge only if it doesn’t conflict with OS back-swipe; consider device performance.
- Tooltips: support mini-mode sidebar tooltips; minimize reliance on long-press tooltips on mobile.

## Accessibility & Baseline

- Apply CssBaseline; ensure color scheme alignment for dark/light modes.
- Verify focus management and keyboard navigation for menus and tabs; ARIA labels on navigation components.

## Performance

- Keep heavy content off mobile-first screens; lazy-load where useful.
- Use `keepMounted` on mobile drawers; prefer skeletons to spinners.

## Governance

- Treat these as minimums; deviations require rationale in PRs.
- Reference: MUI components (Drawer, SwipeableDrawer, Bottom Navigation, App Bar, Tabs, Text Fields), Berry React patterns.
