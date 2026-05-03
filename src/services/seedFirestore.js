/**
 * src/services/seedFirestore.js
 * Populates Firestore with initial data on first launch.
 * Called from DataContext — runs only if 'subjects' collection is empty.
 */
import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../config/firebase';

const SEED_SUBJECTS = [
  { id: 's1', title: 'Mathematics',  description: 'Algebra, Calculus, and Statistics',    icon: '🔢', color: '#38bdf8', materialsCount: 3, quizzesCount: 2 },
  { id: 's2', title: 'Physics',      description: 'Mechanics, Thermodynamics, Waves',     icon: '⚛️', color: '#a78bfa', materialsCount: 2, quizzesCount: 1 },
  { id: 's3', title: 'Chemistry',    description: 'Organic, Inorganic, Physical Chemistry',icon: '🧪', color: '#4ade80', materialsCount: 4, quizzesCount: 2 },
  { id: 's4', title: 'Biology',      description: 'Cells, Genetics, Ecology',             icon: '🌿', color: '#fb923c', materialsCount: 2, quizzesCount: 1 },
];

const SEED_MATERIALS = [
  { id: 'm1',  subjectId: 's1', title: 'Introduction to Algebra',    type: 'pdf',   description: 'Basics of algebraic expressions, equations and inequalities.', pages: 24,  author: 'Dr. Sarah Lee', createdAt: '2024-01-10', fileUrl: '' },
  { id: 'm2',  subjectId: 's1', title: 'Calculus Fundamentals',      type: 'video', description: 'Derivatives, integrals, and limits with step-by-step examples.', duration: '45 min', author: 'Dr. Sarah Lee', createdAt: '2024-01-15', fileUrl: '' },
  { id: 'm3',  subjectId: 's1', title: 'Statistics Cheat Sheet',     type: 'pdf',   description: 'Quick reference for probability and statistics formulas.', pages: 6, author: 'Dr. Sarah Lee', createdAt: '2024-01-20', fileUrl: '' },
  { id: 'm4',  subjectId: 's2', title: "Newton's Laws of Motion",    type: 'pdf',   description: 'Comprehensive guide to classical mechanics.', pages: 18, author: 'Prof. James', createdAt: '2024-02-01', fileUrl: '' },
  { id: 'm5',  subjectId: 's2', title: 'Thermodynamics Overview',    type: 'video', description: 'Heat, energy, and entropy explained visually.', duration: '32 min', author: 'Prof. James', createdAt: '2024-02-10', fileUrl: '' },
  { id: 'm6',  subjectId: 's3', title: 'Periodic Table Guide',       type: 'pdf',   description: 'Complete reference for elements and their properties.', pages: 12, author: 'Dr. Chen', createdAt: '2024-01-05', fileUrl: '' },
  { id: 'm7',  subjectId: 's3', title: 'Organic Chemistry Basics',   type: 'pdf',   description: 'Functional groups, nomenclature, and reactions.', pages: 30, author: 'Dr. Chen', createdAt: '2024-01-12', fileUrl: '' },
  { id: 'm8',  subjectId: 's3', title: 'Lab Safety Protocols',       type: 'pdf',   description: 'Safety guidelines for chemistry laboratory work.', pages: 8, author: 'Dr. Chen', createdAt: '2024-01-18', fileUrl: '' },
  { id: 'm9',  subjectId: 's4', title: 'Cell Biology Intro',         type: 'video', description: 'Structure and function of eukaryotic and prokaryotic cells.', duration: '28 min', author: 'Dr. Mills', createdAt: '2024-02-20', fileUrl: '' },
  { id: 'm10', subjectId: 's4', title: 'Genetics Fundamentals',      type: 'pdf',   description: 'DNA, RNA, and heredity explained.', pages: 22, author: 'Dr. Mills', createdAt: '2024-02-25', fileUrl: '' },
];

const SEED_QUIZZES = [
  {
    id: 'q1', subjectId: 's1', title: 'Algebra Quiz 1',
    description: 'Test your knowledge of algebraic expressions.',
    type: 'practice',
    duration: 15, totalMarks: 10, date: '2026-04-25', materialIds: ['m1', 'm3'],
    questions: [
      { id: 'qq1', text: 'What is 2x + 3 = 7? Find x.', options: ['x = 1', 'x = 2', 'x = 3', 'x = 4'], correct: 1 },
      { id: 'qq2', text: 'Simplify: 3(x + 4) - 2x', options: ['x + 12', 'x + 4', '5x + 4', 'x - 12'], correct: 0 },
      { id: 'qq3', text: 'Which is a quadratic equation?', options: ['y = 2x + 1', 'y = x² + 3x + 2', 'y = 1/x', 'y = √x'], correct: 1 },
    ],
  },
  {
    id: 'q2', subjectId: 's1', title: 'Ujian Tengah Semester - Matematika',
    description: 'Materi: Kalkulus Bab 1-3. Persiapkan dirimu dengan baik!',
    type: 'exam',
    duration: 90, totalMarks: 100, date: '2026-05-10', materialIds: ['m2'],
    questions: [
      { id: 'qq6', text: 'What is the derivative of x²?', options: ['x', '2x', 'x³/3', '2'], correct: 1 },
      { id: 'qq7', text: 'What is the integral of 2x?', options: ['2', 'x²', 'x² + C', '2x²'], correct: 2 },
    ],
  },
  {
    id: 'q3', subjectId: 's2', title: "Newton's Laws Quiz",
    description: 'Test understanding of the three laws of motion.',
    type: 'practice',
    duration: 10, totalMarks: 10, date: '2026-04-30', materialIds: ['m4'],
    questions: [
      { id: 'qq9',  text: "Newton's First Law is about:", options: ['Force = mass × acceleration', 'Inertia', 'Action and reaction', 'Gravity'], correct: 1 },
      { id: 'qq10', text: "F = ma is Newton's:", options: ['First Law', 'Second Law', 'Third Law', 'Law of Gravity'], correct: 1 },
    ],
  },
  {
    id: 'q4', subjectId: 's3', title: 'Ujian Akhir Semester - Kimia',
    description: 'Mencakup materi Kimia Organik dan Anorganik. Pelajari tabel periodik!',
    type: 'exam',
    duration: 120, totalMarks: 100, date: '2026-05-05', materialIds: ['m6', 'm7'],
    questions: [
      { id: 'qq12', text: 'What is the chemical symbol for Gold?', options: ['Go', 'Gd', 'Au', 'Ag'], correct: 2 },
      { id: 'qq13', text: "Water's chemical formula is:", options: ['HO', 'H₂O', 'H₂O₂', 'HO₂'], correct: 1 },
    ],
  },
];

export async function seedIfEmpty() {
  const snap = await getDocs(collection(db, 'subjects'));
  if (!snap.empty) return;
  console.log('Seeding Firestore with initial data...');
  const batch = writeBatch(db);
  SEED_SUBJECTS.forEach((s)  => batch.set(doc(db, 'subjects',  s.id),  s));
  SEED_MATERIALS.forEach((m) => batch.set(doc(db, 'materials', m.id),  m));
  SEED_QUIZZES.forEach((q)   => batch.set(doc(db, 'quizzes',   q.id),  q));
  await batch.commit();
  console.log('Firestore seeded.');
}
