"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  CreditCard,
  Truck,
  ShieldCheck,
  Clock,
  AlertCircle,
  CheckCircle,
  Package,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Loader2,
  Calculator,
  ShoppingCart,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  processCheckout,
  checkCheckoutReadiness,
  type CheckoutRequest,
  type CheckoutReadinessResponse,
} from "@/lib/api/orders";
import {
  getEnhancedCart,
  clearCart,
  type EnhancedCartResponse,
} from "@/lib/api/cart";
import {
  getAllShippingCharges,
  calculateShippingCharge,
  type ShippingChargesResponse,
} from "@/lib/api/shipping";
import { getSessionIdCookie } from "@/lib/cookies/session";
import { getProduct, Product, ProductVariation } from "@/lib/api/products";
import { generateEventId, hashSHA256 } from "@/lib/utils";
import useFbIds from "@/hooks/useFbIds";

const paymentMethods = [
  {
    id: "CASH_ON_DELIVERY",
    name: "Cash on Delivery",
    description: "Pay when you receive your order",
    icon: Package,
    available: true,
  },
  // {
  //     id: 'CARD',
  //     name: 'Credit/Debit Card',
  //     description: 'Secure online payment',
  //     icon: CreditCard,
  //     available: true
  // },
  // {
  //     id: 'MOBILE_BANKING',
  //     name: 'Mobile Banking',
  //     description: 'bKash, Nagad, Rocket',
  //     icon: Phone,
  //     available: true
  // }
];

const regions = [
  { value: "dhaka", label: "Dhaka" },
  { value: "outside_dhaka", label: "Outside Dhaka" },
];
interface CartItemWithProduct {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product?: Product;
  variation?: ProductVariation;
  loading?: boolean;
}

interface FieldError {
  path: string;
  message: string;
}

interface ErrorState {
  [key: string]: string;
}

