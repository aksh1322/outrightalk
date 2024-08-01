#!/bin/bash

cd /home/ubuntu/sendbird/laravel-backend

git pull origin sendbird

composer install

php artisan migrate

php artisan config:clear

php artisan config:cache

service nginx restart