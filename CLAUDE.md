# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

Marknest is a Markdown SaaS platform with separate frontend and backend applications:

This is a monorepo including frontend and backend.

- **Frontend**: Next.js 15 app located in `/apps/frontend`
- **Backend**: Laravel 12 REST API located in `/apps/backend`

## Environment Setup

Before running the application, copy the environment example file and configure your environment variables:

```bash
# Copy the environment template
cp .env.example .env

# For frontend development, create a local environment file
cp apps/frontend/.env.local.example apps/frontend/.env.local
```

**Required Environment Variables:**
- `NEXT_PUBLIC_API_BASE_URL`: Backend API base URL (e.g., http://localhost:8000)

## Development Commands

### Root-level workspace scripts (pnpm)
```bash
pnpm dev:frontend    # Start frontend dev server (Next.js with Turbopack)
pnpm dev:backend     # Start backend dev server (Laravel)
pnpm build:frontend  # Build frontend for production
```

### Frontend (Next.js)
```bash
cd apps/frontend
pnpm dev      # Start development server with Turbopack
pnpm build    # Build for production with Turbopack
pnpm lint     # Run ESLint
pnpm start    # Start production server
```

### Backend (Laravel)
```bash
cd apps/backend
composer dev     # Start Laravel server, queue listener, logs, and Vite concurrently
php artisan serve # Start only the Laravel development server
composer test    # Clear config cache and run tests
php artisan migrate # Run database migrations
php artisan pint # Run code formatter (Laravel Pint)
```

## Architecture Overview

### Frontend Architecture
- **Framework**: Next.js 15 with App Router
- **Styling**: TailwindCSS v4 + DaisyUI
- **State Management**: Redux Toolkit with RTK Query + redux-persist
- **Editor**: Milkdown for Markdown editing
- **Path Alias**: `@/*` maps to frontend root directory

Key planned features:
- Dual-pane Markdown editor with live preview
- Document version history with restore capability
- Virtual folder system for document organization
- Public document sharing with optional password/expiry
- User dashboard with quota tracking

### Backend Architecture
- **Framework**: Laravel 12 with REST API design
- **Database**: SQLite (development), configurable for production
- **Testing**: PHPUnit
- **Code Style**: Laravel Pint
- **Authentication**: Laravel Sanctum for API token authentication
- **DTO**: use spatie/laravel-data for Data Transfer Objects
- **API Documentation**: knuckleswtf/scribe for auto-generating API docs

API modules planned:
- Authentication (registration, login, password reset)
- Document CRUD operations
- Version history management
- Folder organization system
- Share link generation with optional password/expiry
- User profile and usage quota management

## Testing

### Frontend
```bash
cd apps/frontend
# No test command configured yet - to be implemented
```

### Backend
```bash
cd apps/backend
composer test    # Run PHPUnit tests
```

## Code Style

Always keep necessary code comments if the code is complex or not self-explanatory.

### Frontend
- TypeScript with strict mode enabled
- ESLint configured with Next.js rules
- Path imports using `@/` alias
- Control the component's complexity by splitting it into smaller, reusable components

ideal project structure with clear separation of concerns

root/
├── app/               # App router
│   ├── layout.tsx
│   ├── page.tsx
│   ├── dashboard/
│   │   ├── page.tsx
│   │   ├── components/
│   │   └── hooks/
│   └── api/
│       └── auth/
├── components/
│   ├── ui/            # Atomic UI Components
│   └── domain/        # Domain-specific Components
├── lib/
│   ├── store
├── hooks/             # Custom Hooks
├── styles/            # Global CSS / Tailwind
├── types/             # Global Types
├── constants/         # Constants
├── config/            # Third-party Configurations
└── tests/             # Unit Tests & E2E

### Backend
- PSR-4 autoloading standard
- Laravel Pint for code formatting
- Follow Laravel conventions for controllers, models, and migrations
- **API Documentation**: When creating or editing controller methods, always include Scribe-style PHPDoc annotations for API documentation generation. Use annotation style (`@group`, `@bodyParam`, `@response`, `@authenticated`, etc.)

#### Data Transfer Objects (DTO) and Response Objects (RO)

This project uses `spatie/laravel-data` for both DTOs and ROs with clear separation:

**Namespaces:**
- `App\Data\` - DTOs for input data (request validation, service parameters)
- `App\RO\{Module}\` - Response Objects organized by feature module (e.g., `App\RO\User\`, `App\RO\Document\`)

**When to use:**
- **DTO**: For incoming data - request validation, form data, service method parameters
- **RO**: For API responses - structured output data returned to clients

**Naming Convention:**
- PHP properties: camelCase (e.g., `$storageUsed`, `$documentCount`)
- JSON output: snake_case (e.g., `storage_used`, `document_count`)
- Use `#[MapName(SnakeCaseMapper::class)]` class attribute for automatic conversion

**Example RO:**
```php
<?php

namespace App\RO\User;

use Spatie\LaravelData\Attributes\MapName;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Mappers\SnakeCaseMapper;

#[MapName(SnakeCaseMapper::class)]
class UserProfileRO extends Data
{
    public function __construct(
        public int $id,
        public int $storageUsed,  // outputs as "storage_used" in JSON
    ) {}
}
```

#### Controller & Test Organization

**Directory Structure:**
```
app/Http/Controllers/Api/
├── AuthController.php
├── MeController.php
├── UserController.php
└── V1/                          # Versioned API controllers
    └── ExampleController.php

tests/Feature/Api/
├── AuthControllerTest.php
├── MeControllerTest.php
├── UserControllerTest.php
└── V1/                          # Mirror the controller structure
    └── ExampleControllerTest.php
```

**Naming Convention:**
- Controller: `{Name}Controller.php` in `App\Http\Controllers\Api\{Module?}`
- Test: `{Name}ControllerTest.php` in `Tests\Feature\Api\{Module?}`
- Test class must mirror the controller's namespace structure

**When to Create/Update Tests:**
- **New Controller**: Create corresponding test class with tests for all public methods
- **New Method**: Add test methods covering success, authentication (401), validation (422), and error scenarios
- **Modified Method**: Update existing tests to reflect the changes

**Test Method Naming:**
- Format: `test_{method}_{scenario}`
- Examples:
  - `test_me_returns_authenticated_user_profile`
  - `test_me_requires_authentication`
  - `test_update_password_fails_when_current_password_incorrect`