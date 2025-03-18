// Import the Firebase SDK components we need
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBXFuHbCQqwg5sZYcpHmxMvU9NdvJx-BLw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "paulocell-sistema.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "paulocell-sistema",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "paulocell-sistema.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1098765432",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1098765432:web:abc123def456ghi789jkl"
  // Removed measurementId as it's not required for basic auth
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Create a Google Auth Provider instance
const googleProvider = new GoogleAuthProvider();
// Configure Google provider settings with all necessary parameters
googleProvider.setCustomParameters({
  prompt: 'select_account',
  // Adding these parameters to ensure proper OAuth flow - make sure access_type is a string
  access_type: 'offline',
  include_granted_scopes: 'true' // Changed to string instead of boolean
});
// Add necessary scopes for the application
googleProvider.addScope('profile');
googleProvider.addScope('email');

export { auth, googleProvider };
