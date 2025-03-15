import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Notion Graph View",
  description: "Visualize relationships between Notion pages in an interactive graph",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
