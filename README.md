# your-lib-name

Modern TypeScript library boilerplate (ESM + CJS) built with **Vite**, **Vitest**, and **Biome**.

## Features
- Dual build: ESM (`dist/index.mjs`) + CommonJS (`dist/index.cjs`)
- Type declarations (`dist/index.d.ts`)
- Vite library mode build
- Vitest with coverage
- Biome for lint + format (replaces ESLint + Prettier)
- GitHub Actions: CI + Publish to npm on tag

## Scripts
- `npm run build` – build library
- `npm test` – run tests with coverage
- `npm run lint` – lint with Biome
- `npm run format` – format with Biome
- `npm run typecheck` – TS type checking (no emit)
- `npm run check` – lint + typecheck + tests

## Using the template
1. Replace the package name in `package.json` with your own (optionally scoped, e.g. `@scope/pkg`).
2. Update the `author`, `description`, and `license` as needed.
3. If you have external deps, add them to `rollupOptions.external` in `vite.config.ts`.

## CI
- **CI workflow** runs lint, typecheck, tests, and build on pushes and PRs across Node 18/20/22.
- **Release workflow** publishes to npm when you push a Git tag like `v0.1.0`.

### Releasing
1. Create an npm token (automation or classic) with `publish` rights.
2. Add it as `NPM_TOKEN` in your repo **Settings → Secrets and variables → Actions**.
3. Bump and tag locally, then push:
   ```bash
   npm version patch   # or minor / major
   git push --follow-tags
   ```
4. The `release.yml` workflow will build and `npm publish` automatically.

## Importing
```ts
import { sum } from "your-lib-name";
// or CommonJS
const { sum } = require("your-lib-name");
```

---

## 🚀 Automated releases with Changesets
- Create a changeset: `npm run changeset` (choose patch/minor/major and describe changes)
- Commit the generated file(s) under `.changeset/`
- Push to `main`. The **Release** workflow will open/refresh a release PR with version bumps and changelog.
- Merge the release PR. The workflow will publish to npm using `NPM_TOKEN`.

## 🐶 Husky pre-commit with lint-staged + Biome
- Hooks are installed via the `prepare` script (`husky`).
- On commit, Husky runs `lint-staged`, which executes Biome **only on staged files**: `biome check --write`.
- If Biome fixes files, re-stage and commit proceeds.
