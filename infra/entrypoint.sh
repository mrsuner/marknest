#!/bin/bash
set -e

# Wait for database
echo "Waiting for database..."
while ! nc -z "$DB_HOST" "$DB_PORT"; do sleep 1; done
echo "Database ready!"

# Only run migrations if RUN_MIGRATE=true
if [ "${RUN_MIGRATE}" = "true" ]; then
    echo "Running migrations..."
    php artisan migrate --force
    echo "Optimizing application..."
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    php artisan storage:link || true
    if [ -z "$APP_KEY" ]; then
        echo "Generating application key..."
        php artisan key:generate --force
    fi
fi

# Default to php-fpm if no command provided
if [ $# -eq 0 ]; then
    echo "Starting PHP-FPM..."
    exec php-fpm
else
    echo "Executing command: $@"
    exec "$@"
fi
