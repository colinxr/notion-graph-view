import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function AllGraphsPage() {
  // Mock data for all graphs
  const allGraphs = [
    {
      id: 1,
      title: 'Project Database',
      lastUpdated: '2 hours ago',
      nodes: 24,
      edges: 18,
      category: 'Projects'
    },
    {
      id: 2,
      title: 'Content Calendar',
      lastUpdated: '5 hours ago',
      nodes: 32,
      edges: 28,
      category: 'Content'
    },
    {
      id: 3,
      title: 'Knowledge Base',
      lastUpdated: '1 day ago',
      nodes: 56,
      edges: 42,
      category: 'Knowledge'
    },
    {
      id: 4,
      title: 'Team Organization',
      lastUpdated: '3 days ago',
      nodes: 18,
      edges: 24,
      category: 'Teams'
    },
    {
      id: 5,
      title: 'Product Roadmap',
      lastUpdated: '1 week ago',
      nodes: 42,
      edges: 36,
      category: 'Products'
    },
    {
      id: 6,
      title: 'Client Relationships',
      lastUpdated: '2 weeks ago',
      nodes: 28,
      edges: 46,
      category: 'Clients'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search graphs..."
            className="w-full pl-8"
          />
        </div>
        <div className="flex items-center gap-2">
          <select className="h-10 rounded-md border border-gray-200 bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <option value="">All Categories</option>
            <option value="projects">Projects</option>
            <option value="content">Content</option>
            <option value="knowledge">Knowledge</option>
            <option value="teams">Teams</option>
            <option value="products">Products</option>
            <option value="clients">Clients</option>
          </select>
          <select className="h-10 rounded-md border  border-gray-200 border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <option value="recent">Recently Updated</option>
            <option value="az">A-Z</option>
            <option value="za">Z-A</option>
            <option value="nodes">Most Nodes</option>
          </select>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {allGraphs.map((graph) => (
          <Card key={graph.id} className="overflow-hidden">
            <div 
              className="h-32 bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center"
            >
              <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-medium">{graph.category}</span>
            </div>
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
    </div>
  );
} 