# StudyMate 📚

Platform belajar cerdas untuk siswa, guru, dan administrator.

---

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm start

# Run on device/simulator
npm run android
npm run ios
```

---

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| 🎓 Siswa | student@studymate.com | student123 |
| 👩‍🏫 Admin | admin@studymate.com | admin123 |
| ⚡ Superadmin | superadmin@studymate.com | super123 |

All auth is **in-memory mock** — no backend required to run. See [Connecting a Real Backend](#connecting-a-real-backend).

---

## App Structure

```
app/
├── _layout.jsx                    ← Root (providers + Stack)
├── index.jsx                      ← Smart redirect by role
│
├── (auth)/
│   ├── welcome.jsx                ← Landing / onboarding
│   ├── login.jsx                  ← Login with demo fill buttons
│   └── register.jsx               ← Register (creates student account)
│
├── (student)/                     ← 5-tab nav, requires role=student
│   ├── home.jsx                   ← Dashboard: stats, pending quizzes, classes
│   ├── classes.jsx                ← Browse all / enrolled classes
│   ├── tests.jsx                  ← Pending vs completed quizzes
│   ├── banksoal.jsx               ← All quizzes by subject filter
│   ├── profile.jsx                ← Stats, score history, logout
│   ├── subject/[id].jsx           ← Subject detail: materials + quizzes tabs
│   └── quiz/[id].jsx              ← Full quiz: intro → timed quiz → result review
│
├── (admin)/                       ← 5-tab nav, requires role=admin
│   ├── dashboard.jsx              ← Stats overview + recent activity
│   ├── classes.jsx                ← Accordion: view/delete classes, materials, quizzes
│   ├── create-class.jsx           ← Create class with icon/color picker + inline materials
│   ├── quizzes.jsx                ← Quiz list + full quiz builder
│   ├── profile.jsx                ← Admin stats + quick nav
│   ├── add-material.jsx           ← Add material to existing class (hidden tab)
│   └── create-quiz.jsx            ← Create quiz for existing class (hidden tab)
│
└── (superadmin)/                  ← 4-tab nav, requires role=superadmin
    ├── dashboard.jsx              ← Full system stats (users, content, activity)
    ├── users.jsx                  ← Search/filter users, change roles, delete
    ├── content.jsx                ← Tabbed view of all subjects/materials/quizzes/scores
    └── profile.jsx                ← System overview + quick nav
```

---

## Key Files

| File | Purpose |
|------|---------|
| `src/contexts/AuthContext.js` | Auth state: login, register, logout, user management |
| `src/contexts/DataContext.js` | App data: subjects, materials, quizzes, scores |
| `components/UI.js` | Shared design-system components |
| `utils/theme.js` | Colors, spacing, typography, shadows |
| `services/authService.js` | Backend integration stub (see below) |

---

## Role System

Every protected route group checks `user.role` in its `_layout.jsx`:

```jsx
// Example from (student)/_layout.jsx
const { user } = useAuth();
if (!user) return <Redirect href="/(auth)/login" />;
if (user.role !== 'student') return <Redirect href="/" />;
```

`index.jsx` redirects to the correct section after login:
```jsx
if (user.role === 'superadmin') return <Redirect href="/(superadmin)/dashboard" />;
if (user.role === 'admin')      return <Redirect href="/(admin)/dashboard" />;
return <Redirect href="/(student)/home" />;
```

---

## Connecting a Real Backend

### Option A: REST API

In `src/contexts/AuthContext.js`, replace the mock `login` function:

```js
const login = async (email, password) => {
  const res = await fetch('https://your-api.com/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Invalid credentials');
  const data = await res.json();
  setUser(data.user);
  // Store data.token in SecureStore for subsequent requests
  return data.user;
};
```

### Option B: Firebase

```bash
npm install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore
```

Then in `AuthContext.js`:
```js
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const login = async (email, password) => {
  const cred = await auth().signInWithEmailAndPassword(email, password);
  const doc = await firestore().collection('users').doc(cred.user.uid).get();
  const user = { id: cred.user.uid, ...doc.data() };
  setUser(user);
  return user;
};
```

### Option C: Supabase

```bash
npm install @supabase/supabase-js
```

---

## Data Model

### User
```js
{
  id: string,
  name: string,
  email: string,
  password: string,      // remove when using real auth
  role: 'student' | 'admin' | 'superadmin',
  avatar: string,        // emoji
  enrolledSubjects: string[],  // subject IDs (student only)
}
```

### Subject (Kelas)
```js
{ id, title, description, icon, color, materialsCount, quizzesCount }
```

### Material (Materi)
```js
{ id, subjectId, title, description, type: 'pdf'|'video'|'notes', author, pages?, duration?, createdAt }
```

### Quiz (Kuis / Bank Soal)
```js
{
  id, subjectId, title, description, duration, totalMarks,
  questions: [{ id, text, options: string[], correct: number }]
}
```

### Score (Nilai)
```js
{ id, userId, quizId, subjectId, score, total, percentage, completedAt, answers: number[] }
```

---

## Theming

All colors, spacing, and typography are in `utils/theme.js`. The app uses a **deep navy + electric teal** dark palette:

- `colors.bg` — main background (`#0f172a`)
- `colors.bgCard` — card surface (`#1e293b`)
- `colors.accent` — primary action color (`#38bdf8`)
- `colors.admin` — admin accent (`#a78bfa`)
- `colors.superadmin` — superadmin accent (`#fb923c`)

---

## TODO (Future)

- [ ] Connect real backend (Firebase / REST)
- [ ] Push notifications for upcoming tests
- [ ] PDF viewer integration
- [ ] Video player integration  
- [ ] Student enrollment flow (join class by code)
- [ ] Admin: edit existing materials/quizzes
- [ ] Progress tracking charts
- [ ] Export scores to PDF/Excel
