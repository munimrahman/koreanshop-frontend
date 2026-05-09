"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { cloudfrontLoader } from '@/lib/cloudfront-loader';

interface BrandCardProps {
  id: string;
  slug?: string;
  name: string;
  logoUrl: string | null;
}

export function BrandCard({ id, slug, name, logoUrl }: BrandCardProps) {
  return (
    <Link
      href={`/products?brand=${slug || id}`}
      className="group flex-shrink-0"
    >
      <div className="relative bg-white shadow-lg group-hover:shadow-xl rounded-xl w-32 md:w-40 h-32 md:h-40 overflow-hidden group-hover:scale-105 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-orange-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="z-10 relative flex flex-col justify-center items-center p-4 h-full">
          <div className="relative mb-2 w-16 md:w-20 h-16 md:h-20">
            <Image
              src={logoUrl || '/placeholder-brand-logo.png'}
              alt={name}
              fill
              loader={cloudfrontLoader}
              sizes="(max-width: 768px) 64px, 80px"
              className="rounded-lg object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder-brand-logo.png';
              }}
            />
          </div>
          <p className="font-semibold text-gray-800 group-hover:text-primary-600 text-sm md:text-base text-center transition-colors">
            {name}
          </p>
        </div>
      </div>
    </Link>
  );
}