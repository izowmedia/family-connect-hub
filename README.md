# Mariki Family Portal

> **Umoja Wetu Ni Nguvu Yetu**

A modern dark-themed family management portal built with React + TanStack Start, Firebase (Auth + Firestore), and Cloudinary for media.

## Features

- Email/Password + Google sign-in with email verification & password reset
- Role-based access: **Super Admin · Admin · Treasurer · Member**
- Dashboard with real-time stats from Firestore
- Member directory + individual profiles
- Contributions tracker with running total (Treasurer/Admin)
- Events module with upcoming/past splits
- Family tree (placeholder data — easy to wire to Firestore)
- Media gallery (Cloudinary uploads, image + video)
- Notifications: birthday & event reminders
- Admin panel: approve/block users, change roles, delete

## Quick start

```bash
npm install
npm run dev
```

## Configuration

Create a `.env` file in the project root (see `.env.example`):

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
```

### Firebase setup

1. Create a project at https://console.firebase.google.com
2. Enable **Authentication** → providers: **Email/Password** and **Google**
3. Create a **Cloud Firestore** database in production mode
4. Copy the web app config into your `.env`
5. Paste the rules from `firestore.rules` into Firestore → Rules

The **first user to sign up** is automatically promoted to `super_admin` and activated. Everyone after that starts as a pending `member` and must be approved in the Admin panel.

### Cloudinary setup

1. Sign up at https://cloudinary.com
2. Settings → Upload → **Add upload preset** → Signing mode: **Unsigned**
3. Copy your cloud name + preset name into `.env`

## Deployment

### Netlify

Add the `VITE_*` env vars in Netlify → Site settings → Environment, then:

- Build command: `npm run build`
- Publish directory: `dist`

Since this app is fully client-side (Firebase SDK in the browser), it deploys cleanly as a static SPA. A `netlify.toml` SPA fallback is included.

## Folder structure

```
src/
  components/        AppShell, ProtectedRoute, StatCard, EmptyState
  contexts/          AuthContext (Firebase auth + Firestore profile)
  lib/               firebase, cloudinary, roles, utils
  routes/            File-based routing (TanStack Router)
    index.tsx        Dashboard
    login / signup / forgot-password / verify-email
    members.tsx + members.$id.tsx
    contributions / events / family-tree / gallery
    profile / notifications
    admin.users.tsx
  styles.css         Dark Midnight Indigo design system
```

## Security notes

- Firestore security rules are the source of truth — see `firestore.rules`
- The first-user-becomes-admin bootstrap relies on `_meta/users_count`; in stricter setups, manually promote your first user via the Firebase console
- Cloudinary unsigned presets should restrict allowed formats and folder
