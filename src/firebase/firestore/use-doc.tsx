'use client';

import { useState, useEffect } from 'react';
import { onSnapshot } from 'firebase/firestore';
import type { DocumentReference, DocumentData } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface DocState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useDoc<T>(ref: DocumentReference<DocumentData> | null) {
  const [state, setState] = useState<DocState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!ref) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    setState(prevState => ({ ...prevState, loading: true }));

    const unsubscribe = onSnapshot(
      ref,
      (doc) => {
        if (doc.exists()) {
          const data = { id: doc.id, ...doc.data() } as T;
          setState({ data, loading: false, error: null });
        } else {
          setState({ data: null, loading: false, error: null });
        }
      },
      async (err) => {
        // Create the rich, contextual error asynchronously.
        const permissionError = new FirestorePermissionError({
            path: ref.path,
            operation: 'get',
        });

        // Emit the error with the global error emitter
        // Do not use console.error() as it is handled centrally.
        errorEmitter.emit('permission-error', permissionError);
        setState({ data: null, loading: false, error: permissionError });
      }
    );

    return () => unsubscribe();
  }, [ref]);

  return state;
}
