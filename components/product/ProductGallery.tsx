"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { cloudfrontLoader } from "@/lib/cloudfront-loader";

interface ProductGalleryProps {
  images: string[];
  name: string;
  isOnSale?: boolean;
  discountPercentage?: number;
  isNew?: boolean;
}

export function ProductGallery({
  images,
  name,
  isOnSale = false,
  discountPercentage = 0,
  isNew = false,
}: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="space-y-4">
      <div className="relative bg-gray-100 rounded-lg aspect-square overflow-hidden">
        <Image
          src={images[selectedImage]}
          alt={name}
          fill
          loader={cloudfrontLoader}
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
          className="object-contain"
        />
        {isNew && (
          <Badge className="top-4 left-4 absolute bg-primary text-white">
            New
          </Badge>
        )}
        {isOnSale && (
          <Badge className="top-4 right-4 absolute" variant="destructive">
            -{discountPercentage}%
          </Badge>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(index)}
            className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
              selectedImage === index ? "border-primary" : "border-gray-200"
            }`}
          >
            <Image
              src={image}
              alt={`${name} ${index + 1}`}
              fill
              loader={cloudfrontLoader}
              sizes="80px"
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
