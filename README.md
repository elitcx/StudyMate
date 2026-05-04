# 💪 Daily Fitness Challenge Tracker

A minimalist React app to help you stay consistent with daily Push Up and Pull Up challenges throughout the year.

## 🎯 What is This?

Two progressive fitness challenges in one app:

### Push Up Challenge _(Easy – Intermediate)_
Do push ups equal to the **day of the year**. Day 1 = 1 push up. Day 100 = 100 push ups. Day 365 = 365 push ups. You can split them into any number of sets — the only rule is good form.

### Pull Up Challenge _(Intermediate – Hard)_
Do pull ups equal to the **week of the year**. Week 1 = 1 pull up per day. Week 30 = 30 pull ups per day. Same deal — split into sets as needed, just keep good form.

---

## ✨ Features

- **Daily target auto-calculation** — the app figures out today's goal based on the date
- **Incremental logging** — log reps in batches using +1, +10, or manual input
- **Missed day tracking** — if you forget a day, it's logged automatically so you can make it up
- **Persistent progress** — progress is saved locally, so closing the tab won't lose your data
- **Reset button** — made a mistake? reset today's count with a confirmation prompt
- **Clean, mobile-friendly UI** — works great on phone or desktop

---

## 🚀 Getting Started

### Prerequisites
- Node.js v20.19.0 or higher

### Installation

```bash
git clone <your-repo-url>
cd my-react-app
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🛠️ Tech Stack

| Tool | Purpose |
|------|---------|
| React 19 | UI framework |
| Vite 7 | Build tool & dev server |
| Tailwind CSS 4 | Styling |
| localStorage | Data persistence |
| Vercel Analytics | Usage analytics |

---

## 📁 Project Structure

```
src/
├── App.jsx        # Main app — all pages and components
├── App.css        # Tailwind imports + custom styles
├── index.css      # Global base styles
└── main.jsx       # React entry point
```

---

## 📖 How to Use

1. **Push Up page** — check your daily target, log sets throughout the day, hit confirm after each set
2. **Pull Up page** — same flow, but based on the week number instead
3. **About page** — explains both challenges with links to form tutorials
4. **Missed days** — shown at the bottom of each page; dismiss them once you've made them up

---

## 📝 Challenge Rules

- You can split your daily reps into as many sets as you want
- Substitutions (easier or harder variations) are allowed
- The only non-negotiable: **good form every rep**
  - [Push Up form guide](https://www.youtube.com/watch?v=WDIpL0pjun0)
  - [Pull Up form guide](https://www.youtube.com/watch?v=eGo4IYlbE5g)
