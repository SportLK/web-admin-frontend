import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from './components/AppShell';

export const metadata: Metadata = {
  title: 'SportLK — Admin Dashboard (Member 4)',
  description: 'Grassroots Sports Portal - Match, Live Score, Venue & Statistics Administration',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
