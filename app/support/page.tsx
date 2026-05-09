// pages/support.tsx or app/support/page.tsx
import React from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Headphones, 
  MessageSquare, 
  Phone, 
  Mail, 
  Clock, 
  HelpCircle,
  Search,
  ChevronRight,
  Star
} from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Customer Support & Help | Korean Skincare Shop BD',
  description: 'Contact Korean Skincare Shop BD customer support. Get help with FAQs, live chat, email, and phone support for all your K-beauty skincare questions.',
  keywords: ['customer support', 'help center', 'FAQs', 'contact support', 'Korean skincare help'],
  openGraph: {
    title: 'Customer Support Center',
    description: 'Get help and support for your Korean skincare purchases.',
    url: 'https://www.koreanskincareshopbd.com/support',
    type: 'website',
    images: [{ url: '/logo2.png', width: 1200, height: 630, alt: 'Customer Support' }],
  },
};

const CustomerSupportPage: React.FC = () => {
  const faqs = [
    {
      question: "How long does shipping take?",
      answer: "Inside Dhaka: 1-2 days (৳80), Outside Dhaka: 3-5 days (৳150). Same-day delivery available for orders placed before 2 PM in selected Dhaka areas."
    },
  ];

  const supportChannels = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Phone Support",
      description: "Speak directly with our support team",
      contact: "+880 153 455 4311",
      availability: "9 AM - 9 PM (Daily)",
      color: "blue"
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email Support",
      description: "Send us detailed questions or concerns",
      contact: "koreanskincareshopbd1@gmail.com",
      availability: "24/7 (Response within 6 hours)",
      color: "green"
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Whatsapp or Messenger Chat",
      description: "Get instant help through live chat",
      contact: "Available on website",
      availability: "9 AM - 11 PM (Daily)",
      color: "purple"
    }
  ];

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto px-4 py-8 max-w-6xl container">
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
            <Headphones className="w-8 h-8 text-primary" />
            <h1 className="font-bold text-foreground text-3xl">Customer Support</h1>
          </div>
                    <p className="text-muted-foreground">
            We're here to help you with any questions or concerns. Choose the support option that works best for you.
          </p>
        </div>

        <div className="space-y-12">
          {/* Support Channels */}
          <section>
            <h2 className="mb-6 font-semibold text-foreground text-2xl text-center">Get Help Your Way</h2>
            <div className="gap-6 grid md:grid-cols-3">
              {supportChannels.map((channel, index) => (
                <div key={index} className={`border-2 border-${channel.color}-200 dark:border-${channel.color}-800 rounded-lg p-6 hover:shadow-lg transition-shadow`}>
                  <div className={`w-12 h-12 bg-${channel.color}-100 dark:bg-${channel.color}-950/20 rounded-lg flex items-center justify-center mb-4`}>
                    <div className={`text-${channel.color}-600`}>{channel.icon}</div>
                  </div>
                  <h3 className="mb-2 font-semibold text-foreground">{channel.title}</h3>
                  <p className="mb-3 text-muted-foreground text-sm">{channel.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground text-sm">{channel.contact}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground text-xs">{channel.availability}</span>
                    </div>
                  </div>
                  <button className={`w-full mt-4 bg-${channel.color}-600 text-white py-2 rounded-lg hover:bg-${channel.color}-700 transition-colors`}>
                    Contact Now
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ Search */}
          <section>
            <h2 className="mb-6 font-semibold text-foreground text-2xl text-center">Frequently Asked Questions</h2>
            <div className="mx-auto mb-8 max-w-2xl">
              <div className="relative">
                <Search className="top-1/2 left-3 absolute w-5 h-5 text-muted-foreground -translate-y-1/2 transform" />
                <input
                  type="text"
                  placeholder="Search for answers..."
                  className="bg-background py-3 pr-4 pl-10 border focus:border-transparent border-border rounded-lg focus:ring-2 focus:ring-primary w-full text-foreground placeholder-muted-foreground"
                />
              </div>
            </div>

            {/* FAQ Items */}
            <div className="space-y-4 mx-auto max-w-4xl">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-border rounded-lg">
                  <button className="hover:bg-muted/50 p-4 w-full text-left transition-colors">
                    <div className="flex justify-between items-center">
                      <h3 className="flex items-center gap-2 font-medium text-foreground">
                        <HelpCircle className="w-4 h-4 text-primary" />
                        {faq.question}
                      </h3>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </button>
                  <div className="px-4 pb-4">
                    <p className="pl-6 text-muted-foreground text-sm">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Emergency Contact */}
          <section className="bg-red-50 dark:bg-red-950/20 p-6 border border-red-200 dark:border-red-800 rounded-lg text-center">
            <h2 className="mb-4 font-semibold text-red-800 dark:text-red-200 text-xl">Emergency Support</h2>
            <p className="mb-4 text-red-700 dark:text-red-300">
              For urgent issues related to payment problems or order disputes
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="tel:+8801534554311"
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg text-white transition-colors"
              >
                <Phone className="w-4 h-4" />
                Emergency Hotline
              </a>
              <a
                href="mailto:koreanskincareshopbd1@gmail.com"
                className="inline-flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-950/20 px-6 py-3 border border-red-600 rounded-lg text-red-600 transition-colors"
              >
                <Mail className="w-4 h-4" />
                Priority Email
              </a>
            </div>
            <p className="mt-3 text-red-600 dark:text-red-400 text-sm">
              Available 24/7 for critical issues
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CustomerSupportPage;