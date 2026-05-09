"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Sun,
  Moon,
  Crown,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn, generateEventId } from "@/lib/utils";
import { useAdmin } from "@/contexts/AdminContext";
import { useToast } from "@/hooks/use-toast";
import { getEnhancedCart } from "@/lib/api/cart";
import { getSessionIdCookie } from "@/lib/cookies/session";
import Image from "next/image";
import { cloudfrontLoader } from "@/lib/cloudfront-loader";
import useFbIds from "@/hooks/useFbIds";
import { PAGINATION_LIMIT } from "@/constants/constants";

// Type definitions
interface Brand {
  id: string;
  slug?: string;
  name: string;
  logo: string;
  description: string;
}

interface Category {
  id: string;
  slug?: string;
  name: string;
  description: string;
  parentId?: string;
}

interface ApiResponse<T> {
  categories: T[];
  message: string;
  data: {
    brands: Brand[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}
interface CartItemWithProduct {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  loading?: boolean;
}

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState<number>(0); // Mock cart count
  const [isAdmin, setIsAdmin] = useState(false); // Mock admin state
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingBrands, setIsLoadingBrands] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { logout } = useAdmin();
  const { toast } = useToast();
  const [items, setItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  // const sessionIdcookie = getSessionIdCookie();
  const [authed, setAuthed] = useState<boolean>(false);
  const { fbclid, fbp } = useFbIds();
  const eventId = generateEventId();
  const fbEventTime = Math.floor(Date.now() / 1000);

  useEffect(() => {
    const checkAuth = () => {
      const authedValue = localStorage.getItem("authed") === "true";
      setAuthed(authedValue);
      console.log("Auth checked:", authedValue);
    };

    const interval = setInterval(() => {
      checkAuth();
    }, 10000); // 30 secons

    return () => clearInterval(interval);
  }, []);

  // Prevent hydration mismatch for theme
  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      let allCategories: Category[] = [];
      let currentPage = 1;
      let hasMorePages = true;

      // Fetch all pages of categories
      while (hasMorePages) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/categories?page=${currentPage}&limit=20`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }

        const result: ApiResponse<Category> = await response.json();

        if (result && result.categories) {
          allCategories = [...allCategories, ...result.categories];
        }

        // Check if there are more pages (adjust based on your API response structure)
        if (result.categories && result.categories.length === 20) {
          currentPage++;
        } else {
          hasMorePages = false;
        }
      }

      setCategories(allCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Fallback to empty array or show error message
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        setLoading(true);

        // Check if session exists first
        const sessionId = await getSessionIdCookie();
        if (!sessionId) {
          // No session means empty cart
          setItems([]);
          setCartItems(0);
          setLoading(false);
          return;
        }

        // Get cart items
        const cartResponse = await getEnhancedCart();

        // Check if cart is empty or invalid
        if (
          !cartResponse?.data?.cart?.items ||
          cartResponse.data.cart.items.length === 0
        ) {
          setItems([]);
          setCartItems(0);
          setLoading(false);
          return;
        }

        const cartItems = cartResponse.data.cart.items;

        // Convert cart items to our interface
        const cartItemsWithProduct: CartItemWithProduct[] = cartItems.map(
          (item) => ({
            id: item.productId, // Using productId as ID for now
            productId: item.productId,
            quantity: item.quantity,
            price: Number(item.totalPrice),
            loading: true,
          })
        );

        setItems(cartItemsWithProduct);
        let count = 0;
        for (const item of cartItemsWithProduct) {
          count += item.quantity;
        }
        setCartItems(count);

        // Fetch product details for each item
      } catch (error) {
        console.error("Failed to fetch cart:", error);
        // Set empty cart on error
        setItems([]);
        setCartItems(0);
        toast({
          title: "Error",
          description: "Failed to load cart items",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCartData();
    window.addEventListener("cartUpdated", fetchCartData);

    return () => {
      window.removeEventListener("cartUpdated", fetchCartData);
    };
  }, [toast]);
  const fetchBrands = async () => {
    try {
      setIsLoadingBrands(true);
      let allBrands: Brand[] = [];
      let currentPage = 1;
      let hasMorePages = true;

      // Fetch all pages of brands
      while (hasMorePages) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/brands?page=${currentPage}&limit=20`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch brands");
        }

