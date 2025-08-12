
'use client';

import { PublicPageLayout } from "@/components/PublicPageLayout";
import { Building, Globe, Mail, Phone, Users } from "lucide-react";

export default function AboutPage() {
    const companyDetails = [
        { icon: Building, label: "Company Name", value: "RAJ CARGO" },
        { icon: Users, label: "Business Type", value: "Logistics, Courier, and Transport Services" },
        { icon: Phone, label: "Contact Number", value: "+91 12345 67890" },
        { icon: Mail, label: "Email", value: "contact@rajcargo.com" },
        { icon: Globe, label: "Website", value: "www.rajcargo.com" },
    ];

    return (
        <PublicPageLayout
            title="About RAJ CARGO"
            description="Your trusted partner in logistics and courier services."
        >
            <div className="space-y-8">
                <div>
                    <h2 className="text-2xl font-semibold mb-3">Our Mission</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        At RAJ CARGO, our mission is to provide reliable, efficient, and secure logistics solutions that connect businesses and people. We are committed to leveraging technology to deliver excellence and build lasting relationships with our clients based on trust and mutual success.
                    </p>
                </div>
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Company Profile</h2>
                    <ul className="space-y-3">
                        {companyDetails.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <li key={index} className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mt-1">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">{item.label}</p>
                                        <p className="text-muted-foreground">{item.value}</p>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
                 <div>
                    <h2 className="text-2xl font-semibold mb-3">Why Choose Us?</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        With years of experience in the logistics industry, RAJ CARGO combines deep industry knowledge with a passion for innovation. Our network is extensive, our team is dedicated, and our focus is always on you, the customer. We handle every package with the utmost care, ensuring it reaches its destination safely and on time.
                    </p>
                </div>
            </div>
        </PublicPageLayout>
    );
}
