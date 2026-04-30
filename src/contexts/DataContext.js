import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection, doc, addDoc, getDocs,
  updateDoc, deleteDoc, onSnapshot, writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { seedIfEmpty } from '../services/seedFirestore';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const [subjects,  setSubjects]  = useState([]);
  const [materials, setMaterials] = useState([]);
  const [quizzes,   setQuizzes]   = useState([]);
  const [scores,    setScores]    = useState([]);
  const [dbReady,   setDbReady]   = useState(false);

  // Bootstrap: seed if empty, then subscribe to real-time updates
  useEffect(() => {
    let unsubSubjects, unsubMaterials, unsubQuizzes, unsubScores;

    const init = async () => {
      await seedIfEmpty();

      unsubSubjects  = onSnapshot(collection(db, 'subjects'),  (snap) =>
        setSubjects(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));

      unsubMaterials = onSnapshot(collection(db, 'materials'), (snap) =>
        setMaterials(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));

      unsubQuizzes   = onSnapshot(collection(db, 'quizzes'),   (snap) =>
        setQuizzes(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));

      unsubScores    = onSnapshot(collection(db, 'scores'),    (snap) =>
        setScores(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));

      setDbReady(true);
    };

    init().catch(console.error);
    return () => {
      unsubSubjects?.();
      unsubMaterials?.();
      unsubQuizzes?.();
      unsubScores?.();
    };
  }, []);

  // ── Subjects ──────────────────────────────────────────────────────────────
  const addSubject = async (subject) => {
    const data = { ...subject, materialsCount: 0, quizzesCount: 0, createdAt: new Date().toISOString() };
    const ref  = await addDoc(collection(db, 'subjects'), data);
    return { id: ref.id, ...data };
  };

  const updateSubject = async (id, updates) => {
    await updateDoc(doc(db, 'subjects', id), updates);
  };

  const deleteSubject = async (id) => {
    const batch = writeBatch(db);
    batch.delete(doc(db, 'subjects', id));
    materials.filter((m) => m.subjectId === id).forEach((m) => batch.delete(doc(db, 'materials', m.id)));
    quizzes.filter((q) => q.subjectId === id).forEach((q) => batch.delete(doc(db, 'quizzes', q.id)));
    await batch.commit();
  };

  // ── Materials ─────────────────────────────────────────────────────────────
  const addMaterial = async (material) => {
    const data = { ...material, fileUrl: material.fileUrl || '', createdAt: new Date().toISOString().split('T')[0] };
    const ref  = await addDoc(collection(db, 'materials'), data);
    const sub  = subjects.find((s) => s.id === material.subjectId);
    if (sub) await updateDoc(doc(db, 'subjects', material.subjectId), { materialsCount: (sub.materialsCount || 0) + 1 });
    return { id: ref.id, ...data };
  };

  const updateMaterial = async (id, updates) => {
    await updateDoc(doc(db, 'materials', id), updates);
  };

  const deleteMaterial = async (id) => {
    const mat = materials.find((m) => m.id === id);
    await deleteDoc(doc(db, 'materials', id));
    if (mat?.subjectId) {
      const sub = subjects.find((s) => s.id === mat.subjectId);
      if (sub) await updateDoc(doc(db, 'subjects', mat.subjectId), {
        materialsCount: Math.max(0, (sub.materialsCount || 1) - 1),
      });
    }
  };

  // ── Quizzes ───────────────────────────────────────────────────────────────
  const addQuiz = async (quiz) => {
    const data = { ...quiz, questions: quiz.questions || [], createdAt: new Date().toISOString() };
    const ref  = await addDoc(collection(db, 'quizzes'), data);
    const sub  = subjects.find((s) => s.id === quiz.subjectId);
    if (sub) await updateDoc(doc(db, 'subjects', quiz.subjectId), { quizzesCount: (sub.quizzesCount || 0) + 1 });
    return { id: ref.id, ...data };
  };

  const updateQuiz = async (id, updates) => {
    await updateDoc(doc(db, 'quizzes', id), updates);
  };

  const deleteQuiz = async (id) => {
    const quiz = quizzes.find((q) => q.id === id);
    await deleteDoc(doc(db, 'quizzes', id));
    if (quiz?.subjectId) {
      const sub = subjects.find((s) => s.id === quiz.subjectId);
      if (sub) await updateDoc(doc(db, 'subjects', quiz.subjectId), {
        quizzesCount: Math.max(0, (sub.quizzesCount || 1) - 1),
      });
    }
  };

  // ── Scores ────────────────────────────────────────────────────────────────
  const submitScore = async (userId, quizId, subjectId, score, total, answers) => {
    const pct  = Math.round((score / total) * 100);
    const data = {
      userId, quizId, subjectId, score, total, percentage: pct, answers,
      completedAt: new Date().toISOString().split('T')[0],
    };
    const ref = await addDoc(collection(db, 'scores'), data);
    return { id: ref.id, ...data };
  };

  // ── Selectors ─────────────────────────────────────────────────────────────
  const getUserScores       = (userId)         => scores.filter((s) => s.userId === userId);
  const getQuizScore        = (userId, quizId) => scores.find((s) => s.userId === userId && s.quizId === quizId);
  const getSubjectMaterials = (subjectId)      => materials.filter((m) => m.subjectId === subjectId);
  const getSubjectQuizzes   = (subjectId)      => quizzes.filter((q) => q.subjectId === subjectId);

  return (
    <DataContext.Provider value={{
      subjects, materials, quizzes, scores, dbReady,
      addSubject, updateSubject, deleteSubject,
      addMaterial, updateMaterial, deleteMaterial,
      addQuiz, updateQuiz, deleteQuiz,
      submitScore, getUserScores, getQuizScore,
      getSubjectMaterials, getSubjectQuizzes,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};
