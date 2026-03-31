import type {Metadata} from 'next';
import Image from 'next/image';
// Style Version: 3 - Updated theme colors
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/hooks/useAuth.tsx';
import { GlobalKeyboardShortcuts } from '@/components/GlobalKeyboardShortcuts';

export const metadata: Metadata = {
  title: 'YU-WON LOGISTICS',
  description: 'Victory-driven transport and courier service',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"></link>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="theme-color" content="#0056b3" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for(let registration of registrations) {
                    registration.unregister();
                  }
                }).catch(function(err) {
                  console.log('Service Worker unregistration failed: ', err);
                });
              }
            `,
          }}
        />
      </head>
      <body className="font-body antialiased bg-background">
          <AuthProvider>
            <GlobalKeyboardShortcuts />
            {children}
          </AuthProvider>
          <Toaster />
      </body>
    </html>
  );
}
