// firebase-config.js
// IMPORTANT: Create a Firebase project and replace the placeholder config below.
// After creating the project, enable Authentication (Google) and Firestore.

// Example config - REPLACE with your project's actual values
const firebaseConfig = {
  apiKey: "REPLACE_ME",
  authDomain: "REPLACE_ME.firebaseapp.com",
  projectId: "REPLACE_ME",
  storageBucket: "REPLACE_ME.appspot.com",
  messagingSenderId: "REPLACE_ME",
  appId: "REPLACE_ME"
};

if (!window.firebase || !firebase.apps) {
  console.warn('Firebase SDK not found; ensure scripts loaded.');
} else {
  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    window.FIREBASE_CONFIG = firebaseConfig;
  } catch (e) {
    console.error('Firebase init error', e);
  }
}

// NOTE: Add your domain (e.g., username.github.io) to the Firebase Auth authorized domains.
