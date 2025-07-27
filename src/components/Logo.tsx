
import { Truck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
    className?: string;
}

export function Logo({ className }: LogoProps) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div className="relative">
                <Truck className="h-10 w-10 text-primary filter drop-shadow-md" />
            </div>
            <span className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">
                RAJ CARGO
            </span>
        </div>
    )
}
