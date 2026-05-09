import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shopping Cart | Korean Skincare Shop BD',
  description: 'Review your items in your shopping cart. Complete your Korean skincare product purchase with our secure checkout process.',
  keywords: ['shopping cart', 'my cart', 'checkout', 'Korean skincare shop'],
  robots: {
    index: false,
    follow: true,
  },
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
