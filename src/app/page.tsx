
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useWaybills } from '@/hooks/useWaybills';
import { Waybill } from '@/types/waybill';
import { Search, Package, CheckCircle, Truck, XCircle, Loader2, ArrowRight, LogIn, Send } from 'lucide-react';
import { DataProvider } from '@/components/DataContext';
import { format } from 'date-fns';

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
        <Card className="mt-8 bg-white/90 backdrop-blur-sm">
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
            <Card className="bg-white/90 backdrop-blur-sm">
                <CardHeader className="text-center">
                    <Package className="h-12 w-12 mx-auto text-primary" />
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
                 <div className="text-center p-8 text-white/80 bg-black/20 rounded-lg mt-8">
                    <p>Your shipment status will appear here.</p>
                </div>
            )}
            
            {error && <p className="text-red-200 bg-red-900/80 p-3 rounded-md text-center mt-4">{error}</p>}

            {foundWaybill && <TrackingResult waybill={foundWaybill} />}
        </div>
    );
}


export default function Home() {
  return (
    <DataProvider>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 relative">
        <div className="absolute inset-0 -z-10">
            <Image
                src="https://images.unsplash.com/photo-1587293852726-70cdb1e89408"
                alt="Team of delivery workers handling packages in a city street"
                fill
                style={{objectFit: 'cover'}}
                quality={75}
                data-ai-hint="delivery workers packages"
            />
            <div className="absolute inset-0 bg-black/50" />
        </div>
        <header className="w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm z-10">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex-shrink-0 flex items-center gap-2">
                        <Send className="h-8 w-8 text-primary"/>
                        <span className="text-2xl font-bold text-primary">RAJ CARGO</span>
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
