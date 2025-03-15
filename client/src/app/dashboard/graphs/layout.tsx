'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Plus, Edit } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function GraphsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Graphs</h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" /> New Graph
          </Button>
          <Button>
            <Edit className="mr-2 h-4 w-4" /> Edit Graph
          </Button>
        </div>
      </div>
      
      <Tabs 
        defaultValue={
          pathname.includes('recent') ? 'recent' : 
          pathname.includes('/all') ? 'all' : 
          pathname.includes('/shared') ? 'shared' : 'recent'
        } 
        className="w-full"
      >
        <TabsList className="mb-6">
          <Link href="/dashboard/graphs/recent" passHref>
            <TabsTrigger
              value="recent"
              className={cn(
                pathname.includes('/recent') ? 'bg-muted' : ''
              )}
            >
              Recent
            </TabsTrigger>
          </Link>
          <Link href="/dashboard/graphs/all" passHref>
            <TabsTrigger
              value="all"
              className={cn(
                pathname.includes('/all') ? 'bg-muted' : ''
              )}
            >
              All Graphs
            </TabsTrigger>
          </Link>
          <Link href="/dashboard/graphs/shared" passHref>
            <TabsTrigger
              value="shared"
              className={cn(
                pathname.includes('/shared') ? 'bg-muted' : ''
              )}
            >
              Shared
            </TabsTrigger>
          </Link>
        </TabsList>
      </Tabs>
      
      {children}
    </div>
  );
} 