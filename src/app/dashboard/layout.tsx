
import { DataProvider } from '@/components/DataContext';
import { AuthProvider } from '@/hooks/useAuth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
        <DataProvider>{children}</DataProvider>
    </AuthProvider>
  );
}
