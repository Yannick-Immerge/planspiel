#!/bin/bash

until mysqladmin ping -h ${DATABASE_HOST} --silent; do
    echo "Waiting for MySQL to start..."
    sleep 2
done

echo "Configuring database..."
python scripts/setup_database.py --configure-database --force
sleep 2
echo "Setting up prototype roles..."
python scripts/setup_prototype_roles.py
sleep 2
echo "Setting up product key..."
python scripts/setup_product_key.py
