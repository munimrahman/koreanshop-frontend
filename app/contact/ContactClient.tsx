'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import { BASE_URL } from '@/lib/utils';

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How long does shipping take?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Inside Dhaka: 1-2 days, Outside Dhaka: 3-5 days",
      },
    },
    {
      "@type": "Question",
      name: "What are your shipping charges?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Inside Dhaka: ৳80, Outside Dhaka: ৳150",
      },
    },
    {
      "@type": "Question",
      name: "Do you offer cash on delivery?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, we offer cash on delivery for all orders within Bangladesh.",
      },
    },
    {
      "@type": "Question",
      name: "Are all products authentic?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, we guarantee 100% authentic Korean skincare products directly from Korea.",
      },
    },
  ],
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Korean Skincare Shop BD",
  description:
    "Bangladesh's premier destination for authentic Korean skincare products.",
  url: BASE_URL,
  logo: `${BASE_URL}/logo2.png`,
  image: `${BASE_URL}/logo2.png`,
  email: "koreanskincareshopbd1@gmail.com",
  telephone: "+8801534554311",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Dhanmondi",
    addressLocality: "Dhaka",
    addressCountry: "BD",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+8801534554311",
    contactType: "customer service",
    availableLanguage: ["English", "Bengali"],
  },
};

const ContactClient: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    setIsSubmitting(false);
    alert('Thank you for your message! We\'ll get back to you soon.');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
    <div className="bg-gradient-to-br from-background via-background to-muted/10 min-h-screen">
      <div className="mx-auto px-4 py-8 md:py-12 max-w-6xl container">
        {/* Header */}
        <div className="mb-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 mb-6 text-muted-foreground hover:text-primary transition-all hover:gap-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex justify-center items-center gap-4 mb-6">
            <div className="flex justify-center items-center bg-primary/10 rounded-full w-16 h-16">
              <MessageCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-bold text-foreground text-4xl md:text-5xl">Contact Us</h1>
          </div>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed">
            We&apos;re here to help! Reach out to us with any questions or concerns about our Korean skincare products.
          </p>
        </div>

        <div className="gap-8 lg:gap-12 grid lg:grid-cols-2">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="space-y-8 bg-card shadow-lg hover:shadow-xl p-8 border border-border rounded-2xl transition-shadow">
              <div className="text-center">
                <div className="inline-flex justify-center items-center bg-primary/10 mb-4 rounded-full w-12 h-12">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <h2 className="mb-2 font-bold text-foreground text-2xl">Get In Touch</h2>
                <p className="text-muted-foreground text-sm">We&apos;d love to hear from you</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4 hover:bg-muted/30 p-4 rounded-xl transition-colors group">
                  <div className="flex justify-center items-center bg-primary/10 group-hover:bg-primary/20 rounded-lg w-10 h-10 transition-colors">
                    <Mail className="flex-shrink-0 w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1 font-semibold text-foreground">Email</h3>
                    <a href="mailto:koreanskincareshopbd1@gmail.com" className="text-muted-foreground hover:text-primary text-sm transition-colors break-all">
                      koreanskincareshopbd1@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 hover:bg-muted/30 p-4 rounded-xl transition-colors group">
                  <div className="flex justify-center items-center bg-primary/10 group-hover:bg-primary/20 rounded-lg w-10 h-10 transition-colors">
                    <Phone className="flex-shrink-0 w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1 font-semibold text-foreground">Phone</h3>
                    <a href="https://wa.me/8801534554311" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                      +8801534554311
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 hover:bg-muted/30 p-4 rounded-xl transition-colors group">
                  <div className="flex justify-center items-center bg-primary/10 group-hover:bg-primary/20 rounded-lg w-10 h-10 transition-colors">
                    <MapPin className="flex-shrink-0 w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1 font-semibold text-foreground">Address</h3>
                    <p className="text-muted-foreground text-sm">
                      Dhanmondi, Dhaka, Bangladesh
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Contact Options */}
            <div className="space-y-4">
              <h3 className="font-bold text-foreground text-lg">Quick Actions</h3>
              <div className="space-y-3">
                <a
                  href="tel:+8801534554311"
                  className="flex items-center gap-4 hover:bg-primary/10 hover:border-primary/20 p-4 border border-border rounded-xl transition-all transform hover:scale-[1.02] group"
                >
                  <div className="flex justify-center items-center bg-green-100 dark:bg-green-900/30 rounded-lg w-10 h-10">
                    <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-foreground">Call Now</span>
                    <p className="text-muted-foreground text-xs">Instant support via phone</p>
                  </div>
                </a>
                <a
                  href="mailto:koreanskincareshopbd1@gmail.com"
                  className="flex items-center gap-4 hover:bg-primary/10 hover:border-primary/20 p-4 border border-border rounded-xl transition-all transform hover:scale-[1.02] group"
                >
                  <div className="flex justify-center items-center bg-blue-100 dark:bg-blue-900/30 rounded-lg w-10 h-10">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-foreground">Send Email</span>
                    <p className="text-muted-foreground text-xs">Get detailed support via email</p>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="text-center lg:text-left">
                <div className="inline-flex justify-center items-center bg-primary/10 mb-4 rounded-full w-12 h-12">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <h2 className="mb-4 font-bold text-foreground text-2xl">Frequently Asked Questions</h2>
                <p className="text-muted-foreground">Find quick answers to common questions</p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    question: "How long does shipping take?",
                    answer: "Inside Dhaka: 1-2 days, Outside Dhaka: 3-5 days",
                    icon: "🚚"
                  },
                  {
                    question: "What are your shipping charges?",
                    answer: "Inside Dhaka: ৳80, Outside Dhaka: ৳150",
                    icon: "💰"
                  },
                  {
                    question: "Do you offer cash on delivery?",
                    answer: "Yes, we offer cash on delivery for all orders within Bangladesh.",
                    icon: "💵"
                  },
                  {
                    question: "Are all products authentic?",
                    answer: "Yes, we guarantee 100% authentic Korean skincare products directly from Korea.",
                    icon: "✅"
                  },
                ].map((faq, index) => (
                  <div key={index} className="bg-card hover:shadow-md p-5 border border-border rounded-xl transition-all transform hover:scale-[1.02] group">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 text-xl">{faq.icon}</div>
                      <div className="flex-1">
                        <h3 className="mb-2 font-semibold text-foreground text-base leading-tight">{faq.question}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default ContactClient;