        const result: ApiResponse<Brand> = await response.json();

        if (result && result.data && result.data.brands) {
          allBrands = [...allBrands, ...result.data.brands];
        }

        // Check if there are more pages based on pagination info
        if (
          result.data &&
          result.data.pagination &&
          result.data.pagination.hasNext
        ) {
          currentPage++;
        } else {
          hasMorePages = false;
        }
      }

      setBrands(allBrands);
    } catch (error) {
      console.error("Error fetching brands:", error);
      // Fallback to empty array or show error message
      setBrands([]);
    } finally {
      setIsLoadingBrands(false);
    }
  };

  // Fetch brands from API
  useEffect(() => {
     Promise.all([fetchCategories(), fetchBrands()]);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }

    // Cleanup on unmount
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }

    // handle pixel and conversion api
    fetch("/api/fb-conversion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventName: "Search",
        eventId: eventId,
        eventTime: fbEventTime,
      }),
    }).catch(() => {});

    (window as any).fbq("track", "Search", {
      eventID: eventId,
      fbc: fbclid,
      fbp: fbp,
    });
  };

  const toggleAdmin = () => {
    setAuthed(false);
    logout();

    router.push("/");
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "glass-effect shadow-lg border-b"
          : "bg-white/95 dark:bg-gray-900/95"
      )}
    >
      <div className="mx-auto px-4 container">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="group flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="flex justify-center items-center bg-white rounded-full w-12 h-12"
            >
              <Image
                src="/logo1.png"
                width={75}
                height={75}
                loader={cloudfrontLoader}
                alt="Korean Skincare Shop BD Logo"
                className="pt-1 w-20 h-19 object-contain"
              />
            </motion.div>
            <span className="inline-block font-bold text-sm lg:text-2xl text-blue-900">
              KOREAN SKINCARE SHOP BD
            </span>
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href={`/products?page=1&per_page=${PAGINATION_LIMIT}`} legacyBehavior passHref>
                  <NavigationMenuLink className="group inline-flex justify-center items-center bg-background data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 hover:bg-accent focus:bg-accent disabled:opacity-50 px-4 py-2 rounded-md focus:outline-none w-max h-10 font-medium text-sm transition-colors hover:text-accent-foreground focus:text-accent-foreground disabled:pointer-events-none">
                    All Products
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>Skincare</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="gap-3 grid md:grid-cols-2 p-4 w-[400px] md:w-[500px] lg:w-[600px] max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        <NavigationMenuLink key={category.id} asChild>
                          <Link
                            href={`/products?category=${category.slug || category.id}&page=1&per_page=${PAGINATION_LIMIT}`}
                            className="block space-y-1 hover:bg-accent focus:bg-accent p-3 rounded-md outline-none no-underline leading-none transition-colors hover:text-accent-foreground focus:text-accent-foreground select-none"
                          >
                            <div className="font-medium text-sm leading-none">
                              {category.name}
                            </div>
                            {category.description && (
                              <p className="text-muted-foreground text-sm line-clamp-2 leading-snug">
                                {category.description}
                              </p>
                            )}
                          </Link>
                        </NavigationMenuLink>
                      ))
                    ) : (
                      <div className="col-span-2 py-4 text-muted-foreground text-sm text-center">
                        No categories available
                      </div>
                    )}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>Brands</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="gap-3 grid md:grid-cols-2 p-4 w-[400px] md:w-[500px] lg:w-[600px] max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {/* All Brands Link */}
                    <NavigationMenuLink asChild className="col-span-2">
                      <Link
                        href="/brands"
                        className="block space-y-1 hover:bg-accent focus:bg-accent p-3 rounded-md outline-none no-underline leading-none transition-colors hover:text-accent-foreground focus:text-accent-foreground select-none border-b border-border mb-2"
                      >
                        <div className="font-semibold text-sm leading-none text-primary">
                          All Brands
                        </div>
                        <p className="text-muted-foreground text-sm line-clamp-1 leading-snug">
                          Browse all available brands
                        </p>
                      </Link>
                    </NavigationMenuLink>

                    {brands.length > 0 ? (
                      brands.map((brand) => (
                        <NavigationMenuLink key={brand.id} asChild>
                          <Link
                            href={`/products?brand=${brand.slug || brand.id}&page=1&per_page=${PAGINATION_LIMIT}`}
                            className="block space-y-1 hover:bg-accent focus:bg-accent p-3 rounded-md outline-none no-underline leading-none transition-colors hover:text-accent-foreground focus:text-accent-foreground select-none"
                          >
                            <div className="flex items-center space-x-2">
                              {" "}
                              {brand.logo && (
                                <Image
                                  src={brand.logo}
                                  alt={brand.name}
                                  width={24}
                                  height={24}
                                  loader={cloudfrontLoader}
                                  className="rounded w-6 h-6 object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              )}
                              <div className="font-medium text-sm leading-none">
                                {brand.name}
                              </div>
                            </div>
                            {brand.description && (
                              <p className="text-muted-foreground text-sm line-clamp-2 leading-snug">
                                {brand.description}
                              </p>
                            )}
                          </Link>
                        </NavigationMenuLink>
                      ))
                    ) : (
                      <div className="col-span-2 py-4 text-muted-foreground text-sm text-center">
                        No brands available
                      </div>
                    )}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex md:flex-1 md:mx-8 md:max-w-sm"
          >
            <div className="relative w-full">
              <Search className="top-1/2 left-3 absolute w-4 h-4 text-muted-foreground -translate-y-1/2" />
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-4 pl-10 w-full"
              />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            {" "}
            {/* Theme Toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="hidden sm:inline-flex"
              >
                <Sun className="w-5 h-5 rotate-0 dark:-rotate-90 scale-100 dark:scale-0 transition-all" />
                <Moon className="absolute w-5 h-5 rotate-90 dark:rotate-0 scale-0 dark:scale-100 transition-all" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            )}
            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="group relative hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary/70 transition-shadow"
              aria-label="View cart"
            >
              <Link href="/cart" className="flex justify-center items-center">
                <span className="relative flex items-center">
                  <ShoppingBag className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  {cartItems > 0 && (
                    <span
                      className="-top-2 -right-2 absolute flex justify-center items-center bg-gradient-to-tr from-primary to-yellow-400 shadow-md border-2 border-background rounded-full w-5 h-5 font-semibold text-white text-xs"
                      aria-label={`${cartItems} items in cart`}
                    >
                      {cartItems}
                    </span>
                  )}
                </span>
              </Link>
            </Button>
            {/* Admin/User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <Settings className="mr-2 w-4 h-4" />
                      Admin Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {authed && (
                    <DropdownMenuItem onClick={toggleAdmin}>
                      <LogOut className="mr-2 w-4 h-4" />
                      Logout
                    </DropdownMenuItem>
                  )}
                </>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pt-4 pb-4 border-t">
          <form onSubmit={handleSearch} className="relative">
            <Search className="top-1/2 left-3 absolute w-4 h-4 text-muted-foreground -translate-y-1/2" />
            <Input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-4 pl-10"
            />
          </form>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="lg:hidden bg-background border-t shadow-lg relative z-50"
          >
            <div className="mx-auto px-4 py-4 container">
              <div
                className="max-h-[70vh] overflow-y-auto overscroll-contain border rounded-lg mobile-scroll"
                style={{
                  WebkitOverflowScrolling: "touch",
                  scrollbarWidth: "thin",
                  scrollbarColor: "#cbd5e1 #f1f5f9",
                }}
                onTouchStart={(e) => {
                  setTouchStart(e.touches[0].clientY);
                }}
                onTouchMove={(e) => {
                  if (touchStart === null) return;

                  const element = e.currentTarget;
                  const currentTouch = e.touches[0].clientY;
                  const diff = touchStart - currentTouch;
                  const scrollTop = element.scrollTop;
                  const scrollHeight = element.scrollHeight;
                  const clientHeight = element.clientHeight;

                  // At top and scrolling up
                  if (scrollTop === 0 && diff < 0) {
                    e.preventDefault();
                    return;
                  }

                  // At bottom and scrolling down
                  if (scrollTop >= scrollHeight - clientHeight && diff > 0) {
                    e.preventDefault();
                    return;
                  }

                  // Allow normal scrolling
                  e.stopPropagation();
                }}
                onTouchEnd={() => {
                  setTouchStart(null);
                }}
              >
                <nav className="space-y-2 p-2">
                  <Link href={`/products?page=1&per_page=${PAGINATION_LIMIT}`} onClick={() => setIsOpen(false)}>
                    <div className="py-3 px-2 font-medium text-lg hover:no-underline hover:bg-accent/50 rounded-md transition-colors touch-target">
                      All Products
                    </div>
                  </Link>

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="categories" className="border-0">
                      <AccordionTrigger className="py-3 px-2 font-medium text-lg hover:no-underline hover:bg-accent/50 rounded-md transition-colors [&[data-state=open]]:bg-accent/30 touch-target">
                        Skincare
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-1 pl-4 pr-2">
                          {isLoadingCategories ? (
                            <div className="py-3 px-2 text-muted-foreground text-sm">
                              Loading categories...
                            </div>
                          ) : categories.length > 0 ? (
                            categories.map((category) => (
                              <Link
                                key={category.id}
                                href={`/products?category=${category.slug || category.id}&page=1&per_page=${PAGINATION_LIMIT}`}
                                className="block py-3 px-2 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-accent/30 active:bg-accent/50 touch-manipulation touch-target"
                                onClick={() => setIsOpen(false)}
                              >
                                {category.name}
                              </Link>
                            ))
                          ) : (
                            <span className="block py-3 px-2 text-muted-foreground text-sm">
                              No categories available
                            </span>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="brands" className="border-0">
                      <AccordionTrigger className="py-3 px-2 font-medium text-lg hover:no-underline hover:bg-accent/50 rounded-md transition-colors [&[data-state=open]]:bg-accent/30 touch-target">
                        Brands
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-1 pl-4 pr-2">
                          {/* All Brands Link */}
                          <Link
                            href="/brands"
                            className="block py-3 px-2 font-semibold text-primary hover:bg-accent/30 rounded-md transition-colors border-b border-border mb-2 touch-manipulation touch-target"
                            onClick={() => setIsOpen(false)}
                          >
                            All Brands
                          </Link>

                          {isLoadingBrands ? (
                            <div className="py-3 px-2 text-muted-foreground text-sm">
                              Loading brands...
                            </div>
                          ) : brands.length > 0 ? (
                            brands.map((brand) => (
                              <Link
                                key={brand.id}
                                href={`/products?brand=${brand.slug || brand.id}&page=1&per_page=${PAGINATION_LIMIT}`}
                                className="flex items-center py-3 px-2 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-accent/30 active:bg-accent/50 touch-manipulation touch-target"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setIsOpen(false);
                                  window.location.href = `/products?brand=${brand.slug || brand.id}&page=1&per_page=${PAGINATION_LIMIT}`;
                                }}
                              >
                                {brand.logo && (
                                  <Image
                                    src={brand.logo}
                                    alt={brand.name}
                                    width={16}
                                    height={16}
                                    loader={cloudfrontLoader}
                                    className="mr-2 rounded w-4 h-4 object-cover flex-shrink-0"
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                    }}
                                  />
                                )}
                                {brand.name}
                              </Link>
                            ))
                          ) : (
                            <span className="block py-3 px-2 text-muted-foreground text-sm">
                              No brands available
                            </span>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <div className="pt-2 mt-4 border-t">
                    {mounted && (
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setTheme(theme === "dark" ? "light" : "dark");
                          setIsOpen(false);
                        }}
                        className="justify-start w-full py-3 px-2 text-left hover:bg-accent/50 touch-manipulation touch-target"
                      >
                        {theme === "dark" ? (
                          <>
                            <Sun className="mr-2 w-4 h-4 flex-shrink-0" />
                            Light Mode
                          </>
                        ) : (
                          <>
                            <Moon className="mr-2 w-4 h-4 flex-shrink-0" />
                            Dark Mode
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </nav>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
