
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
                    {/* Left Wing */}
                    <path 
                        d="M20 23C26 20 28 22 30 25L30 39C28 42 26 44 20 41Z"
                        stroke="hsl(var(--primary))" 
                        strokeWidth="2.5" 
                        fill="hsl(var(--primary) / 0.1)"
                        strokeLinejoin='round'
                        strokeLinecap='round'
                    />
                     {/* Right Wing */}
                    <path 
                        d="M44 23C38 20 36 22 34 25L34 39C36 42 38 44 44 41Z" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth="2.5" 
                        fill="hsl(var(--primary) / 0.1)"
                        strokeLinejoin='round'
                        strokeLinecap='round'
                    />
                </svg>
                 <Truck className="h-7 w-7 text-primary" strokeWidth="2.5" />
            </div>
            <span className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">
                RAJ CARGO
            </span>
        </div>
    )
}
