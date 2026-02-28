# Marknest Database Structure & Relationships

This document provides a comprehensive overview of the Marknest database structure, relationships, and design decisions.

## Overview

Marknest is a Markdown SaaS platform with a Laravel backend using PostgreSQL. The database supports:
- Multi-plan subscription system (Free, Pro, Enterprise)
- Document management with version history
- Hierarchical folder organization
- Media file management with reusable assets
- Document sharing and collaboration
- Activity logging and audit trails
- Payment processing with Stripe integration

## Database Tables

### Core User Management

#### `users`
Primary user accounts with plan-based quotas and permissions.

```sql
- id (Primary Key)
- name, email, password (Authentication)
- plan (enum: free, pro, enterprise)
- storage_used, storage_limit (bytes)
- document_count, document_limit (integer)
- version_history_days (plan-based retention)
- can_share_public, can_password_protect (boolean plan features)
- email_verified_at, remember_token (Laravel auth)
- created_at, updated_at
```

**Indexes:**
- `idx_users_email`, `idx_users_plan`, `idx_users_created_at`

#### `user_preferences`
User-specific settings and editor preferences (1:1 with users).

```sql
- id (Primary Key)
- user_id (Foreign Key -> users.id)
- theme (light, dark, auto)
- editor_theme, editor_font_family, editor_font_size
- editor_line_numbers, editor_word_wrap, editor_auto_save (boolean)
- editor_auto_save_interval (seconds)
- preview_sync_scroll, enable_vim_mode, enable_spell_check (boolean)
- preview_style, default_view, language, timezone
- email_notifications (boolean)
- notification_settings, keyboard_shortcuts (JSON)
- created_at, updated_at
```

**Relationships:**
- `belongsTo(User::class)`

#### `user_activities`
Activity logging for audit trails and analytics.

```sql
- id (Primary Key)
- user_id (Foreign Key -> users.id)
- activity_type (login, document_create, document_update, etc.)
- entity_type (document, folder, share)
- entity_id (polymorphic reference)
- description (human-readable activity description)
- metadata (JSON - additional context)
- ip_address, user_agent
- created_at (no updated_at - immutable log)
```

**Indexes:**
- `idx_user_activities_user_id`, `idx_user_activities_activity_type`
- `idx_user_activities_entity_type`, `idx_user_activities_created_at`
- `idx_user_activities_user_created`, `idx_user_activities_entity`

### Content Management

#### `folders`
Hierarchical folder organization with path optimization.

```sql
- id (Primary Key)
- user_id (Foreign Key -> users.id)
- parent_id (Foreign Key -> folders.id, nullable for root folders)
- name, slug (URL-friendly identifier)
- description (optional)
- path (full path for efficient querying: /parent/child)
- depth (tree level: 0 for root)
- order (sorting within parent)
- color (hex color for UI), icon (icon identifier)
- created_at, updated_at
```

**Indexes:**
- `idx_folders_user_id`, `idx_folders_parent_id`, `idx_folders_slug`
- `idx_folders_path`, `idx_folders_user_parent`

**Unique Constraints:**
- `unq_folders_user_parent_slug` (no duplicate slugs in same folder)

**Relationships:**
- `belongsTo(User::class)`
- `belongsTo(Folder::class, 'parent_id')` - Parent folder
- `hasMany(Folder::class, 'parent_id')` - Child folders
- `hasMany(Document::class)` - Documents in folder

#### `documents`
Main document storage with rich metadata.

```sql
- id (Primary Key)
- user_id (Foreign Key -> users.id)
- folder_id (Foreign Key -> folders.id, nullable for root level)
- title, slug (URL-friendly identifier)
- content (longText - raw Markdown)
- rendered_html (longText - cached HTML for performance)
- size, word_count, character_count (content metrics)
- version_number (current version)
- is_favorite, is_archived, is_trashed (boolean flags)
- trashed_at (soft delete timestamp)
- tags (JSON array), metadata (JSON object)
- status (draft, published, private)
- last_accessed_at (for analytics)
- created_at, updated_at
```

