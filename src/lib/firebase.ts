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

const app = firebaseConfig.apiKey ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;

export function isFirebaseConfigured(): boolean {
  return !!firebaseConfig.apiKey;
}

export function setupRecaptcha(buttonId: string): RecaptchaVerifier | null {
  if (!auth) return null;
  const verifier = new RecaptchaVerifier(auth, buttonId, { size: 'invisible', callback: () => {} });
  return verifier;
}

export async function sendOtp(
  phoneNumber: string,
  recaptchaVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  if (!auth) throw new Error('Firebase not configured');
  // Default to Bangladesh country code (+88) if none provided
  const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+88${phoneNumber}`;
  return signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
}

export async function verifyOtp(
  confirmationResult: ConfirmationResult,
  code: string
) {
  const result = await confirmationResult.confirm(code);
  return result.user;
}

export async function firebaseSignOut() {
  if (auth) await auth.signOut();
}
