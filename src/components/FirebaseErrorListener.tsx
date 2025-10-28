'use client';

import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

// A generic error superclass could be defined if more specific error types emerge.
// For now, we listen for any object that looks like an error.
interface EmittedError {
  name: string;
  message: string;
  stack?: string;
}

/**
 * An invisible component that listens for globally emitted 'permission-error' events.
 * It throws any received error to be caught by Next.js's global-error.tsx.
 */
export function FirebaseErrorListener() {
  const [error, setError] = useState<EmittedError | null>(null);

  useEffect(() => {
    // The callback now expects a strongly-typed error, matching the event payload.
    const handleError = (error: EmittedError) => {
      // Set error in state to trigger a re-render.
      setError(error);
    };

    // The typed emitter will enforce that the callback for 'permission-error'
    // matches the expected payload type.
    errorEmitter.on('permission-error', handleError);

    // Unsubscribe on unmount to prevent memory leaks.
    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  // On re-render, if an error exists in state, throw it.
  if (error) {
    // Re-construct the error object to ensure it has a proper prototype chain.
    const errorToThrow = new Error(error.message);
    errorToThrow.name = error.name;
    errorToThrow.stack = error.stack;
    throw errorToThrow;
  }

  // This component renders nothing.
  return null;
}
