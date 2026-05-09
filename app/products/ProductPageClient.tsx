"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Grid,
  List,
  ShoppingBag,
  Eye,
  X,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { getProducts, Product, GetProductsParams } from "@/lib/api/products";
import { getBrands, Brand } from "@/lib/api/brands";
import { getCategories, Category } from "@/lib/api/categories";
import { QuickViewModal } from "@/components/ui/quick-view-modal";
import { addToEnhancedCart } from "@/lib/api/cart";
import { useToast } from "@/hooks/use-toast";
import { ProductsSection } from "@/components/product/ProductSections";
import PriceRangeFilter from "@/components/product/PriceRange";

interface ProductsPageContentProps {
  initialProducts: Product[];
  initialBrands: Brand[];
  initialCategories: Category[];
  initialPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function ProductsPageContent({
  initialProducts,
  initialBrands,
  initialCategories,
  initialPagination,
}: ProductsPageContentProps) {
  const searchParams = useSearchParams();

  const router = useRouter();

  // State for data
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [brands, setBrands] = useState<Brand[]>(initialBrands);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [perPage] = useState(
    Math.max(1, parseInt(searchParams?.get("per_page") || "48") || 48)
  );
  const [pagination, setPagination] = useState(initialPagination);

  // State for filters
  const [searchQuery, setSearchQuery] = useState(
    searchParams?.get("search") || ""
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams?.get("category") || "all"
  );
  const [selectedBrand, setSelectedBrand] = useState(
    searchParams?.get("brand") || "all"
  );
  const [variationTags, setVariationTags] = useState(
    searchParams?.get("variationTags") || ""
  );

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [sortBy, setSortBy] = useState<"price" | "name" | "createdAt">(
    "createdAt"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(
    Math.max(1, parseInt(searchParams?.get("page") || "1") || 1)
  );

  // Update filter states when URL parameters change
  useEffect(() => {
    setSearchQuery(searchParams?.get("search") || "");
    setSelectedCategory(searchParams?.get("category") || "all");
    setSelectedBrand(searchParams?.get("brand") || "all");
    setVariationTags(searchParams?.get("variationTags") || "");
    setCurrentPage(Math.max(1, parseInt(searchParams?.get("page") || "1") || 1));
  }, [searchParams]);

  // Quick view modal state
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(
    null
  );
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  // Mobile filter state
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    brands: false,
    price: false,
  });
  const { toast } = useToast();
  const isInitialRender = useRef(true);

  // Fetch initial data (brands and categories) — skip if server already provided them
  useEffect(() => {
    if (initialBrands.length > 0 && initialCategories.length > 0) return;
    const fetchInitialData = async () => {
      try {
        const [brandsResponse, categoriesResponse] = await Promise.all([
          getBrands(1, 100),
          getCategories(1, 100),
        ]);

        setBrands(brandsResponse.data.brands);
        setCategories(categoriesResponse.categories);
      } catch (err) {
        console.error("Failed to fetch initial data:", err);
        setError("Failed to load filters");
      }
    };

    fetchInitialData();
  }, []);

  // Fetch products based on filters — skip first run if server already provided data
  useEffect(() => {
    if (isInitialRender.current && initialProducts.length > 0) {
      isInitialRender.current = false;
      return;
    }
    isInitialRender.current = false;
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Build params object
        const params: GetProductsParams = {
          page: currentPage,
          limit: perPage,
          sortBy,
          sortOrder,
        };

        if (selectedCategory !== "all") {
          params.category = selectedCategory;
        }
        if (selectedBrand !== "all") {
          params.brand = selectedBrand;
        }
        if (priceRange[0] > 0) {
          params.minPrice = priceRange[0];
        }
        if (priceRange[1] < 50000) {
          params.maxPrice = priceRange[1];
        }
        if (searchQuery) {
          params.search = searchQuery;
        }
        if (variationTags) {
          params.variationTags = variationTags;
        }

        // Fetch products using getProducts API
        const response = await getProducts(params);

        setProducts(response.products);
        setPagination({
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages,
          hasNext: response.hasNext,
          hasPrev: response.hasPrev,
        });
        setError(null);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    searchQuery,
    selectedCategory,
    selectedBrand,
    priceRange,
    sortBy,
    sortOrder,
    currentPage,
    variationTags,
  ]);

