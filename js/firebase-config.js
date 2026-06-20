import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAGwNaiqkad8JXQxCCXUFwWOhcYd-s0v38",
  authDomain: "kishan-737a9.firebaseapp.com",
  databaseURL: "https://kishan-737a9-default-rtdb.firebaseio.com",
  projectId: "kishan-737a9",
  storageBucket: "kishan-737a9.firebasestorage.app",
  messagingSenderId: "789225873195",
  appId: "1:789225873195:web:d08202ba3423c1032caf6e",
  measurementId: "G-HDHD6G5MXY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

console.log("Firebase initialized successfully!");

export { app, analytics };
