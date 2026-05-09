"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { cloudfrontLoader } from "@/lib/cloudfront-loader";
import Link from "next/link";
import { Search, Grid, List, ShoppingBag, Eye, Package, Info, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getBrands, Brand } from "@/lib/api/brands";

interface BrandsPageContentProps {
  initialBrands: Brand[];
  initialPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function BrandsPageContent({
  initialBrands,
  initialPagination,
}: BrandsPageContentProps) {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const isInitialRender = useRef(true);

  // State
  const [brands, setBrands] = useState<Brand[]>(initialBrands);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(
    searchParams?.get("search") || ""
  );
  const [sortBy, setSortBy] = useState<"name" | "createdAt" | "productCount">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [pagination, setPagination] = useState(initialPagination);

  // Fetch brands — skip first run if server already provided data
  useEffect(() => {
    if (isInitialRender.current && initialBrands.length > 0) {
      isInitialRender.current = false;
      return;
    }
    isInitialRender.current = false;
    const fetchBrands = async () => {
      try {
        setLoading(true);
        const response = await getBrands(currentPage, pagination.limit);
        setBrands(response.data.brands);
        setPagination(response.data.pagination);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch brands:", err);
        setError("Failed to load brands");
        toast({
          title: "Error",
          description: "Failed to load brands",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, [currentPage, toast]);

  // Filter and sort brands
  const filteredAndSortedBrands = brands
    .filter((brand) =>
      brand.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (sortBy === "productCount") {
        const aCount = a.productCount || 0;
        const bCount = b.productCount || 0;
        return sortOrder === "asc" ? aCount - bCount : bCount - aCount;
      }
      
      if (sortBy === "createdAt") {
        const aDate = new Date(a.createdAt).getTime();
        const bDate = new Date(b.createdAt).getTime();
        return sortOrder === "asc" ? aDate - bDate : bDate - aDate;
      }
      
      // For name
      const aName = String(aValue || "").toLowerCase();
      const bName = String(bValue || "").toLowerCase();
      return sortOrder === "asc" 
        ? aName.localeCompare(bName)
        : bName.localeCompare(aName);
    });

  const handleSortChange = (value: string) => {
    switch (value) {
      case "name-asc":
        setSortBy("name");
        setSortOrder("asc");
        break;
      case "name-desc":
        setSortBy("name");
        setSortOrder("desc");
        break;
      case "products-desc":
        setSortBy("productCount");
        setSortOrder("desc");
        break;
      case "products-asc":
        setSortBy("productCount");
        setSortOrder("asc");
        break;
      case "newest":
        setSortBy("createdAt");
        setSortOrder("desc");
        break;
      case "oldest":
        setSortBy("createdAt");
        setSortOrder("asc");
        break;
      default:
        setSortBy("name");
        setSortOrder("asc");
    }
  };

  // Brand Detail Modal Component
  const BrandDetailModal = ({ brand }: { brand: Brand }) => (
    <Dialog open={selectedBrand?.id === brand.id} onOpenChange={(open) => !open && setSelectedBrand(null)}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-4">
            {/* Brand Logo */}
            <div className="relative flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-lg w-16 h-16 overflow-hidden">
              {brand.logoUrl ? (
                <Image
                  src={brand.logoUrl}
                  alt={brand.name}
                  fill
                  loader={cloudfrontLoader}
                  sizes="64px"
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder-brand-logo.png";
                  }}
                />
              ) : (
                <div className="flex justify-center items-center bg-gradient-to-br from-primary-500 to-purple-600 w-full h-full">
                  <span className="font-semibold text-white text-lg">
                    {brand.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold mb-2">{brand.name}</DialogTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  <span>{brand.productCount || 0} products</span>
                </div>
                <div>Since {new Date(brand.createdAt).getFullYear()}</div>
              </div>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Full Description */}
          {brand.description && (
            <div>
              <h3 className="font-semibold text-lg mb-3">About {brand.name}</h3>
              <DialogDescription className="text-base leading-relaxed whitespace-pre-wrap">
                {brand.description}
              </DialogDescription>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button asChild className="golden-button flex-1">
              <Link href={`/products?brand=${brand.slug || brand.id}`}>
                <ShoppingBag className="mr-2 w-4 h-4" />
                View All Products
              </Link>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setSelectedBrand(null)}
              className="px-6"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 container">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="mb-2 sm:mb-4 font-bold text-2xl sm:text-3xl lg:text-4xl golden-text">
            Our Brands
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Discover our curated selection of premium beauty and skincare brands
          </p>
        </div>

        {/* Search and Controls */}
        <div className="space-y-4 mb-6 sm:mb-8">
          {/* Search Bar */}
          <div className="relative">
            <Search className="top-1/2 left-3 absolute w-4 h-4 text-muted-foreground -translate-y-1/2" />
            <Input
              type="search"
              placeholder="Search brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-4 pl-10 h-10 sm:h-11"
            />
          </div>

          {/* Controls */}
          <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4">
            <div className="flex flex-wrap gap-2 sm:gap-4">
              {/* Sort Select */}
              <div className="flex-1 sm:flex-none sm:w-48">
                <Select
                  value={`${sortBy}-${sortOrder}`}
                  onValueChange={handleSortChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name-asc">Name A-Z</SelectItem>
                    <SelectItem value="name-desc">Name Z-A</SelectItem>
                    <SelectItem value="products-desc">Most Products</SelectItem>
                    <SelectItem value="products-asc">Least Products</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-1 sm:gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="flex-1 sm:flex-none"
              >
                <Grid className="sm:mr-2 w-4 h-4" />
                <span className="hidden sm:inline">Grid</span>
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="flex-1 sm:flex-none"
              >
                <List className="sm:mr-2 w-4 h-4" />
                <span className="hidden sm:inline">List</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4 mb-4 sm:mb-6">
          <div className="text-muted-foreground text-sm">
            Showing {filteredAndSortedBrands.length} of {brands.length} brands
          </div>
        </div>

        {/* Error State */}
        {error ? (
          <div className="py-12 text-center">
            <p className="mb-4 text-red-600 text-lg">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : filteredAndSortedBrands.length === 0 ? (
          <div className="py-12 text-center">
            <p className="mb-4 text-muted-foreground text-lg">
              No brands found matching your search.
            </p>
            <Button variant="outline" onClick={() => setSearchQuery("")}>
              Clear Search
            </Button>
          </div>
        ) : (
          <>
            {/* Brands Grid/List */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAndSortedBrands.map((brand, index) => (
                  <motion.div
                    key={brand.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.6,
                      delay: (index % 12) * 0.1,
                    }}
                  >
                    <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden h-full">
                      <CardContent className="p-6 h-full">
                        <div className="flex flex-col items-center justify-between h-full space-y-4">
                          <div className="flex flex-col items-center space-y-4 flex-1">
                            {/* Brand Logo */}
                            <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg w-20 h-20 overflow-hidden">
                              {brand.logoUrl ? (
                                <Image
                                  src={brand.logoUrl}
                                  alt={brand.name}
                                  fill
                                  loader={cloudfrontLoader}
                                  sizes="80px"
                                  className="object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = "/placeholder-brand-logo.png";
                                  }}
                                />
                              ) : (
                                <div className="flex justify-center items-center bg-gradient-to-br from-primary-500 to-purple-600 w-full h-full">
                                  <span className="font-semibold text-white text-lg">
                                    {brand.name.charAt(0)}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Brand Info */}
                            <div className="space-y-2 text-center flex-1 flex flex-col justify-center">
                              <h3 className="font-semibold text-lg line-clamp-2">
                                {brand.name}
                              </h3>
                              
                              {brand.description && (
                                <p className="text-muted-foreground text-sm line-clamp-3">
                                  {brand.description}
                                </p>
                              )}

                              {/* Show "Read more" for longer descriptions */}
                              {brand.description && brand.description.length > 100 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedBrand(brand)}
                                  className="text-primary hover:text-primary/80 p-0 h-auto font-medium"
                                >
                                  <Info className="mr-1 w-3 h-3" />
                                  Read more
                                </Button>
                              )}

                              {/* Product Count */}
                              <div className="flex justify-center items-center gap-2 mt-auto">
                                <Package className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground text-sm">
                                  {brand.productCount || 0} products
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Actions - Always at bottom */}
                          <div className="flex gap-2 w-full mt-auto">
                            {brand.description && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedBrand(brand)}
                                className="flex-shrink-0"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              asChild
                              className="golden-button flex-1"
                            >
                              <Link href={`/products?brand=${brand.slug || brand.id}`}>
                                <ShoppingBag className="mr-2 w-4 h-4" />
                                View Products
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedBrands.map((brand, index) => (
                  <motion.div
                    key={brand.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.6,
                      delay: (index % 12) * 0.1,
                    }}
                  >
                    <Card className="overflow-hidden">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex gap-4 sm:gap-6">
                          {/* Brand Logo */}
                          <div className="relative flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-lg w-16 sm:w-20 h-16 sm:h-20 overflow-hidden">
                            {brand.logoUrl ? (
                              <Image
                                src={brand.logoUrl}
                                alt={brand.name}
                                fill
                                loader={cloudfrontLoader}
                                sizes="(max-width: 640px) 64px, 80px"
                                className="object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/placeholder-brand-logo.png";
                                }}
                              />
                            ) : (
                              <div className="flex justify-center items-center bg-gradient-to-br from-primary-500 to-purple-600 w-full h-full">
                                <span className="font-semibold text-white text-sm sm:text-base">
                                  {brand.name.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Brand Details */}
                          <div className="flex-1 space-y-2 min-w-0">
                            <div className="flex sm:flex-row flex-col sm:justify-between sm:items-start gap-2 sm:gap-4 h-full">
                              <div className="flex-1 min-w-0 flex flex-col justify-between">
                                <div>
                                  <h3 className="font-semibold text-lg sm:text-xl line-clamp-2">
                                    {brand.name}
                                  </h3>
                                  
                                  {brand.description && (
                                    <div className="mt-1">
                                      <p className="text-muted-foreground text-sm sm:text-base line-clamp-2">
                                        {brand.description}
                                      </p>
                                      {brand.description.length > 150 && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => setSelectedBrand(brand)}
                                          className="text-primary hover:text-primary/80 p-0 h-auto font-medium mt-1"
                                        >
                                          <Info className="mr-1 w-3 h-3" />
                                          Read full description
                                        </Button>
                                      )}
                                    </div>
                                  )}
                                </div>

                                <div className="flex sm:flex-row flex-col sm:justify-between sm:items-end gap-2 sm:gap-4 mt-4">
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1">
                                      <Package className="w-4 h-4 text-muted-foreground" />
                                      <span className="text-muted-foreground text-sm">
                                        {brand.productCount || 0} products
                                      </span>
                                    </div>
                                    
                                    <div className="text-muted-foreground text-sm">
                                      Since {new Date(brand.createdAt).getFullYear()}
                                    </div>
                                  </div>

                                  {/* Actions - Always at bottom right */}
                                  <div className="flex gap-2 sm:ml-auto">
                                    {brand.description && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSelectedBrand(brand)}
                                        className="flex-shrink-0"
                                      >
                                        <Eye className="mr-2 w-4 h-4" />
                                        <span className="hidden sm:inline">Details</span>
                                      </Button>
                                    )}
                                    <Button
                                      asChild
                                      className="golden-button"
                                    >
                                      <Link href={`/products?brand=${brand.slug || brand.id}`}>
                                        <ShoppingBag className="mr-2 w-4 h-4" />
                                        <span className="hidden sm:inline">View Products</span>
                                        <span className="sm:hidden">Products</span>
                                      </Link>
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Brand Detail Modals */}
            {filteredAndSortedBrands.map((brand) => (
              <BrandDetailModal key={`modal-${brand.id}`} brand={brand} />
            ))}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex sm:flex-row flex-col justify-center items-center gap-4 mt-8">
                {/* Mobile Pagination */}
                <div className="sm:hidden flex justify-center items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={!pagination.hasPrev || loading}
                  >
                    Previous
                  </Button>

                  <span className="px-3 text-muted-foreground text-sm">
                    {currentPage} of {pagination.totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!pagination.hasNext || loading}
                  >
                    Next
                  </Button>
                </div>

                {/* Desktop Pagination */}
                <div className="hidden sm:flex justify-center items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={!pagination.hasPrev || loading}
                  >
                    Previous
                  </Button>

                  <div className="flex items-center gap-1 sm:gap-2">
                    {Array.from(
                      { length: Math.min(5, pagination.totalPages) },
                      (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            disabled={loading}
                            className="w-10"
                          >
                            {pageNum}
                          </Button>
                        );
                      }
                    )}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!pagination.hasNext || loading}
                  >
                    Next
                  </Button>
                </div>

                {/* Page Info */}
                <div className="sm:text-left text-center">
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    Page {currentPage} of {pagination.totalPages} ({pagination.total} total brands)
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
