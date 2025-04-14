import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const createFirebaseClient = () => {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
// const firebaseConfig = {
//     apiKey: "AIzaSyCrvI0ztCUvDqtXaPzHWVsrLPlx4U1xoVI",
//     authDomain: "fir-7b225.firebaseapp.com",
//     projectId: "fir-7b225",
//     storageBucket: "fir-7b225.firebasestorage.app",
//     messagingSenderId: "76280826398",
//     appId: "1:76280826398:web:c21a2fbda1194ebc30fc0f",
//     measurementId: "G-WGCNRJPLLG"
//   };

  if (!firebaseConfig.apiKey || !firebaseConfig.authDomain) {
    throw new Error('Missing Firebase environment variables');
  }

  const app = initializeApp(firebaseConfig);

  return {
    app,
    auth: getAuth(app),
    firestore: getFirestore(app),
  };
};