import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import Sidebar from '@/components/layout/Sidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';
import { createServerSupabaseClient } from '@/lib/supabase/server'; // Import the centralized server client
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/database.types';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Unipay | University Payroll System",
  description: "A comprehensive university payroll management system.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createServerSupabaseClient(); // Use the centralized server client

  const { data: { user } } = await supabase.auth.getUser();
  let userRole: string | undefined;
  if (user) {
    const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', user.id).single();
    userRole = profile?.role || '';
  }

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen bg-gray-100 dark:bg-gray-900`}>
      {user && <Sidebar />}
      <div className="flex flex-col flex-1 overflow-x-hidden">
        {user && <DashboardHeader userRole={userRole} />}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-800">
          {children}
        </main>
      </div>
    </div>
  );
}