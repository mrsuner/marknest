---
title: Backend Feature Outline – Markdown SaaS Platform
date: 2025-08-31
tags: [laravel, backend, api, feature-outline, markdown-saas]
---

# Backend Feature Outline – Markdown SaaS Platform (REST API)

This document outlines the backend features and API modules for a Markdown writing and sharing platform. The backend is developed using Laravel and only exposes RESTful endpoints. It will handle authentication, user data, document storage, version control, sharing links, and folder management.

---

## 🔐 Authentication & Authorization

### Features:
- User registration, login, logout
- Email verification
- Password reset
- Auth token handling via Laravel Passport or Sanctum
- Role-based access (Free / Pro)

### Endpoints:
- `POST /api/register`
- `POST /api/login`
- `POST /api/logout`
- `GET  /api/user` – current authenticated user
- `POST /api/password/forgot`
- `POST /api/password/reset`

---

## 📄 Document Management

### Features:
- Create, edit, view, delete Markdown documents
- Document belongs to a user and optionally a folder
- Save autosave drafts (latest state)
- Track `title`, `content`, `updated_at`, `folder_id`

### Endpoints:
- `GET    /api/documents` – list all documents
- `POST   /api/documents` – create new document
- `GET    /api/documents/{id}` – get document
- `PUT    /api/documents/{id}` – update document
- `DELETE /api/documents/{id}` – delete document

---

## 🕓 Version History

### Features:
- Store historical versions (content + metadata)
- Limit number of versions per document based on user plan
- Restore previous version

### Endpoints:
- `GET    /api/documents/{id}/versions` – list versions
- `POST   /api/documents/{id}/versions` – create version manually
- `GET    /api/versions/{versionId}` – view specific version
- `POST   /api/versions/{versionId}/restore` – restore version
- `DELETE /api/versions/{versionId}` – delete version (optional)

---

## 📁 Virtual Folder System

### Features:
- Tree-like organization (one-level folders per user)
- Folders can contain documents
- Only accessible by document owner

### Endpoints:
- `GET    /api/folders` – list folders
- `POST   /api/folders` – create folder
- `PUT    /api/folders/{id}` – rename folder
- `DELETE /api/folders/{id}` – delete folder

---

## 🔗 Document Sharing

### Features:
- Generate shareable links
- Options:
  - Password protection (optional)
  - Expiration timestamp (optional)
  - Access level: view-only (MVP)
- Validate password + expiry at access

### Endpoints:
- `POST   /api/documents/{id}/share` – create shareable link
- `GET    /api/share-links/{token}` – get public access metadata
- `GET    /api/share-links/{token}/content` – fetch content (public)
- `POST   /api/share-links/{token}/verify` – verify password (if required)
- `DELETE /api/share-links/{id}` – revoke link

---

## 👤 User Profile & Plan Management

### Features:
- View & update user profile
- Show current plan and usage quotas
- Plan: Free / Pro (via config or future billing module)

### Endpoints:
- `GET    /api/profile`
- `PUT    /api/profile`
- `GET    /api/usage` – e.g., number of documents, versions used

---

## 📦 Additional Backend Responsibilities

### Markdown Rendering (optional)
- Sanitize preview content if rendered server-side
- Render math / Mermaid / etc. as HTML (optional)

### Rate Limiting
- Limit API abuse (e.g. link generation, public views)

### Email Service
- For password reset and verification

### Admin Utilities (future)
- View usage stats
- Moderate abusive content
- Upgrade/downgrade user plans manually

---

## 📁 Recommended Folder Structure (Laravel)

app/
├── Http/
│   ├── Controllers/
│   │   ├── AuthController.php
│   │   ├── DocumentController.php
│   │   ├── VersionController.php
│   │   ├── ShareLinkController.php
│   │   └── FolderController.php
├── Models/
│   ├── User.php
│   ├── Document.php
│   ├── DocumentVersion.php
│   ├── ShareLink.php
│   └── Folder.php
routes/
└── api.php

---