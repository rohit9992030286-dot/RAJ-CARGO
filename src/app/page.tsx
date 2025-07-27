
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useWaybills } from '@/hooks/useWaybills';
import { Waybill } from '@/types/waybill';
import { Search, Package, CheckCircle, Truck, XCircle, Loader2, ArrowRight, LogIn } from 'lucide-react';
import { DataProvider } from '@/components/DataContext';
import { format } from 'date-fns';
import { Logo } from '@/components/Logo';

function TrackingResult({ waybill }: { waybill: Waybill }) {
    const statusInfo = {
        'Pending': { icon: Package, color: 'text-gray-500', description: 'Your shipment has been booked.' },
        'In Transit': { icon: Truck, color: 'text-blue-500', description: 'The shipment is on its way.' },
        'Out for Delivery': { icon: ArrowRight, color: 'text-yellow-500', description: 'The shipment is out for delivery.' },
        'Delivered': { icon: CheckCircle, color: 'text-green-500', description: 'The shipment has been delivered.' },
        'Cancelled': { icon: XCircle, color: 'text-red-500', description: 'This shipment has been cancelled.' },
        'Returned': { icon: XCircle, color: 'text-red-500', description: 'The shipment has been returned.' }
    };

    const currentStatus = statusInfo[waybill.status] || statusInfo['Pending'];
    const Icon = currentStatus.icon;

    return (
        <Card className="mt-8 bg-card/90 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-4">
                    <Icon className={`h-8 w-8 ${currentStatus.color}`} />
                    <span>Status: {waybill.status}</span>
                </CardTitle>
                <CardDescription>{currentStatus.description}</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6 text-sm">
                <div>
                    <h4 className="font-semibold mb-2">Waybill Details</h4>
                    <p><strong>Waybill #:</strong> {waybill.waybillNumber}</p>
                    <p><strong>Date:</strong> {format(new Date(waybill.shippingDate), 'PPP')}</p>
                    <p><strong>Boxes:</strong> {waybill.numberOfBoxes}</p>
                    <p><strong>Weight:</strong> {waybill.packageWeight} kg</p>
                </div>
                <div>
                    <h4 className="font-semibold mb-2">Journey</h4>
                    <p><strong>From:</strong> {waybill.senderName}, {waybill.senderCity}</p>
                    <p><strong>To:</strong> {waybill.receiverName}, {waybill.receiverCity}</p>
                </div>
            </CardContent>
        </Card>
    );
}

function TrackingPageContent() {
    const { waybills, isLoaded } = useWaybills();
    const [waybillNumber, setWaybillNumber] = useState('');
    const [foundWaybill, setFoundWaybill] = useState<Waybill | null | undefined>(undefined);
    const [error, setError] = useState<string | null>(null);

    const handleTrack = () => {
        setError(null);
        setFoundWaybill(undefined);
        if (!waybillNumber.trim()) {
            setError("Please enter a waybill number.");
            return;
        }
        const waybill = waybills.find(w => w.waybillNumber.toLowerCase() === waybillNumber.toLowerCase().trim());
        if (waybill) {
            setFoundWaybill(waybill);
        } else {
            setFoundWaybill(null);
            setError("No shipment found with that waybill number. Please check the number and try again.");
        }
    };
    
    if (!isLoaded) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="w-full max-w-2xl mx-auto py-12 px-4">
            <Card className="bg-card/90 backdrop-blur-sm">
                <CardHeader className="text-center">
                    <div className="mx-auto">
                        <Logo />
                    </div>
                    <CardTitle className="text-3xl font-bold mt-4">Track Your Shipment</CardTitle>
                    <CardDescription>Enter your waybill number below to see the status of your package.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Enter your waybill number"
                            value={waybillNumber}
                            onChange={(e) => setWaybillNumber(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
                        />
                        <Button onClick={handleTrack}>
                            <Search className="mr-2 h-4 w-4" /> Track
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {foundWaybill === undefined && !error && (
                 <div className="text-center p-8 text-foreground/80 bg-black/10 rounded-lg mt-8 backdrop-blur-sm">
                    <p>Your shipment status will appear here.</p>
                </div>
            )}
            
            {error && <p className="text-destructive-foreground bg-destructive/80 p-3 rounded-md text-center mt-4">{error}</p>}

            {foundWaybill && <TrackingResult waybill={foundWaybill} />}
        </div>
    );
}


export default function Home() {
  return (
    <DataProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <div className="fixed inset-0 -z-10 flex items-center justify-center overflow-hidden">
            <Image
                src="/logo.png"
                alt="RAJ CARGO Logo Background"
                width={800}
                height={800}
                className="object-contain opacity-5 dark:opacity-[0.02]"
                quality={100}
                priority
            />
        </div>
       
        <header className="w-full bg-card/80 dark:bg-background/80 backdrop-blur-sm z-10 border-b">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex-shrink-0 flex items-center gap-2">
                        <Logo />
                    </div>
                    <div className="flex items-center">
                        <Link href="/login">
                            <Button variant="ghost">
                                <LogIn className="mr-2 h-5 w-5" />
                                Staff Login
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>
        </header>
        <main className="flex-grow flex items-center justify-center relative z-10">
            <TrackingPageContent />
        </main>
    </div>
    </DataProvider>
  );
}
