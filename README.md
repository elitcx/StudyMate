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