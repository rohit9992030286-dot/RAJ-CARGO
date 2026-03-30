'use client';

import { PublicPageLayout } from "@/components/PublicPageLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Search, BookCopy, Truck, Cpu, ScanLine, DollarSign, Users, Shield, ArrowRight, Package, List, History, Handshake, Building, Map } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
    {
        category: "For Customers",
        icon: Search,
        iconBg: "bg-blue-100 dark:bg-blue-900/50",
        iconColor: "text-blue-600 dark:text-blue-300",
        items: [
            { title: "Real-Time Shipment Tracking", description: "Customers can track their shipments instantly using a waybill or invoice number directly from the homepage." },
            { title: "Clear Status Updates", description: "Get simple, clear status updates, from 'Pending' to 'Delivered', so you always know where your package is." },
        ]
    },
    {
        category: "For Staff",
        icon: Users,
        iconBg: "bg-sky-100 dark:bg-sky-900/50",
        iconColor: "text-sky-600 dark:text-sky-300",
        items: [
            { title: "Digital Waybill Booking", description: "Booking partners can create, manage, and print waybills and stickers effortlessly, with options for bulk upload via Excel.", icon: BookCopy },
            { title: "Dispatch Manifest System", description: "Group waybills into manifests for dispatch. Manage vehicle and driver details for each trip.", icon: Truck },
            { title: "Hub Verification & Dispatch", description: "Hub staff can scan and verify incoming manifests, report shortages, and create outbound manifests for delivery or hub-to-hub transfer.", icon: Cpu },
            { title: "Last-Mile Delivery Management", description: "Delivery partners get a clear delivery sheet, and can update shipment statuses to 'Delivered' or 'Returned' in real-time.", icon: List },
            { title: "Accounts Management", description: "The accounts team can manage employee salaries, partner payments, and view detailed company sales reports.", icon: DollarSign },
        ]
    },
    {
        category: "For Admins",
        icon: Shield,
        iconBg: "bg-purple-100 dark:bg-purple-900/50",
        iconColor: "text-purple-600 dark:text-purple-300",
        items: [
            { title: "Centralized User Management", description: "Create, update, and manage all user accounts, assigning specific roles like booking, hub, delivery, and account access.", icon: Users },
            { title: "Rate & Inventory Control", description: "Set state-to-state shipping rates and manage the allocation of waybill numbers to different partners and companies.", icon: Handshake },
            { title: "System & Data Oversight", description: "Monitor the entire system with an overview dashboard, manage e-way bill expiries, and handle data backup and restore operations.", icon: Building },
            { title: "Hub & Partner Routing", description: "Define the logistics network by creating associations between booking partners, hubs, and delivery partners to automate routing.", icon: Map },
        ]
    }
];

export default function FeaturesPage() {
    return (
        <PublicPageLayout
            title="Application Features"
            description="A comprehensive look at the powerful capabilities of the YU-WON LOGISTICS platform."
        >
            <div className="space-y-12">
                {features.map((featureCategory, index) => {
                    const CategoryIcon = featureCategory.icon;
                    return (
                        <section key={index}>
                            <div className="flex items-center gap-4 mb-6">
                                <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", featureCategory.iconBg)}>
                                    <CategoryIcon className={cn("h-7 w-7", featureCategory.iconColor)} />
                                </div>
                                <h2 className="text-3xl font-bold">{featureCategory.category}</h2>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                {featureCategory.items.map((item, itemIndex) => {
                                    const ItemIcon = item.icon || Package;
                                    return (
                                        <Card key={itemIndex} className="flex flex-col">
                                            <CardHeader className="flex flex-row items-start gap-4">
                                                <div className="bg-primary/10 rounded-md p-2 mt-1">
                                                    <ItemIcon className="h-6 w-6 text-primary" />
                                                </div>
                                                <div>
                                                    <CardTitle>{item.title}</CardTitle>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="flex-grow">
                                                <p className="text-muted-foreground">{item.description}</p>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </section>
                    )
                })}
            </div>
        </PublicPageLayout>
    );
}
