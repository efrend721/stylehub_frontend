# Contributing

This project is oriented to tablets and phones. All new work must follow our mobile-first standards aligned with Berry React and MUI.

## Pull Request Requirements

- Use the PR template: .github/pull_request_template.md
- Complete the Mobile-First Checklist and document any deviations with rationale.
- Include mobile/tablet screenshots or short clips for key flows.
- Verify `pnpm lint` and `pnpm type-check` pass locally.

## Mobile-First References

- Guidelines: docs/mobile-first-guidelines.md
- Checklist: docs/mobile-first-checklist.md

## Coding & UI Notes

- Navigation: Bottom Navigation + App Bar on phones; temporary `SwipeableDrawer`. Mini/persistent drawer on md+.
- Touch targets: 48–56 px; avoid dense lists on phones.
- Typography: responsive font sizes; verify legibility.
- Tabs: `fullWidth` on phones; `scrollable` when many; keep ARIA semantics.
- Forms: full-width stacked fields; correct `type`/`inputMode`; bottom primary actions.
- Lists/cards vs tables: prefer lists/cards on phones; tables on md+ with skeletons.
- Accessibility/performance: apply CssBaseline; verify focus; iOS swipe props; `keepMounted` drawers.

## Development

- Run `pnpm lint` and `pnpm type-check` before pushing.
- Keep changes minimal and consistent with existing style.
