import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function SharedGraphsPage() {
  // Mock data for shared graphs
  const sharedGraphs = [
    {
      id: 1,
      title: 'Marketing Team Projects',
      lastUpdated: '1 day ago',
      nodes: 32,
      edges: 27,
      sharedBy: {
        name: 'Alex Johnson',
        avatar: '/avatars/alex.jpg',
        initials: 'AJ'
      }
    },
    {
      id: 2,
      title: 'Q4 Planning',
      lastUpdated: '3 days ago',
      nodes: 18,
      edges: 22,
      sharedBy: {
        name: 'Sam Parker',
        avatar: '/avatars/sam.jpg',
        initials: 'SP'
      }
    },
    {
      id: 3,
      title: 'Product Development Roadmap',
      lastUpdated: '1 week ago',
      nodes: 45,
      edges: 38,
      sharedBy: {
        name: 'Jamie Lee',
        avatar: '/avatars/jamie.jpg',
        initials: 'JL'
      }
    },
  ];

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Graphs shared with you by team members and collaborators.
      </p>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sharedGraphs.map((graph) => (
          <Card key={graph.id} className="overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-indigo-400 to-cyan-500"></div>
            <CardHeader className="p-4">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{graph.title}</CardTitle>
                <Avatar className="h-6 w-6">
                  <AvatarImage src={graph.sharedBy.avatar} alt={graph.sharedBy.name} />
                  <AvatarFallback>{graph.sharedBy.initials}</AvatarFallback>
                </Avatar>
              </div>
              <div className="flex justify-between text-sm">
                <p className="text-sm text-muted-foreground">Updated {graph.lastUpdated}</p>
                <p className="text-sm text-muted-foreground">Shared by {graph.sharedBy.name}</p>
              </div>
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