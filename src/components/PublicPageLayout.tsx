
'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function PublicPageLayout({ children, title, description }: { children: ReactNode, title: string, description: string }) {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <header className="w-full bg-card/80 dark:bg-background/80 backdrop-blur-sm z-10 border-b">
                <nav className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/">
                            <Logo />
                        </Link>
                        <Link href="/">
                            <Button variant="ghost">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Home
                            </Button>
                        </Link>
                    </div>
                </nav>
            </header>
            <main className="flex-grow w-full max-w-5xl mx-auto py-12 px-4">
                <div className="p-6 rounded-xl bg-card/80 backdrop-blur-sm border">
                     <h1 className="text-4xl font-bold">{title}</h1>
                     <p className="text-muted-foreground mt-2 text-lg">{description}</p>
                </div>
                <div className="mt-8 p-6 rounded-xl bg-card/80 backdrop-blur-sm border">
                    {children}
                </div>
            </main>
             <footer className="text-center p-4 text-sm text-muted-foreground border-t bg-card/80 backdrop-blur-sm">
                <p>&copy; {new Date().getFullYear()} RAJ CARGO. All rights reserved.</p>
            </footer>
        </div>
    );
}
