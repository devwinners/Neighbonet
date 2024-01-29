// Import the functions you need from the SDKs you need
 import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
 import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-analytics.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
 
const firebaseConfig = {
  apiKey: "AIzaSyBuUPN1d9YvLOXgMv9A0DItNo_IKo2SYew",
  authDomain: "hackathon-handlers.firebaseapp.com",
  projectId: "hackathon-handlers",
  storageBucket: "hackathon-handlers.appspot.com",
  messagingSenderId: "1030547854386",
  appId: "1:1030547854386:web:bd3f2713fb275aef60d82b",
  measurementId: "G-5Y71Q1NXQC"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
export const auth=firebase.auth();
export const db=firebase.firestore();
export const storage=firebase.storage();