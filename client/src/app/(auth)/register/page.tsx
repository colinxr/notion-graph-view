'use client';

import { SignUp } from '@clerk/nextjs';
import { Card, CardContent } from '@/components/ui/card';

export default function RegisterPage() {
  return (
    <Card className="w-full">
      <CardContent className="p-0">
        <SignUp routing="hash" />
      </CardContent>
    </Card>
  );
}