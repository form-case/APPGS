// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC_lbi5nlJvS-xij1HcHjhclStMLK3qq38",
  authDomain: "casex-189f4.firebaseapp.com",
  databaseURL: "https://casex-189f4-default-rtdb.firebaseio.com",
  projectId: "casex-189f4",
  storageBucket: "casex-189f4.appspot.com",
  messagingSenderId: "1045250220171",
  appId: "1:1045250220171:web:a1884f31356365c38ef48e",
  measurementId: "G-DDXGRT2F8Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);