// Helper component for displaying field errors
const FieldError = ({ error }: { error?: string }) => {
  if (!error) return null;

  return (
    <p className="text-sm font-medium text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
      <AlertCircle className="w-4 h-4" />
      {error}
    </p>
  );
};
export default function CheckoutPage() {
  const router = useRouter();
  //   const searchParams = useSearchParams();
  const { toast } = useToast();

  const [sessionId, setSessionId] = useState<string>("");
  const [sessionIdLoading, setSessionIdLoading] = useState(true);
  //   const [readiness, setReadiness] = useState<CheckoutReadinessResponse | null>(null);
  const [cartData, setCartData] = useState<EnhancedCartResponse | null>(null);
  const [shippingCharges, setShippingCharges] =
    useState<ShippingChargesResponse | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<
    "dhaka" | "outside_dhaka"
  >("dhaka");
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<ErrorState>({});
  const [formData, setFormData] = useState<CheckoutRequest>({
    sessionId: "",
    customerName: "",
    email: "",
    phone: "",
    shippingAddress: "",
    billingAddress: "",
    paymentMethod: "CASH_ON_DELIVERY",
    notes: "",
    customShippingFee: undefined,
  });
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [items, setItems] = useState<CartItemWithProduct[]>([]);
  const { fbclid, fbp } = useFbIds();
  const fbEventTime = Math.floor(Date.now() / 1000);

  useEffect(() => {
    const fetchSessionId = async () => {
      try {
        const id = await getSessionIdCookie();
        setSessionId(id || "");
        setFormData((prev) => ({
          ...prev,
          sessionId: id || "",
        }));
      } finally {
        setSessionIdLoading(false);
      }
    };
    fetchSessionId();
  }, []);

  useEffect(() => {
    // Don't proceed until we've finished fetching the session ID
    if (sessionIdLoading) return;

    if (!sessionId) {
      toast({
        title: "Error",
        description: "No cart session found. Please add items to cart first.",
        variant: "destructive",
      });
      // router.push('/cart');
      return;
    }

    Promise.all([
      //   checkReadiness(),
      fetchCartData(),
      fetchShippingCharges(),
    ]);
  }, [sessionId, sessionIdLoading]);

  const fetchCartData = async () => {
    try {
      const data = await getEnhancedCart();
      console.log(data);
      setCartData(data);
      const cartItems = data.data.cart.items;

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

      // Fetch product details for each item
      const updatedItems = await Promise.all(
        cartItemsWithProduct.map(async (item) => {
          try {
            const product = await getProduct(item.productId);

            // Find the appropriate variation based on price or use first variation
            const variation =
              product.variations.find(
                (v) => v.price === item.price || v.salePrice === item.price
              ) || product.variations[0];

            return {
              ...item,
              product,
              variation,
              loading: false,
            };
          } catch (error) {
            console.error(`Failed to fetch product ${item.productId}:`, error);
            return {
              ...item,
              loading: false,
            };
          }
        })
      );

      setItems(updatedItems);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch cart data",
        variant: "destructive",
      });
    }
  };

  const fetchShippingCharges = async () => {
    try {
      const data = await getAllShippingCharges();
      setShippingCharges(data);
      setShippingCost(data.data.dhaka); // Default to Dhaka
      // Set initial shipping fee in formData
      setFormData((prev) => ({
        ...prev,
        customShippingFee: data.data.dhaka,
      }));
      setLoading(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch shipping charges",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleRegionChange = (region: "dhaka" | "outside_dhaka") => {
    setSelectedRegion(region);
    if (shippingCharges) {
      const cost =
        region === "dhaka"
          ? shippingCharges.data.dhaka
          : shippingCharges.data.outsideDhaka;
      setShippingCost(cost);
      // Update formData with the selected shipping fee for backend
      setFormData((prev) => ({
        ...prev,
        customShippingFee: cost,
      }));
    }
  };

  const calculateShippingFromAddress = async () => {
    if (!formData.shippingAddress.trim()) {
      toast({
        title: "Missing Address",
        description: "Please enter your shipping address first",
        variant: "destructive",
      });
      return;
    }

    try {
      setCalculatingShipping(true);
      const result = await calculateShippingCharge({
        address: formData.shippingAddress,
      });

      const detectedRegion = result.data.region;
      setSelectedRegion(detectedRegion);
      setShippingCost(result.data.charge);
      // Update formData with the calculated shipping fee
      setFormData((prev) => ({
        ...prev,
        customShippingFee: result.data.charge,
      }));

      toast({
        title: "Shipping Calculated",
        description: `Detected region: ${
          result.data.isDhaka ? "Dhaka" : "Outside Dhaka"
        }. Shipping cost: ৳${result.data.charge}`,
      });
    } catch (error: any) {
      toast({
        title: "Calculation Failed",
        description:
          error.message || "Failed to calculate shipping from address",
        variant: "destructive",
      });
    } finally {
      setCalculatingShipping(false);
    }
  };

  const handleInputChange = (field: keyof CheckoutRequest, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }

    // Auto-fill billing address if same as shipping
    if (field === "shippingAddress" && sameAsBilling) {
      setFormData((prev) => ({
        ...prev,
        billingAddress: value,
      }));
      // Clear billing address error when auto-filling from shipping
      if (errors.billingAddress) {
        setErrors((prev) => ({
          ...prev,
          billingAddress: "",
        }));
      }
    }
  };

  const handleSameAsBillingChange = (checked: boolean) => {
    setSameAsBilling(checked);
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        billingAddress: prev.shippingAddress,
      }));
      // Clear billing address error when auto-filling
      if (errors.billingAddress) {
        setErrors((prev) => ({
          ...prev,
          billingAddress: "",
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: ErrorState = {};

    // Required field validation
    const required: Array<keyof CheckoutRequest> = [
      "customerName",
      "email",
      "phone",
      "shippingAddress",
      "billingAddress",
    ];

    required.forEach((field) => {
      if (!formData[field]) {
        const fieldName = field.replace(/([A-Z])/g, " $1").toLowerCase();
        newErrors[field] = `${
          fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
        } is required`;
      }
    });

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation - more comprehensive
    if (formData.phone) {
      const phoneDigits = formData.phone.replace(/\D/g, "");
      if (phoneDigits.length < 10) {
        newErrors.phone = "Phone number must be at least 10 digits";
      } else if (phoneDigits.length > 15) {
        newErrors.phone = "Phone number cannot exceed 15 digits";
      }
    }

    // Customer name validation
    if (formData.customerName && formData.customerName.trim().length < 2) {
      newErrors.customerName = "Name must be at least 2 characters";
    }

    // Address validation
    if (
      formData.shippingAddress &&
      formData.shippingAddress.trim().length < 10
    ) {
      newErrors.shippingAddress = "Please provide a complete shipping address";
    }

    if (formData.billingAddress && formData.billingAddress.trim().length < 10) {
      newErrors.billingAddress = "Please provide a complete billing address";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors below",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setProcessing(true);
      setErrors({}); // Clear any existing errors

      const result = await processCheckout(formData);

      // send data to facebook conversion API
      if (result.success) {
        // call Facebook conversion API from next api folder
        fetch("/api/fb-conversion", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            eventName: "Purchase",
            eventId: result.data.orderId,
            eventTime: fbEventTime,
            customData: {
              value: total,
              currency: "BDT",
            },
            customerData: {
              em: [hashSHA256(formData.email)],
              fn: [hashSHA256(formData.phone)],
            },
          }),
        }).catch(() => {});

        (window as any).fbq(
          "track",
          "Purchase",
          {
            value: total,
            currency: "BDT",
          },
          {
            eventID: result.data.orderId,
            fbc: fbclid,
            fbp: fbp,
          }
        );
      }

      toast({
        title: "Order Placed Successfully!",
        description: `Your order ${result.data.orderId} has been created.`,
      });

      // Clear cart items in state
      setItems([]);
      setCartData(null);

      // Clear cart session and trigger update event
      await clearCart();

      // Redirect to order confirmation page
      router.push(`/`);
    } catch (error: any) {
      // Clear any existing errors first
      setErrors({});

      try {
        // Try to parse the error response to get field-specific errors
        const errorResponse = JSON.parse(error.message);

        if (errorResponse.errors && Array.isArray(errorResponse.errors)) {
          const newErrors: ErrorState = {};
          errorResponse.errors.forEach((err: FieldError) => {
            newErrors[err.path] = err.message;
          });
          setErrors(newErrors);

          toast({
            title: "Validation Error",
            description: "Please check the form for errors",
            variant: "destructive",
          });
        } else {
          // Fallback for non-field-specific errors
          toast({
            title: "Checkout Failed",
            description:
              errorResponse.message ||
              error.message ||
              "Failed to process your order",
            variant: "destructive",
          });
        }
      } catch {
        // If error message is not JSON, handle as a general error
        toast({
          title: "Checkout Failed",
          description: error.message || "Failed to process your order",
          variant: "destructive",
        });
      }
    } finally {
      setProcessing(false);
    }
  };

  const subtotal = items.reduce(
    (sum, item) =>
      sum +
      (Number(item.variation?.salePrice) ||
        Number(item.variation?.price) ||
        Number(item.price)) *
        item.quantity,
    0
  );
  const total = subtotal + shippingCost;

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-primary-50 dark:from-gray-900 to-orange-50 dark:to-gray-800 py-8 min-h-screen">
        <div className="mx-auto px-4 container">
          <div className="mx-auto max-w-4xl">
            <div className="py-12 text-center">
              <Loader2 className="mx-auto mb-4 w-8 h-8 animate-spin" />
              <p className="text-muted-foreground">Checking your cart...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-primary-50 dark:from-gray-900 to-orange-50 dark:to-gray-800 py-8 min-h-screen">
      <div className="mx-auto px-4 container">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <h1 className="mb-2 font-bold text-3xl md:text-4xl golden-text">
              Secure Checkout
            </h1>
            <p className="text-muted-foreground">
              Complete your order with our enhanced security features
            </p>
          </motion.div>

          {/* Readiness Status */}
          {/* {readiness && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <Alert className={readiness.ready ? "border-green-200 bg-green-50 dark:bg-green-950" : "border-red-200 bg-red-50 dark:bg-red-950"}>
                {readiness.ready ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
                <AlertDescription>
                  {readiness.ready ? (
                    <div className="flex justify-between items-center">
                      <span>Your cart is ready for checkout</span>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          {readiness.summary.itemCount} items
                        </span>
                                                <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          ~{readiness.summary.estimatedCheckoutTime}s
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="mb-2 font-medium">Checkout Issues:</p>
                      <ul className="space-y-1 list-disc list-inside">
                        {readiness.issues.map((issue, index) => (
                          <li key={index}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            </motion.div>
          )} */}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Summary */}
            {Object.keys(errors).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <AlertDescription>
                    <div className="text-red-800 dark:text-red-200">
                      <p className="font-medium mb-2">
                        Please fix the following errors:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {Object.entries(errors).map(([field, message]) => (
                          <li key={field}>{message}</li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            <div className="gap-6 grid grid-cols-1 lg:grid-cols-3">
              {/* Left Column - Customer Information */}
              <div className="space-y-6 lg:col-span-2">
                {/* Customer Details */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="glass-effect">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Customer Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="customerName">Full Name *</Label>
                        <Input
                          id="customerName"
                          value={formData.customerName}
                          onChange={(e) =>
                            handleInputChange("customerName", e.target.value)
                          }
                          placeholder="Enter your full name"
                          className={
                            errors.customerName
                              ? "border-red-500 focus:border-red-500"
                              : ""
                          }
                          required
                        />
                        <FieldError error={errors.customerName} />
                      </div>
                      <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                        <div>
                          <Label htmlFor="email">Email Address *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              handleInputChange("email", e.target.value)
                            }
                            placeholder="your@email.com"
                            className={
                              errors.email
                                ? "border-red-500 focus:border-red-500"
                                : ""
                            }
                            required
                          />
                          <FieldError error={errors.email} />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number *</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) =>
                              handleInputChange("phone", e.target.value)
                            }
                            placeholder="+880 1234 567890"
                            className={
                              errors.phone
                                ? "border-red-500 focus:border-red-500"
                                : ""
                            }
                            required
                          />
                          <FieldError error={errors.phone} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Shipping Address */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="glass-effect">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Truck className="w-5 h-5" />
                        Shipping Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="shippingAddress">Address *</Label>
                        <Textarea
                          id="shippingAddress"
                          value={formData.shippingAddress}
                          onChange={(e) =>
                            handleInputChange("shippingAddress", e.target.value)
                          }
                          placeholder="Enter your complete shipping address"
                          rows={3}
                          className={
                            errors.shippingAddress
                              ? "border-red-500 focus:border-red-500"
                              : ""
                          }
                          required
                        />
                        <FieldError error={errors.shippingAddress} />
                      </div>

                      {/* Region Selection */}
                      <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                        <div>
                          <Label htmlFor="region">Region *</Label>
                          <Select
                            value={selectedRegion}
                            onValueChange={handleRegionChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select region" />
                            </SelectTrigger>
                            <SelectContent>
                              {regions.map((region) => (
                                <SelectItem
                                  key={region.value}
                                  value={region.value}
                                >
                                  {region.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {/* <div className="flex items-end">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={calculateShippingFromAddress}
                            disabled={
                              calculatingShipping ||
                              !formData.shippingAddress.trim()
                            }
                            className="w-full"
                          >
                            {calculatingShipping ? (
                              <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Calculating...
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Calculator className="w-4 h-4" />
                                Auto-detect Region
                              </div>
                            )}
                          </Button>
                        </div> */}
                      </div>

                      {/* Shipping Cost Display */}
                      <div className="bg-blue-50 dark:bg-blue-950/20 p-3 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-blue-700 dark:text-blue-300 text-sm">
                            Shipping Cost (
                            {selectedRegion === "dhaka"
                              ? "Dhaka"
                              : "Outside Dhaka"}
                            )
                          </span>
                          <span className="font-bold text-blue-700 dark:text-blue-300">
                            ৳{Number(shippingCost).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Billing Address */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="glass-effect">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Billing Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="sameAsBilling"
                          checked={sameAsBilling}
                          onChange={(e) =>
                            handleSameAsBillingChange(e.target.checked)
                          }
                          className="border-gray-300 rounded"
                        />
                        <Label htmlFor="sameAsBilling">
                          Same as shipping address
                        </Label>
                      </div>
                      <div>
                        <Label htmlFor="billingAddress">Address *</Label>
                        <Textarea
                          id="billingAddress"
                          value={formData.billingAddress}
                          onChange={(e) =>
                            handleInputChange("billingAddress", e.target.value)
                          }
                          placeholder="Enter your billing address"
                          rows={3}
                          disabled={sameAsBilling}
                          className={
                            errors.billingAddress
                              ? "border-red-500 focus:border-red-500"
                              : ""
                          }
                          required
                        />
                        <FieldError error={errors.billingAddress} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Payment Method */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Card className="glass-effect">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Payment Method
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RadioGroup
                        value={formData.paymentMethod}
                        onValueChange={(value) =>
                          handleInputChange("paymentMethod", value)
                        }
                      >
                        {paymentMethods.map((method) => {
                          const IconComponent = method.icon;
                          return (
                            <div
                              key={method.id}
                              className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors ${
                                formData.paymentMethod === method.id
                                  ? "border-primary bg-primary/5"
                                  : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                              } ${
                                !method.available
                                  ? "opacity-50 cursor-not-allowed"
                                  : "cursor-pointer"
                              }`}
                            >
                              <RadioGroupItem
                                value={method.id}
                                id={method.id}
                                disabled={!method.available}
                              />
                              <IconComponent className="w-5 h-5 text-primary" />
                              <div className="flex-1">
                                <Label
                                  htmlFor={method.id}
                                  className="font-medium cursor-pointer"
                                >
                                  {method.name}
                                </Label>
                                <p className="text-muted-foreground text-sm">
                                  {method.description}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </RadioGroup>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Order Notes */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Card className="glass-effect">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Order Notes (Optional)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={formData.notes}
                        onChange={(e) =>
                          handleInputChange("notes", e.target.value)
                        }
                        placeholder="Any special instructions for your order..."
                        rows={3}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Right Column - Order Summary */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="top-8 sticky"
                >
                  <Card className="glass-effect">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5" />
                        Order Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Cart Items */}
                      {items && items.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm">Items in Cart</h4>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {items.map((item) => (
                              <div
                                key={item.productId}
                                className="flex justify-between items-start text-sm"
                              >
                                <div className="flex-1 pr-2">
                                  <p className="font-medium line-clamp-1">
                                    {item.product?.name ||
                                      "Product name unavailable"}
                                  </p>
                                  <span className="font-bold text-sm sm:text-base golden-text">
                                    ৳
                                    {(
                                      Number(item.variation?.salePrice) ||
                                      Number(item.variation?.price) ||
                                      Number(item.price)
                                    ).toFixed(2)}
                                  </span>
                                  {item.variation?.price &&
                                    item.variation?.salePrice &&
                                    Number(item.variation.price) >
                                      Number(item.variation.salePrice) && (
                                      <span className="ml-2 text-muted-foreground text-xs sm:text-sm line-through">
                                        ৳
                                        {Number(item.variation.price).toFixed(
                                          2
                                        )}
                                      </span>
                                    )}
                                  <p className="text-muted-foreground text-xs">
                                    Qty: {item.quantity} × ৳
                                    {(
                                      Number(item.variation?.salePrice) ||
                                      Number(item.variation?.price) ||
                                      Number(item.price)
                                    ).toFixed(2)}
                                  </p>
                                </div>
                                <span className="font-medium">
                                  ৳
                                  {(
                                    (Number(item.variation?.salePrice) ||
                                      Number(item.variation?.price) ||
                                      Number(item.price)) * item.quantity
                                  ).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                          <Separator />
                        </div>
                      )}

                      {/* Summary Calculations */}
                      {items && (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground text-sm">
                              Items ({items.length})
                            </span>
                            <span className="font-medium">
                              ৳{Number(subtotal).toFixed(2)}
                            </span>
                          </div>

                          <Separator />

                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground">
                                Subtotal
                              </span>
                              <span>৳{Number(subtotal).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground">
                                Shipping (
                                {selectedRegion === "dhaka"
                                  ? "Dhaka"
                                  : "Outside Dhaka"}
                                )
                              </span>
                              <span
                                className={
                                  shippingCost === 0 ? "text-green-600" : ""
                                }
                              >
                                {shippingCost === 0
                                  ? "Free"
                                  : `৳${Number(shippingCost).toFixed(2)}`}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground">Tax</span>
                              <span>৳0.00</span>
                            </div>
                          </div>

                          <Separator />

                          <div className="flex justify-between items-center font-bold text-lg">
                            <span>Total</span>
                            <span className="golden-text">
                              ৳{Number(total).toFixed(2)}
                            </span>
                          </div>
                        </>
                      )}

                      <div className="space-y-3 pt-4">
                        <div className="flex items-center gap-2 text-green-600 text-sm">
                          <ShieldCheck className="w-4 h-4" />
                          <span>SSL Secured Checkout</span>
                        </div>
                        <div className="flex items-center gap-2 text-green-600 text-sm">
                          <Truck className="w-4 h-4" />
                          <span>
                            {shippingCost === 0
                              ? "Free Shipping"
                              : `Shipping: ৳${shippingCost}`}
                          </span>
                        </div>
                        {/* <div className="flex items-center gap-2 text-green-600 text-sm">
                                                    <Package className="w-4 h-4" />
                                                    <span>30-Day Return Policy</span>
                                                </div> */}
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-12 text-lg golden-button"
                        disabled={processing}
                      >
                        {processing ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Processing...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5" />
                            Place Order - ৳{Number(total).toFixed(2)}
                          </div>
                        )}
                      </Button>

                      <p className="text-muted-foreground text-xs text-center">
                        By placing your order, you agree to our{" "}
                        <a
                          href="/terms"
                          className="text-primary hover:underline"
                        >
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a
                          href="/privacy"
                          className="text-primary hover:underline"
                        >
                          Privacy Policy
                        </a>
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </form>

          {/* Security Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8"
          >
            <Card className="glass-effect">
              <CardContent className="p-6">
                <h3 className="mb-4 font-semibold text-center">
                  Enhanced Security Features
                </h3>
                <div className="gap-4 grid grid-cols-1 md:grid-cols-3 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <ShieldCheck className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="font-medium">Two-Phase Commit</p>
                      <p className="text-muted-foreground text-xs">
                        Bulletproof transaction processing
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Package className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="font-medium">Stock Reservation</p>
                      <p className="text-muted-foreground text-xs">
                        Items reserved during checkout
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <CreditCard className="w-8 h-8 text-purple-600" />
                    <div>
                      <p className="font-medium">Server-Side Pricing</p>
                      <p className="text-muted-foreground text-xs">
                        Real-time price validation
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Shipping Information */}
          {shippingCharges && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mt-6"
            >
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle className="flex justify-center items-center gap-2 text-center">
                    <Truck className="w-5 h-5" />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                    <div className="bg-blue-50 dark:bg-blue-950/20 p-4 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <h4 className="font-medium text-blue-700 dark:text-blue-300">
                          Dhaka Region
                        </h4>
                      </div>
                      <p className="mb-1 text-blue-600 dark:text-blue-400 text-sm">
                        Shipping Cost:{" "}
                        <span className="font-bold">
                          ৳{shippingCharges.data.dhaka}
                        </span>
                      </p>
                      <p className="text-blue-600 dark:text-blue-400 text-xs">
                        Delivery within Dhaka city limits
                      </p>
                    </div>

                    <div className="bg-orange-50 dark:bg-orange-950/20 p-4 border border-orange-200 dark:border-orange-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-orange-600" />
                        <h4 className="font-medium text-orange-700 dark:text-orange-300">
                          Outside Dhaka
                        </h4>
                      </div>
                      <p className="mb-1 text-orange-600 dark:text-orange-400 text-sm">
                        Shipping Cost:{" "}
                        <span className="font-bold">
                          ৳{shippingCharges.data.outsideDhaka}
                        </span>
                      </p>
                      <p className="text-orange-600 dark:text-orange-400 text-xs">
                        Delivery outside Dhaka city
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800/50 mt-4 p-3 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="flex-shrink-0 mt-0.5 w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <div className="text-gray-700 dark:text-gray-300 text-sm">
                        <p className="mb-1 font-medium">Shipping Notes:</p>
                        <ul className="space-y-1 text-xs">
                          <li>
                            • Orders are typically processed within 1-2 business
                            days
                          </li>
                          <li>
                            • Delivery time: 2-3 days for Dhaka, 3-5 days for
                            outside Dhaka
                          </li>
                          <li>
                            • Free shipping may apply for orders above certain
                            amount
                          </li>
                          <li>
                            • Use &quot;Auto-detect Region&quot; for accurate
                            shipping calculation
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
