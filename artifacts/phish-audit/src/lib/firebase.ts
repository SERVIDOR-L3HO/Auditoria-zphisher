import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCAGrsMjwPLIaDbExIUYVg35QS1kssXDH4",
  authDomain: "ultragol-api.firebaseapp.com",
  projectId: "ultragol-api",
  storageBucket: "ultragol-api.firebasestorage.app",
  messagingSenderId: "62425304873",
  appId: "1:62425304873:web:8107eb3991c50a5be43138",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
