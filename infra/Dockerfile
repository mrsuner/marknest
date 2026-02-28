# Stage 1: Base — System dependencies & PHP extensions
FROM php:8.3-fpm AS base

RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    netcat-traditional \
    postgresql-client \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_pgsql mbstring exif pcntl bcmath gd zip opcache

RUN pecl install redis && docker-php-ext-enable redis

COPY infra/php/php.ini /usr/local/etc/php/conf.d/custom.ini

# Stage 2: Dependencies — Composer install
FROM base AS deps

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY apps/backend/composer.json apps/backend/composer.lock ./
RUN composer install --optimize-autoloader --no-dev --no-scripts --no-interaction

# Stage 3: Application
FROM base AS app

WORKDIR /var/www/html

COPY --from=deps /var/www/html/vendor ./vendor
COPY apps/backend .

RUN mkdir -p storage/framework/{sessions,views,cache} storage/logs bootstrap/cache \
    && chown -R www-data:www-data /var/www/html \
    && chmod -R 755 storage bootstrap/cache

COPY infra/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 9000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
