'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import type { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      console.error(error.message); // Log the detailed message to the console for devs
      
      // Optionally, show a generic toast to the user in production
      if (process.env.NODE_ENV === 'production') {
        toast({
            variant: "destructive",
            title: "Access Denied",
            description: "You do not have permission to perform this action.",
        });
      } else {
         // In development, throw it to let Next.js overlay handle it
         throw error;
      }
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  return null;
}
