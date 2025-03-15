'use client';

import Link from 'next/link';
import { OAuthButton } from '@/components/auth/oauth-button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if already signed in
  useEffect(() => {
    if (isLoaded && userId) {
      router.push('/dashboard');
    }
  }, [isLoaded, userId, router]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Sign In</CardTitle>
        <CardDescription>
          Connect your Notion account to visualize your databases as graphs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <OAuthButton provider="notion" />
        
        <div className="relative flex items-center justify-center text-xs">
          <span className="bg-background px-2 text-muted-foreground">
            Notion is the only authentication method supported
          </span>
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-center text-sm">
          By signing in, you agree to our{' '}
          <Link href="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
} 