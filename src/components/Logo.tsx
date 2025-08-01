
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
                    viewBox="0 0 200 200" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute"
                >
                    <defs>
                        <linearGradient id="wing-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{stopColor: 'hsl(var(--primary))', stopOpacity: 1}} />
                            <stop offset="100%" style={{stopColor: 'hsl(var(--primary) / 0.5)', stopOpacity: 1}} />
                        </linearGradient>
                         <linearGradient id="body-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{stopColor: 'hsl(var(--primary) / 0.8)', stopOpacity: 1}} />
                            <stop offset="100%" style={{stopColor: 'hsl(var(--primary) / 0.3)', stopOpacity: 1}} />
                        </linearGradient>
                    </defs>
                    
                    {/* Bottom Wing */}
                    <path d="M 50,150 Q 90,110 150,130 L 110,180 Q 80,170 50,150 Z" fill="url(#body-gradient)" />
                    
                    {/* Top Wing */}
                    <path d="M 30,100 Q 100,20 180,80 L 130,140 Q 80,110 30,100 Z" fill="url(#wing-gradient)" />

                </svg>
            </div>
            <span className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">
                RAJ CARGO
            </span>
        </div>
    )
}
