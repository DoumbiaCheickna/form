import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDq0B-y0VB3O8COblqDkuzkGNh2vR20S3U",
  authDomain: "drop-5096a.firebaseapp.com",
  projectId: "drop-5096a",
  storageBucket: "drop-5096a.appspot.com",
  messagingSenderId: "521360347017",
  appId: "1:521360347017:web:7c5d579de51cf63cf5db58",
  measurementId: "G-XG6K1Q9SB7"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
