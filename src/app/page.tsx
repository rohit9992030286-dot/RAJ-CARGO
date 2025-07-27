
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

const BirdSVG = ({ className }: { className?: string }) => (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 512 512" 
      width="100" 
      height="100" 
      fill="currentColor"
    >
      <path d="M441.3,167.3c-23.9,29.4-53.5,53.4-87.3,71.2c-2.3,1.2-4.9,1.6-7.4,1.3c-2.5-0.3-4.9-1.3-6.8-3l-79.6-71.1 c-2.9-2.6-7-3.4-10.7-2.1c-3.7,1.3-6.5,4.4-7.4,8.2l-23,98.2c-2.1,9-12.2,14.2-21.2,12.1c-9-2.1-14.2-12.2-12.1-21.2l23-98.2 c3.4-14.7,14.6-26.4,29-30.4c14.4-4,29.3,1.6,38.8,13.2l79.6,71.1c5.2,4.6,12.6,5.8,19.2,3.1c33.8-13.8,62.8-37.4,82.4-66.1 c5.1-7.4,15.2-9.1,22.6-4c7.4,5.1,9.1,15.2,4,22.6C441.3,167.3,441.3,167.3,441.3,167.3z" />
      <path d="M197,215.3c-2.3,1.2-4.9,1.6-7.4,1.3c-2.5-0.3-4.9-1.3-6.8-3l-79.6-71.1c-9.5-8.5-22-11.7-34.1-9.4 c-12.1,2.3-22.4,9.4-28.5,20.1c-6.1,10.7-7.5,23.5-4.1,35.5c3.4,12,10.6,22.1,20.5,28.6l79.6,71.1c5.2,4.6,12.6,5.8,19.2,3.1 c28.3-11.5,53.3-29.3,73.5-51.9c6.9-7.7,6.1-19.4-1.6-26.3c-7.7-6.9-19.4-6.1-26.3,1.6C237.3,195.4,217.4,208.7,197,215.3z" />
    </svg>
  );

export default function Home() {
  return (
    <DataProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden">
            <Image
                src="https://placehold.co/1920x1080.png"
                alt="Abstract background"
                fill
                className="object-cover opacity-5 dark:opacity-[0.02]"
                quality={100}
                priority
            />
            <div className="absolute inset-0 w-full h-full text-foreground/10 dark:text-foreground/5 pointer-events-none">
                <BirdSVG className="bird bird-1" />
                <BirdSVG className="bird bird-2" />
                <BirdSVG className="bird bird-3" />
                <BirdSVG className="bird bird-4" />
            </div>
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
