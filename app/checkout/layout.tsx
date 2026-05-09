import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Checkout | Korean Skincare Shop BD',
  description: 'Complete your order securely. Fast and safe payment options for your Korean skincare products.',
  keywords: ['checkout', 'payment', 'secure checkout', 'Korean skincare purchase'],
  robots: {
    index: false,
    follow: true,
  },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
