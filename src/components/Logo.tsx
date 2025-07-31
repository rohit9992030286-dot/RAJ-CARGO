
'use client';

import { cn } from '@/lib/utils';
import { Truck } from 'lucide-react';

interface LogoProps {
    className?: string;
}

export function Logo({ className }: LogoProps) {
    return (
        <div className={cn("flex items-center gap-3", className)}>
            <div className="relative h-12 w-12 flex items-center justify-center">
                <svg 
                    width="48" 
                    height="48" 
                    viewBox="0 0 64 64" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute"
                >
                    <path d="M20 16H36C42.6274 16 48 21.3726 48 28C48 34.6274 42.6274 40 36 40H28L44 48" stroke="hsl(var(--primary))" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 48L28 40" stroke="hsl(var(--primary))" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M44 16H52" stroke="hsl(var(--primary) / 0.5)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                     <path d="M40 24H48" stroke="hsl(var(--primary) / 0.5)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
            <span className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">
                RAJ CARGO
            </span>
        </div>
    )
}
