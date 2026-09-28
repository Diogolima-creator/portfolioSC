import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL
};

export const app = initializeApp(firebaseConfig);
// Initialize these services only when a questionnaire route needs them.
// The public portfolio must also render without local Firebase credentials.
export function getFirebaseDatabase() {
  if (!firebaseConfig.databaseURL && !firebaseConfig.projectId) {
    throw new Error('Configure VITE_FIREBASE_DATABASE_URL or VITE_FIREBASE_PROJECT_ID to use questionnaires.');
  }
  return getDatabase(app);
}

export function getFirebaseStorage() {
  if (!firebaseConfig.storageBucket) {
    throw new Error('Configure VITE_FIREBASE_STORAGE_BUCKET to upload questionnaire files.');
  }
  return getStorage(app);
}
