import type { Metadata } from "next";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "Poll App",
  description: "Create and vote on polls",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-background text-foreground font-sans">
        <AuthProvider>
          <SiteNav />
          <div className="container mx-auto px-4 py-6">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
