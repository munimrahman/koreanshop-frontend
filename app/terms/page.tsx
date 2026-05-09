// pages/terms.tsx or app/terms/page.tsx
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, Scale, AlertTriangle, CreditCard, Truck } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Korean Skincare Shop BD',
  description: 'Review our terms of service and conditions of use for Korean Skincare Shop BD. Understand your rights and responsibilities when shopping with us.',
  keywords: ['terms of service', 'terms and conditions', 'user agreement', 'policies'],
  openGraph: {
    title: 'Terms of Service',
    description: 'Review our terms and conditions of use.',
    url: 'https://www.koreanskincareshopbd.com/terms',
    type: 'website',
    images: [{ url: '/logo2.png', width: 1200, height: 630, alt: 'Terms of Service' }],
  },
  robots: {
    index: false,
    follow: true,
  },
};

const TermsOfServicePage: React.FC = () => {
    return (
        <div className="bg-background min-h-screen">
            <div className="mx-auto px-4 py-8 max-w-4xl container">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 mb-4 text-muted-foreground hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                    <div className="flex items-center gap-3 mb-4">
                        <Scale className="w-8 h-8 text-primary" />
                        <h1 className="font-bold text-foreground text-3xl">Terms of Service</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Last updated: {new Date().toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>

                <div className="space-y-8">
                    {/* Acceptance */}
                    <section className="pl-6 border-primary border-l-4">
                        <h2 className="mb-3 font-semibold text-foreground text-xl">1. Acceptance of Terms</h2>
                        <p className="text-muted-foreground">
                            By accessing and using our website, you accept and agree to be bound by the terms and provision of this agreement.
                        </p>
                    </section>

                    {/* Use of Website */}
                    <section className="bg-muted/50 p-6 rounded-lg">
                        <h2 className="flex items-center gap-2 mb-3 font-semibold text-foreground text-xl">
                            <FileText className="w-5 h-5" />
                            2. Use of Website
                        </h2>
                        <div className="space-y-3">
                            <p className="text-muted-foreground">You may use our website for lawful purposes only. You agree not to:</p>
                            <ul className="space-y-2 ml-4 text-muted-foreground list-disc list-inside">
                                <li>Violate any applicable laws or regulations</li>
                                <li>Infringe on intellectual property rights</li>
                                <li>Upload malicious code or viruses</li>
                                <li>Engage in fraudulent activities</li>
                                <li>Interfere with website functionality</li>
                            </ul>
                        </div>
                    </section>

                    {/* Product Information */}
                    <section>
                        <h2 className="mb-3 font-semibold text-foreground text-xl">3. Product Information</h2>
                        <div className="gap-6 grid md:grid-cols-2">
                            <div className="space-y-3">
                                <h3 className="font-medium text-foreground">Accuracy</h3>
                                <p className="text-muted-foreground text-sm">
                                    We strive to provide accurate product information, but we cannot guarantee that all details are completely accurate or current.
                                </p>
                            </div>
                            <div className="space-y-3">
                                <h3 className="font-medium text-foreground">Availability</h3>
                                <p className="text-muted-foreground text-sm">
                                    Product availability is subject to change without notice. We reserve the right to limit quantities.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Orders and Payment */}
                    <section className="p-6 border border-border rounded-lg">
                        <h2 className="flex items-center gap-2 mb-3 font-semibold text-foreground text-xl">
                            <CreditCard className="w-5 h-5" />
                            4. Orders and Payment
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="mb-2 font-medium text-foreground">Order Acceptance</h3>
                                <p className="text-muted-foreground text-sm">
                                    We reserve the right to refuse or cancel any order for any reason, including pricing errors or product unavailability.
                                </p>
                            </div>
                            <div>
                                <h3 className="mb-2 font-medium text-foreground">Payment Terms</h3>
                                <ul className="space-y-1 ml-4 text-muted-foreground text-sm list-disc list-inside">
                                    <li>Payment is due at the time of order</li>
                                    <li>We accept major credit cards and mobile payments</li>
                                    <li>Cash on delivery available for local orders</li>
                                    <li>All prices are in Bangladeshi Taka (BDT)</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Shipping */}
                    <section className="bg-primary/5 p-6 rounded-lg">
                        <h2 className="flex items-center gap-2 mb-3 font-semibold text-foreground text-xl">
                            <Truck className="w-5 h-5" />
                            5. Shipping and Delivery
                        </h2>
                        <div className="gap-6 grid md:grid-cols-2">
                            <div className="bg-background p-4 border rounded-lg">
                                <h3 className="mb-2 font-medium text-foreground">Inside Dhaka</h3>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Shipping Fee:</span>
                                    <span className="font-semibold text-foreground">৳80</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Delivery Time:</span>
                                    <span className="text-foreground text-sm">1-2 days</span>
                                </div>
                            </div>
                            <div className="bg-background p-4 border rounded-lg">
                                <h3 className="mb-2 font-medium text-foreground">Outside Dhaka</h3>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Shipping Fee:</span>
                                    <span className="font-semibold text-foreground">৳150</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Delivery Time:</span>
                                    <span className="text-foreground text-sm">3-5 days</span>
                                </div>
                            </div>
                        </div>
                        <p className="mt-4 text-muted-foreground text-sm">
                            Delivery times are estimates and may vary during peak seasons or due to unforeseen circumstances.
                        </p>
                    </section>

                    {/* Returns */}
                    <section>
                        <h2 className="mb-3 font-semibold text-foreground text-xl">6. Returns and Refunds</h2>
                        <div className="space-y-4">
                            <p className="text-muted-foreground">
                                We want you to be satisfied with your purchase. Our return policy includes:
                            </p>
                            <div className="gap-4 grid md:grid-cols-2">
                                <div className="p-4 border border-border rounded-lg">
                                    <h3 className="mb-2 font-medium text-foreground">Return Window</h3>
                                    <p className="text-muted-foreground text-sm">7 days from delivery date</p>
                                </div>
                                <div className="p-4 border border-border rounded-lg">
                                    <h3 className="mb-2 font-medium text-foreground">Condition</h3>
                                    <p className="text-muted-foreground text-sm">Items must be unused and in original packaging</p>
                                </div>
                            </div>

                            <div className="bg-amber-50 dark:bg-amber-950/20 p-4 border border-amber-200 dark:border-amber-800 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="flex-shrink-0 mt-0.5 w-5 h-5 text-amber-600" />
                                    <div>
                                        <h3 className="mb-1 font-medium text-amber-800 dark:text-amber-200">Non-Returnable Items</h3>
                                        <ul className="space-y-1 text-amber-700 dark:text-amber-300 text-sm">
                                            <li>• Personal care and hygiene products</li>
                                            <li>• Customized or personalized items</li>
                                            <li>• Perishable goods</li>
                                            <li>• Digital downloads</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Limitation of Liability */}
                    <section className="p-6 border border-border rounded-lg">
                        <h2 className="mb-3 font-semibold text-foreground text-xl">7. Limitation of Liability</h2>
                        <p className="mb-4 text-muted-foreground">
                            To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages.
                        </p>
                        <div className="bg-muted/30 p-4 rounded-lg">
                            <p className="text-muted-foreground text-sm">
                                Our total liability shall not exceed the amount paid by you for the product or service that gave rise to the claim.
                            </p>
                        </div>
                    </section>

                    {/* Changes to Terms */}
                    <section>
                        <h2 className="mb-3 font-semibold text-foreground text-xl">8. Changes to Terms</h2>
                        <p className="text-muted-foreground">
                            We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting on our website. Your continued use of the website constitutes acceptance of the modified terms.
                        </p>
                    </section>

                    {/* Contact Information */}
                    <section className="bg-muted/50 p-6 rounded-lg">
                        <h2 className="mb-3 font-semibold text-foreground text-xl">9. Contact Information</h2>
                        <p className="mb-4 text-muted-foreground">
                            If you have any questions about these Terms of Service, please contact us:
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <a href="mailto:koreanskincareshopbd1@gmail.com" className="text-primary hover:underline">
                                koreanskincareshopbd1@gmail.com
                            </a>
                            <span className="text-muted-foreground">•</span>
                            <a href="https://wa.me/8801534554311" className="text-primary hover:underline">
                                +8801534554311
                            </a>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsOfServicePage;