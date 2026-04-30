# Firebase Setup Guide for StudyMate

Follow these steps **exactly in order** before running the app.

---

## Step 1 — Create a Firebase Project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"** → name it `StudyMate` → Continue → Create project

---

## Step 2 — Register a Web App

1. In the project dashboard, click the **`</>`** (Web) icon
2. Name it `studymate-app` → click **Register app**
3. **Copy the `firebaseConfig` object** — you'll need it in Step 5

---

## Step 3 — Enable Authentication

1. Left sidebar → **Build → Authentication**
2. Click **Get started**
3. Click **Email/Password** → toggle **Enable** → **Save**

---

## Step 4 — Create Firestore Database

1. Left sidebar → **Build → Firestore Database**
2. Click **Create database**
3. Choose **"Start in test mode"** → Next
4. Pick a region (e.g. `asia-southeast1` for Indonesia) → **Enable**
5. Wait for provisioning

---

## Step 5 — Paste Your Config

Open **`src/config/firebase.js`** and replace the placeholder values:

```js
const firebaseConfig = {
  apiKey:            'AIzaSy...',
  authDomain:        'studymate-xxx.firebaseapp.com',
  projectId:         'studymate-xxx',
  storageBucket:     'studymate-xxx.appspot.com',
  messagingSenderId: '123456789',
  appId:             '1:123:web:abc...',
};
```

---

## Step 6 — Install & Run

```bash
npm install
npx expo start --clear
```

---

## Step 7 — Create the First Superadmin

All new accounts are students by default. To promote to superadmin:

1. Register any account through the app
2. Go to Firebase Console → **Firestore Database** → `users` collection
3. Find your user document → click `role` field → change to `"superadmin"` → Update
4. Restart the app and log in — you're now a superadmin

From the superadmin panel you can change other users' roles to `admin`.

---

## How File Access Works (No Storage Plan Needed)

Instead of uploading files to Firebase Storage (which requires the Blaze paid plan),
admins paste **shareable links** from Google Drive, YouTube, Dropbox, etc.

### For PDF files:
1. Upload your PDF to **Google Drive**
2. Right-click → **Share** → **"Anyone with the link"** → **Copy link**
3. Paste the link when adding a material in the admin panel

### For Video files:
1. Upload to **YouTube** (can be Unlisted) → Share → Copy link
   — OR — upload to **Google Drive** → Share → Copy link
2. Paste when adding a material

Students tap **"Buka PDF"** or **"Putar Video"** and the file opens in their browser or native player.

---

## Firestore Data Structure

```
users/{uid}
  name, email, role, avatar, enrolledSubjects[], createdAt

subjects/{id}
  title, description, icon, color, materialsCount, quizzesCount

materials/{id}
  subjectId, title, description, type (pdf/video/notes)
  author, fileUrl, pages?, duration?, createdAt

quizzes/{id}
  subjectId, title, description, duration, totalMarks
  date, materialIds[], questions[{ id, text, options[], correct }]

scores/{id}
  userId, quizId, subjectId, score, total, percentage
  answers[], completedAt
```

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `Component auth has not been registered yet` | Already fixed in v13 — uses `getAuth` instead of `initializeAuth` |
| `auth/api-key-not-valid` | Check `firebaseConfig.apiKey` in `firebase.js` |
| `Missing or insufficient permissions` | Firestore still in test mode — that's fine for development |
| PDF doesn't open | Make sure the Google Drive link is set to "Anyone with the link" |
| Video doesn't play | YouTube links open in browser; Drive video links open in native player |
| Data not loading | Check that Firestore is created and your `projectId` is correct |
