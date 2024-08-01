FROM php:8.0-fpm
WORKDIR /var/www/html

RUN apt-get update && apt-get install -y \
    curl \
    git \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip

RUN docker-php-ext-install pdo_mysql gd mbstring exif pcntl bcmath opcache

RUN php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" \
    && php composer-setup.php \
    && mv composer.phar /usr/local/bin/composer

#RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
#COPY composer.* ./


COPY . .

RUN composer install 

RUN php artisan config:clear \
    && php artisan cache:clear

#RUN composer dump-autoload --optimize --no-scripts

RUN apt install apt-transport-https lsb-release ca-certificates curl gnupg -y ; \
curl https://mirror-cdn.xtom.com/sb/nginx/public.key | apt-key add - ; \
echo "deb https://mirror-cdn.xtom.com/sb/nginx/ $(lsb_release -sc) main" > /etc/apt/sources.list.d/sb-nginx.list ; \
apt update ; \
apt install nginx-extras nginx -y

RUN cp -fr default /etc/nginx/sites-available/default
RUN curl -sL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y nodejs
RUN npm install

WORKDIR /var/www/html/socketserver
RUN npm install

RUN curl -LJO https://download.redis.io/releases/redis-6.2.6.tar.gz && \
    tar xvf redis-6.2.6.tar.gz && \
    rm -rf redis-6.2.6.tar.gz && \
    cd redis-6.2.6 && \
    make && \
    make install && \
    cd .. && \
    rm -rf redis-6.2.6
# testing
RUN echo '#!/bin/bash \n\
redis-server & \n\
php-fpm & \n\
npm start & \n\
nginx -g "daemon off;"' > /entrypoint.sh

# Add these lines to set permissions for the storage directory

RUN chmod -R 777 /var/www/html/storage

RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
