
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, BookCopy, Cpu, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
       <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-primary">Welcome to RAJ CARGO</h1>
            <p className="text-muted-foreground text-lg mt-2">Please select which system you want to access.</p>
       </div>
       <div className="grid md:grid-cols-3 gap-8 max-w-6xl w-full">
            <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <BookCopy className="h-10 w-10 text-primary" />
                        <div>
                            <CardTitle className="text-2xl">Booking System</CardTitle>
                            <CardDescription>Manage waybills, manifests, and customers.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <p>Create new shipments, track existing ones, manage dispatch manifests, and view sales reports. This is your main operational dashboard.</p>
                </CardContent>
                <CardContent>
                    <Link href="/booking">
                        <Button className="w-full">
                            Go to Booking <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </CardContent>
            </Card>
             <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                     <div className="flex items-center gap-4">
                        <Cpu className="h-10 w-10 text-primary" />
                        <div>
                            <CardTitle className="text-2xl">Hub Operations</CardTitle>
                            <CardDescription>Manage hub-level sorting and scanning.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <p>Tools for incoming package scanning, sorting by destination, and managing outbound line haul trucks.</p>
                </CardContent>
                <CardContent>
                     <Link href="/hub">
                        <Button className="w-full">
                            Go to Hub <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                     <div className="flex items-center gap-4">
                        <Truck className="h-10 w-10 text-primary" />
                        <div>
                            <CardTitle className="text-2xl">Delivery Operations</CardTitle>
                            <CardDescription>Manage last-mile delivery to customers.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <p>View waybills ready for final delivery, update their status, and manage your delivery personnel and routes.</p>
                </CardContent>
                <CardContent>
                     <Link href="/delivery">
                        <Button className="w-full">
                            Go to Delivery <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </CardContent>
            </Card>
       </div>
    </div>
  )
}
