'use client';

import { SignIn } from '@clerk/nextjs';
import { Card, CardContent } from '@/components/ui/card';

export default function LoginPage() {
  return (
    <Card className="w-full">
      <CardContent className="p-0">
        <SignIn routing="hash" />
      </CardContent>
    </Card>
  );
} 