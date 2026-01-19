
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging } from 'firebase/messaging';

// ⚠️ REEMPLAZA ESTOS VALORES CON LOS DE TU PROYECTO FIREBASE ⚠️
// Si usas .env, las tomará de ahí. Si no, puedes pegarlas directamente (aunque no es "best practice", es funcional para uso personal).
const firebaseConfig = {
    apiKey: "AIzaSyDYV8S9iwYB1HQWq5Xg17Zmv4v3VaxNEPc",
    authDomain: "mis-gastos-app-27f00.firebaseapp.com",
    projectId: "mis-gastos-app-27f00",
    storageBucket: "mis-gastos-app-27f00.firebasestorage.app",
    messagingSenderId: "252913038714",
    appId: "1:252913038714:web:c61bbbba002a4bccbf12c3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;
