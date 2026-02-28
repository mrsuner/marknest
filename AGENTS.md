# Repository Guidelines

The user prefer to get output in Traditional Chinese, no matter what's the language of the input. but, for the code, code comments, markdown output should remain in English.

## Project Structure & Module Organization
- `apps/backend/`: Laravel REST API; key areas include `routes/api.php`, `app/Http/Controllers`, `app/Models`, and `tests` for feature/unit coverage.
- `apps/frontend/`: Next.js (App Router) with Tailwind/DaisyUI; pages live in `app/`, shared UI in `components/`, state and helpers under `src/`.
- `docker/`, `docker-compose*.yml`, `Makefile`: container workflows for dev/prod; prefer `make` targets over raw Docker commands.
- `scripts/`: helper utilities; add new automation here or in package scripts.
- Env templates: copy `.env.example` to `.env` and `apps/frontend/.env.local.example` to `apps/frontend/.env.local`; set `NEXT_PUBLIC_API_BASE_URL`.

## Build, Test, and Development Commands
- Local containers: `make up` (build + run dev stack), `make down` (stop), `make logs` (tail all services), `make clean` (remove volumes/orphans).
- API (Laravel): from `apps/backend/` run `composer install`, `php artisan serve` (if not using Docker), `npm run dev` for Vite assets, `php artisan test` for suite.
- Frontend: from `apps/frontend/` run `npm install`, `npm run dev` (Turbopack), `npm run build` (prod), `npm run lint` (ESLint), `npm start` (serve built app).
- Production images: `make build-release` and `make push-image`; `make prod-up` uses `docker-compose.prod.yml`.

## Coding Style & Naming Conventions
- PHP: PSR-12 + Laravel Pint; controllers/services in PascalCase; use `spatie/laravel-data` DTOs (`App\Data\*`) and ROs (`App\RO\{Module}\*`) with camelCase props and snake_case JSON (`#[MapName(SnakeCaseMapper::class)]`). Add Scribe-style PHPDoc annotations for API docs. Keep business logic out of controllers.
- TypeScript/React: components/hooks in PascalCase, utilities in `camelCase.ts`; use typed props, Redux Toolkit slices in `src/features`, and the `@/*` alias.
- Styling: Tailwind utility-first; keep reusable UI in `components/`. Run `npm run lint` and `php artisan test`/`php artisan pint` before pushing.
- Env/config: never commit secrets; use `.env` per service and document new keys in README-style files nearby.

## Testing Guidelines
- Backend: `php artisan test` for unit/feature coverage; name tests with intent (`UserCanShareDocumentTest`).
- Frontend: rely on ESLint/Turbo builds; add component or integration tests alongside files using `.test.ts(x)` when introduced.
- Prefer small, deterministic tests; include happy-path and auth/permission cases for new endpoints.

## Commit & Pull Request Guidelines
- Commits follow Conventional Commit style seen in history (`feat: ...`, `fix: ...`, `chore: ...`); keep messages short and scoped.
- PRs: include a concise summary, linked issue/reference, setup notes, and UI screenshots/GIFs for visual changes. List test commands executed (`php artisan test`, `npm run lint`, `make up` smoke) in a checklist.
- Keep diffs focused; when touching both services, split commits by service to ease review.
