'use client';

import { useState } from 'react';
import { useGraphs } from '@/hooks/use-graph-data';
import { useDatabases } from '@/hooks/use-databases';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const [showOwnedOnly, setShowOwnedOnly] = useState(false);
  const { data: graphs, isLoading: graphsLoading, error: graphsError } = useGraphs(showOwnedOnly);
  const { data: databases, isLoading: databasesLoading, error: databasesError } = useDatabases();

  return (
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Graphs</h2>
            {graphsLoading ? (
              <p>Loading graphs...</p>
            ) : graphsError ? (
              <p className="text-red-500">Error loading graphs: {graphsError.message}</p>
            ) : graphs && graphs.length > 0 ? (
              <ul className="space-y-2">
                {graphs.slice(0, 5).map((graph) => (
                  <li key={graph.id} className="p-2 hover:bg-muted rounded-md">
                    <div className="font-medium">{graph.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {graph.nodeCount} nodes • {graph.edgeCount} edges
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No graphs found. Create your first graph to get started.</p>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Notion Databases</h2>
            {databasesLoading ? (
              <p>Loading databases...</p>
            ) : databasesError ? (
              <p className="text-red-500">Error loading databases: {databasesError.message}</p>
            ) : databases && databases.length > 0 ? (
              <ul className="space-y-2">
                {databases.slice(0, 5).map((database) => (
                  <li key={database.id} className="p-2 hover:bg-muted rounded-md">
                    <div className="font-medium">{database.title}</div>
                    <div className="text-sm text-muted-foreground">
                      Workspace: {database.workspaceName}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No databases found. Connect your Notion account to get started.</p>
            )}
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Button>Create New Graph</Button>
            <Button variant="outline">Import Notion Database</Button>
            <Button variant="outline">View Recent Graphs</Button>
          </div>
        </Card>
      </div>
  );
} 