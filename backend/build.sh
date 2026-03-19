#!/usr/bin/env bash
# exit on error
set -o errexit

python -m pip install --upgrade pip
pip install -r requirements.txt

# Convert static files for WhiteNoise
python manage.py collectstatic --no-input

# Apply database migrations
python manage.py migrate
