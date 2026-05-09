// pages/about.tsx or app/about/page.tsx
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Heart, Users, Award, Target, Mail, Phone, MapPin } from 'lucide-react';
import type { Metadata } from 'next';
import { BASE_URL } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'About Us | Korean Skincare Shop BD',
  description: 'Learn about Korean Skincare Shop BD - Bangladesh\'s premier destination for authentic Korean beauty products since 2024. Discover our mission to bring premium K-beauty to Bangladesh.',
  keywords: ['about us', 'Korean skincare shop', 'K-beauty Bangladesh', 'our story', 'mission'],
  openGraph: {
    title: 'About Korean Skincare Shop BD',
    description: 'Learn about our mission to bring premium Korean skincare to Bangladesh.',
    url: 'https://www.koreanskincareshopbd.com/about',
    type: 'website',
    images: [{ url: '/logo2.png', width: 1200, height: 630, alt: 'About Korean Skincare Shop BD' }],
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Korean Skincare Shop BD",
  description:
    "Bangladesh's premier destination for authentic Korean skincare products. Founded in 2024 to bring premium K-beauty to Bangladesh.",
  url: BASE_URL,
  logo: `${BASE_URL}/logo2.png`,
  image: `${BASE_URL}/logo2.png`,
  email: "koreanskincareshopbd1@gmail.com",
  telephone: "+8801534554311",
  foundingDate: "2024",
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

const AboutUsPage: React.FC = () => {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
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
            <Heart className="w-8 h-8 text-primary" />
            <h1 className="font-bold text-foreground text-3xl">About Us</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Bringing you quality products with exceptional service since 2024
          </p>
        </div>

        <div className="space-y-12">
          {/* Our Story */}
          <section className="text-center">
            <h2 className="mb-6 font-semibold text-foreground text-2xl">Our Story</h2>
            <div className="mx-auto max-w-3xl">
              <p className="mb-6 text-muted-foreground leading-relaxed">
                Founded in 2024, we started as a small team with a big dream: to make quality products accessible to everyone in Bangladesh. What began as a passion project has grown into a trusted e-commerce platform serving thousands of customers nationwide.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We believe that shopping should be convenient, reliable, and enjoyable. That's why we've built our platform with customer satisfaction at the heart of everything we do.
              </p>
            </div>
          </section>

          {/* Our Values */}
          <section>
            <h2 className="mb-8 font-semibold text-foreground text-2xl text-center">Our Values</h2>
            <div className="gap-6 grid md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: <Target className="w-8 h-8" />,
                  title: 'Quality First',
                  description: 'We carefully curate our products to ensure you receive only the best quality items.'
                },
                {
                  icon: <Users className="w-8 h-8" />,
                  title: 'Customer Focus',
                  description: 'Your satisfaction is our priority. We listen, learn, and continuously improve.'
                },
                {
                  icon: <Award className="w-8 h-8" />,
                  title: 'Trust & Reliability',
                  description: 'We build lasting relationships through honest business practices and reliable service.'
                },
                {
                  icon: <Heart className="w-8 h-8" />,
                  title: 'Passion',
                  description: 'We love what we do, and it shows in every aspect of our business.'
                },
                {
                  icon: <Phone className="w-8 h-8" />,
                  title: 'Support',
                  description: '24/7 customer support to help you whenever you need assistance.'
                },
                {
                  icon: <MapPin className="w-8 h-8" />,
                  title: 'Local Impact',
                  description: 'Supporting local businesses and contributing to the Bangladeshi economy.'
                }
              ].map((value, index) => (
                <div key={index} className="hover:shadow-lg p-6 border border-border rounded-lg text-center transition-shadow">
                  <div className="flex justify-center mb-4 text-primary">{value.icon}</div>
                  <h3 className="mb-3 font-semibold text-foreground">{value.title}</h3>
                  <p className="text-muted-foreground text-sm">{value.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Statistics */}
          {/* <section className="bg-primary/5 p-8 rounded-lg">
            <h2 className="mb-8 font-semibold text-foreground text-2xl text-center">Our Impact</h2>
            <div className="gap-6 grid grid-cols-2 md:grid-cols-4">
              {[
                { number: '10K+', label: 'Happy Customers' },
                { number: '5K+', label: 'Products Sold' },
                { number: '99%', label: 'Customer Satisfaction' },
                { number: '24/7', label: 'Support Available' }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="mb-2 font-bold text-primary text-3xl">{stat.number}</div>
                  <div className="text-muted-foreground text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </section> */}

          {/* Team */}
          {/* <section>
            <h2 className="mb-8 font-semibold text-foreground text-2xl text-center">Meet Our Team</h2>
            <div className="gap-6 grid md:grid-cols-3">
              {[
                {
                  name: 'Ahmed Rahman',
                  role: 'Founder & CEO',
                  description: 'Passionate about bringing innovative solutions to e-commerce in Bangladesh.'
                },
                {
                  name: 'Fatima Khan',
                  role: 'Head of Operations',
                  description: 'Ensures smooth operations and exceptional customer experience.'
                },
                {
                  name: 'Karim Hassan',
                  role: 'Technical Lead',
                  description: 'Leads our tech team in building cutting-edge solutions.'
                }
              ].map((member, index) => (
                <div key={index} className="bg-muted/50 p-6 rounded-lg text-center">
                  <div className="flex justify-center items-center bg-primary/20 mx-auto mb-4 rounded-full w-16 h-16">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="mb-1 font-semibold text-foreground">{member.name}</h3>
                  <p className="mb-3 text-primary text-sm">{member.role}</p>
                  <p className="text-muted-foreground text-sm">{member.description}</p>
                </div>
              ))}
            </div>
          </section> */}

          {/* Contact CTA */}
          <section className="bg-muted/50 p-8 rounded-lg text-center">
            <h2 className="mb-4 font-semibold text-foreground text-2xl">Get in Touch</h2>
            <p className="mb-6 text-muted-foreground">
              Have questions or want to learn more about us? We'd love to hear from you.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 px-6 py-3 rounded-lg text-primary-foreground transition-colors"
              >
                <Mail className="w-4 h-4" />
                Contact Us
              </Link>
              <a
                href="https://wa.me/8801534554311"
                className="inline-flex items-center gap-2 hover:bg-muted px-6 py-3 border border-border rounded-lg transition-colors"
              >
                <Phone className="w-4 h-4" />
                Call Us
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
    </>
  );
};

export default AboutUsPage;