
'use client';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Users, Shield, ArrowRight, Activity, Link2, IndianRupee } from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the central control panel.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6" />
              <span>User Management</span>
            </CardTitle>
            <CardDescription>Add, view, and manage user accounts and roles.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Control who has access to the different sections of the application. Assign roles to users to grant them specific permissions.</p>
          </CardContent>
          <CardFooter className="mt-auto">
             <Link href="/admin/users" className="w-full">
                <button className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                    Manage Users <ArrowRight className="h-4 w-4" />
                </button>
             </Link>
          </CardFooter>
        </Card>
        
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                <Link2 className="h-6 w-6" />
                <span>Partner Management</span>
                </CardTitle>
                <CardDescription>Link Hub partners with their corresponding Booking partners.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Define the relationships between your operational hubs and booking offices to ensure correct manifest routing.</p>
            </CardContent>
            <CardFooter className="mt-auto">
                <Link href="/admin/partners" className="w-full">
                    <button className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                        Manage Partners <ArrowRight className="h-4 w-4" />
                    </button>
                </Link>
            </CardFooter>
        </Card>

        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                <IndianRupee className="h-6 w-6" />
                <span>Sales Report</span>
                </CardTitle>
                <CardDescription>View financial reports for all partners.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Get a complete overview of all sales transactions across the entire system. Filter by date to analyze revenue.</p>
            </CardContent>
            <CardFooter className="mt-auto">
                <Link href="/admin/sales" className="w-full">
                    <button className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                        View Sales Report <ArrowRight className="h-4 w-4" />
                    </button>
                </Link>
            </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-6 w-6" />
              <span>System Overview</span>
            </CardTitle>
            <CardDescription>Monitor the overall health and status of the application.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>View key metrics for waybills, manifests, and users to get a snapshot of the application's usage and data.</p>
          </CardContent>
           <CardFooter className="mt-auto">
             <Link href="/admin/system-overview" className="w-full">
                <button className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                    View System Status <ArrowRight className="h-4 w-4" />
                </button>
             </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
