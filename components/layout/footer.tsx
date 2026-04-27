"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Crown,
  Facebook,
  Instagram,
  Mail,
  Twitter,
  Youtube,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { getCategories, Category } from "@/lib/api/categories";

interface ApiResponse<T> {
  categories: T[];
}

export function Footer() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const currentYear = new Date().getFullYear();
  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const response = await getCategories(1, 5);
      if (
        response?.categories &&
        (categories.length !== response.categories.length ||
          !categories.every((cat, idx) => cat.id === response.categories[idx].id))
      ) {
        setCategories(response.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  useEffect(() => {


    fetchCategories();

    // Poll every 10 seconds for new categories
     const interval = setInterval(() => {
      fetchCategories(); // Refetch every 30 seconds
    }, 10000); // 30 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto px-4 py-12 container">
        {/* Main Grid - 3 Columns */}
        <div className="gap-8 grid grid-cols-1 md:grid-cols-3">
          {/* Brand Section - Takes more space */}
          <div className="space-y-6 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="flex justify-center items-center bg-white rounded-full w-12 h-12">
                <Image
                  src="/logo1.png"
                  width={50}
                  height={50}
                  alt="Korean Skincare Shop BD Logo"
                  className="w-13 h-12 object-contain"
                />
              </div>
              <span className="font-bold text-xl golden-text">
                KOREAN SKINCARE SHOP BD
              </span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Korean Skincare SHOP BD - Your Trusted Source for Real Korean Beauty.
            </p>
            <p className="text-gray-400 leading-relaxed">
              We bring you 100% original & authentic skincare, straight from Korea.
              Glowing skin starts here - trusted quality, nationwide delivery, and skincare for every budget.
            </p>
            <p className="text-gray-400 leading-relaxed">
              Real Products. Real Results. Always Authentic.
              "Experience the Luxury of Authentic Korean Skincare - Only at Korean Skincare SHOP BD."
            </p>
            <div>
              <h4 className="mb-3 font-semibold text-white">Follow Us</h4>
              <div className="flex space-x-3">
                <Link
                  href="https://www.facebook.com/share/171kJBukU7/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:bg-gray-800 p-2 rounded-full text-gray-400 hover:text-primary transition-all">
                  <Facebook className="w-5 h-5" />
                </Link>
                <Link
                  href="https://www.instagram.com/koreanskincareshop.bd/?fbclid=IwY2xjawLCQxlleHRuA2FlbQIxMABicmlkETFvaGJCNXhMTHZNQkYycmNvAR7tWZ2DtDj9Mw5egbu53veP8IjPKAxizJoMrBlh0XUGKhNc-fJ5fNuCG0kb2A_aem_qWiwm07QHyXIFOkKw0otLw#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:bg-gray-800 p-2 rounded-full text-gray-400 hover:text-primary transition-all">
                  <Instagram className="w-5 h-5" />
                </Link>
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className="hover:bg-gray-800 text-gray-400 hover:text-primary transition-all">
                  <Link
                    href="mailto:koreanskincareshopbd1@gmail.com"
                    target="_blank"
                    rel="noopener noreferrer">
                    <Mail className="w-5 h-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className="hover:bg-gray-800 text-gray-400 hover:text-primary transition-all">
                  <Link
                    href="https://wa.me/8801534554311"
                    target="_blank"
                    rel="noopener noreferrer">
                    <Phone className="w-5 h-5" />
                  </Link>
                </Button>
              </div>
              {/* Contact Info */}
              <div className="space-y-1">
                <p className="flex items-center text-gray-400">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>+8801534554311</span>
                </p>
                <p className="flex items-center text-gray-400">
                  <span className="mr-2">Address:</span>
                  <span>Dhanmondi, Dhaka, Bangladesh</span>
                </p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-lg">Quick Links</h3>
            <nav className="space-y-3">
              <Link
                href="/about"
                className="block text-gray-400 hover:text-primary transition-colors">
                About Us
              </Link>
              <Link
                href="/contact"
                className="block text-gray-400 hover:text-primary transition-colors">
                Contact
              </Link>
              <Link
                href="/shipping"
                className="block text-gray-400 hover:text-primary transition-colors">
                Shipping Info
              </Link>
              {/* <Link href="/returns" className="block text-gray-400 hover:text-primary transition-colors">
                Returns & Exchanges
              </Link> */}
              <Link
                href="/support"
                className="block text-gray-400 hover:text-primary transition-colors">
                Customer Support
              </Link>
            </nav>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-lg">
              Shop Categories
            </h3>
            <nav className="space-y-3">
              { categories.length > 0 ? (
                categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/products?category=${category.id}`}
                    className="block text-gray-400 hover:text-primary capitalize transition-colors">
                    {category.name}
                  </Link>
                ))
              ) : (
                <>
                  <Link
                    href="/products?category=skincare"
                    className="block text-gray-400 hover:text-primary transition-colors">
                    Skincare
                  </Link>
                  <Link
                    href="/products?category=makeup"
                    className="block text-gray-400 hover:text-primary transition-colors">
                    Makeup
                  </Link>
                  <Link
                    href="/products?category=fragrances"
                    className="block text-gray-400 hover:text-primary transition-colors">
                    Fragrances
                  </Link>
                  <Link
                    href="/products?category=haircare"
                    className="block text-gray-400 hover:text-primary transition-colors">
                    Hair Care
                  </Link>
                  <Link
                    href="/products"
                    className="block text-gray-400 hover:text-primary transition-colors">
                    View All Products
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="flex md:flex-row flex-col justify-between items-center mt-12 pt-8 border-gray-800 border-t">
          <p className="text-gray-400 text-sm">
            © {currentYear} KOREAN SKINCARE SHOP BD. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-6 mt-4 md:mt-0">
            <Link
              href="/privacy"
              className="text-gray-400 hover:text-primary text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-gray-400 hover:text-primary text-sm transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
