# Front-End Code Architecture Guidelines

## Purpose
This project enforces a clean architecture for front-end code built with Next.js (App Router), Redux + RTK Query, TailwindCSS v4, and DaisyUI v5.  
Large components must be refactored into smaller, single-responsibility components, separating UI (presentational) from Domain (logic/state).  

## Core Rules

1. **Single Responsibility Principle**  
   - Each component should serve one clear purpose.  
   - Break large components into smaller, focused ones.  

2. **Domain vs. UI Components**  
   - Domain: Redux slices, RTK Query endpoints, composite hooks, selectors, feature types.  
   - UI: Presentational React components using Tailwind v4 + DaisyUI v5, may call RTK Query hooks for their own data, but never define endpoints or slices.  

3. **Parent Components (Pages)**  
   - App Router pages should orchestrate Domain and UI.  
   - Keep pages lean: handle layout, guards, and orchestration only.  

4. **Naming & Structure**  
   - Use descriptive, domain-driven names.  
   - Place files under feature folders with clear separation of UI and Domain.  

## Folder Structure Convention

### Philosophy
- Feature-first: group code by feature (users, orders, etc.).  
- UI vs. Domain separation: UI for rendering, Domain for state and data.  
- App Router groups: use (public), (auth), (dashboard), etc.  
- Shared: cross-feature utilities and primitives in /shared.  

### Structure
- | app/  
  - | (public)/  
    - | page.tsx  
  - | (auth)/  
    - | sign-in/  
      - | page.tsx  
  - | (dashboard)/  
    - | users/  
      - | page.tsx (thin orchestration)  
      - | layout.tsx  
- | src/  
  - | app/  
    - | providers/StoreProvider.tsx  
    - | styles/globals.css  
  - | shared/  
    - | ui/ (shared primitives like Button, Modal)  
    - | lib/ (helpers, fetchers, validators)  
    - | types/ (cross-feature types)  
  - | features/  
    - | users/  
      - | domain/  
        - | users.api.ts (RTK Query endpoints)  
        - | users.slice.ts (Redux slice if needed)  
        - | users.hooks.ts (business hooks)  
        - | users.selectors.ts  
        - | users.types.ts  
      - | ui/  
        - | UsersTable.tsx  
        - | UserRow.tsx  
        - | UsersEmpty.tsx  
        - | UsersError.tsx  
      - | index.ts (barrel export)  
  - | store/  
    - | baseApi.ts  
    - | store.ts  

## Rules for AI Code Generation

1. Pages must remain lean, importing UI and Domain.  
2. UI components: render + local UI only, use Tailwind v4 + DaisyUI v5, may call RTK Query hooks but never define them.  
3. Domain: define *.api.ts, slices, selectors, composite hooks.  
4. Use one baseApi in store/baseApi.ts, inject endpoints per feature.  
5. No direct cross-feature imports; extract to /shared if needed.  
6. Always use Tailwind v4 and DaisyUI v5 for styling.  

## Example

**Domain**
```ts
// features/users/domain/users.api.ts
import { baseApi } from "@/store/baseApi";

export const usersApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    getUsers: b.query<User[], void>({
      query: () => "users",
      providesTags: ["Users"],
    }),
  }),
});

export const { useGetUsersQuery } = usersApi;

UI

// features/users/ui/UsersTable.tsx
"use client";
import { useGetUsersQuery } from "../domain/users.api";

export function UsersTable() {
  const { data, isLoading, error } = useGetUsersQuery();

  if (isLoading) return <span className="loading loading-spinner" />;
  if (error) return <p className="text-error">Failed to load users</p>;
  if (!data?.length) return <p className="opacity-70">No users found</p>;

  return (
    <ul className="space-y-2">
      {data.map(u => (
        <li key={u.id} className="card bg-base-100 shadow">
          <div className="card-body p-4">
            <h2 className="card-title">{u.name}</h2>
            <p>{u.email}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

Page

// app/(dashboard)/users/page.tsx
import { UsersTable } from "@/features/users/ui/UsersTable";

export default function UsersPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <UsersTable />
    </div>
  );
}

Instruction to AI Tools
	•	Refactor large components into Domain and UI.
	•	Follow Next.js App Router conventions (app/ directory, page.tsx).
	•	Use Redux slices + RTK Query for logic and data, never inside UI.
	•	Use TailwindCSS v4 + DaisyUI v5 for styling.
	•	Always output updated file structure and code snippets.
