
'use client';

import { PublicPageLayout } from "@/components/PublicPageLayout";

export default function TermsAndConditionsPage() {
    return (
        <PublicPageLayout
            title="Terms & Conditions"
            description="Please read our terms and conditions carefully before using our services."
        >
            <div className="space-y-6 prose prose-neutral dark:prose-invert max-w-none">
                <section>
                    <h2 className="text-2xl font-semibold">1. Introduction</h2>
                    <p>
                        Welcome to RAJ CARGO. These terms and conditions outline the rules and regulations for the use of RAJ CARGO's Website and services, located at www.rajcargo.com. By accessing this website and using our services, we assume you accept these terms and conditions. Do not continue to use RAJ CARGO if you do not agree to all of the terms and conditions stated on this page.
                    </p>
                </section>
                <section>
                    <h2 className="text-2xl font-semibold">2. Services</h2>
                    <p>
                        RAJ CARGO provides logistics, courier, and transportation services. All services are subject to availability and our acceptance of your order. We reserve the right to refuse service to anyone for any reason at any time.
                    </p>
                </section>
                <section>
                    <h2 className="text-2xl font-semibold">3. Liability and Insurance</h2>
                    <p>
                        All shipments are carried at the sender's risk. RAJ CARGO's liability for any loss or damage to a shipment is limited to the lesser of its actual cash value or ₹1,000 (One Thousand Indian Rupees), unless the sender has declared a higher value for the shipment and purchased additional insurance coverage from us at the time of booking.
                    </p>
                </section>
                 <section>
                    <h2 className="text-2xl font-semibold">4. Prohibited Items</h2>
                    <p>
                        The sender agrees not to ship any items that are prohibited by law or are hazardous in nature. This includes, but is not limited to, explosives, illegal substances, and perishable goods without prior arrangement. The sender will be solely responsible for any and all damages and legal consequences resulting from shipping prohibited items.
                    </p>
                </section>
                 <section>
                    <h2 className="text-2xl font-semibold">5. Changes to Terms</h2>
                    <p>
                        We reserve the right to amend these terms and conditions at any time. Any such amendments will be effective immediately upon posting on this website. Your continued use of the website and our services following the posting of changes will mean that you accept and agree to the changes.
                    </p>
                </section>
            </div>
        </PublicPageLayout>
    );
}
