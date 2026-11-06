# Self-hosted Discord

A self-hosted browser application for ephemeral voice and screen-sharing rooms.

## Development

Use the pnpm version pinned in `package.json`.

```sh
pnpm install
pnpm start:dev
```

The API uses port 3000 by default (`PORT` overrides it). The frontend uses Vite's
default port 5173. The applications are currently independent starter applications.

## Workspace commands

Run these commands from the repository root:

| Command                       | Purpose                                                |
| ----------------------------- | ------------------------------------------------------ |
| `pnpm start`                  | Start the API and frontend without API watch mode      |
| `pnpm start:dev` / `pnpm dev` | Start both applications with development watch mode    |
| `pnpm build`                  | Build both applications                                |
| `pnpm start:prod`             | Run the built API and preview the built frontend       |
| `pnpm start:debug`            | Start the API in debug/watch mode                      |
| `pnpm preview`                | Preview the built frontend locally                     |
| `pnpm format`                 | Format root tooling files and application source files |
| `pnpm format:check`           | Check formatting without changing files                |
| `pnpm lint`                   | Lint both applications                                 |
| `pnpm typecheck`              | Type-check both applications                           |
| `pnpm test`                   | Run available workspace unit tests                     |
| `pnpm test:watch`             | Watch available workspace unit tests                   |
| `pnpm test:cov`               | Run available workspace tests with coverage            |
| `pnpm test:e2e`               | Run available workspace end-to-end tests               |
| `pnpm check`                  | Run lint, type checks, unit tests, and builds          |

Run `pnpm build` before `pnpm start:prod` or `pnpm preview`. Vite preview is a
preview server; a self-hosted production deployment should serve the frontend's
`dist` directory through a suitable static web server.

Tests currently exist only in the API. Test commands skip packages without the
corresponding script; the frontend does not have a test suite yet.

To target one application, use its workspace name:

```sh
pnpm --filter api start:dev
pnpm --filter frontend dev
pnpm --filter api test:e2e
```

## Git hooks

`pnpm install` installs Husky hooks through the root `prepare` script.
The `pre-commit` hook runs lint and type checks across both applications.
The `commit-msg` hook validates the proposed message using commitlint's
Conventional Commits configuration. Git makes the message available at this hook,
after `pre-commit` has run.

Examples:

```text
chore: configure workspace scripts and git hooks
feat(api): add room creation
fix(frontend): handle expired invitations
```

To manually validate a message:

```sh
printf '%s\n' 'feat(api): add room creation' | pnpm commitlint
```
