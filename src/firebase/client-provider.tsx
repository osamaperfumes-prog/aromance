'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { getDatabase } from 'firebase/database';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    // Initialize Firebase on the client side, once per component mount.
    const { firebaseApp, auth } = initializeFirebase();
    // Get Realtime Database instance
    const database = getDatabase(firebaseApp);
    return { firebaseApp, auth, database };
  }, []); // Empty dependency array ensures this runs only once

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      database={firebaseServices.database}
    >
      {children}
    </FirebaseProvider>
  );
}
