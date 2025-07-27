
import { Truck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
    className?: string;
}

export function Logo({ className }: LogoProps) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            <Truck className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary tracking-tight">SWIFTWAY</span>
        </div>
    )
}
