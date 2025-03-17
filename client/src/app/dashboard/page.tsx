'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ImportDatabaseModal } from '@/components/databases/import-modal';

export default function DashboardPage() {
  const [showOwnedOnly, setShowOwnedOnly] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  // const { data: graphs, isLoading: graphsLoading, error: graphsError } = useGraphs(showOwnedOnly);
  // const { data: databases, isLoading: databasesLoading, error: databasesError } = useDatabases();

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button
            onClick={() => setShowOwnedOnly(!showOwnedOnly)}
            variant="outline"
          >
            {showOwnedOnly ? 'Show All Graphs' : 'Show My Graphs Only'}
          </Button>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Button>Create New Graph</Button>
            <Button 
              variant="outline"
              onClick={() => setIsImportModalOpen(true)}
            >
              Import Notion Database
            </Button>
            <Button variant="outline">View Recent Graphs</Button>
          </div>
        </Card>
      </div>

      <ImportDatabaseModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </>
  );
} 