  // Helper functions
  const getMainImage = (product: Product): string => {
    const mainImage = product.images?.find((img) => img.isMainImage);
    return (
      mainImage?.imageUrl || product.baseImageUrl || "/placeholder-product.png"
    );
  };

  const getProductPrice = (product: Product) => {
    if (product.variations.length === 0)
      return { price: 0, originalPrice: null };

    const variation = product.variations[0];
    return {
      price: Number(variation.salePrice) || Number(variation.price),
      originalPrice: variation.salePrice ? Number(variation.price) : null,
    };
  };

  const isNewProduct = (createdAt: string): boolean => {
    const productDate = new Date(createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return productDate > thirtyDaysAgo;
  };

  const isOnSale = (product: Product): boolean => {
    return product.variations.some(
      (variation) =>
        variation.salePrice &&
        Number(variation.salePrice) < Number(variation.price)
    );
  };

  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  };

  const closeQuickView = () => {
    setIsQuickViewOpen(false);
    setQuickViewProduct(null);
  };

  const handleSortChange = (value: string) => {
    switch (value) {
      case "price-asc":
        setSortBy("price");
        setSortOrder("asc");
        break;
      case "price-desc":
        setSortBy("price");
        setSortOrder("desc");
        break;
      case "name-asc":
        setSortBy("name");
        setSortOrder("asc");
        break;
      case "createdAt-desc":
        setSortBy("createdAt");
        setSortOrder("desc");
        break;
      default:
        setSortBy("createdAt");
        setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedBrand("all");
    setPriceRange([0, 50000]);
    setCurrentPage(1);
    setIsMobileFiltersOpen(false);
  };

  const handleAddToCart = async (product: Product, variationId?: string) => {
    console.log("ProductPageClient handleAddToCart called with:", {
      productId: product.id,
      variationId,
    });
    try {
      setAddingToCart(product.id);

      const selectedVariation = variationId
        ? product.variations.find((v) => v.id === variationId)
        : product.variations[0];

      console.log("ProductPageClient selectedVariation:", selectedVariation);

      if (!selectedVariation) {
        toast({
          title: "Error",
          description: "No product variation available",
          variant: "destructive",
        });
        return;
      }

      console.log("ProductPageClient calling addToEnhancedCart with:", {
        productId: product.id,
        quantity: 1,
        variantId: selectedVariation.id,
      });

      await addToEnhancedCart({
        productId: product.id,
        quantity: 1,
        variantId: selectedVariation.id,
      });
      window.dispatchEvent(new Event("cartUpdated"));

      toast({
        title: "Added to Cart! 🛒",
        description: `${product.name} added to your cart`,
      });
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    } finally {
      setAddingToCart(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("page", newPage.toString());
    params.set("per_page", perPage.toString());
    router.push(`/products?${params.toString()}`);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Filter component for reuse in both desktop sidebar and mobile sheet
  const FilterContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`space-y-6 ${isMobile ? "px-0" : ""}`}>
      {/* Category Filter */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm uppercase tracking-wider">
          Category
        </h3>
        <Select
          value={selectedCategory}
          onValueChange={(value) => {
            setSelectedCategory(value);
            setCurrentPage(1);
            if (isMobile) setIsMobileFiltersOpen(false);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Brand Filter */}
      <div className="space-y-3">
        <Collapsible
          open={isMobile ? expandedSections.brands : true}
          onOpenChange={() => isMobile && toggleSection("brands")}
        >
          <CollapsibleTrigger
            className={`flex items-center justify-between w-full ${
              isMobile ? "py-2" : ""
            }`}
          >
            <h3 className="font-semibold text-sm uppercase tracking-wider">
              Brands
            </h3>
            {isMobile && (
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  expandedSections.brands ? "rotate-180" : ""
                }`}
              />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2">
            <div
              className={`space-y-2 ${
                isMobile ? "mt-2" : ""
              } max-h-48 overflow-y-auto`}
            >
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="all-brands"
                  checked={selectedBrand === "all"}
                  onCheckedChange={() => {
                    setSelectedBrand("all");
                    setCurrentPage(1);
                    if (isMobile) setIsMobileFiltersOpen(false);
                  }}
                />
                <label htmlFor="all-brands" className="text-sm cursor-pointer">
                  All Brands
                </label>
              </div>
              {brands.map((brand) => (
                <div key={brand.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={brand.id}
                    checked={selectedBrand === brand.id}
                    onCheckedChange={() => {
                      setSelectedBrand(brand.id);
                      setCurrentPage(1);
                      if (isMobile) setIsMobileFiltersOpen(false);
                    }}
                  />
                  <label htmlFor={brand.id} className="text-sm cursor-pointer">
                    {brand.name}
                  </label>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Price Range Filter */}
      <PriceRangeFilter
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        setCurrentPage={setCurrentPage}
        isMobile={isMobile}
        expandedSections={expandedSections}
        toggleSection={toggleSection} // Optional: custom step
      />

      {/* Clear Filters Button */}
      {(searchQuery ||
        selectedCategory !== "all" ||
        selectedBrand !== "all" ||
        priceRange[0] > 0 ||
        priceRange[1] < 50000) && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 container">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="mb-2 sm:mb-4 font-bold text-2xl sm:text-3xl lg:text-4xl golden-text">
              Our Products
            </h1>
            {/* <p className="text-muted-foreground text-base sm:text-lg">
              Discover our complete collection of premium beauty products
            </p> */}
          </div>

          {/* Search and Filters */}
          <div className="space-y-4 mb-6 sm:mb-8">
            {/* Search Bar */}
            <div className="relative">
              <Search className="top-1/2 left-3 absolute w-4 h-4 text-muted-foreground -translate-y-1/2" />
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pr-4 pl-10 h-10 sm:h-11"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4">
              <div className="flex flex-wrap gap-2 sm:gap-4">
                {/* Mobile Filters */}
                <Sheet
                  open={isMobileFiltersOpen}
                  onOpenChange={setIsMobileFiltersOpen}
                >
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <Filter className="mr-2 w-4 h-4" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 sm:w-96">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                      <SheetDescription>
                        Filter products by your preferences
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterContent isMobile={true} />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Category Filter - Mobile */}
                <div className="lg:hidden flex-1 sm:flex-none sm:w-40">
                  <Select
                    value={selectedCategory}
                    onValueChange={(value) => {
                      setSelectedCategory(value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort Select */}
                <div className="flex-1 sm:flex-none sm:w-40">
                  <Select
                    value={`${sortBy}-${sortOrder}`}
                    onValueChange={handleSortChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt-desc">Newest</SelectItem>
                      <SelectItem value="price-asc">
                        Price: Low to High
                      </SelectItem>
                      <SelectItem value="price-desc">
                        Price: High to Low
                      </SelectItem>
                      <SelectItem value="name-asc">Name A-Z</SelectItem>
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

          <div className="flex lg:flex-row flex-col gap-6 lg:gap-8">
            {/* Desktop Sidebar Filters */}
            <div className="hidden lg:block flex-shrink-0 w-64">
              <Card className="top-4 sticky">
                <CardContent className="p-6">
                  <FilterContent />
                </CardContent>
              </Card>
            </div>

            {/* Products Grid */}
            <div className="flex-1 min-w-0">
              {/* Results Header */}
              <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4 mb-4 sm:mb-6">
                <div className="order-2 sm:order-1 text-muted-foreground text-sm">
                  Showing {products.length} of {pagination.total} products
                </div>
                {(searchQuery ||
                  selectedCategory !== "all" ||
                  selectedBrand !== "all" ||
                  priceRange[0] > 0 ||
                  priceRange[1] < 50000) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="self-start sm:self-auto order-1 sm:order-2"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>

              {loading ? (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-4 border-primary-600 border-b-2 rounded-full w-8 h-8 animate-spin"></div>
                  <p className="text-muted-foreground">Loading products...</p>
                </div>
              ) : error ? (
                <div className="py-12 text-center">
                  <p className="mb-4 text-red-600 text-lg">{error}</p>
                  <Button onClick={() => window.location.reload()}>
                    Try Again
                  </Button>
                </div>
              ) : products.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="mb-4 text-muted-foreground text-lg">
                    No products found matching your criteria.
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <>
                  {viewMode === "grid" ? (
                    <ProductsSection
                      products={products}
                      hoveredProduct={hoveredProduct}
                      setHoveredProduct={setHoveredProduct}
                      handleAddToCart={handleAddToCart}
                      addingToCart={addingToCart}
                      handleQuickView={handleQuickView}
                      getProductPrice={getProductPrice}
                      getMainImage={getMainImage}
                      isNewProduct={isNewProduct}
                      isOnSale={isOnSale}
                    />
                  ) : (
                    <div className="space-y-4">
                      {products.map((product, index) => {
                        const { price, originalPrice } =
                          getProductPrice(product);
                        const mainImageUrl = getMainImage(product);
                        const isNew = isNewProduct(product.createdAt);
                        const onSale = isOnSale(product);

                        return (
                          <motion.div
                            key={product.id}
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
                                  <div className="relative flex-shrink-0 w-20 sm:w-32 h-20 sm:h-32">
                                    <Link href={`/products/${product.slug || product.id}`}>
                                      <Image
                                        src={mainImageUrl}
                                        alt={product.name}
                                        fill
                                        sizes="(max-width: 640px) 80px, 128px"
                                        className="rounded-lg object-cover cursor-pointer"
                                        onError={(e) => {
                                          const target =
                                            e.target as HTMLImageElement;
                                          target.src =
                                            "/placeholder-product.png";
                                        }}
                                      />
                                    </Link>

                                    {/* Badges for list view */}
                                    <div className="-top-1 sm:-top-2 -right-1 sm:-right-2 absolute flex flex-col gap-1">
                                      {isNew && (
                                        <Badge className="bg-primary text-white text-xs">
                                          New
                                        </Badge>
                                      )}
                                      {onSale && originalPrice && (
                                        <Badge
                                          variant="destructive"
                                          className="text-xs"
                                        >
                                          -
                                          {Math.round(
                                            (1 - price / originalPrice) * 100
                                          )}
                                          %
                                        </Badge>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex-1 space-y-1 sm:space-y-2 min-w-0">
                                    <div className="flex sm:flex-row flex-col sm:justify-between sm:items-start gap-2 sm:gap-4">
                                      <div className="flex-1 min-w-0">
                                        <p className="text-muted-foreground text-xs sm:text-sm truncate">
                                          {product.brand?.name}
                                        </p>
                                        <h3 className="font-semibold text-sm sm:text-lg line-clamp-2">
                                          <Link
                                            href={`/products/${product.slug || product.id}`}
                                            className="hover:text-primary transition-colors"
                                          >
                                            {product.name}
                                          </Link>
                                        </h3>
                                        <p className="text-muted-foreground text-xs sm:text-sm truncate">
                                          {product.category?.name}
                                        </p>
                                      </div>

                                      {/* <div className="sm:hidden flex gap-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() =>
                                            handleQuickView(product)
                                          }
                                        >
                                          <Eye className="w-4 h-4" />
                                        </Button>
                                      </div> */}
                                    </div>

                                    {product.description && (
                                      <div className="hidden sm:block text-muted-foreground text-xs sm:text-sm line-clamp-2 whitespace-pre-wrap">
                                        {product.description}
                                      </div>
                                    )}

                                    <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-2 sm:gap-4 pt-1 sm:pt-2">
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-lg sm:text-xl golden-text">
                                          ৳{price}
                                        </span>
                                        {originalPrice &&
                                          originalPrice > price && (
                                            <span className="text-muted-foreground text-sm line-through">
                                              ৳{originalPrice}
                                            </span>
                                          )}
                                      </div>

                                      <div className="flex sm:flex-row flex-col sm:items-center gap-2">
                                        {product.variations.length > 0 && (
                                          <span
                                            className={`text-xs px-2 py-1 rounded self-start ${
                                              product.variations[0]
                                                .stockQuantity > 0
                                                ? "bg-green-100 text-green-600"
                                                : "bg-red-100 text-red-600"
                                            }`}
                                          >
                                            {product.variations[0]
                                              .stockQuantity > 0
                                              ? "In Stock"
                                              : "Out of Stock"}
                                          </span>
                                        )}
                                        <div className="flex gap-2">
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                              handleQuickView(product)
                                            }
                                            className="hidden sm:flex"
                                          >
                                            <Eye className="w-4 h-4" />
                                          </Button>
                                          <Button
                                            className="golden-button size:sm"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              // Pass the first variation's ID since we're adding from the card view
                                              const firstVariationId =
                                                product.variations?.[0]?.id;
                                              handleAddToCart(
                                                product,
                                                firstVariationId
                                              );
                                            }}
                                            disabled={
                                              addingToCart === product.id
                                            }
                                          >
                                            {addingToCart === product.id ? (
                                              <>
                                                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                                                <span className="hidden sm:inline">
                                                  Adding..
                                                </span>
                                              </>
                                            ) : (
                                              <>
                                                <ShoppingBag className="mr-2 w-4 h-4" />
                                                <span className="hidden sm:inline">
                                                  Add to Cart
                                                </span>
                                                <span className="sm:hidden">
                                                  Add
                                                </span>
                                              </>
                                            )}
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="flex sm:flex-row flex-col justify-center items-center gap-4 mt-8">
                      {/* Mobile Pagination */}
                      <div className="sm:hidden flex justify-center items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
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
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={!pagination.hasNext || loading}
                        >
                          Next
                        </Button>
                      </div>

                      {/* Desktop Pagination */}
                      <div className="hidden sm:flex justify-center items-center gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={!pagination.hasPrev || loading}
                        >
                          Previous
                        </Button>

                        <div className="flex items-center gap-1 sm:gap-2">
                          {/* Show first few pages */}
                          {Array.from(
                            { length: Math.min(3, pagination.totalPages) },
                            (_, i) => {
                              const pageNum = i + 1;
                              return (
                                <Button
                                  key={pageNum}
                                  variant={
                                    currentPage === pageNum
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  onClick={() => handlePageChange(pageNum)}
                                  disabled={loading}
                                  className="w-10"
                                >
                                  {pageNum}
                                </Button>
                              );
                            }
                          )}

                          {/* Show ellipsis and last page if needed */}
                          {pagination.totalPages > 5 && currentPage <= 3 && (
                            <>
                              <span className="px-2 text-muted-foreground">
                                ...
                              </span>
                              <Button
                                variant={
                                  currentPage === pagination.totalPages
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() =>
                                  handlePageChange(pagination.totalPages)
                                }
                                disabled={loading}
                                className="w-10"
                              >
                                {pagination.totalPages}
                              </Button>
                            </>
                          )}

                          {/* Show middle pages if current page is in the middle */}
                          {pagination.totalPages > 5 &&
                            currentPage > 3 &&
                            currentPage < pagination.totalPages - 2 && (
                              <>
                                <span className="px-2 text-muted-foreground">
                                  ...
                                </span>
                                {Array.from({ length: 3 }, (_, i) => {
                                  const pageNum = currentPage - 1 + i;
                                  return (
                                    <Button
                                      key={pageNum}
                                      variant={
                                        currentPage === pageNum
                                          ? "default"
                                          : "outline"
                                      }
                                      size="sm"
                                      onClick={() => handlePageChange(pageNum)}
                                      disabled={loading}
                                      className="w-10"
                                    >
                                      {pageNum}
                                    </Button>
                                  );
                                })}
                                <span className="px-2 text-muted-foreground">
                                  ...
                                </span>
                                <Button
                                  variant={
                                    currentPage === pagination.totalPages
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  onClick={() =>
                                    handlePageChange(pagination.totalPages)
                                  }
                                  disabled={loading}
                                  className="w-10"
                                >
                                  {pagination.totalPages}
                                </Button>
                              </>
                            )}

                          {/* Show last few pages if current page is near the end */}
                          {pagination.totalPages > 5 &&
                            currentPage >= pagination.totalPages - 2 && (
                              <>
                                <span className="px-2 text-muted-foreground">
                                  ...
                                </span>
                                {Array.from(
                                  {
                                    length: Math.min(3, pagination.totalPages),
                                  },
                                  (_, i) => {
                                    const pageNum =
                                      pagination.totalPages - 2 + i;
                                    if (pageNum <= 3) return null; // Avoid duplicate pages
                                    return (
                                      <Button
                                        key={pageNum}
                                        variant={
                                          currentPage === pageNum
                                            ? "default"
                                            : "outline"
                                        }
                                        size="sm"
                                        onClick={() => handlePageChange(pageNum)}
                                        disabled={loading}
                                        className="w-10"
                                      >
                                        {pageNum}
                                      </Button>
                                    );
                                  }
                                )}
                              </>
                            )}
                        </div>

                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={!pagination.hasNext || loading}
                        >
                          Next
                        </Button>
                      </div>

                      {/* Page Info */}
                      <div className="sm:text-left text-center">
                        <p className="text-muted-foreground text-xs sm:text-sm">
                          Page {currentPage} of {pagination.totalPages} (
                          {pagination.total} total products)
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={closeQuickView}
      />
    </>
  );
}
