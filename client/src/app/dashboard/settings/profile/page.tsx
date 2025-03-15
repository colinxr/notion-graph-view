'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

export default function ProfilePage() {
  const [name, setName] = useState('Natalie Wilson');
  const [email, setEmail] = useState('natalie@example.com');
  const [bio, setBio] = useState('Product Designer at AntBlocks UI');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Profile update:', { name, email, bio });
    // Add save logic here
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your personal information</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Full Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="bio" className="text-sm font-medium">
              Bio
            </label>
            <textarea
              id="bio"
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit">Save Changes</Button>
        </CardFooter>
      </form>
    </Card>
  );
} 