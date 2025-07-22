import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCwtCMESqYZc8aqJWDqRu5DR6nX87yCSw4",
  authDomain: "worker-2261e.firebaseapp.com",
  projectId: "worker-2261e",
  storageBucket: "worker-2261e.firebasestorage.app",
  messagingSenderId: "1056182642371",
  appId: "1:1056182642371:web:fc2bc84b55dba8f390a476",
  measurementId: "G-KSEDCG3PLD"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);