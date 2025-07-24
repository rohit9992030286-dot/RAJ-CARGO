
import { DataProvider } from '@/components/DataContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DataProvider>{children}</DataProvider>;
}
