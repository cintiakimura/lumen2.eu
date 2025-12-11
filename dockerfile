# Use an official PHP image with Apache as the base
FROM php:8.1-apache

# Install system dependencies and PHP extensions required by Lumen/Laravel
# Adjust these based on your specific Lumen project's needs
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libonig-dev \
    libzip-dev \
    && rm -rf /var/lib/apt/lists/* \
    && docker-php-ext-install pdo_mysql mbstring zip

# Install Composer globally
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set the working directory inside the container
WORKDIR /var/www/html

# Copy your Lumen application files into the container
# This assumes your application's entry point is in /var/www/html
COPY . .

# Install PHP dependencies using Composer
# --no-dev: Skips development dependencies
# --optimize-autoloader: Optimizes Composer's autoloader for production
RUN composer install --no-dev --optimize-autoloader

# Configure Apache for Lumen/Laravel
# Create a custom Apache configuration file for your application
# This example assumes you have a .docker/000-default.conf file in your repo
# If not, you can create one or modify this step.
# A typical Lumen/Laravel Apache config points the DocumentRoot to the 'public' directory.
COPY .docker/000-default.conf /etc/apache2/sites-available/000-default.conf
RUN a2enmod rewrite
RUN a2ensite 000-default.conf
RUN service apache2 restart

# Expose the port your web server listens on (Apache default is 80)
EXPOSE 80

# Command to run your application when the container starts
# For Apache, this typically keeps the server running in the foreground
CMD ["apache2-foreground"]
