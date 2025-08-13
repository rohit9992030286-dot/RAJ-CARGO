
'use client';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Users, ArrowRight, Handshake, DollarSign, Building } from 'lucide-react';
import { cn } from '@/lib/utils';


const accountLinks = [
    {
        href: '/account/employees',
        title: 'Employee Management',
        description: 'Manage employee details and monthly salaries.',
        icon: Users,
        iconBgColor: 'bg-sky-100 dark:bg-sky-900/50',
        iconColor: 'text-sky-600 dark:text-sky-300'
    },
    {
        href: '/account/partners',
        title: 'Partner Payments',
        description: 'Manage payments for booking & delivery partners.',
        icon: Handshake,
        iconBgColor: 'bg-green-100 dark:bg-green-900/50',
        iconColor: 'text-green-600 dark:text-green-300'
    },
    {
        href: '/account/company-sales',
        title: 'Company Sales Report',
        description: 'View sales reports for corporate clients.',
        icon: Building,
        iconBgColor: 'bg-purple-100 dark:bg-purple-900/50',
        iconColor: 'text-purple-600 dark:text-purple-300'
    }
]

export default function AccountDashboardPage() {
  return (
    <div className="space-y-8">
      <div className="p-8 rounded-xl bg-card border relative overflow-hidden">
        <div className="absolute top-0 right-0 -z-0">
             <svg width="250" height="250" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_3_2)">
                <path d="M100 200C155.228 200 200 155.228 200 100C200 44.7715 155.228 0 100 0C44.7715 0 0 44.7715 0 100C0 155.228 44.7715 200 100 200Z" fill="url(#paint0_radial_3_2)"/>
                <path d="M127.188 199.389C157.971 188.498 183.33 166.974 196.357 138.834C209.384 110.693 208.767 78.4111 194.675 50.418C180.583 22.4249 154.248 1.40509 123.465 -9.48622C92.6823 -20.3775 59.21 -19.9698 28.1475 -8.44855C-2.91497 3.07271 -30.0822 25.132 -48.2163 53.2721C-66.3504 81.4123 -74.4925 113.885 -71.2163 145.878C-67.9401 177.871 -53.472 207.411 -31.2581 229.076" fill="url(#paint1_linear_3_2)"/>
                </g>
                <defs>
                <radialGradient id="paint0_radial_3_2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(100) rotate(90) scale(100)">
                <stop stopColor="hsl(var(--primary) / 0.1)"/>
                <stop offset="1" stopColor="hsl(var(--primary) / 0)"/>
                </radialGradient>
                <linearGradient id="paint1_linear_3_2" x1="82.4519" y1="185.038" x2="-23.7548" y2="-13.4357" gradientUnits="userSpaceOnUse">
                <stop stopColor="hsl(var(--primary) / 0.05)"/>
                <stop offset="1" stopColor="hsl(var(--primary) / 0)"/>
                </linearGradient>
                <clipPath id="clip0_3_2">
                <rect width="200" height="200" fill="white"/>
                </clipPath>
                </defs>
            </svg>
        </div>
        <div className="relative">
            <h1 className="text-4xl font-bold">Accounts Dashboard</h1>
            <p className="text-muted-foreground mt-2 text-lg">Your central hub for managing salaries and partner payments.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accountLinks.map((link) => (
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
