#!/bin/bash
set -e

echo "Starting Laravel application setup..."

# Wait for database to be ready (PostgreSQL)
echo "Waiting for database..."
while ! nc -z db 5432; do
  sleep 1
done
echo "Database server is ready!"

# Test database connection and create database if it doesn't exist
echo "Checking database connection..."
if ! php artisan migrate:status > /dev/null 2>&1; then
    echo "Database connection failed or database doesn't exist. Attempting to create database..."
    # Try to connect to PostgreSQL and create the database
    PGPASSWORD=password psql -h db -U marknest -d postgres -c "CREATE DATABASE marknest;" 2>/dev/null || echo "Database might already exist or creation failed - continuing anyway"
fi

# Run migrations
echo "Running database migrations..."
php artisan migrate --force

# Clear and cache configuration
echo "Optimizing application..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Create storage link
echo "Creating storage link..."
php artisan storage:link || true

# Generate application key if not exists
if [ -z "$APP_KEY" ]; then
    echo "Generating application key..."
    php artisan key:generate --force
fi

echo "Laravel application setup complete!"

# If no arguments provided, start php-fpm by default
if [ $# -eq 0 ]; then
    echo "Starting PHP-FPM..."
    exec php-fpm
else
    # Execute the provided command
    echo "Executing command: $@"
    exec "$@"
fi