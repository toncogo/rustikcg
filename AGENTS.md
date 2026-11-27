# Repository Guidelines

## Project Structure
- **Backend (`backend/src/`):** Node.js (22+) and Express API with PostgreSQL.
  - `server.js` — Server entrypoint.
  - `app.js` — Middleware and route wiring.
  - `config/` — Environment, database pool, and service configuration.
  - `routes/` — HTTP route definitions only (no business logic).
  - `middlewares/` — Auth, validation, rate limiting, and error-handling middlewares.
  - `controllers/` — Request parsing, boundary validation, and HTTP responses.
  - `services/` — Core business logic and database interaction.
  - `utils/` — Shared pure helpers.
  - `database/init.sql` — Initial PostgreSQL schema (executes only when the data volume is first created).
  - `database/migrations/` — Idempotent SQL migrations for existing databases.
- **Scoped Agent Guides:** When working inside `frontend/` or `backend/`, also follow the corresponding local `AGENTS.md` (`frontend/AGENTS.md` or `backend/AGENTS.md`), which defines strict write boundaries.
- **Frontend (`frontend/src/`):** Static HTML, CSS, and vanilla JavaScript in `assets/`; venue photos in `fotos/`.
- **Reverse Proxy (`frontend/nginx.conf`):** Serves static files, enforces security headers and CSP, and proxies `/api/*` to Express.

## Communication & Workflow
- Respond to the user in Portuguese (pt-BR). Keep all code, comments, commit messages, and documentation in English, **except user-facing UI copy and API validation/error messages**, which must be in Brazilian Portuguese (`pt-BR`).
- Before modifying more than 3 files, changing database schemas, altering `frontend/nginx.conf` security headers, or adding dependencies, present a concise step-by-step plan and wait for confirmation.
- **Scope discipline:** Only edit files directly required for the task. Do not refactor, reformat, or rename unrelated code.
- **Verify before assuming:** Inspect `backend/package.json` and existing modules before importing packages or referencing environment variables.
- **Stop condition:** If a fix fails after 2–3 attempts or requirements are ambiguous, stop, explain the root cause, and ask before proceeding.
- Keep explanations direct and concise. Never output unchanged files in full.

## Local Development
- **First-time setup (manual):** User creates `.env` from `.env.example` with local values.
- **Full stack with Mailpit:** `docker compose --profile dev-mail up -d --build`
  - App: `http://localhost:8080`
  - Mailpit inbox: `http://localhost:8025`
- **Container operations:** `docker compose ps`, `docker compose logs -f backend`, and `docker compose down`.
- **Direct API dev (Node.js 22+):** From `backend/`, run `npm ci` then `npm run dev` (watch mode) or `npm start` (without watch). Requires reachable PostgreSQL and SMTP services.
- **Worktree isolation:** When running inside a Git worktree, do **not** run `docker compose up` or `docker compose down` against the default project name, shared ports (`8080`, `8025`, `5432`), or shared volumes. Either let the maintainer validate the Docker stack or use the isolated override (`docker-compose.wt.yml` with a unique `-p` project name) only when explicitly instructed.

## Code Style & Conventions
- **Backend:** Use CommonJS (`require`/`module.exports`), 4-space indentation, `camelCase` identifiers, and filenames such as `auth.routes.js` and `auth.service.js`.
- **Async code:** Always use `async`/`await` instead of callbacks or `.then()` chains across both backend and frontend. Use promise-based APIs (e.g., `node:fs/promises`, `util.promisify`, async `pg` queries). In Express handlers, catch unexpected errors and forward them to `next(err)` to avoid unhandled promise rejections.
- **Frontend:** Use 2-space indentation, `camelCase` identifiers, and filenames such as `api.js` and `verify-email.js`.
- **CSP compliance:** Keep all browser JavaScript and CSS in external files. Never introduce inline `<script>` blocks, inline event handlers (`onclick`, `onload`, etc.), or inline styles that violate `frontend/nginx.conf`.
- **Input validation & errors:** Validate all external inputs (params, query, body, headers) at the request boundary. Handle errors explicitly with clear, structured JSON responses without leaking stack traces or raw database errors.
- Follow the surrounding quote style and existing folder conventions.

## Security & Guardrails
- Never read, print, modify, or commit `.env` files, session cookies, private keys, or credentials. If a new environment variable is needed, add a placeholder to `.env.example` only and notify the user.
- Never hardcode secrets, tokens, OTPs, or passwords in source code.
- Never log secrets, tokens, OTPs, passwords, or sensitive user data.
- Always use parameterized SQL queries (`$1`, `$2`, etc.); never concatenate or interpolate untrusted input into SQL strings.
- **Database safety:** Because `backend/src/database/init.sql` only runs on an empty volume, never run `docker compose down -v` or drop data without explicit approval. When changing an existing schema, update `init.sql` for fresh setups and provide an idempotent SQL migration for existing databases; never alter already-applied migration files.
- Never run destructive commands (`rm -rf`, `docker compose down -v`, `git push --force`, `git reset --hard`, `DROP TABLE`, etc.) without explicit approval.

## Verification & Testing
- This repository currently has no automated test suite or linter configured. Do not invent or claim test/lint runs that do not exist. (If automated test or lint scripts are added to `backend/package.json` in the future, run them and never skip or weaken tests to make them pass.)
- Run syntax checks (`node --check <file>`) on modified backend files.
- When Docker services are running, verify API and database health through Nginx:
  - `curl -f http://localhost:8080/api/health`
  - `curl -f http://localhost:8080/api/health/database`
- For authentication changes, verify registration, email verification, and OTP sign-in flows using Mailpit (`http://localhost:8025`).
- End every task with a brief summary of modified files, exact verification steps executed (and observed results), and any remaining edge cases or manual actions required.

## Commits & Pull Requests
- Use Conventional Commits in English (e.g., `feat(auth): add OTP login`, `chore(docker): configure application containers and proxy`).
- Follow the branch workflow: validate changes on `test` before opening a PR into `main`. Never push directly to `main`.
- PR descriptions must summarize changes and verification performed, link related issues, and note screenshots for visible UI changes.
- **Multi-agent & worktree safety:**
  - Operate strictly within the current worktree (`PWD`); never read or write outside it (`../`).
  - Do not edit shared root files (`docker-compose*.yml`, `frontend/nginx.conf`, `.env.example`, root `AGENTS.md`) from a scoped frontend/backend worktree—document any needed changes in your final response instead.
  - Restrict Git operations to **local commits on the current branch only**. Never run `git merge`, `git rebase`, `git push`, `git push --force`, `git reset --hard`, `git clean -fd`, or switch branches; integration and PRs are handled manually by the maintainer.