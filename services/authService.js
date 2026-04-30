/**
 * authService.js
 * 
 * Currently using in-memory mock via AuthContext.
 * When connecting a real backend, replace these with API calls.
 * 
 * Example with a REST backend:
 *   export const login = async (email, password) => {
 *     const res = await fetch('https://your-api.com/auth/login', {
 *       method: 'POST',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify({ email, password }),
 *     });
 *     if (!res.ok) throw new Error('Invalid credentials');
 *     return res.json(); // { token, user }
 *   };
 * 
 * Example with Firebase:
 *   import auth from '@react-native-firebase/auth';
 *   export const login = (email, password) =>
 *     auth().signInWithEmailAndPassword(email, password);
 */

export const login = async (email, password) => {
  // Handled by AuthContext (mock). Swap this for real API call.
  throw new Error('Use AuthContext login() directly.');
};

export const register = async (name, email, password) => {
  // Handled by AuthContext (mock). Swap this for real API call.
  throw new Error('Use AuthContext register() directly.');
};
