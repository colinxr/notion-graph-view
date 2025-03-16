import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/layout/footer';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="py-12 md:py-24 lg:py-32">
          <div className="container mx-auto flex flex-col items-center gap-4 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              Visualize your Notion pages in an interactive graph
            </h1>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              Discover connections between your Notion pages, track relationships, and uncover insights with our powerful graph visualization tool.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button size="lg">Get Started</Button>
              <Button size="lg" variant="outline">Learn More</Button>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-24 lg:py-32 bg-muted/40">
          <div className="container mx-auto">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-lg border border-gray-200 bg-card p-6 shadow-sm">
                <h3 className="text-xl font-semibold">Connect with Notion</h3>
                <p className="text-muted-foreground mt-2">
                  Seamlessly connect to your Notion workspace and select the databases to visualize.
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-card p-6 shadow-sm">
                <h3 className="text-xl font-semibold">Visualize Relationships</h3>
                <p className="text-muted-foreground mt-2">
                  See how your Notion pages connect to each other in an interactive graph visualization.
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-card p-6 shadow-sm">
                <h3 className="text-xl font-semibold">Embed Anywhere</h3>
                <p className="text-muted-foreground mt-2">
                  Embed your graph visualizations directly into your Notion pages for easy reference.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
