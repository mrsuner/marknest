-- PostgreSQL initialization script for Marknest
-- This script runs when the PostgreSQL container is first created

-- Create additional databases if needed (optional)
-- CREATE DATABASE marknest_testing;

-- Grant permissions to the marknest user
GRANT ALL PRIVILEGES ON DATABASE marknest TO marknest;

-- Create extensions that might be useful for Laravel
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Set default search path
ALTER DATABASE marknest SET search_path TO public;

-- Optional: Create a readonly user for reports/analytics
-- CREATE USER marknest_readonly WITH PASSWORD 'readonly_password';
-- GRANT CONNECT ON DATABASE marknest TO marknest_readonly;
-- GRANT USAGE ON SCHEMA public TO marknest_readonly;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO marknest_readonly;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO marknest_readonly;
