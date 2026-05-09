// pages/shipping.tsx or app/shipping/page.tsx
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Truck, MapPin, Clock, Package, CreditCard, AlertCircle } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping & Delivery | Korean Skincare Shop BD',
  description: 'Learn about our shipping rates, delivery options, and policies. Get your Korean skincare products delivered fast across Dhaka and Bangladesh.',
  keywords: ['shipping', 'delivery', 'shipping rates', 'fast delivery Bangladesh', 'K-beauty delivery'],
  openGraph: {
    title: 'Shipping & Delivery Information',
    description: 'Fast and reliable shipping across Bangladesh.',
    url: 'https://www.koreanskincareshopbd.com/shipping',
    type: 'website',
    images: [{ url: '/logo2.png', width: 1200, height: 630, alt: 'Shipping Information' }],
  },
};

const ShippingInfoPage: React.FC = () => {
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
            <Truck className="w-8 h-8 text-primary" />
            <h1 className="font-bold text-foreground text-3xl">Shipping Information</h1>
          </div>
          <p className="text-muted-foreground">
            Everything you need to know about our shipping and delivery services
          </p>
        </div>

        <div className="space-y-8">
          {/* Shipping Rates */}
          <section>
            <h2 className="flex items-center gap-2 mb-6 font-semibold text-foreground text-2xl">
              <CreditCard className="w-6 h-6" />
              Shipping Rates
            </h2>
            <div className="gap-6 grid md:grid-cols-2">
              <div className="bg-gradient-to-br from-blue-50 dark:from-blue-950/20 to-blue-100 dark:to-blue-900/20 p-6 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-6 h-6 text-blue-600" />
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-xl">Inside Dhaka</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-800 dark:text-blue-200">Shipping Fee:</span>
                    <span className="font-bold text-blue-900 dark:text-blue-100 text-2xl">৳80</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-800 dark:text-blue-200">Delivery Time:</span>
                    <span className="font-medium text-blue-900 dark:text-blue-100">1-2 Days</span>
                  </div>
                  <div className="pt-2 border-t border-blue-200 dark:border-blue-700">
                    <p className="text-blue-700 dark:text-blue-300 text-sm">
                      Same-day delivery available for orders placed before 2 PM
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 dark:from-green-950/20 to-green-100 dark:to-green-900/20 p-6 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-6 h-6 text-green-600" />
                  <h3 className="font-semibold text-green-900 dark:text-green-100 text-xl">Outside Dhaka</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-green-800 dark:text-green-200">Shipping Fee:</span>
                    <span className="font-bold text-green-900 dark:text-green-100 text-2xl">৳150</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-green-800 dark:text-green-200">Delivery Time:</span>
                    <span className="font-medium text-green-900 dark:text-green-100">3-5 Days</span>
                  </div>
                  <div className="pt-2 border-green-200 dark:border-green-700 border-t">
                    <p className="text-green-700 dark:text-green-300 text-sm">
                      Free shipping on orders over ৳2000
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Delivery Areas */}
          <section className="bg-muted/50 p-6 rounded-lg">
            <h2 className="flex items-center gap-2 mb-4 font-semibold text-foreground text-2xl">
              <MapPin className="w-6 h-6" />
              Delivery Areas
            </h2>
            <div className="gap-6 grid md:grid-cols-2">
              <div>
                <h3 className="mb-3 font-semibold text-foreground">Inside Dhaka (৳80)</h3>
                <ul className="space-y-1 text-muted-foreground text-sm">
                  <li>• Dhanmondi, Gulshan, Banani</li>
                  <li>• Uttara, Mirpur, Mohammadpur</li>
                  <li>• Old Dhaka, New Market</li>
                  <li>• Wari, Ramna, Tejgaon</li>
                  <li>• Bashundhara, Baridhara</li>
                </ul>
              </div>
              <div>
                <h3 className="mb-3 font-semibold text-foreground">Outside Dhaka (৳150)</h3>
                <ul className="space-y-1 text-muted-foreground text-sm">
                  <li>• Chittagong, Sylhet, Rajshahi</li>
                  <li>• Khulna, Barisal, Rangpur</li>
                  <li>• Comilla, Mymensingh</li>
                  <li>• All other districts nationwide</li>
                  <li>• Remote areas may take longer</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Shipping Process */}
          <section>
            <h2 className="flex items-center gap-2 mb-6 font-semibold text-foreground text-2xl">
              <Package className="w-6 h-6" />
              How Shipping Works
            </h2>
            <div className="gap-4 grid md:grid-cols-4">
              {[
                {
                  step: '1',
                  title: 'Order Placed',
                  description: 'You place your order and make payment',
                  icon: <CreditCard className="w-6 h-6" />
                },
                {
                  step: '2',
                  title: 'Confirmed',
                  description: 'We Confirm and pack your order',
                  icon: <Package className="w-6 h-6" />
                },
                {
                  step: '3',
                  title: 'Shipped',
                  description: 'Your order is dispatched with tracking',
                  icon: <Truck className="w-6 h-6" />
                },
                {
                  step: '4',
                  title: 'Delivered',
                  description: 'You receive your order at your doorstep',
                  icon: <MapPin className="w-6 h-6" />
                }
              ].map((item, index) => (
                <div key={index} className="p-4 border border-border rounded-lg text-center">
                  <div className="flex justify-center items-center bg-primary/10 mx-auto mb-3 rounded-full w-12 h-12">
                    <div className="text-primary">{item.icon}</div>
                  </div>
                  <div className="mb-1 font-semibold text-primary text-sm">Step {item.step}</div>
                  <h3 className="mb-2 font-medium text-foreground">{item.title}</h3>
                  <p className="text-muted-foreground text-xs">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Delivery Times */}
          <section className="p-6 border border-border rounded-lg">
            <h2 className="flex items-center gap-2 mb-4 font-semibold text-foreground text-2xl">
              <Clock className="w-6 h-6" />
              Estimated Delivery Times
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-3 font-medium text-foreground text-left">Location</th>
                    <th className="py-3 font-medium text-foreground text-left">Standard Delivery</th>
                                        <th className="py-3 font-medium text-foreground text-left">Express Delivery</th>
                    <th className="py-3 font-medium text-foreground text-left">Shipping Cost</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-border">
                    <td className="py-3 text-foreground">Dhaka Metro</td>
                    <td className="py-3 text-muted-foreground">1-2 days</td>
                    <td className="py-3 text-muted-foreground">Same day*</td>
                    <td className="py-3 font-medium text-foreground">৳80</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3 text-foreground">Chittagong</td>
                    <td className="py-3 text-muted-foreground">3-4 days</td>
                    <td className="py-3 text-muted-foreground">2 days</td>
                    <td className="py-3 font-medium text-foreground">৳150</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3 text-foreground">Sylhet, Rajshahi</td>
                    <td className="py-3 text-muted-foreground">3-5 days</td>
                    <td className="py-3 text-muted-foreground">2-3 days</td>
                    <td className="py-3 font-medium text-foreground">৳150</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-foreground">Other Districts</td>
                    <td className="py-3 text-muted-foreground">4-7 days</td>
                    <td className="py-3 text-muted-foreground">3-5 days</td>
                    <td className="py-3 font-medium text-foreground">৳150</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-muted-foreground text-xs">
              *Same-day delivery available for orders placed before 2:00 PM in selected Dhaka areas
            </p>
          </section>

          {/* Important Notes */}
          <section className="bg-amber-50 dark:bg-amber-950/20 p-6 border border-amber-200 dark:border-amber-800 rounded-lg">
            <h2 className="flex items-center gap-2 mb-4 font-semibold text-amber-800 dark:text-amber-200 text-xl">
              <AlertCircle className="w-5 h-5" />
              Important Notes
            </h2>
            <div className="space-y-3 text-amber-700 dark:text-amber-300">
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 bg-amber-500 mt-2 rounded-full w-2 h-2" />
                <p className="text-sm">
                  <strong>Processing Time:</strong> Orders are processed within 24 hours (excluding weekends and holidays)
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 bg-amber-500 mt-2 rounded-full w-2 h-2" />
                <p className="text-sm">
                  <strong>Weather Delays:</strong> Delivery may be delayed during extreme weather conditions
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 bg-amber-500 mt-2 rounded-full w-2 h-2" />
                <p className="text-sm">
                  <strong>Holiday Schedule:</strong> No deliveries on major national holidays
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 bg-amber-500 mt-2 rounded-full w-2 h-2" />
                <p className="text-sm">
                  <strong>Remote Areas:</strong> Some remote locations may incur additional charges
                </p>
              </div>
            </div>
          </section>

          {/* Tracking */}
          {/* <section>
            <h2 className="mb-4 font-semibold text-foreground text-2xl">Order Tracking</h2>
            <div className="gap-6 grid md:grid-cols-2">
              <div className="space-y-4">
                <h3 className="font-medium text-foreground">How to Track Your Order</h3>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">1.</span>
                    You'll receive an SMS and email with tracking details once your order ships
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">2.</span>
                    Visit our tracking page or use the link provided
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">3.</span>
                    Enter your order number to see real-time updates
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">4.</span>
                    Get notified when your package is out for delivery
                  </li>
                </ul>
              </div>
              
            </div>
          </section> */}

          {/* Contact for Shipping */}
          <section className="bg-muted/50 p-8 rounded-lg text-center">
            <h2 className="mb-4 font-semibold text-foreground text-xl">Need Help with Shipping?</h2>
            <p className="mb-6 text-muted-foreground">
              Our customer service team is here to assist you with any shipping questions or concerns.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 px-6 py-3 rounded-lg text-primary-foreground transition-colors"
              >
                <Truck className="w-4 h-4" />
                Contact Support
              </Link>
              <a
                href="tel:+8801534554311"
                className="inline-flex items-center gap-2 hover:bg-muted px-6 py-3 border border-border rounded-lg transition-colors"
              >
                Call: +8801534554311
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ShippingInfoPage;