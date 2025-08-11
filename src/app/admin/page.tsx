
'use client';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Users, ArrowRight, Activity, IndianRupee, Tags, List, KeyRound, AlertTriangle, Building, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';


const adminLinks = [
    {
        href: '/admin/users',
        title: 'User Management',
        description: 'Add, view, and manage user accounts and roles.',
        icon: Users,
        iconBgColor: 'bg-sky-100 dark:bg-sky-900/50',
        iconColor: 'text-sky-600 dark:text-sky-300'
    },
    {
        href: '/admin/companies',
        title: 'Company Management',
        description: 'Manage company profiles and default sender details.',
        icon: Building,
        iconBgColor: 'bg-purple-100 dark:bg-purple-900/50',
        iconColor: 'text-purple-600 dark:text-purple-300'
    },
    {
        href: '/admin/inventory',
        title: 'Waybill Inventory',
        description: 'Assign waybill number series to different partners.',
        icon: List,
        iconBgColor: 'bg-amber-100 dark:bg-amber-900/50',
        iconColor: 'text-amber-600 dark:text-amber-300'
    },
    {
        href: '/admin/partner-associations',
        title: 'Partner Associations',
        description: 'Define routing between partners and hubs.',
        icon: Link2,
        iconBgColor: 'bg-teal-100 dark:bg-teal-900/50',
        iconColor: 'text-teal-600 dark:text-teal-300'
    },
    {
        href: '/admin/rates',
        title: 'Rate Management',
        description: 'Set shipping rates based on destination pincodes.',
        icon: Tags,
        iconBgColor: 'bg-rose-100 dark:bg-rose-900/50',
        iconColor: 'text-rose-600 dark:text-rose-300'
    },
     {
        href: '/admin/sales-report',
        title: 'Sales Report',
        description: 'View total sales based on freight charges.',
        icon: IndianRupee,
        iconBgColor: 'bg-green-100 dark:bg-green-900/50',
        iconColor: 'text-green-600 dark:text-green-300'
    },
     {
        href: '/admin/system-overview',
        title: 'System Overview',
        description: 'Monitor the overall health and status of the application.',
        icon: Activity,
        iconBgColor: 'bg-indigo-100 dark:bg-indigo-900/50',
        iconColor: 'text-indigo-600 dark:text-indigo-300'
    },
    {
        href: '/admin/ewaybill-alerts',
        title: 'E-Way Bill Alerts',
        description: 'Monitor shipments with expiring E-Way Bills.',
        icon: AlertTriangle,
        iconBgColor: 'bg-orange-100 dark:bg-orange-900/50',
        iconColor: 'text-orange-600 dark:text-orange-300'
    },
     {
        href: '/admin/account',
        title: 'Account Settings',
        description: 'Manage account credentials and system data.',
        icon: KeyRound,
        iconBgColor: 'bg-slate-100 dark:bg-slate-900/50',
        iconColor: 'text-slate-600 dark:text-slate-300'
    }
]

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div className="p-6 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-slate-300 mt-1">Welcome to the central control panel for RAJ CARGO.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminLinks.map((link) => (
            <Link href={link.href} key={link.href} className="group">
                <Card className="flex flex-col h-full hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <CardHeader>
                        <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mb-4", link.iconBgColor)}>
                            <link.icon className={cn("h-6 w-6", link.iconColor)} />
                        </div>
                        <CardTitle>{link.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="text-muted-foreground">{link.description}</p>
                    </CardContent>
                    <CardFooter>
                        <div className="text-sm font-medium text-primary flex items-center gap-2">
                           Go to {link.title} <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                    </CardFooter>
                </Card>
            </Link>
        ))}
      </div>
    </div>
  );
}
