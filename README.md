# Blood Donation Management System

A comprehensive blood donation management system built with React, Firebase, and EmailJS. This professional-grade application facilitates blood donation processes with features for donors, hospitals, and administrators.

## 🩸 Features

### Donor Management
- **Donor Registration**: Complete registration with eligibility checking
- **Health Assessment**: Automated eligibility verification based on medical conditions
- **Profile Management**: Update health information and donation history

### Blood Inventory Management
- **Hospital Inventory**: Real-time tracking of blood units by type
- **Expiry Management**: Alerts for expiring blood units
- **Low Stock Alerts**: Automatic notifications when inventory is low

### Request & Approval System
- **Blood Requests**: Submit urgent and emergency blood requests
- **Approval Workflow**: Admin review and approval process
- **Priority Management**: Emergency, urgent, and normal priority levels

### Search & Compatibility
- **Donor Search**: Find compatible donors by blood type
- **Compatibility Matching**: Automated blood type compatibility checking
- **Location-based Search**: Find donors in specific areas

### Notifications
- **Email Notifications**: Automated emails via EmailJS
- **Request Updates**: Status updates for blood requests
- **Eligibility Notifications**: Donor eligibility status updates

### Dashboard & Analytics
- **Role-based Dashboards**: Different views for donors, hospitals, and admins
- **Real-time Statistics**: Blood inventory, requests, and donor statistics
- **Activity Tracking**: Recent activity and system updates

## 🚀 Tech Stack

- **Frontend**: React 18 with modern hooks
- **Backend**: Firebase (Firestore & Authentication)
- **Email Service**: EmailJS for notifications
- **Styling**: Custom CSS with responsive design
- **Icons**: Lucide React icons
- **Build Tool**: Vite
- **Deployment Ready**: Professional production build

## 📋 Prerequisites

Before running this application, make sure you have:

- Node.js (version 14.0 or higher)
- npm or yarn package manager
- Firebase project with Firestore and Authentication enabled
- EmailJS account for email notifications

## ⚙️ Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment file and add your credentials:
```bash
cp .env.example .env
```

Edit `.env` file and add your actual credentials:

```env
# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID_APPLY=your_apply_template_id
VITE_EMAILJS_TEMPLATE_ID_STATUS=your_status_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
VITE_EMAILJS_USER_ID=your_user_id

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Firebase Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Authentication** with Email/Password
3. Create a **Firestore Database**
4. Copy your Firebase config credentials to `.env` file

### 4. EmailJS Setup
1. Create an EmailJS account at [EmailJS](https://www.emailjs.com/)
2. Create email service and templates
3. Copy your EmailJS credentials to `.env` file

### 5. Default Admin Access
For testing purposes, use these admin credentials:
- **Email:** rameshwar.patil24@pcu.edu.in
- **Password:** 123456789

## 🏃‍♂️ Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Build

```bash
npm run build
```

## 👥 User Roles & Access

### Donors
- Register and manage donor profile
- Check donation eligibility
- View donation history
- Search for blood requests they can fulfill

### Hospitals
- Submit blood requests for patients
- Manage blood inventory
- Track request status
- Search for compatible donors

### Administrators
- Review and approve blood requests
- Manage system-wide inventory
- Oversee donor registrations
- Generate reports and analytics

## 🚀 Deployment

The application is ready for deployment on platforms like Vercel, Netlify, or Firebase Hosting.

**Built with ❤️ for saving lives through technology**
**Built By Rameshwar Patil**
