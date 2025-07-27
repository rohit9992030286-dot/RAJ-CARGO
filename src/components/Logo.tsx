
import { cn } from '@/lib/utils';
import { Plane, Truck } from 'lucide-react';

interface LogoProps {
    className?: string;
}

export function Logo({ className }: LogoProps) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div className="relative flex items-center justify-center h-12 w-12">
                <svg width="100%" height="100%" viewBox="0 0 100 100" className="absolute filter drop-shadow-md">
                    {/* Background Circle */}
                    <circle cx="50" cy="50" r="48" fill="hsl(var(--primary) / 0.1)" stroke="hsl(var(--primary))" strokeWidth="2"/>

                    {/* Horizon/Road line */}
                    <line x1="10" y1="65" x2="90" y2="65" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" />

                    {/* Wing elements */}
                    <path d="M15 50 Q 25 40 50 30" fill="none" stroke="hsl(var(--accent-foreground))" strokeWidth="3" strokeLinecap="round"/>
                    <path d="M85 50 Q 75 40 50 30" fill="none" stroke="hsl(var(--accent-foreground))" strokeWidth="3" strokeLinecap="round"/>
                </svg>

                {/* Icons positioned over the SVG */}
                <Plane className="h-6 w-6 text-primary absolute" style={{ top: '20%', left: '50%', transform: 'translateX(-50%)' }} />
                <Truck className="h-6 w-6 text-primary absolute" style={{ top: '55%', left: '50%', transform: 'translate(-50%, -50%)' }}/>
            </div>
            <span className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">
                RAJ CARGO
            </span>
        </div>
    )
}
