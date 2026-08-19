import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDTA03MwZrAocP9OVcSA3kHI9rIchDYdJM",
  authDomain: "diptyque-ecommerce.firebaseapp.com",
  projectId: "diptyque-ecommerce",
  storageBucket: "diptyque-ecommerce.firebasestorage.app",
  messagingSenderId: "158445928824",
  appId: "1:158445928824:web:7af46ac700cb7a6ec7c88d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth and Firestore services
export const auth = getAuth(app);
export const db = getFirestore(app);
