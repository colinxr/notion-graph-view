'use client';

import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function NotionCallbackPage() {
  const { isLoaded, signIn } = useSignIn();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    // Process the OAuth callback
    const handleCallback = async () => {
      try {
        await signIn.reload();
        
        const { status, firstFactorVerification } = signIn;
        
        if (status === 'complete') {
          // Redirect to dashboard if authentication is successful
          router.push('/dashboard');
        } else {
          console.error('Authentication not complete:', status, firstFactorVerification);
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
      }
    };

    handleCallback();
  }, [isLoaded, signIn, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h1 className="text-2xl font-bold">Connecting to Notion...</h1>
        <p className="text-muted-foreground">
          Please wait while we complete the authentication process.
        </p>
      </div>
    </div>
  );
} 