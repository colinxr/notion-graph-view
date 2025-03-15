import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Databases</CardTitle>
          <CardDescription>Your connected Notion databases</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">3</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Graphs</CardTitle>
          <CardDescription>Your created graph visualizations</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">5</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Embeds</CardTitle>
          <CardDescription>Your embedded graphs</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">2</p>
        </CardContent>
      </Card>
    
      <div className="md:col-span-2 lg:col-span-3">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="rounded-lg border border-border">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div>
              <p className="font-medium">Project Database</p>
              <p className="text-sm text-muted-foreground">Updated 2 hours ago</p>
            </div>
            <a href="/dashboard/graphs/view" className="text-blue-600 text-sm font-medium hover:underline">
              View Graph
            </a>
          </div>
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div>
              <p className="font-medium">Content Calendar</p>
              <p className="text-sm text-muted-foreground">Updated 5 hours ago</p>
            </div>
            <a href="/dashboard/graphs/view" className="text-blue-600 text-sm font-medium hover:underline">
              View Graph
            </a>
          </div>
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">Knowledge Base</p>
              <p className="text-sm text-muted-foreground">Updated 1 day ago</p>
            </div>
            <a href="/dashboard/graphs/view" className="text-blue-600 text-sm font-medium hover:underline">
              View Graph
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 