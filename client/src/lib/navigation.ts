// Define types for navigation items
export interface NavigationItem {
  title: string;
  href: string;
  icon?: string;
  external?: boolean;
}

export interface NavigationSection {
  title?: string;
  items: NavigationItem[];
}

// Main navigation items (for the header)
export const mainNavItems: NavigationItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
  {
    title: 'Help',
    href: '/help',
  },
  {
    title: 'Pricing',
    href: '/#pricing',
  },
];

// Dashboard sidebar navigation
export const dashboardNavItems: NavigationSection[] = [
  {
    title: 'Overview',
    items: [
      {
        title: 'Dashboard',
        href: '/dashboard',
      },
    ],
  },
  {
    title: 'Content',
    items: [
      {
        title: 'Databases',
        href: '/dashboard/databases',
      },
      {
        title: 'Graphs',
        href: '/dashboard/graphs',
      },
      {
        title: 'Embeds',
        href: '/dashboard/embeds',
      },
    ],
  },
  {
    title: 'Settings',
    items: [
      {
        title: 'Account',
        href: '/dashboard/settings',
      },
      {
        title: 'Subscription',
        href: '/dashboard/subscription',
      },
    ],
  },
];

// Footer navigation items
export const footerNavItems: NavigationSection[] = [
  {
    title: 'Product',
    items: [
      {
        title: 'Features',
        href: '/#features',
      },
      {
        title: 'Pricing',
        href: '/#pricing',
      },
      {
        title: 'Testimonials',
        href: '/#testimonials',
      },
    ],
  },
  {
    title: 'Resources',
    items: [
      {
        title: 'Documentation',
        href: '/docs',
      },
      {
        title: 'Help Center',
        href: '/help',
      },
    ],
  },
  {
    title: 'Company',
    items: [
      {
        title: 'Privacy',
        href: '/privacy',
      },
      {
        title: 'Terms',
        href: '/terms',
      },
    ],
  },
]; 