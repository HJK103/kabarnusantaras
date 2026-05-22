import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection, addDoc, doc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, serverTimestamp, increment
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const cfg = {
  apiKey: "AIzaSyDeL2zJ2c9hr8xMGmzbclSaq_B2dkwVAbA",
  authDomain: "kabarnusantara-68abc.firebaseapp.com",
  projectId: "kabarnusantara-68abc",
  storageBucket: "kabarnusantara-68abc.firebasestorage.app",
  messagingSenderId: "411274357104",
  appId: "1:411274357104:web:3c045d04f3e941483147b5"
};

const app = initializeApp(cfg);
const db = getFirestore(app);

// TIDAK pakai enableIndexedDbPersistence karena bisa conflict
// di multi-tab dan menyebabkan data tidak sync antar browser

window.KN_FB = {
  db, collection, addDoc, doc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, serverTimestamp, increment
};
window.dispatchEvent(new Event("fb_ready"));
