'use client';

import { cn } from '@/lib/utils';

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
                        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{stopColor: '#0056b3', stopOpacity: 1}} /> {/* Corporate Blue */}
                            <stop offset="100%" style={{stopColor: '#E1AD01', stopOpacity: 1}} /> {/* Professional Gold */}
                        </linearGradient>
                    </defs>
                    
                    {/* Bottom Wing */}
                    <path d="M 50,150 Q 90,110 150,130 L 110,180 Q 80,170 50,150 Z" fill="url(#logo-gradient)" fillOpacity="0.6" />
                    
                    {/* Top Wing */}
                    <path d="M 30,100 Q 100,20 180,80 L 130,140 Q 80,110 30,100 Z" fill="url(#logo-gradient)" />

                </svg>
            </div>
            <span className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#0056b3] via-[#0056b3] to-[#E1AD01]">
                RAJ CARGO
            </span>
        </div>
    )
}