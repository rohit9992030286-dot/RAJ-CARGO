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
                            <stop offset="0%" style={{stopColor: '#0056b3', stopOpacity: 1}} />
                            <stop offset="100%" style={{stopColor: '#E1AD01', stopOpacity: 1}} />
                        </linearGradient>
                    </defs>
                    
                    {/* Speed Lines */}
                    <path d="M 10,80 L 50,80 M 5,100 L 45,100 M 15,120 L 55,120" stroke="url(#logo-gradient)" strokeWidth="8" strokeLinecap="round" />
                    
                    {/* Trophy Cup */}
                    <path d="M 60,60 Q 110,180 160,60 L 145,50 Q 110,140 75,50 Z" fill="url(#logo-gradient)" />
                    
                    {/* Victory Star */}
                    <path d="M 110,20 L 120,45 L 145,45 L 125,60 L 135,85 L 110,70 L 85,85 L 95,60 L 75,45 L 100,45 Z" fill="#E1AD01" />
                    
                    {/* Trophy Base */}
                    <path d="M 95,160 L 125,160 L 140,185 L 80,185 Z" fill="url(#logo-gradient)" opacity="0.8" />
                    <rect x="105" y="140" width="10" height="25" fill="url(#logo-gradient)" opacity="0.8" />
                </svg>
            </div>
            <div className="flex flex-col leading-none">
                <span className="text-2xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#0056b3] to-[#E1AD01]">
                    YU-WON LOGISTICS
                </span>
            </div>
        </div>
    )
}
