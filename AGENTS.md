# AGENTS.md

## Project overview

Student evaluation form for IIBS (Institut Informatique Business School). React SPA with Firebase Firestore backend. Students rate courses/professors per class per semester.

## Stack

- React 19 + React Router 7
- Vite 8 (build tool)
- Tailwind CSS 4
- Firebase (Firestore + Auth)

## Structure

```
form/
├── index.html              ← Vite entry point
├── public/                 ← static assets (logos, carousel images)
├── src/
│   ├── firebase.js         ← Firebase config (Firestore + Auth)
│   ├── data/courses.js     ← all course data by year/semester/class
│   ├── components/         ← Header, Carousel, ClassSelector, EvaluationTable, ThankYouModal, Toast
│   └── pages/              ← StudentForm, AdminLogin, AdminDashboard
```

## Key commands

```bash
npm run dev      # start dev server
npm run build    # production build → dist/
npm run lint     # oxlint
```

## Key details

- **Git repo** lives in `form/`, not the workspace root.
- **Firebase config** is in `src/firebase.js`. Project: `drop-5096a`.
- **Course data** is in `src/data/courses.js`. The `academicData` object is keyed by `year → semester → className → [{matiere, prof}]`.
- **Academic year + semester** are auto-detected from the current date in `StudentForm.jsx` via `getAcademicYear()` / `getSemester()`.
- **Semester → level mapping**: L1 = S1/S2, L2 = S3/S4, L3 = S5/S6.
- **Rating scale**: A = 50%, B = 75%, C = 100% (8 questions, Q1-Q8).
- **Admin dashboard** at `/admin`. Firebase Auth (email/password) required. Displays all evaluations with filters.
- **Language**: UI is French. Keep strings in French.
- **Images**: `IBS_NOIR.png`, `IBS_BLANC.png`, `direction1.png`, `direction2.png` in `public/`.

## Updating course data

Edit `src/data/courses.js`. Each semester maps class names to arrays of `{matiere, prof}`. To add a new academic year, add a new key to `academicData`.
