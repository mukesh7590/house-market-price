// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
   apiKey: "AIzaSyDlZvmo6YevbTiN1YIuWyae9FeSwkv9qns",
   authDomain: "house-marketplace-app-675f8.firebaseapp.com",
   projectId: "house-marketplace-app-675f8",
   storageBucket: "house-marketplace-app-675f8.appspot.com",
   messagingSenderId: "954027755349",
   appId: "1:954027755349:web:d15de8f9b793c55ed351dc",
};

// Initialize Firebase
initializeApp(firebaseConfig);

export const db = getFirestore();
