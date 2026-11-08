# Self-hosted Discord

A self-hosted browser application for ephemeral voice and screen-sharing rooms.

## Development

Use the pnpm version pinned in `package.json`.

```sh
pnpm install
pnpm api:start:dev
```

In a separate terminal, run `pnpm web:dev`.

The API uses port 3000 by default (`PORT` overrides it). The frontend uses Vite's
default port 5173. The applications are currently independent starter applications.

The API exposes `GET /health`, which returns HTTP 200 with `{ "status": "ok" }`.

## Workspace commands

Run these commands from the repository root:

| API command             | Web command                           | Purpose                                                                               |
| ----------------------- | ------------------------------------- | ------------------------------------------------------------------------------------- |
| `pnpm api:start`        | `pnpm web:start`                      | Start the selected application without API watch mode                                 |
| `pnpm api:start:dev`    | `pnpm web:start:dev` / `pnpm web:dev` | Start the selected application in development mode                                    |
| `pnpm api:build`        | `pnpm web:build`                      | Build the selected application                                                        |
| `pnpm api:start:prod`   | `pnpm web:start:prod`                 | Run the built API or preview the built frontend                                       |
| `pnpm api:start:debug`  | —                                     | Start the API in debug/watch mode                                                     |
| —                       | `pnpm web:preview`                    | Preview the built frontend locally                                                    |
| `pnpm api:format`       | `pnpm web:format`                     | Format the selected application's source files                                        |
| `pnpm api:format:check` | `pnpm web:format:check`               | Check the selected application's formatting                                           |
| `pnpm api:lint`         | `pnpm web:lint`                       | Lint the selected application                                                         |
| `pnpm api:typecheck`    | `pnpm web:typecheck`                  | Type-check the selected application                                                   |
| `pnpm api:test`         | —                                     | Run API unit tests                                                                    |
| `pnpm api:test:watch`   | —                                     | Watch API unit tests                                                                  |
| `pnpm api:test:cov`     | —                                     | Run API unit tests with coverage                                                      |
| `pnpm api:test:e2e`     | —                                     | Run API end-to-end tests                                                              |
| `pnpm api:check`        | `pnpm web:check`                      | Run lint, type checks, available unit tests, and a build for the selected application |

Build the selected application before running its `start:prod` or `preview`
command. Vite preview is a preview server; a self-hosted production deployment
should serve the frontend's `dist` directory through a suitable static web server.

Tests currently exist only in the API; the frontend does not have a test suite yet.
The `web:*` commands target the workspace package named `frontend`.

Repository-wide commands remain available for validation and Git hooks:

| Command             | Purpose                                                            |
| ------------------- | ------------------------------------------------------------------ |
| `pnpm build`        | Build both applications                                            |
| `pnpm format`       | Format root tooling files and application source files             |
| `pnpm format:check` | Check root and application formatting                              |
| `pnpm lint`         | Lint both applications                                             |
| `pnpm typecheck`    | Type-check both applications                                       |
| `pnpm test`         | Run available workspace unit tests                                 |
| `pnpm test:cov`     | Run available workspace tests with coverage                        |
| `pnpm test:e2e`     | Run available workspace end-to-end tests                           |
| `pnpm check`        | Run lint, type checks, unit tests, and builds across the workspace |

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
