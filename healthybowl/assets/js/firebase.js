/* =====================================================
   FIREBASE CONFIGURATION — HEALTHYBOWL
===================================================== */

// ===== FIREBASE IMPORTS =====
import { initializeApp } from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  onSnapshot
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ===== YOUR REAL FIREBASE CONFIG =====
const firebaseConfig = {
  apiKey: "AIzaSyAXXvAHwi-KeyjyliTpE3nOs1NjNFUGrSk",
  authDomain: "the-healthy-bowl-web-dd819.firebaseapp.com",
  projectId: "the-healthy-bowl-web-dd819",
  storageBucket: "the-healthy-bowl-web-dd819.firebasestorage.app",
  messagingSenderId: "341467327692",
  appId: "1:341467327692:web:15a6fdde7a2e22b8786669"
};


// ===== INITIALIZE FIREBASE =====
const app = initializeApp(firebaseConfig);


// ===== SERVICES =====
export const auth = getAuth(app);
export const db = getFirestore(app);


// ===== EXPORT FUNCTIONS =====
export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  onSnapshot
};