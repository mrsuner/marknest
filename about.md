---
title: HackMD-Inspired SaaS – Feature Specification (MVP)
date: 2025-08-31
tags: [markdown-editor, saas, laravel, nextjs, feature-doc]
---

# Marknest

## 🧭 Overview

This document outlines the core features of a web-based SaaS platform focused on collaborative Markdown editing. The product aims to deliver a clean and reliable writing experience optimized for PC users, with essential file management, version control, and secure sharing.

---

## 🧱 Tech Stack

- **Frontend**: Next.js (TypeScript, TailwindCSS)
- **Backend**: Laravel (REST API, Passport/Sanctum for Auth)
- **Database**: PostgreSQL (or MySQL)
- **Storage**: Local / S3-compatible object storage (e.g. Wasabi)
- **Authentication**: Email/password, OAuth (Google/GitHub planned)
- **Deployment**: Docker + Traefik + CI/CD pipeline

---

## 🔐 User Roles

- **Guest**: Can only view public documents (if shared)
- **Free User**:
  - Create up to X documents
  - Limited version history (e.g., max 10 versions/document)
- **Pro User**:
  - Unlimited documents
  - Extended version history (e.g., 100 versions/document)
  - Priority support and upcoming features

---

## ✍️ Core Features

### 1. Markdown Editor & Live Preview

- Dual-pane layout: Editor (left) + Preview (right)
- Real-time rendering using `markdown-it`
- Basic syntax highlighting (code blocks)
- Support for:
  - Headings, lists, links, images
  - Code fences
  - Tables
  - Blockquotes
  - Task lists
- Draft autosave on blur or interval (every 10s)

### 2. Version History

- Every save creates a new version (if content changes)
- UI to browse version list per document
- View, restore, and delete specific versions
- Version quota based on user tier
- Backend stores diffs or snapshots depending on config

---

## 📁 Virtual Folder Structure

- Documents organized in a tree-like folder structure
- User can:
  - Create folders
  - Move documents between folders
  - Rename/delete folders
- Virtual only: No physical folder constraints on storage

---

## 🔗 Sharing & Access Control

### Shareable Link

- Generate public link for any document
- Configurable options:
  - Password protection (optional)
  - Expiry date/time (optional)
  - Access level: `View only` or `Editable (Planned in future)`

### Link Management

- Each document shows a list of active share links
- User can:
  - Revoke a link
  - Copy the URL
  - Update expiration or password

---

## 👤 User Dashboard

- Document list
- Folder navigator
- Quick action: New document / New folder
- Search and filter (by title or tag)
- Sorting: Updated time / Created time / A-Z

---

## ⚙️ Account & Plan Management

- Profile settings (email, password, avatar)
- Usage metrics: Number of documents, version count
- Subscription page (Free / Pro tiers)
- Billing integration planned (Stripe)

---

## 🛡️ Security Considerations

- CSRF protection, XSS sanitization (especially during preview rendering)
- Document permissions enforced at API level
- Rate limiting for sharing/public access

---

## 🔜 Planned for Future Releases

- Real-time collaboration via WebSocket/Y.js
- Team-based document spaces
- Slide mode (Markdown → presentation)
- Mobile-optimized UI
- GitHub integration
- PDF/HTML export
- AI-assisted writing

---

## ✅ API Suggestions (Backend)

| Endpoint                     | Method | Description |
|-----------------------------|--------|-------------|
| `/api/login`                | POST   | Login with email/password |
| `/api/documents`            | GET    | List all user documents |
| `/api/documents`            | POST   | Create new document |
| `/api/documents/{id}`       | GET    | Get document content |
| `/api/documents/{id}`       | PUT    | Update document |
| `/api/documents/{id}`       | DELETE | Delete document |
| `/api/documents/{id}/versions` | GET | List version history |
| `/api/share-links`          | POST   | Create shareable link |
| `/api/share-links/{id}`     | PUT    | Update link (password/expiry) |
| `/api/share-links/{id}`     | DELETE | Revoke shareable link |

---

## 📦 Project Structure (Suggestion)

### Frontend (Next.js)

/pages
/dashboard
/editor/[id].tsx
/components
Editor.tsx
Preview.tsx
FolderTree.tsx
ShareDialog.tsx
/utils
markdown.ts
api.ts

### Backend (Laravel)

/app/Models/Document.php
/app/Models/Version.php
/app/Models/ShareLink.php
/app/Http/Controllers/DocumentController.php
/app/Http/Controllers/ShareController.php
/routes/api.php

---

## 🧪 Testing Strategy

- Unit + Feature tests (Laravel PHPUnit)
- Frontend e2e tests with Playwright or Cypress
- Manual QA checklist before major releases
