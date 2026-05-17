#!/usr/bin/env bash
# exit on error
set -o errexit

python -m pip install --upgrade pip
pip install -r requirements.txt

# Apply database migrations
python manage.py migrate --no-input

# Seed categories, shops and products if not already seeded
python manage.py seed_data

# Convert static files for WhiteNoise
python manage.py collectstatic --no-input
