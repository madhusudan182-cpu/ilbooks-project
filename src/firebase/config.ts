export const firebaseConfig = {
  apiKey: "AIzaSyCn-akbdFtUis55j6HAhxwQtpYTKJJ6uU0",
  authDomain: "studio-7175103333-eb9b0.firebaseapp.com",
  projectId: "studio-7175103333-eb9b0",
  storageBucket: "studio-7175103333-eb9b0.firebasestorage.app",
  messagingSenderId: "131580562261",
  appId: "1:131580562261:web:7cdabf3a3a94310504fddc",
  measurementId: ""
};

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
