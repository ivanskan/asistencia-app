import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 👇 pega tu config aquí
const firebaseConfig = {
  apiKey: "AIzaSyD7q47fOzRu8RmldRIJdriJ_tLA5GoFbq0",
  authDomain: "asistencia-ers.firebaseapp.com",
  projectId: "asistencia-ers",
  storageBucket: "asistencia-ers.firebasestorage.app",
  messagingSenderId: "293780124942",
  appId: "1:293780124942:web:48c3d7d3c608f3e6d9535f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);