**Indexes:**
- `idx_documents_user_id`, `idx_documents_folder_id`, `idx_documents_slug`
- `idx_documents_is_favorite`, `idx_documents_is_archived`, `idx_documents_is_trashed`
- `idx_documents_status`, `idx_documents_created_at`, `idx_documents_updated_at`
- `idx_documents_last_accessed_at`, `idx_documents_user_folder`

**Unique Constraints:**
- `unq_documents_user_folder_slug` (no duplicate slugs in same folder)

**Relationships:**
- `belongsTo(User::class)`
- `belongsTo(Folder::class)`
- `hasMany(DocumentVersion::class)`
- `hasMany(DocumentShare::class)`
- `hasMany(DocumentCollaborator::class)`
- `belongsToMany(MediaFile::class)` - Via document_media pivot

#### `document_versions`
Complete version history for documents.

```sql
- id (Primary Key)
- document_id (Foreign Key -> documents.id)
- user_id (Foreign Key -> users.id)
- version_number (incremental)
- title, content, rendered_html (snapshot)
- size, word_count, character_count (metrics)
- change_summary (optional description)
- diff (JSON - change information)
- operation (create, update, restore)
- is_auto_save (boolean - distinguishes manual vs auto saves)
- created_at (no updated_at - immutable history)
```

**Indexes:**
- `idx_document_versions_document_id`, `idx_document_versions_user_id`
- `idx_document_versions_version_number`, `idx_document_versions_created_at`
- `idx_document_versions_doc_version`

**Unique Constraints:**
- `unq_document_versions_doc_version` (one version per number per document)

**Relationships:**
- `belongsTo(Document::class)`
- `belongsTo(User::class)`

### Media Management

#### `media_files`
Reusable media assets (images, files, attachments).

```sql
- id (Primary Key)
- user_id (Foreign Key -> users.id)
- original_name (user's filename)
- filename (system-generated unique name)
- mime_type, file_extension
- size (bytes - counts toward user quota)
- disk (storage disk: public, private, s3)
- path (file path on disk)
- url (public URL if applicable)
- alt_text (accessibility), description
- metadata (JSON - dimensions, EXIF, etc.)
- hash (SHA256 for deduplication)
- is_optimized (boolean - for image optimization)
- is_public (boolean - shareable across users)
- download_count (usage analytics)
- last_accessed_at
- created_at, updated_at
```

**Indexes:**
- `idx_media_files_user_id`, `idx_media_files_filename`
- `idx_media_files_mime_type`, `idx_media_files_hash`
- `idx_media_files_is_public`, `idx_media_files_created_at`

**Relationships:**
- `belongsTo(User::class)`
- `belongsToMany(Document::class)` - Via document_media pivot

#### `document_media` (Pivot Table)
Many-to-many relationship between documents and media files with rich metadata.

```sql
- id (Primary Key)
- document_id (Foreign Key -> documents.id)
- media_file_id (Foreign Key -> media_files.id)
- usage_context (inline, attachment, cover, gallery)
- order (position in document)
- metadata (JSON - position, size overrides, alt text overrides)
- created_at, updated_at
```

**Indexes:**
- `idx_document_media_document_id`, `idx_document_media_media_file_id`
- `idx_document_media_usage_context`, `idx_document_media_order`

**Unique Constraints:**
- `unq_document_media_doc_media` (no duplicate media per document)

**Benefits:**
- **Media Reuse**: Upload once, use across multiple documents
- **Storage Efficiency**: No duplicate files
- **Rich Context**: Different usage types per document
- **Public Media**: Shared assets across users

### Sharing & Collaboration

#### `document_shares`
Public sharing links with security features.

```sql
- id (Primary Key)
- document_id (Foreign Key -> documents.id)
- user_id (Foreign Key -> users.id)
- share_token (64-char unique token)
- short_url (20-char short identifier)
- password (hashed password for protection)
- expires_at (optional expiration)
- max_views, view_count (usage limits)
- allow_download, allow_copy, show_watermark (permissions)
- access_level (read, comment, edit)
- allowed_emails (JSON array - email restrictions)
- access_log (JSON array - who accessed when)
- is_active (boolean)
- description (optional)
- created_at, updated_at
```

