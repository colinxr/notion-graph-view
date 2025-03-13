import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <Breadcrumbs />
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <Button>Import Database</Button>
        </div>
        
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
        </div>
        
        <h2 className="text-xl font-semibold mt-6">Recent Activity</h2>
        <div className="rounded-lg border">
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <p className="font-medium">Project Database</p>
              <p className="text-sm text-muted-foreground">Updated 2 hours ago</p>
            </div>
            <Button variant="outline" size="sm">View Graph</Button>
          </div>
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <p className="font-medium">Content Calendar</p>
              <p className="text-sm text-muted-foreground">Updated 5 hours ago</p>
            </div>
            <Button variant="outline" size="sm">View Graph</Button>
          </div>
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">Knowledge Base</p>
              <p className="text-sm text-muted-foreground">Updated 1 day ago</p>
            </div>
            <Button variant="outline" size="sm">View Graph</Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 