---
title: Marknest Frontend Feature Outline – Markdown SaaS Platform
date: 2025-08-31
tags: [nextjs, rtk, daisyui, frontend-outline, markdown-saas]
---

# Marknest Frontend Feature Outline – Markdown SaaS Platform

This document describes the core frontend architecture and feature modules for the HackMD-style SaaS platform, built with Next.js, TailwindCSS, DaisyUI, and Redux Toolkit.

---

## 🏗️ Tech Stack Overview

| Layer        | Tool / Library                  |
|--------------|----------------------------------|
| Framework    | **Next.js** (App Router)         |
| UI Layer     | **TailwindCSS + DaisyUI**        |
| State Mgmt   | **Redux Toolkit (RTK + RTK Query)** |
| Editor       | **CodeMirror** for Markdown editing |
| API Layer    | **REST API** via RTK Query       |
| Routing      | **App Router** with dynamic routes |
| Auth         | Cookie-based / Bearer token auth |
| Markdown     | `markdown-it` for preview        |

---

## 📁 Folder Structure (Proposed)

/app
/dashboard
/editor/[docId]
/auth
/components
/layout
/markdown
/modals
/folders
/features
/auth
/documents
/folders
/versions
/sharing
/store
store.ts
api.ts (RTK Query base)
slices/

---

## 🔐 Authentication

### Features
- Login / Registration forms
- Auth token storage (HTTP-only cookie or bearer)
- Global auth state using Redux slice
- Redirect to login if unauthenticated

### Pages
- `/login`
- `/register`
- `/reset-password`

---

## 📄 Markdown Editor

### Features
- Dual-pane layout: Editor (CodeMirror) + Preview (markdown-it)
- Live preview with debounce (250ms–500ms)
- Autosave (on interval or blur)
- Responsive layout for widescreen
- Toolbar for heading, list, table, etc. (optional in MVP)
- Save → triggers versioning API

### Route
- `/editor/[docId]`

---

## 🕓 Document Version History

### Features
- List of past versions
- View & restore any version
- Visual diff (planned)
- Show version count vs quota

### UI Components
- `<VersionHistoryModal />`
- `<VersionItem />`

---

## 📁 Virtual Folder System

### Features
- Folder tree view (left sidebar)
- Create, rename, delete folder
- Drag-and-drop documents (planned)
- Filter by folder
- "Uncategorized" fallback

### UI Components
- `<FolderTree />`
- `<NewFolderModal />`

---

## 📂 Document CRUD

### Features
- List documents in dashboard
- Filter/search by title
- Create, rename, delete document
- Display updated time, folder

### UI Components
- `<DocumentList />`
- `<DocumentCard />`
- `<NewDocumentButton />`

---

## 🔗 Sharing & Public Access

### Features
- Generate public links with:
  - Password (optional)
  - Expiry date (optional)
- Copy link
- View active share links
- Delete/revoke link

### UI Components
- `<ShareDialog />`
- `<ShareLinkItem />`
- `<PublicAccessPage />` (SSR page)

### Routes
- `/s/[token]` → public view page
- Optional: password prompt if required

---

## 📊 User Dashboard

### Features
- Stats: total docs, storage/quota
- Plan info: Free vs Pro
- Upgrade button (Stripe integration future)
- Profile: Avatar, email, password

### UI Components
- `<DashboardLayout />`
- `<UserMenu />`

---

## 🔄 State Management (Redux + RTK Query)

### Global Slices
- `authSlice` – user info, login state
- `uiSlice` – modals, loading, toasts

### RTK Query APIs
- `authApi`
- `documentApi`
- `folderApi`
- `versionApi`
- `shareApi`

---

## 🪄 UI Libraries & Plugins

| Purpose            | Library         |
|--------------------|-----------------|
| Markdown Preview   | `markdown-it`   |
| Editor             | `CodeMirror 6`  |
| Icons              | `lucide-react` / `heroicons` |
| Modal/Toast/Dialog | DaisyUI built-in |
| Drag & Drop (Future)| `dnd-kit`       |

---

## 📦 Component Highlights

### Layout
- `<Sidebar />` – folder tree + navigation
- `<Topbar />` – actions + user menu
- `<MainContent />` – editor or viewer
- `<ModalRoot />` – global modal container

### Reusables
- `<Button />` – DaisyUI buttons
- `<Input />`, `<Textarea />`
- `<DropdownMenu />`, `<Tooltip />`

---

## 🔐 Public Access View

### Features
- SSR-rendered Markdown page (no edit)
- Password check if required
- Expiration check
- Branded landing layout

### Route
- `/s/[token]`

---

## ✅ MVP Completion Checklist

| Feature                         | Status |
|----------------------------------|--------|
| Auth (login/register)           | ☐      |
| Dashboard layout & routing      | ☐      |
| Folder tree & document list     | ☐      |
| Markdown editor + preview       | ☐      |
| Version management UI           | ☐      |
| Share link creation & public view | ☐    |
| Profile & quota display         | ☐      |
| API integration (RTK Query)     | ☐      |

---