**Indexes:**
- `idx_document_shares_document_id`, `idx_document_shares_user_id`
- `idx_document_shares_share_token`, `idx_document_shares_short_url`
- `idx_document_shares_expires_at`, `idx_document_shares_is_active`
- `idx_document_shares_doc_active`

**Relationships:**
- `belongsTo(Document::class)`
- `belongsTo(User::class)`

#### `document_collaborators`
Multi-user document collaboration.

```sql
- id (Primary Key)
- document_id (Foreign Key -> documents.id)
- user_id (Foreign Key -> users.id)
- invited_by (Foreign Key -> users.id)
- permission (view, comment, edit)
- can_share, can_delete (boolean granular permissions)
- last_accessed_at
- created_at, updated_at
```

**Indexes:**
- `idx_document_collaborators_document_id`, `idx_document_collaborators_user_id`
- `idx_document_collaborators_permission`

**Unique Constraints:**
- `unq_document_collaborators_doc_user` (one collaboration per user per document)

**Relationships:**
- `belongsTo(Document::class)`
- `belongsTo(User::class)`
- `belongsTo(User::class, 'invited_by')`

### Template System

#### `templates`
Document templates (public and private).

```sql
- id (Primary Key)
- user_id (Foreign Key -> users.id, nullable for system templates)
- name, slug (unique identifier)
- description, content
- category (personal, business, academic, technical)
- is_public, is_featured (boolean)
- usage_count (analytics)
- variables (JSON - template placeholders)
- metadata (JSON - additional data)
- thumbnail_url (preview image)
- created_at, updated_at
```

**Indexes:**
- `idx_templates_slug`, `idx_templates_category`
- `idx_templates_user_id`, `idx_templates_is_public`
- `idx_templates_is_featured`, `idx_templates_usage_count`
- `idx_templates_public_category`

**Relationships:**
- `belongsTo(User::class)` (nullable for system templates)

### Export System

#### `export_jobs`
Asynchronous export job tracking.

```sql
- id (Primary Key)
- user_id (Foreign Key -> users.id)
- document_id (Foreign Key -> documents.id)
- job_id (UUID for tracking)
- format (pdf, docx, html, epub, latex)
- status (pending, processing, completed, failed)
- options (JSON - margins, fonts, etc.)
- file_path, download_url (result files)
- file_size (bytes)
- error_message (for failed jobs)
- progress (0-100 percentage)
- started_at, completed_at, expires_at
- created_at, updated_at
```

**Indexes:**
- `idx_export_jobs_user_id`, `idx_export_jobs_document_id`
- `idx_export_jobs_job_id`, `idx_export_jobs_status`
- `idx_export_jobs_created_at`, `idx_export_jobs_user_status`

**Relationships:**
- `belongsTo(User::class)`
- `belongsTo(Document::class)`

### Subscription & Payment

#### `subscriptions`
SaaS subscription management with Stripe integration.

```sql
- id (Primary Key)
- user_id (Foreign Key -> users.id)
- stripe_subscription_id, stripe_customer_id, stripe_price_id
- plan (free, pro, enterprise)
- status (active, canceled, past_due, incomplete, unpaid)
- amount, currency (billing details)
- interval, interval_count (billing frequency)
- trial_ends_at, current_period_start, current_period_end
- canceled_at, ends_at (cancellation handling)
- features, limits (JSON - plan-specific data)
- metadata (JSON - additional Stripe data)
- created_at, updated_at
```

**Indexes:**
- `idx_subscriptions_user_id`, `idx_subscriptions_stripe_subscription_id`
- `idx_subscriptions_stripe_customer_id`, `idx_subscriptions_plan`
- `idx_subscriptions_status`, `idx_subscriptions_current_period_end`
- `idx_subscriptions_user_status`

**Unique Constraints:**
- `unq_subscriptions_user_id` (one subscription per user)

**Relationships:**
- `belongsTo(User::class)`
- `hasMany(PaymentTransaction::class)`

#### `payment_transactions`
Complete payment history and transaction logging.

