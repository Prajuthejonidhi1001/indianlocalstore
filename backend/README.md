# Indian Local Store - Backend

This is the backend repository for the **Indian Local Store** e-commerce application. It provides the core API, database models, and media management required to power the storefront.

## 🚀 Tech Stack

* **Framework:** [Django](https://www.djangoproject.com/) (Python)
* **Database:** [Supabase](https://supabase.com/) (PostgreSQL)
* **Media Storage:** [Cloudinary](https://cloudinary.com/)
* **Hosting / Deployment:** [Render](https://render.com/)

## 📦 Features

* **PostgreSQL Database:** Fully managed PostgreSQL relational database hosted on Supabase.
* **Cloud Image Management:** Product images and user uploads are securely stored and optimized via Cloudinary.
* **Production Ready:** Configured for seamless deployment on Render's web services.

## 🛠️ Local Development Setup

Follow these steps to set up the project locally on your machine.

### 1. Prerequisites
* Python 3.8+
* pip (Python package installer)
* A Supabase account and database project
* A Cloudinary account

### 2. Clone and Environment Setup
```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
DDDDDDDDDDDDDDD333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333XEEEEE3source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Environment Variables
Create a `.env` file in the root of your backend directory and add the following keys. **Do not commit this file to version control.**

```ini
SECRET_KEY=your_django_secret_key
DEBUG=True
DATABASE_URL=your_supabase_postgresql_connection_string
CLOUDINARY_URL=your_cloudinary_api_environment_variable
```

### 4. Run Migrations & Start Server
```bash
# Apply database migrations to Supabase
python manage.py migrate

# Run the local development server
python manage.py runserver
```