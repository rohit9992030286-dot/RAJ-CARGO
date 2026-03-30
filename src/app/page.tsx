'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useWaybills } from '@/hooks/useWaybills';
import { Waybill } from '@/types/waybill';
import { Search, Package, CheckCircle, Truck, XCircle, Loader2, ArrowRight, LogIn, Info, FileText, Star } from 'lucide-react';
import { DataProvider } from '@/components/DataContext';
import { format } from 'date-fns';
import { Logo } from '@/components/Logo';
import { cn } from '@/lib/utils';

function TrackingResult({ waybill }: { waybill: Waybill }) {
    const statusInfo = {
        'Pending': { icon: Package, color: 'text-slate-500', description: 'Your shipment has been booked and is awaiting dispatch.' },
        'In Transit': { icon: Truck, color: 'text-blue-600', description: 'The shipment is currently in transit between hubs.' },
        'Out for Delivery': { icon: ArrowRight, color: 'text-primary', description: 'Your package is out with our delivery partner for final delivery.' },
        'Delivered': { icon: CheckCircle, color: 'text-green-600', description: 'Shipment successfully delivered.' },
        'Cancelled': { icon: XCircle, color: 'text-red-600', description: 'This shipment has been cancelled.' },
        'Returned': { icon: XCircle, color: 'text-red-600', description: 'The shipment has been returned to the origin.' }
    };

    const currentStatus = statusInfo[waybill.status] || statusInfo['Pending'];
    const Icon = currentStatus.icon;

    return (
        <Card className="mt-8 bg-card/90 backdrop-blur-sm border-primary/20 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
            <CardHeader className="border-b bg-muted/30">
                <CardTitle className="flex items-center gap-4">
                    <div className={cn("p-3 rounded-full bg-white shadow-sm", currentStatus.color)}>
                        <Icon className="h-8 w-8" />
                    </div>
                    <div>
                        <p className="text-xs uppercase font-black tracking-widest text-muted-foreground">Current Status</p>
                        <span className={cn("text-2xl font-black uppercase tracking-tighter italic", currentStatus.color)}>{waybill.status}</span>
                    </div>
                </CardTitle>
                <CardDescription className="font-medium mt-2">{currentStatus.description}</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-8 text-sm pt-6">
                <div className="space-y-4">
                    <h4 className="font-bold text-blue-900 border-b pb-1 uppercase tracking-wider text-xs">Shipment Information</h4>
                    <div className="grid grid-cols-2 gap-2">
                        <p className="text-muted-foreground">Waybill #:</p>
                        <p className="font-mono font-bold">{waybill.waybillNumber}</p>
                        
                        <p className="text-muted-foreground">Booking Date:</p>
                        <p className="font-semibold">{format(new Date(waybill.shippingDate), 'PP')}</p>
                        
                        <p className="text-muted-foreground">Total Boxes:</p>
                        <p className="font-semibold">{waybill.numberOfBoxes}</p>
                        
                        <p className="text-muted-foreground">Total Weight:</p>
                        <p className="font-semibold">{waybill.packageWeight} kg</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <h4 className="font-bold text-blue-900 border-b pb-1 uppercase tracking-wider text-xs">Journey Route</h4>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shadow-[0_0_0_4px_rgba(37,99,235,0.1)]"></div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Origin</p>
                                <p className="font-bold">{waybill.senderCity}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shadow-[0_0_0_4px_rgba(225,173,1,0.1)]"></div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Destination</p>
                                <p className="font-bold">{waybill.receiverCity}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
            {waybill.status === 'Delivered' && (
                <CardFooter className="bg-green-50 text-green-700 py-3 flex items-center justify-center gap-2 border-t border-green-100">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Verified Delivery</span>
                </CardFooter>
            )}
        </Card>
    );
}

