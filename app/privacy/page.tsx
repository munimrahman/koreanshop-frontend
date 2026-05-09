// pages/privacy.tsx or app/privacy/page.tsx
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Eye, Lock, Database, Users, Mail } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Korean Skincare Shop BD',
  description: 'Read our privacy policy to understand how we collect, use, and protect your personal information at Korean Skincare Shop BD.',
  keywords: ['privacy policy', 'data protection', 'GDPR', 'personal information'],
  openGraph: {
    title: 'Privacy Policy',
    description: 'Learn how we protect your personal information.',
    url: 'https://www.koreanskincareshopbd.com/privacy',
    type: 'website',
    images: [{ url: '/logo2.png', width: 1200, height: 630, alt: 'Privacy Policy' }],
  },
  robots: {
    index: false,
    follow: true,
  },
};

const PrivacyPolicyPage: React.FC = () => {
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
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="font-bold text-foreground text-3xl">Privacy Policy</h1>
          </div>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Content */}
        <div className="dark:prose-invert max-w-none prose prose-gray">
          <div className="space-y-8">
            {/* Introduction */}
            <section className="pl-6 border-primary border-l-4">
              <h2 className="flex items-center gap-2 mb-3 font-semibold text-foreground text-xl">
                <Eye className="w-5 h-5" />
                Information We Collect
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>We collect information you provide directly to us, such as when you:</p>
                <ul className="space-y-2 ml-4 list-disc list-inside">
                  <li>Make a purchase</li>
                  <li>Contact customer support</li>
                  <li>Participate in surveys or promotions</li>
                </ul>
              </div>
            </section>

            {/* Personal Information */}
            <section className="bg-muted/50 p-6 rounded-lg">
              <h2 className="flex items-center gap-2 mb-3 font-semibold text-foreground text-xl">
                <Users className="w-5 h-5" />
                Personal Information
              </h2>
              <div className="gap-6 grid md:grid-cols-2">
                <div>
                  <h3 className="mb-2 font-medium text-foreground">Account Information</h3>
                  <ul className="space-y-1 text-muted-foreground text-sm">
                    <li>• Name and contact details</li>
                    <li>• Email address</li>
                    <li>• Phone number</li>
                    <li>• Billing and shipping addresses</li>
                  </ul>
                </div>
                <div>
                  <h3 className="mb-2 font-medium text-foreground">Transaction Data</h3>
                  <ul className="space-y-1 text-muted-foreground text-sm">
                    <li>• Purchase history</li>
                    <li>• Payment information</li>
                    <li>• Order details</li>
                    <li>• Delivery preferences</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Information */}
            <section>
              <h2 className="flex items-center gap-2 mb-3 font-semibold text-foreground text-xl">
                <Database className="w-5 h-5" />
                How We Use Your Information
              </h2>
              <div className="gap-4 grid md:grid-cols-2">
                {[
                  'Process and fulfill your orders',
                  'Send order confirmations and updates',
                  'Provide customer support',
                  'Improve our products and services',
                  'Send marketing communications (with consent)',
                  'Prevent fraud and enhance security',
                  'Comply with legal obligations',
                  'Analyze website usage and performance'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 bg-primary mt-2 rounded-full w-2 h-2" />
                    <span className="text-muted-foreground text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Data Security */}
            <section className="p-6 border border-border rounded-lg">
              <h2 className="flex items-center gap-2 mb-3 font-semibold text-foreground text-xl">
                <Lock className="w-5 h-5" />
                Data Security
              </h2>
              <p className="mb-4 text-muted-foreground">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
              <div className="gap-4 grid md:grid-cols-3">
                <div className="bg-muted/30 p-4 rounded-lg text-center">
                  <Lock className="mx-auto mb-2 w-6 h-6 text-primary" />
                  <h3 className="font-medium text-foreground text-sm">Encryption</h3>
                  <p className="text-muted-foreground text-xs">SSL/TLS encryption</p>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg text-center">
                  <Shield className="mx-auto mb-2 w-6 h-6 text-primary" />
                  <h3 className="font-medium text-foreground text-sm">Secure Storage</h3>
                  <p className="text-muted-foreground text-xs">Protected databases</p>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg text-center">
                  <Eye className="mx-auto mb-2 w-6 h-6 text-primary" />
                  <h3 className="font-medium text-foreground text-sm">Access Control</h3>
                  <p className="text-muted-foreground text-xs">Limited access</p>
                </div>
              </div>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="mb-3 font-semibold text-foreground text-xl">Your Rights</h2>
              <div className="space-y-3">
                {[
                  { title: 'Access', desc: 'Request a copy of your personal data' },
                  { title: 'Correction', desc: 'Update or correct your information' },
                  { title: 'Deletion', desc: 'Request deletion of your data' },
                  { title: 'Portability', desc: 'Transfer your data to another service' },
                  { title: 'Opt-out', desc: 'Unsubscribe from marketing communications' }
                ].map((right, index) => (
                  <div key={index} className="flex gap-4 hover:bg-muted/50 p-3 rounded-lg transition-colors">
                    <div className="flex flex-shrink-0 justify-center items-center bg-primary/10 rounded-full w-8 h-8">
                      <span className="font-semibold text-primary text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{right.title}</h3>
                      <p className="text-muted-foreground text-sm">{right.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Contact */}
            <section className="bg-primary/5 p-6 rounded-lg">
              <h2 className="flex items-center gap-2 mb-3 font-semibold text-foreground text-xl">
                <Mail className="w-5 h-5" />
                Contact Us
              </h2>
              <p className="mb-4 text-muted-foreground">
                If you have any questions about this Privacy Policy, please contact us:
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
    </div>
  );
};

export default PrivacyPolicyPage;