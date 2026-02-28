# Repository Guidelines

## Project Structure & Module Organization
- Core Laravel app lives in `app/` with HTTP controllers, models, and service classes; shared helpers follow PSR-4 under `App\`.
- Configuration is in `config/`; environment defaults in `.env.example`.
- Database seeds/factories live under `database/`; migrations manage schema.
- Routes: `routes/web.php` for web, `routes/api.php` for API. Public assets in `public/`; Vite/Tailwind sources in `resources/` with entrypoints wired via `vite.config.js`.
- Tests sit in `tests/` using PHPUnit; feature vs. unit namespaces mirror `app/` paths.

## Build, Test, and Development Commands
- `composer install` / `npm install` to fetch PHP and JS deps.
- `composer run dev` spins up Laravel server, queue listener, pail logs, and Vite concurrently for local dev.
- `php artisan serve` (or Sail) runs the app; `php artisan queue:listen --tries=1` processes jobs.
- `npm run dev` launches Vite dev server; `npm run build` builds assets for production.
- `composer test` clears config cache then runs the test suite; `php artisan test` works too.

## Coding Style & Naming Conventions
- Follow PSR-12 for PHP; prefer typed properties/params/returns. Run `./vendor/bin/pint` before pushing.
- Controllers/services: verb-named methods (`store`, `update`, `handle`). Form requests and resources keep `*Request` / `*Resource` suffixes.
- Use snake_case for DB columns, StudlyCaps for classes, camelCase for methods/props. Keep routes RESTful and validate via form requests.

## Testing Guidelines
- Framework: PHPUnit; Pest not enabled. Place feature tests under `tests/Feature`, unit under `tests/Unit` mirroring namespaces.
- Name tests descriptively (`it_handles_invalid_payloads`) and assert HTTP status + payload shape for APIs.
- Run `composer test` locally before PRs; add factories/seeds for fixtures instead of hard-coded IDs.

## Commit & Pull Request Guidelines
- Write concise commits in present tense (`Add user role checks`); group logical changes and keep vendor/build artifacts out of diffs.
- PRs should include a brief summary, linked issue/ticket, setup steps, and screenshots for UI/API docs when relevant.
- Note migrations, env vars, or background worker changes in the PR description to help reviewers deploy safely.

## Security & Configuration Tips
- Keep secrets out of git; use `.env` and update `.env.example` when new keys are required.
- Run `php artisan key:generate` for fresh setups; ensure `APP_ENV=production` and `APP_DEBUG=false` in production.
- Queue/cron: align queue workers with jobs added; cache clear (`php artisan config:clear`, `php artisan route:clear`) after config/route changes.
