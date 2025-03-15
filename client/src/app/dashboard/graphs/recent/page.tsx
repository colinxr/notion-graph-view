import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RecentGraphsPage() {
  // Mock data for recent graphs
  const recentGraphs = [
    {
      id: 1,
      title: 'Project Database',
      lastUpdated: '2 hours ago',
      nodes: 24,
      edges: 18
    },
    {
      id: 2,
      title: 'Content Calendar',
      lastUpdated: '5 hours ago',
      nodes: 32,
      edges: 28
    },
    {
      id: 3,
      title: 'Knowledge Base',
      lastUpdated: '1 day ago',
      nodes: 56,
      edges: 42
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {recentGraphs.map((graph) => (
        <Card key={graph.id} className="overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-blue-400 to-purple-500"></div>
          <CardHeader className="p-4">
            <CardTitle className="text-lg">{graph.title}</CardTitle>
            <p className="text-sm text-muted-foreground">Updated {graph.lastUpdated}</p>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex justify-between text-sm">
              <span>{graph.nodes} nodes</span>
              <span>{graph.edges} connections</span>
            </div>
            <div className="mt-4 flex justify-end">
              <a href={`/dashboard/graphs/${graph.id}`} className="text-blue-600 text-sm font-medium hover:underline">
                View Graph
              </a>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 