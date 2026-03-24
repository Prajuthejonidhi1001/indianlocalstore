# 🏪 IndianLocalStore

IndianLocalStore is a full-stack hyper-local marketplace designed to connect customers with nearby shops and sellers. It prioritizes local discovery through GPS-based detection and a structured location-first user experience.

---

## 🚀 Project Architecture

The project consists of three main components:

1.  **Backend**: A Django REST Framework API serving both mobile and web clients.
2.  **Web Frontend**: A modern, responsive React application built with Vite.
3.  **Mobile App**: A cross-platform React Native application built with Expo.

---

## 🛠️ Technology Stack

### Backend
- **Framework**: Django 4.2 & Django REST Framework
- **Authentication**: JWT (SimpleJWT)
- **Database**: PostgreSQL (hosted on **Supabase**)
- **Image Storage**: **Cloudinary**
- **Hosting**: **Render.com** (Free Tier)
- **API Documentation**: Integrated DRF Browsable API

### Web Frontend
- **Library**: React 19 (Vite)
- **Routing**: React Router v7
- **Icons**: Lucide React
- **Styling**: Vanilla CSS (Custom Design System with Dark Mode)
- **State Management**: Context API (Auth, Cart, Location)
- **Hosting**: **Vercel**

### Mobile Frontend
- **Framework**: React Native (Expo SDK 54)
- **Navigation**: React Navigation (Stack & Bottom Tabs)
- **Location**: Expo Location (GPS detection)
- **Build System**: Expo EAS (Android .apk and .aab generation)

---

## ✨ Key Features

- **📍 Hyper-Local Discovery**: Automatically detects user location via GPS to show shops in the immediate vicinity.
- **🗺️ Advanced Location Picker**: A cascading selector for India (State → District → City/Village/Pincode) using the Indian Postal API.
- **🏢 Managed Shop Profiles**: Sellers can register and manage their shop details, including verification status and ratings.
- **📂 Category-Based Browsing**: Filter shops and products by real-time categories fetched from the backend.
- **🛒 Shopping Cart**: Integrated cart management across the web and mobile ecosystem.
- **🔐 Secure Auth**: Robust JWT-based authentication flow for both Customers and Sellers.

---

## 📦 Deployment Overview

This project is optimized for **Zero-Cost Cloud Hosting**:
- **Database**: Supabase PostgreSQL Free Tier.
- **Backend API**: Render.com Free Web Service.
- **Static Media**: Cloudinary Free Tier (images).
- **Web App**: Vercel Free Tier.
- **Mobile Distribution**: Expo EAS for building ready-to-install Android APKs.

---

## 🛠️ Local Development

### 1. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py runserver
```

### 2. Web Frontend Setup
```bash
cd web
npm install
npm run dev
```

### 3. Mobile App Setup
```bash
# In the root directory
npm install
npx expo start
```

---

## 📂 Directory Structure

```
indianlocalstore/
├── backend/            # Django API source code
├── web/                # React Vite frontend
├── src/                # React Native (Mobile) source code
├── assets/             # Mobile app assets (icons, splash)
├── App.js              # Mobile app entry point
├── package.json        # Root dependencies (Mobile/Shared)
└── README.md           # This file
```

---

## 🇮🇳 Powered by India
Built with a focus on supporting local Indian businesses and neighborhood marketplaces.
