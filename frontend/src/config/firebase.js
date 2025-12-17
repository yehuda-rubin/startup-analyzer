import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAvH4lWW84qmoxxnFJI8lBQTBrVYiEpjYk",
  authDomain: "startup-fa7b2.firebaseapp.com",
  projectId: "startup-fa7b2",
  storageBucket: "startup-fa7b2.firebasestorage.app",
  messagingSenderId: "334006246206",
  appId: "1:334006246206:web:69a97525fc8701d3adea6f",
  measurementId: "G-HJD2C851MP"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
