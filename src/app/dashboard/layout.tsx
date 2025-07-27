
'use client';
import { DataProvider } from '@/components/DataContext';
import { ReactNode } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <DataProvider>{children}</DataProvider>
  );
}
