
import type {Metadata} from 'next';
import Image from 'next/image';
// Style Version: 2 - This comment helps ensure style changes are picked up.
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/hooks/useAuth.tsx';
import { GlobalKeyboardShortcuts } from '@/components/GlobalKeyboardShortcuts';

export const metadata: Metadata = {
  title: 'RAJ CARGO',
  description: 'Transport and courier service',
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
        <meta name="theme-color" content="#29ABE2" />
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
          <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden">
            <Image
                src="https://images.unsplash.com/photo-1554189097-90d3aa583c26?q=80&w=2940&auto=format&fit=crop"
                alt="Abstract background"
                data-ai-hint="abstract background"
                fill
                className="object-cover opacity-10 dark:opacity-[0.03]"
                quality={90}
                priority
            />
          </div>
          <AuthProvider>
            <GlobalKeyboardShortcuts />
            {children}
          </AuthProvider>
          <Toaster />
      </body>
    </html>
  );
}
