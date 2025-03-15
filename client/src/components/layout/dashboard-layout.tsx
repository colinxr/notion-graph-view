import { ReactNode } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Navbar } from '@/components/navigation/navbar';
import { Sidebar } from '@/components/navigation/sidebar';
import { Footer } from '@/components/layout/footer';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ProtectedRoute>  
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-6 md:p-8">
            {children}
          </main>
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  );
} 