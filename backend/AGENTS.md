# Backend Agent Instructions (`backend/`)

This file defines the local context, API contracts, security boundaries, and Git workflow rules for the **RustikCG** backend. Follow these guidelines strictly for all changes within `backend/`.

## 1. Scope & Architecture

- **Scope:** Work exclusively inside `backend/` within the current worktree. Reading `frontend/` or root files is allowed for reference only (see Section 5).
- **Runtime & Port:** The backend service listens on port **`8000`** and is exposed internally to Nginx as `http://backend:8000`.
- **Routing:** All public API endpoints are reverse-proxied by Nginx under `/api/*`.
- **Stack Details:** *(Update with your exact stack, e.g., Node.js/Express, Python/FastAPI, PostgreSQL, etc.)*
  - Language / Framework: `[FILL IN]`
  - Database / ORM: `[FILL IN]`
  - Test Command: `[FILL IN]`

## 2. API Contract (Frontend Compatibility)

The frontend communicates exclusively via `window.RustikApi` (`frontend/src/api.js`). All endpoints must adhere to this contract:

- **Format:** Accept and return `application/json` (`Accept: application/json`, `Content-Type: application/json`).
- **Authentication & Sessions:**
  - The frontend sends requests with `credentials: 'same-origin'`.
  - Use `HttpOnly`, `SameSite=Lax` (or `Strict`), and `Secure` (in production) cookies for session/auth tokens rather than exposing tokens to `localStorage`.
- **Structured Error Responses:**
  - Return appropriate HTTP status codes (`400`, `401`, `403`, `404`, `409`, `422`, `500`).
  - Error payloads must follow this JSON shape so `RustikApi.showError()` renders them properly:
    ```json
    {
      "error": "MACHINE_READABLE_CODE",
      "message": "Mensagem clara em pt-BR para o usuário.",
      "details": {
        "fields": {
          "email": "Informe um e-mail válido."
        }
      }
    }
    ```
- **User-Facing Messages:** All validation and error messages returned in `message` and `details.fields` must be in **Brazilian Portuguese (`pt-BR`)**.

## 3. Security & Data Integrity

- Validate and sanitize all incoming request payloads (body, query, params) at the boundary.
- Never trust client-supplied user IDs or roles; always derive the authenticated user from the server-side session/token.
- Never log secrets, passwords, session tokens, or full `.env` contents.
- Use parameterized queries / ORM bindings exclusively to prevent SQL injection.
- Keep database migrations reversible and additive whenever possible.

## 4. Environment & Docker Isolation

- Do not commit `.env` files or hardcoded credentials.
- When running inside a Git worktree, **do not** run `docker compose up` against shared ports or shared named database volumes. Run unit/integration tests against an isolated environment or let the maintainer validate the full Docker stack after integration.

## 5. Git & Worktree Safety

**Write Scope & Read-Only Frontend Policy:** Limit all file creations, edits, and deletions strictly to `backend/` within the current worktree. You may **read** files in `frontend/` (and root configuration files) within this worktree strictly as a reference to inspect API consumers (such as `frontend/src/api.js`), expected payloads, form fields, or error-handling conventions, but you must **never write to, modify, create, or delete** any file inside `frontend/`, shared root files (such as `docker-compose*.yml`, `nginx.conf`, or `.env*`), or any path outside the current worktree (`../`). If a backend change requires a frontend or infrastructure update, do not edit those files—document the required change in your response so the maintainer or frontend agent can apply it separately without merge conflicts.

**Git Operations:** Restrict all Git operations to **local commits on the current branch only** (following Conventional Commits). Never push to remote repositories, switch branches, or alter commit history. Specifically, **do not run** `git merge`, `git rebase`, `git push`, `git push --force`, `git reset --hard`, or `git clean -fd`—branch integration, conflict resolution, and cleanup are handled manually by the maintainer.