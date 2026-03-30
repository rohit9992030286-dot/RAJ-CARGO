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
                    
                    {/* Winning V / Trophy Cup */}
                    <path d="M 40,60 Q 100,180 160,60 L 145,50 Q 100,140 55,50 Z" fill="url(#logo-gradient)" />
                    
                    {/* Victory Star (Achievement) */}
                    <path d="M 100,20 L 110,45 L 135,45 L 115,60 L 125,85 L 100,70 L 75,85 L 85,60 L 65,45 L 90,45 Z" fill="#E1AD01" />
                    
                    {/* Trophy Stem/Base */}
                    <path d="M 85,160 L 115,160 L 130,185 L 70,185 Z" fill="url(#logo-gradient)" opacity="0.8" />
                    <rect x="95" y="140" width="10" height="25" fill="url(#logo-gradient)" opacity="0.8" />

                </svg>
            </div>
            <span className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#0056b3] via-[#0056b3] to-[#E1AD01]">
                YU-WON LOGISTICS
            </span>
        </div>
    )
}
