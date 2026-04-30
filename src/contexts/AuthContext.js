import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  doc, getDoc, setDoc, updateDoc,
  collection, getDocs, deleteDoc,
  arrayUnion, arrayRemove,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]         = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading]   = useState(true);

  // Listen to Firebase auth state — restores session on app restart
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await fetchUserProfile(firebaseUser.uid);
        setUser(profile);
        // Load all users for admin panels
        await refreshAllUsers();
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const fetchUserProfile = async (uid) => {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    return { id: uid, ...snap.data() };
  };

  const refreshAllUsers = async () => {
    const snap = await getDocs(collection(db, 'users'));
    setAllUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  // ── Auth ──────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(
      auth, email.trim().toLowerCase(), password
    );
    const profile = await fetchUserProfile(cred.user.uid);
    if (!profile) throw new Error('Profil pengguna tidak ditemukan.');
    setUser(profile);
    return profile;
  };

  const register = async (name, email, password, grade = null) => {
    const cred = await createUserWithEmailAndPassword(
      auth, email.trim().toLowerCase(), password
    );
    const profile = {
      name,
      email: email.trim().toLowerCase(),
      role: 'student',
      avatar: '🎓',
      enrolledSubjects: [],
      grade: grade || null,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', cred.user.uid), profile);
    const full = { id: cred.user.uid, ...profile };
    setUser(full);
    return full;
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  // ── User management ───────────────────────────────────────────────────────
  const updateUserRole = async (userId, newRole) => {
    await updateDoc(doc(db, 'users', userId), { role: newRole });
    setAllUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
    if (user?.id === userId) setUser((prev) => ({ ...prev, role: newRole }));
  };

  const updateUserGrade = async (userId, grade) => {
    await updateDoc(doc(db, 'users', userId), { grade });
    setAllUsers((prev) => prev.map((u) => u.id === userId ? { ...u, grade } : u));
    if (user?.id === userId) setUser((prev) => ({ ...prev, grade }));
  };

  const deleteUser = async (userId) => {
    await deleteDoc(doc(db, 'users', userId));
    setAllUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  // ── Enrollment ────────────────────────────────────────────────────────────
  const enrollInSubject = async (userId, subjectId) => {
    await updateDoc(doc(db, 'users', userId), { enrolledSubjects: arrayUnion(subjectId) });
    const upd = (u) => ({
      ...u,
      enrolledSubjects: u.enrolledSubjects?.includes(subjectId)
        ? u.enrolledSubjects
        : [...(u.enrolledSubjects || []), subjectId],
    });
    setAllUsers((prev) => prev.map((u) => u.id === userId ? upd(u) : u));
    if (user?.id === userId) setUser(upd);
  };

  const unenrollFromSubject = async (userId, subjectId) => {
    await updateDoc(doc(db, 'users', userId), { enrolledSubjects: arrayRemove(subjectId) });
    const upd = (u) => ({
      ...u,
      enrolledSubjects: (u.enrolledSubjects || []).filter((id) => id !== subjectId),
    });
    setAllUsers((prev) => prev.map((u) => u.id === userId ? upd(u) : u));
    if (user?.id === userId) setUser(upd);
  };

  return (
    <AuthContext.Provider value={{
      user, allUsers, loading,
      login, register, logout,
      updateUserRole, updateUserGrade, deleteUser,
      enrollInSubject, unenrollFromSubject,
      refreshAllUsers,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
