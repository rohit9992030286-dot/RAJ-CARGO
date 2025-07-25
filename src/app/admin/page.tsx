
'use client';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Users, Shield, ArrowRight } from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the central control panel.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
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
              <Shield className="h-6 w-6" />
              <span>System Overview</span>
            </CardTitle>
            <CardDescription>Monitor the overall health and status of the application.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>View key metrics, check logs, and ensure all parts of the system are running smoothly. (Future implementation)</p>
          </CardContent>
           <CardFooter className="mt-auto">
             <button disabled className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2">
                View System Status
             </button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
