
# Barrel Pattern Convention for New Views

Scope: Applies to all new view modules under `src/views/*`.

## Structure

- Create subfolders: `types/`, `utils/`, `hooks/`, `components/`.
- Orchestrator component: `index.tsx` (default export) composes layout and uses local state/hooks.
- Folder index: `index.ts` may re-export named barrels as needed for external consumption.

## Barrels Usage

- Provide barrels in `components/index.ts` and `hooks/index.ts` for consumers outside the feature.
- Inside the feature (components/hooks/utils), do NOT import the local barrels. Import concrete files directly (with extension) to avoid cycles and match TS bundler resolution.
  - Example (good): `import { useLoginForm } from '../hooks/useLoginForm.ts';`
  - Example (avoid): `import { useLoginForm } from '../hooks';`

## Avoiding Cyclic Imports

- Typical cycle: `hooks → components/index.ts → SomeComponent → hooks`.
- Rules:
  
  - Hooks must not import components. Hooks expose state and handlers only.
  - Components may import hooks directly (file path), not the hooks barrel.
  - Utils and types are leaf modules (no UI), safe to import anywhere.
  - Orchestrator (`index.tsx`) can import local barrels; it is top-level and not imported by submodules.

## TypeScript Resolution

- Project uses `moduleResolution: bundler`. Prefer explicit paths with extensions for local files:
  - `../hooks/useLoginForm.ts`, `../components/AuthLoginAlerts.tsx`.

## Routing

- Lazy routes should import the view folder, relying on the default export from `index.tsx`.

## ESLint/Prettier

- Keep ESLint flat config in `eslint.config.mjs` as the single source of truth.
- Ensure `tsconfig.eslint.json` includes `src/**/*` for typed linting coverage.
- Prettier is enforced via `prettier/prettier`; fix formatting with `--fix` or Prettier.

## Checklist for New View

- Create `types/`, `utils/`, `hooks/`, `components/` subfolders.
- Implement `index.tsx` orchestrator with default export.
- Add barrels for external consumption only; use direct-file imports internally.
- Verify no cycles: hooks never import components; components import hooks via file.
- Use explicit file extensions in internal imports.
- Update routes to lazy-load the new view folder.
- Run `pnpm exec tsc --noEmit` and `pnpm exec eslint "src/**/*.{js,jsx,ts,tsx}"`.
