FROM php:8.4-cli
RUN apt-get update && apt-get install -y libpq-dev unzip git \
    && docker-php-ext-install pdo_pgsql \
    && rm -rf /var/lib/apt/lists/*
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /var/www/html
COPY . .
RUN composer install --no-interaction --prefer-dist
EXPOSE 8000
CMD ["sh", "-c", "cp -n .env.example .env; php artisan key:generate --force; php artisan migrate --force; php artisan db:seed --force; php artisan serve --no-reload --host=0.0.0.0 --port=8000"]