function TrackingPageContent() {
    const { waybills, isLoaded } = useWaybills();
    const [trackingNumber, setTrackingNumber] = useState('');
    const [foundWaybill, setFoundWaybill] = useState<Waybill | null | undefined>(undefined);
    const [error, setError] = useState<string | null>(null);

    const handleTrack = () => {
        setError(null);
        setFoundWaybill(undefined);
        const searchTerm = trackingNumber.toLowerCase().trim();
        if (!searchTerm) {
            setError("Please enter a waybill or invoice number.");
            return;
        }
        const waybill = waybills.find(w => 
            w.waybillNumber.toLowerCase() === searchTerm || 
            (w.invoiceNumber && w.invoiceNumber.toLowerCase() === searchTerm)
        );
        if (waybill) {
            setFoundWaybill(waybill);
        } else {
            setFoundWaybill(null);
            setError("Tracking ID not found. Please verify the number.");
        }
    };
    
    if (!isLoaded) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="w-full max-w-2xl mx-auto py-12 px-4">
            <Card className="bg-card/95 backdrop-blur-md shadow-2xl border-primary/10 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-blue-600 to-primary"></div>
                <CardHeader className="text-center pt-10">
                    <div className="mx-auto scale-110 mb-2">
                        <Logo />
                    </div>
                    <CardTitle className="text-4xl font-black mt-4 tracking-tighter text-blue-900 uppercase italic">Track Shipment</CardTitle>
                    <CardDescription className="text-blue-800/60 font-medium">Real-time status updates for your YU-WON LOGISTICS delivery.</CardDescription>
                </CardHeader>
                <CardContent className="pb-10">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-grow">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-400" />
                            <Input
                                placeholder="Enter Waybill or Invoice #"
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
                                className="h-14 pl-12 text-lg font-mono border-blue-100 focus:ring-primary focus:border-primary shadow-inner"
                            />
                        </div>
                        <Button onClick={handleTrack} size="lg" className="h-14 px-8 font-black uppercase tracking-tighter italic text-xl shadow-lg shadow-primary/30 active:scale-95 transition-transform">
                            TRACK NOW
                        </Button>
                    </div>
                    {error && (
                        <div className="mt-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-3">
                            <XCircle className="h-5 w-5 shrink-0" />
                            <p className="font-bold text-sm uppercase tracking-tight">{error}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {foundWaybill === undefined && !error && (
                 <div className="text-center p-10 text-blue-900/40 bg-blue-900/5 border border-blue-900/10 rounded-2xl mt-8 backdrop-blur-sm dashed-border">
                    <Package size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-bold uppercase tracking-widest text-xs">Awaiting Entry</p>
                </div>
            )}

            {foundWaybill && <TrackingResult waybill={foundWaybill} />}
        </div>
    );
}

export default function Home() {
  return (
    <DataProvider>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden">
            <Image
                src="https://images.unsplash.com/photo-1554189097-90d3aa583c26?q=80&w=2940&auto=format&fit=crop"
                data-ai-hint="abstract cargo background"
                alt="Abstract background"
                fill
                className="object-cover opacity-20"
                quality={100}
                priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-blue-100/50 via-white to-white"></div>
        </div>
       
        <header className="w-full bg-slate-950 text-white z-10 border-b border-white/10 sticky top-0 shadow-xl">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <div className="flex-shrink-0 flex items-center gap-2">
                        <Logo />
                    </div>
                    <div className="flex items-center gap-1">
                         <Link href="/features" className="hidden md:block">
                            <Button variant="ghost" className="text-white hover:bg-white/10 font-bold uppercase tracking-widest text-[10px]">
                                <Star className="mr-2 h-4 w-4 text-primary" />
                                Features
                            </Button>
                        </Link>
                         <Link href="/about" className="hidden sm:block">
                            <Button variant="ghost" className="text-white hover:bg-white/10 font-bold uppercase tracking-widest text-[10px]">
                                <Info className="mr-2 h-4 w-4 text-primary" />
                                About
                            </Button>
                        </Link>
                        <div className="w-px h-8 bg-white/10 mx-2 hidden sm:block"></div>
                        <Link href="/login">
                            <Button className="font-black uppercase tracking-tighter italic border-2 border-primary hover:bg-primary hover:text-black transition-all">
                                <LogIn className="mr-2 h-4 w-4" />
                                STAFF SIGN-IN
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>
        </header>
        <main className="flex-grow flex items-center justify-center relative z-10">
            <TrackingPageContent />
        </main>
        <footer className="w-full bg-slate-950 text-slate-500 py-8 border-t border-white/5 relative z-10">
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <Logo className="opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-pointer" />
                <div className="flex gap-6 text-xs font-bold uppercase tracking-widest">
                    <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
                    <Link href="/about" className="hover:text-primary transition-colors">Privacy</Link>
                    <Link href="/about" className="hover:text-primary transition-colors">Contact</Link>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em]">&copy; {new Date().getFullYear()} YU-WON LOGISTICS</p>
            </div>
        </footer>
    </div>
    </DataProvider>
  );
}
