'use client';

import { initializeFirebase } from '@/firebase';
import { FirebaseProvider } from '@/firebase/provider';

const { app, auth, firestore } = initializeFirebase();

export function FirebaseAppProvider({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseProvider value={{ app, auth, firestore }}>
      {children}
    </FirebaseProvider>
  );
}
