# Frontend Agent Instructions (`frontend/src/`)

This file defines the local context, architectural constraints, and UI rules for the **RustikCG** frontend. Follow these guidelines strictly for all changes within `frontend/src/`.

---

## 1. Tech Stack & Architecture
- **Stack:** Pure static **HTML5**, **CSS3**, and **Vanilla JavaScript** (no frameworks, no npm/Node build step, no bundlers).
- **Serving & Deployment:** Files are served directly by **Nginx** (`nginx:stable-alpine`).
  - Only the following paths are copied into `/usr/share/nginx/html/`:
    - `src/*.html`, `src/*.css`, `src/*.js`
    - `src/assets/` (e.g., `assets/css/style.css`, `assets/js/script.js`)
    - `src/fotos/`
    - `src/rustikcg-logo.png`
  - Keep all new assets inside these existing directories so the Docker build picks them up automatically.
- **UI Language:** All user-facing copy, labels, and messages must be in **Brazilian Portuguese (`pt-BR`)**.

---

## 2. Security & Nginx CSP Compliance (CRITICAL)
Nginx enforces a strict `Content-Security-Policy` (`nginx.conf`):
- `script-src 'self'`
- `style-src 'self' https://fonts.googleapis.com`
- `font-src 'self' https://fonts.gstatic.com`
- `img-src 'self' data: https:`
- `default-src 'self'`

**Mandatory Rules:**
1. **No inline JavaScript:** Never use `<script>...</script>` blocks or inline event handlers (e.g., `onclick="..."`, `onsubmit="..."`). Always attach listeners via external `.js` files.
2. **No inline CSS:** Never use `<style>` tags in HTML or inline `style="..."` attributes. Put all styles in `assets/css/style.css` and toggle classes or the HTML `hidden` attribute from JS.
3. **XSS Prevention:** Never inject untrusted or API-sourced data with `innerHTML`. Use `textContent`, `document.createElement()`, and `replaceChildren()` (following the pattern in `api.js`).

---

## 3. API Integration
- All backend calls go through `/api/*` (reverse-proxied by Nginx to `http://backend:8000`).
- Always use the shared helper `window.RustikApi` (`api.js`):
  - `RustikApi.request(path, options)` — handles JSON serialization, `Accept: application/json`, `credentials: 'same-origin'`, and structured error throwing.
  - `RustikApi.showMessage(el, msg, kind)` / `RustikApi.showError(el, err)` / `RustikApi.clearMessage(el)` — standard feedback rendering.
  - `RustikApi.formObject(form)` — extracts form fields as a plain object.
- Do not introduce competing `fetch` wrappers or duplicate error-handling logic.

---

## 4. Visual Identity & Styling
Preserve the existing RustikCG rustic/industrial aesthetic defined in `assets/css/style.css`:
- **Color Tokens (`:root`):**
  - `--wood-dark: #140f0b` (primary background)
  - `--iron: #222222` (borders, structural blocks)
  - `--rust: #8b4513` (primary actions, accents)
  - `--paper: #d2b48c` / `--paper-dim: #8a6a48` (text)
  - `--accent-gold: #b8860b` (highlights, titles, active states)
  - `--danger: #b22222` (alerts, unavailable states)
- **Typography:**
  - Headings, nav links, and buttons: `'Staatliches', sans-serif`
  - Body & inputs: `'Roboto Mono', monospace`
  - Stamps & brand accents: `'Special Elite', cursive`
- **Responsiveness:** Maintain existing breakpoints (`1050px`, `900px`, `760px`, `500px`) and mobile menu behavior.

---

## 5. Standard Header & Dynamic Auth State
Use the standard `<header>` and `.mobile-nav` structure from `index.html` as the baseline across pages. Do not alter its layout, height (`110px`), logo placement, or navigation styling.

### Dynamic Behavior Based on Authentication
The header and mobile menu must dynamically adapt to the user's session state:

1. **Logged Out (Unauthenticated):**
   - Display the standard navigation links and the **"PAINEL"** button (`.btn-login-bruto` linking to `login.html`).
   - Hide/omit the user summary and logout button.

2. **Logged In (Authenticated):**
   - **Hide "PAINEL":** The **"PAINEL"** button must **always be hidden/removed** whenever the user is logged in.
   - **User Summary:** Display a compact user identifier showing the **first name + abbreviated last name** (e.g., `João Silva` → `João S.`, `Maria Eduarda Souza` → `Maria S.`).
   - **Logout Button ("SAIR"):** Display a logout button (`<button type="button">`) that **reuses the `.btn-login-bruto` class** so it maintains the exact same visual style as the "PAINEL" button.
   - **Consistency:** Mirror this exact logged-in / logged-out state in both the desktop `<header>` and the `.mobile-nav` drawer.

---

## 6. Code Quality & Conventions
- Wrap standalone scripts in an IIFE `(function () { ... })();` to avoid polluting the global scope (unless explicitly attaching a shared namespace like `window.RustikApi`).
- Use semantic HTML (`<header>`, `<nav>`, `<main>`, `<section>`, `<button type="button">` for non-submit actions) and accessible attributes (`aria-label`, `role="status"`, `aria-live="polite"`).
- Keep changes minimal, focused, and aligned with existing class names in `assets/css/style.css`.instrua o agente a apenas fazer commits locais na própria branch. Nunca deixe o agente rodar git merge, git rebase, git push --force ou git reset --hard

## 7. Git & Worktree Safety

Restrict all Git operations to **local commits on the current branch only** (following Conventional Commits). Never push to remote repositories, switch branches, or alter commit history. Specifically, **do not run** `git merge`, `git rebase`, `git push`, `git push --force`, `git reset --hard`, or `git clean -fd`—branch integration, conflict resolution, and cleanup are handled manually by the maintainer.