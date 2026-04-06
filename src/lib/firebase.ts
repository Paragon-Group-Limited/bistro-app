// ============================================
// Firebase Configuration
// Replace these values with your Firebase project config.
// Get them from: Firebase Console → Project Settings → General → Your Apps → Web App
// ============================================

import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// Only initialize if config is present
const app = firebaseConfig.apiKey ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;

// Check if Firebase is configured
export function isFirebaseConfigured(): boolean {
  return !!firebaseConfig.apiKey;
}

// Set up invisible reCAPTCHA verifier
export function setupRecaptcha(buttonId: string): RecaptchaVerifier | null {
  if (!auth) return null;
  
  const verifier = new RecaptchaVerifier(auth, buttonId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved
    },
  });
  return verifier;
}

// Send OTP to phone number
export async function sendOtp(
  phoneNumber: string,
  recaptchaVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  if (!auth) throw new Error('Firebase not configured');
  
  // Ensure phone number has country code
  const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+88${phoneNumber}`;
  
  return signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
}

// Verify OTP code
export async function verifyOtp(
  confirmationResult: ConfirmationResult,
  code: string
) {
  const result = await confirmationResult.confirm(code);
  return result.user;
}

// Sign out
export async function firebaseSignOut() {
  if (auth) await auth.signOut();
}

export { auth };
