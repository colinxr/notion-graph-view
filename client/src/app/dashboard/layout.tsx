'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  Settings,
  BarChart2,
  Menu,
  ChevronDown,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { SignOutButton } from '@clerk/nextjs';
import { Toaster } from 'sonner'

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('Home');
  const [graphsExpanded, setGraphsExpanded] = useState(false);
  const [settingsExpanded, setSettingsExpanded] = useState(false);

  // Update active section and expanded sections based on pathname
  useEffect(() => {
    if (pathname.includes('/dashboard/graphs')) {
      setActiveSection('Graphs');
      setGraphsExpanded(true);
    } else if (pathname.includes('/dashboard/settings')) {
      setActiveSection('Settings');
      setSettingsExpanded(true);
    } else {
      setActiveSection('Home');
    }
  }, [pathname]);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  // Get page title based on the pathname
  // const getPageTitle = () => {
  //   if (pathname === '/dashboard') return 'Dashboard';
  //   if (pathname.includes('/dashboard/graphs')) return 'Graphs';
  //   if (pathname.includes('/dashboard/settings')) return 'Settings';
  //   return 'Dashboard';
  // };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 z-20 flex h-full flex-col border-r bg-white transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            {!collapsed && <span className="font-bold text-xl">AntBlocks UI</span>}
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="h-8 w-8"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
        
        <Separator />
        
        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-3 py-2">
            <Link
              href="/dashboard"
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                activeSection === 'Home' ? "text-blue-600 bg-blue-50" : "hover:bg-slate-100"
              )}
            >
              <Home className="mr-2 h-4 w-4" />
              {!collapsed && <span>Home</span>}
            </Link>
          </div>
          
          {/* Graphs Section */}
          <div className="px-3 py-2">
            <button
              onClick={() => setGraphsExpanded(!graphsExpanded)}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-100",
                activeSection === 'Graphs' && "text-blue-600"
              )}
            >
              <div className="flex items-center">
                <BarChart2 className="mr-2 h-4 w-4" />
                {!collapsed && <span>Graphs</span>}
              </div>
              {!collapsed && (
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    graphsExpanded ? "rotate-180" : ""
                  )}
                />
              )}
            </button>
            
            {graphsExpanded && !collapsed && (
              <div className="mt-2 space-y-1 pl-6">
                <Link
                  href="/dashboard/graphs/recent"
                  className={cn(
                    "block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-slate-100",
                    pathname === '/dashboard/graphs/recent' && "bg-slate-100"
                  )}
                >
                  Recent
                </Link>
                <Link
                  href="/dashboard/graphs/all"
                  className={cn(
                    "block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-slate-100",
                    pathname === '/dashboard/graphs/all' && "bg-slate-100"
                  )}
                >
                  All Graphs
                </Link>
                <Link
                  href="/dashboard/graphs/shared"
                  className={cn(
                    "block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-slate-100",
                    pathname === '/dashboard/graphs/shared' && "bg-slate-100"
                  )}
                >
                  Shared
                </Link>
              </div>
            )}
          </div>
          
          {/* Settings Section */}
          <div className="px-3 py-2">
            <button
              onClick={() => setSettingsExpanded(!settingsExpanded)}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-100",
                activeSection === 'Settings' && "text-blue-600"
              )}
            >
              <div className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                {!collapsed && <span>Settings</span>}
              </div>
              {!collapsed && (
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    settingsExpanded ? "rotate-180" : ""
                  )}
                />
              )}
            </button>
            
            {settingsExpanded && !collapsed && (
              <div className="mt-2 space-y-1 pl-6">
                <Link
                  href="/dashboard/settings/profile"
                  className={cn(
                    "block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-slate-100",
                    pathname === '/dashboard/settings/profile' && "bg-slate-100"
                  )}
                >
                  Profile
                </Link>
                <Link
                  href="/dashboard/settings/account"
                  className={cn(
                    "block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-slate-100",
                    pathname === '/dashboard/settings/account' && "bg-slate-100"
                  )}
                >
                  Account
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* User Profile */}
        <div className="sticky bottom-0 border-t bg-white p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-2 rounded-md p-2 hover:bg-slate-100">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/natalie-wilson.jpg" alt="Natalie Wilson" />
                  <AvatarFallback>NW</AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex flex-1 items-center justify-between">
                    <span className="text-sm font-medium">Natalie Wilson</span>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings/account">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <SignOutButton />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
      
      {/* Main Content */}
      <main 
        className={cn(
          "flex-1 transition-all duration-300 p-6",
          collapsed ? "ml-16" : "ml-64"
        )}
      >
        <div className="mx-auto w-full max-w-7xl">
          {/* Content */}
          <div className="rounded-lg p-6">
            {children}
          </div>
        </div>
      </main>
      <Toaster position="bottom-right" />
    </div>
  );
} 