```sql
- id (Primary Key)
- user_id (Foreign Key -> users.id)
- subscription_id (Foreign Key -> subscriptions.id)
- transaction_id (Stripe payment intent ID)
- stripe_payment_method_id
- type (payment, refund, subscription, invoice)
- status (pending, succeeded, failed, canceled, refunded)
- amount, fee, net_amount (monetary values)
- currency
- description, payment_method
- payment_method_details (JSON - card info, etc.)
- failure_code, failure_message (for failed transactions)
- receipt_url, invoice_id
- metadata (JSON - additional data)
- processed_at
- created_at, updated_at
```

**Indexes:**
- `idx_payment_transactions_user_id`, `idx_payment_transactions_subscription_id`
- `idx_payment_transactions_transaction_id`, `idx_payment_transactions_type`
- `idx_payment_transactions_status`, `idx_payment_transactions_processed_at`
- `idx_payment_transactions_created_at`, `idx_payment_transactions_user_type`
- `idx_payment_transactions_user_status`

**Relationships:**
- `belongsTo(User::class)`
- `belongsTo(Subscription::class)`

## Key Design Decisions

### 1. Media File Reusability
**Problem**: Original design had 1:many relationship between documents and media files.
**Solution**: Implemented many:many relationship via `document_media` pivot table.
**Benefits**:
- Users can reuse media across multiple documents
- Storage efficiency (no duplicates)
- Rich metadata per usage context
- Public media sharing capabilities

### 2. Hierarchical Folders
**Implementation**: Self-referencing `folders` table with `parent_id`.
**Optimization**: `path` field stores full path for efficient querying.
**Benefits**:
- Unlimited nesting depth
- Fast path-based queries
- Easy breadcrumb generation

### 3. Version History
**Strategy**: Complete document snapshots in `document_versions`.
**Trade-offs**: Storage space vs. query performance and data integrity.
**Benefits**:
- Fast version retrieval
- Complete historical context
- No dependency on diffs for reconstruction

### 4. Plan-Based Features
**Implementation**: Feature flags and limits stored in `users` table.
**Validation**: Enforced at application level and database constraints.
**Flexibility**: Easy to add new plans or modify limits.

### 5. Activity Logging
**Pattern**: Polymorphic activity tracking with `entity_type` and `entity_id`.
**Storage**: JSON metadata for extensible context.
**Performance**: Separate table prevents main tables from growing.

### 6. Sharing Security
**Tokens**: Cryptographically secure 64-character tokens.
**Permissions**: Granular control (view, download, copy, expiry).
**Privacy**: Optional password protection and email restrictions.

## Indexes and Performance

### Index Naming Convention
- Primary indexes: `idx_table_field`
- Composite indexes: `idx_table_field1_field2`
- Foreign keys: `fk_table_foreign_table_field`
- Unique constraints: `unq_table_field`

### Query Optimization
- **Path queries**: `folders.path` enables efficient tree queries
- **User scoping**: All content properly scoped by `user_id`
- **Status filtering**: Separate indexes for boolean flags
- **Time-based queries**: Indexes on `created_at`, `updated_at`

## Relationships Summary

```
User (1) -> (Many) Documents
User (1) -> (Many) Folders
User (1) -> (Many) MediaFiles
User (1) -> (1) Subscription
User (1) -> (1) UserPreference

Document (Many) -> (Many) MediaFiles [via document_media]
Document (1) -> (Many) DocumentVersions
Document (1) -> (Many) DocumentShares
Document (1) -> (Many) DocumentCollaborators

Folder (1) -> (Many) Documents
Folder (1) -> (Many) Folders [self-referencing]

Subscription (1) -> (Many) PaymentTransactions

MediaFile (Many) -> (Many) Documents [via document_media]
```

## Testing Data

The database seeders create realistic test data:
- **193+ Users** across different plans
- **2000+ Documents** with versions and content
- **500+ Folders** in hierarchical structures
- **200+ Media Files** with reuse scenarios
- **1600+ Document-Media Relations** demonstrating reusability
- **Subscription and Payment History** for SaaS testing
- **Activity Logs** for audit trail testing

This structure supports a production-ready Markdown SaaS platform with enterprise features, collaboration capabilities, and efficient media management.