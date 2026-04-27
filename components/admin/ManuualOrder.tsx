// components/Order/ManualOrderForm.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
    Plus,
    Search,
    Package,
    User,
    CreditCard,
    Settings,
    X,
    ShoppingCart,
    AlertCircle,
    CheckCircle,
    Loader2,
    Copy,
    Trash2
} from 'lucide-react';
import { useManualOrder } from '@/hooks/use-mannual-order';
import { CreateManualOrderRequest } from '@/lib/api/orders';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface OrderItem {
    id: string;
    quantity: number;
    customPrice: number;
    customDiscountAmount: number;
    customDiscountPercentage: number;
    notes: string;
}

interface ManualOrderFormData {
    customerName: string;
    email: string;
    phone: string;
    shippingAddress: string;
    billingAddress: string;
    items: OrderItem[];
    paymentMethod: 'CASH_ON_DELIVERY' | 'BKASH';
    paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
    orderStatus: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
    customTotalAmount: number;
    customDiscountAmount: number;
    customShippingFee: number;
    notes: string;
    orderSource: string;
    referenceNumber: string;
    generateInvoice: boolean;
    sendEmailNotification: boolean;
    skipStockValidation: boolean;
    markAsPaid: boolean;
}

export function ManualOrderForm() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProducts, setSelectedProducts] = useState<Map<string, any>>(new Map());
    const [errors, setErrors] = useState<Record<string, string>>({});
    const router = useRouter();
    const { toast } = useToast();

    const {
        loading,
        products,
        loadingProducts,
        createOrder,
        searchProducts,
        clearProductVariations,
    } = useManualOrder();

    const [formData, setFormData] = useState<ManualOrderFormData>({
        customerName: '',
        email: '',
        phone: '',
        shippingAddress: '',
        billingAddress: '',
        items: [],
        paymentMethod: 'CASH_ON_DELIVERY',
        paymentStatus: 'PENDING',
        orderStatus: 'CONFIRMED',
        customTotalAmount: 0,
        customDiscountAmount: 0,
        customShippingFee: 0,
        notes: '',
        orderSource: '',
        referenceNumber: '',
        generateInvoice: true,
        sendEmailNotification: false,
        skipStockValidation: false,
        markAsPaid: false,
    });

    // Calculate total automatically
    const calculatedTotal = useMemo(() => {
        let total = 0;

        formData.items.forEach((item) => {
            const product = selectedProducts.get(item.id);
            if (product) {
                const price = item.customPrice || product.salePrice || product.price || 0;
                const quantity = item.quantity || 1;
                let itemTotal = price * quantity;

                // Apply item-level discounts
                if (item.customDiscountAmount > 0) {
                    itemTotal -= item.customDiscountAmount;
                } else if (item.customDiscountPercentage > 0) {
                    itemTotal -= (itemTotal * item.customDiscountPercentage) / 100;
                }

                total += Math.max(0, itemTotal);
            }
        });

        // Add shipping fee
        total += formData.customShippingFee || 0;

        // Apply order-level discount
        total -= formData.customDiscountAmount || 0;

        return Math.max(0, total);
    }, [formData.items, formData.customShippingFee, formData.customDiscountAmount, selectedProducts]);

    // Update custom total amount when calculated total changes
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            customTotalAmount: calculatedTotal
        }));
    }, [calculatedTotal]);

    // Search products with debouncing
    const debouncedSearch = useCallback(
        (() => {
            let timeoutId: NodeJS.Timeout;
            let previousQuery = '';

            return (query: string) => {
                if (query !== previousQuery) {
                    clearTimeout(timeoutId);
                    previousQuery = query;

                    timeoutId = setTimeout(() => {
                        if (query.length >= 1) {
                            searchProducts(query);
                        } else {
                            clearProductVariations();
                        }
                    }, 300);
                }
            };
        })(),
        [searchProducts, clearProductVariations]
    );

    // Track previous search query to avoid unnecessary fetches
    const [lastSearchedQuery, setLastSearchedQuery] = useState('');

    useEffect(() => {
        if (searchQuery !== lastSearchedQuery) {
            debouncedSearch(searchQuery);
            setLastSearchedQuery(searchQuery);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, debouncedSearch]);

    const addProductToOrder = (product: any) => {
        console.log('Adding product to order:', product);
        console.log('Product ID:', product.id);
        console.log('Product name:', product.productName);
        
        const existingIndex = formData.items.findIndex(item => item.id === product.id);

        if (existingIndex !== -1) {
            // Increment quantity of existing item
            const updatedItems = [...formData.items];
            updatedItems[existingIndex].quantity += 1;
            setFormData(prev => ({ ...prev, items: updatedItems }));

            toast({
                title: "Quantity updated",
                description: `${product.productName} quantity increased to ${updatedItems[existingIndex].quantity}.`,
            });
        } else {
            // Add new item with discount set to 0
            const newItem: OrderItem = {
                id: product.id,
                quantity: 1,
                customPrice: product.salePrice || product.price || 0,
                customDiscountAmount: 0,
                customDiscountPercentage: 0,
                notes: ''
            };

            setFormData(prev => ({
                ...prev,
                items: [...prev.items, newItem]
            }));
            setSelectedProducts(prev => new Map(prev.set(product.id, product)));

            toast({
                title: "Product added",
                description: `${product.productName} has been added to the order.`,
            });
        }

        setSearchQuery('');
        clearProductVariations();
    };

    const removeProductFromOrder = (index: number, productId: string) => {
        const product = selectedProducts.get(productId);
        const updatedItems = formData.items.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, items: updatedItems }));
        
        setSelectedProducts(prev => {
            const newMap = new Map(prev);
            newMap.delete(productId);
            return newMap;
        });

        toast({
            title: "Product removed",
            description: `${product?.productName || 'Product'} has been removed from the order.`,
        });
    };

    const updateFormData = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const updateItemData = (index: number, field: string, value: any) => {
        const updatedItems = [...formData.items];
        updatedItems[index] = { ...updatedItems[index], [field]: value };
        setFormData(prev => ({ ...prev, items: updatedItems }));
    };

    const copyShippingToBilling = () => {
        if (formData.shippingAddress) {
            updateFormData('billingAddress', formData.shippingAddress);
            toast({
                title: "Address copied",
                description: "Shipping address has been copied to billing address.",
            });
        } else {
            toast({
                title: "No shipping address",
                description: "Please enter a shipping address first.",
            });
        }
    };

    const clearForm = () => {
        setFormData({
            customerName: '',
            email: '',
            phone: '',
            shippingAddress: '',
            billingAddress: '',
            items: [],
            paymentMethod: 'CASH_ON_DELIVERY',
            paymentStatus: 'PENDING',
            orderStatus: 'CONFIRMED',
            customTotalAmount: 0,
            customDiscountAmount: 0,
            customShippingFee: 0,
            notes: '',
            orderSource: '',
            referenceNumber: '',
            generateInvoice: true,
            sendEmailNotification: false,
            skipStockValidation: false,
            markAsPaid: false,
        });
        setSelectedProducts(new Map());
        setSearchQuery('');
        setErrors({});
        clearProductVariations();

        toast({
            title: "Form cleared",
            description: "All form data has been cleared.",
        });
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.customerName.trim()) newErrors.customerName = 'Customer name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Valid email is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!formData.shippingAddress.trim()) newErrors.shippingAddress = 'Shipping address is required';
        if (!formData.billingAddress.trim()) newErrors.billingAddress = 'Billing address is required';
        if (formData.items.length === 0) newErrors.items = 'At least one item is required';

        // Validate items
        formData.items.forEach((item, index) => {
            if (item.quantity < 1) newErrors[`item-${index}-quantity`] = 'Quantity must be at least 1';
            if (item.customDiscountPercentage > 100) newErrors[`item-${index}-discount`] = 'Discount cannot exceed 100%';
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast({
                title: "Validation Error",
                description: "Please fix the errors below before submitting.",
            });
            return;
        }

        try {
            toast({
                title: "Creating order...",
                description: "Please wait while we process your order.",
            });

            const orderPayload = {
                ...formData,
                items: formData.items.map(item => ({
                    productVariationId: item.id,
                    quantity: Number(item.quantity),
                    customPrice: Number(item.customPrice) || 0,
                    customDiscountAmount: item.customDiscountAmount !== undefined && item.customDiscountAmount !== null
                        ? Number(item.customDiscountAmount)
                        : undefined,
                    customDiscountPercentage: item.customDiscountPercentage !== undefined && item.customDiscountPercentage !== null
                        ? Number(item.customDiscountPercentage)
                        : undefined,
                    notes: item.notes || undefined,
                })),
            } as CreateManualOrderRequest;

            console.log('Order payload being sent:', JSON.stringify(orderPayload, null, 2));
            console.log('Items with productVariationId:', orderPayload.items);
            console.log('Custom shipping fee being sent:', orderPayload.customShippingFee);
            console.log('Custom discount amount being sent:', orderPayload.customDiscountAmount);

            const order = await createOrder(orderPayload);

            if (order) {
                toast({
                    title: "Order created successfully!",
                    description: `Order #${order.id || 'new'} has been created and is being processed.`,
                });

                setTimeout(() => {
                    router.push('/admin/orders');
                }, 1500);
            }
        } catch (error) {
            console.error('Error creating order:', error);
            toast({
                title: "Failed to create order",
                description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
            });
        }
    };

    return (
        <div className="mx-auto px-4 py-6 max-w-5xl container">
            <div className="mb-8">
                <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4 mb-4">
                    <div>
                        <h1 className="mb-2 font-bold text-foreground text-2xl sm:text-3xl">
                            Create Manual Order
                        </h1>
                        <p className="text-muted-foreground text-sm sm:text-base">
                            Create a new order manually with custom pricing and settings
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={clearForm}
                            className="flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear Form
                        </Button>
                    </div>
                </div>

                {/* Order Summary */}
                {formData.items.length > 0 && (
                    <Alert className="mb-6">
                        <ShoppingCart className="w-4 h-4" />
                        <AlertDescription className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-2">
                            <span>
                                {formData.items.length} item{formData.items.length !== 1 ? 's' : ''} in order
                            </span>
                            <div className="flex items-center gap-4">
                                <Badge variant="secondary" className="font-semibold text-lg">
                                    Total: ৳{calculatedTotal.toFixed(2)}
                                </Badge>
                            </div>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Form Errors Alert */}
                {Object.keys(errors).length > 0 && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="w-4 h-4" />
                        <AlertDescription>
                            Please fix the errors below before submitting the order.
                        </AlertDescription>
                    </Alert>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* Customer Information */}
                <Card className="shadow-sm">
                    <CardHeader className="bg-muted/30">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <User className="w-5 h-5 text-primary" />
                            Customer Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="customerName" className="font-medium text-sm">
                                    Customer Name *
                                </Label>
                                <Input
                                    id="customerName"
                                    value={formData.customerName}
                                    onChange={(e) => updateFormData('customerName', e.target.value)}
                                    placeholder="John Doe"
                                    className={errors.customerName ? 'border-destructive' : ''}
                                />
                                {errors.customerName && (
                                    <p className="flex items-center gap-1 text-destructive text-sm">
                                        <AlertCircle className="w-3 h-3" />
                                        {errors.customerName}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="font-medium text-sm">
                                    Email *
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => updateFormData('email', e.target.value)}
                                    placeholder="john.doe@example.com"
                                    className={errors.email ? 'border-destructive' : ''}
                                />
                                {errors.email && (
                                    <p className="flex items-center gap-1 text-destructive text-sm">
                                        <AlertCircle className="w-3 h-3" />
                                        {errors.email}
                                    </p>
                                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone" className="font-medium text-sm">
                                Phone Number *
                            </Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => updateFormData('phone', e.target.value)}
                                placeholder="+8801712345678"
                                className={errors.phone ? 'border-destructive' : ''}
                            />
                            {errors.phone && (
                                <p className="flex items-center gap-1 text-destructive text-sm">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.phone}
                                </p>
                            )}
                        </div>

                        <div className="gap-4 grid grid-cols-1 lg:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="shippingAddress" className="font-medium text-sm">
                                    Shipping Address *
                                </Label>
                                <Textarea
                                    id="shippingAddress"
                                    value={formData.shippingAddress}
                                    onChange={(e) => updateFormData('shippingAddress', e.target.value)}
                                    placeholder="123 Main St, Dhaka 1000, Bangladesh"
                                    rows={3}
                                    className={errors.shippingAddress ? 'border-destructive' : ''}
                                />
                                {errors.shippingAddress && (
                                    <p className="flex items-center gap-1 text-destructive text-sm">
                                        <AlertCircle className="w-3 h-3" />
                                        {errors.shippingAddress}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="billingAddress" className="font-medium text-sm">
                                        Billing Address *
                                    </Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={copyShippingToBilling}
                                        className="flex items-center gap-1"
                                    >
                                        <Copy className="w-3 h-3" />
                                        Copy from Shipping
                                    </Button>
                                </div>
                                <Textarea
                                    id="billingAddress"
                                    value={formData.billingAddress}
                                    onChange={(e) => updateFormData('billingAddress', e.target.value)}
                                    placeholder="456 Secondary St, Dhaka 1000, Bangladesh"
                                    rows={3}
                                    className={errors.billingAddress ? 'border-destructive' : ''}
                                />
                                {errors.billingAddress && (
                                    <p className="flex items-center gap-1 text-destructive text-sm">
                                        <AlertCircle className="w-3 h-3" />
                                        {errors.billingAddress}
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Order Items */}
                <Card className="shadow-sm">
                    <CardHeader className="bg-muted/30">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Package className="w-5 h-5 text-primary" />
                            Order Items
                            {formData.items.length > 0 && (
                                <Badge variant="secondary" className="ml-auto">
                                    {formData.items.length} item{formData.items.length !== 1 ? 's' : ''}
                                </Badge>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        {/* Product Search */}
                        <div className="space-y-3">
                            <Label className="font-medium text-sm">Add Products</Label>
                            <div className="relative">
                                <Search className="top-1/2 left-3 absolute w-4 h-4 text-muted-foreground -translate-y-1/2 transform" />
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search products by name or SKU..."
                                    className="pl-10"
                                />
                            </div>

                            {/* Product Search Results */}
                            {products.length > 0 && (
                                <div className="border rounded-lg max-h-64 overflow-y-auto">
                                    {products.map((product) => (
                                        <div
                                            key={product.id}
                                            className="flex justify-between items-center hover:bg-muted/50 p-4 border-b last:border-b-0 transition-colors cursor-pointer"
                                            onClick={() => addProductToOrder(product)}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{product.name}</p>
                                                <p className="text-muted-foreground text-sm truncate">{product.productName}</p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <p className="text-sm">SKU: {product.productName}</p>
                                                    <Badge
                                                        variant={product.stockQuantity > 0 ? "secondary" : "destructive"}
                                                        className="text-xs"
                                                    >
                                                        Stock: {product.stockQuantity}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 ml-4">
                                                <div className="text-right">
                                                    {product.salePrice ? (
                                                        <div className="flex flex-col items-end">
                                                            <span className="font-semibold text-primary text-lg">৳{product.salePrice}</span>
                                                            <span className="text-muted-foreground text-sm line-through">৳{product.price}</span>
                                                        </div>
                                                    ) : (
                                                        <p className="font-semibold text-lg">৳{product.price}</p>
                                                    )}
                                                </div>
                                                <Button size="sm" variant="outline" className="flex items-center gap-1">
                                                    <Plus className="w-4 h-4" />
                                                    Add
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* Selected Items */}
                        <div className="space-y-4">
                            <Label className="font-medium text-sm">Selected Items</Label>
                            {formData.items.map((item, index) => {
                                const selectedProduct = selectedProducts.get(item.id);

                                return (
                                    <Card key={item.id} className="p-4 border-2 border-dashed">
                                        <div className="flex lg:flex-row flex-col gap-4">
                                            {selectedProduct && (
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium truncate">{selectedProduct.productName}</h4>
                                                    <p className="text-muted-foreground text-sm truncate">{selectedProduct.name}</p>
                                                    <p className="text-sm">SKU: {selectedProduct.productName}</p>
                                                    <Badge variant="outline" className="mt-1 text-xs">
                                                        Available: {selectedProduct.stockQuantity}
                                                    </Badge>
                                                </div>
                                            )}

                                            <div className="flex sm:flex-row flex-col sm:items-end gap-3">
                                                <div className="space-y-1">
                                                    <Label className="font-medium text-xs">Quantity</Label>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItemData(index, 'quantity', parseInt(e.target.value) || 1)}
                                                        className={`w-20 ${errors[`item-${index}-quantity`] ? 'border-destructive' : ''}`}
                                                    />
                                                    {errors[`item-${index}-quantity`] && (
                                                        <p className="text-destructive text-xs">{errors[`item-${index}-quantity`]}</p>
                                                    )}
                                                </div>

                                                <div className="space-y-1">
                                                    <Label className="font-medium text-xs">Custom Price</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={item.customPrice}
                                                        onChange={(e) => updateItemData(index, 'customPrice', parseFloat(e.target.value) || 0)}
                                                        className="w-24"
                                                    />
                                                </div>

                                                <div className="space-y-1">
                                                    <Label className="font-medium text-xs">Discount ৳</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={item.customDiscountAmount}
                                                        onChange={(e) => updateItemData(index, 'customDiscountAmount', parseFloat(e.target.value) || 0)}
                                                        className="w-24"
                                                    />
                                                </div>

                                                <div className="space-y-1">
                                                    <Label className="font-medium text-xs">Discount %</Label>
                                                    <Input
                                                        type="number"
                                                        max="100"
                                                        value={item.customDiscountPercentage}
                                                        onChange={(e) => updateItemData(index, 'customDiscountPercentage', parseFloat(e.target.value) || 0)}
                                                        className={`w-24 ${errors[`item-${index}-discount`] ? 'border-destructive' : ''}`}
                                                    />
                                                    {errors[`item-${index}-discount`] && (
                                                        <p className="text-destructive text-xs">{errors[`item-${index}-discount`]}</p>
                                                    )}
                                                </div>

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => removeProductFromOrder(index, item.id)}
                                                    className="self-start sm:self-end hover:bg-destructive hover:text-destructive-foreground"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-1 mt-4">
                                            <Label className="font-medium text-xs">Item Notes</Label>
                                            <Textarea
                                                value={item.notes}
                                                onChange={(e) => updateItemData(index, 'notes', e.target.value)}
                                                placeholder="Special instructions for this item..."
                                                rows={2}
                                            />
                                        </div>
                                    </Card>
                                );
                            })}

                            {formData.items.length === 0 && (
                                <div className="py-12 text-muted-foreground text-center">
                                    <Package className="opacity-50 mx-auto mb-4 w-16 h-16" />
                                    <p className="font-medium text-lg">No items added yet</p>
                                    <p className="text-sm">Search and add products above to start building the order</p>
                                </div>
                            )}
                        </div>

                        {errors.items && (
                            <p className="flex items-center gap-1 text-destructive text-sm">
                                <AlertCircle className="w-3 h-3" />
                                {errors.items}
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Payment & Order Details */}
                <Card className="shadow-sm">
                    <CardHeader className="bg-muted/30">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <CreditCard className="w-5 h-5 text-primary" />
                            Payment & Order Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            <div className="space-y-2">
                                <Label className="font-medium text-sm">Payment Method</Label>
                                <Select value={formData.paymentMethod} onValueChange={(value) => updateFormData('paymentMethod', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select payment method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CASH_ON_DELIVERY">Cash on Delivery</SelectItem>
                                        <SelectItem value="BKASH">bKash</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="font-medium text-sm">Payment Status</Label>
                                <Select value={formData.paymentStatus} onValueChange={(value) => updateFormData('paymentStatus', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select payment status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PENDING">Pending</SelectItem>
                                        <SelectItem value="PAID">Paid</SelectItem>
                                        <SelectItem value="FAILED">Failed</SelectItem>
                                        <SelectItem value="REFUNDED">Refunded</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="font-medium text-sm">Order Status</Label>
                                <Select value={formData.orderStatus} onValueChange={(value) => updateFormData('orderStatus', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select order status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PENDING">Pending</SelectItem>
                                        <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                                        <SelectItem value="SHIPPED">Shipped</SelectItem>
                                        <SelectItem value="DELIVERED">Delivered</SelectItem>
                                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                        <SelectItem value="RETURNED">Returned</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="customTotalAmount" className="font-medium text-sm">
                                    Total Amount (Auto-calculated)
                                </Label>
                                <Input
                                    id="customTotalAmount"
                                    type="number"
                                    step="0.01"
                                    value={formData.customTotalAmount}
                                    readOnly
                                    className="bg-muted/50"
                                />
                                <p className="text-muted-foreground text-xs">
                                    Auto-calculated: ৳{calculatedTotal.toFixed(2)}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="customDiscountAmount" className="font-medium text-sm">
                                    Order Discount (৳)
                                </Label>
                                <Input
                                    id="customDiscountAmount"
                                    type="number"
                                    step="0.01"
                                    value={formData.customDiscountAmount}
                                    onChange={(e) => updateFormData('customDiscountAmount', parseFloat(e.target.value) || 0)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="customShippingFee" className="font-medium text-sm">
                                    Shipping Fee (৳)
                                </Label>
                                <Input
                                    id="customShippingFee"
                                    type="number"
                                    step="0.01"
                                    value={formData.customShippingFee}
                                    onChange={(e) => updateFormData('customShippingFee', parseFloat(e.target.value) || 0)}
                                />
                            </div>
                        </div>

                        <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="orderSource" className="font-medium text-sm">
                                    Order Source
                                </Label>
                                <Input
                                    id="orderSource"
                                    value="ADMIN_MANUAL"
                                    onChange={(e) => updateFormData('orderSource', e.target.value)}
                                    placeholder="ADMIN_MANUAL"
                                    disabled={true}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="referenceNumber" className="font-medium text-sm">
                                    Reference Number
                                </Label>
                                <Input
                                    id="referenceNumber"
                                    value={formData.referenceNumber}
                                    onChange={(e) => updateFormData('referenceNumber', e.target.value)}
                                    placeholder="e.g., Bkash transaction ID or order reference"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes" className="font-medium text-sm">
                                Order Notes
                            </Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => updateFormData('notes', e.target.value)}
                                placeholder="Special instructions or notes about this order..."
                                rows={3}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Advanced Settings */}
                <Card className="shadow-sm">
                    <CardHeader className="bg-muted/30">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Settings className="w-5 h-5 text-primary" />
                            Advanced Settings
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                            <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg">
                                <div className="space-y-1">
                                    <Label className="font-medium text-base">Generate Invoice</Label>
                                    <p className="text-muted-foreground text-sm">
                                        Automatically generate an invoice for this order
                                    </p>
                                </div>
                                <Switch
                                    checked={formData.generateInvoice}
                                    onCheckedChange={(checked) => updateFormData('generateInvoice', checked)}
                                />
                            </div>

                            <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg">
                                <div className="space-y-1">
                                    <Label className="font-medium text-base">Send Email Notification</Label>
                                    <p className="text-muted-foreground text-sm">
                                        Send order confirmation email to customer
                                    </p>
                                </div>
                                <Switch
                                    checked={formData.sendEmailNotification}
                                    onCheckedChange={(checked) => updateFormData('sendEmailNotification', checked)}
                                />
                            </div>

                            <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg">
                                <div className="space-y-1">
                                    <Label className="font-medium text-base">Skip Stock Validation</Label>
                                    <p className="text-muted-foreground text-sm">
                                        Allow ordering even if items are out of stock
                                    </p>
                                </div>
                                <Switch
                                    checked={formData.skipStockValidation}
                                    onCheckedChange={(checked) => updateFormData('skipStockValidation', checked)}
                                />
                            </div>

                            <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg">
                                <div className="space-y-1">
                                    <Label className="font-medium text-base">Mark as Paid</Label>
                                    <p className="text-muted-foreground text-sm">
                                        Automatically mark payment as completed
                                    </p>
                                </div>
                                <Switch
                                    checked={formData.markAsPaid}
                                    onCheckedChange={(checked) => {
                                        updateFormData('markAsPaid', checked);
                                        if (checked) {
                                            updateFormData('paymentStatus', 'PAID');
                                            toast({
                                                title: "Payment status updated",
                                                description: "Payment status has been set to 'Paid'.",
                                            });
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Order Summary */}
                {formData.items.length > 0 && (
                    <Card className="shadow-sm border-2 border-primary/20">
                        <CardHeader className="bg-primary/5">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <CheckCircle className="w-5 h-5 text-primary" />
                                Order Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Subtotal:</span>
                                    <span className="font-medium">
                                        ৳{(calculatedTotal - (formData.customShippingFee || 0) + (formData.customDiscountAmount || 0)).toFixed(2)}
                                    </span>
                                </div>

                                {(formData.customDiscountAmount ?? 0) > 0 && (
                                    <div className="flex justify-between items-center text-green-600">
                                        <span>Order Discount:</span>
                                        <span>-৳{(formData.customDiscountAmount ?? 0).toFixed(2)}</span>
                                    </div>
                                )}

                                {(formData.customShippingFee ?? 0) > 0 && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Shipping Fee:</span>
                                        <span className="font-medium">৳{(formData.customShippingFee ?? 0).toFixed(2)}</span>
                                    </div>
                                )}

                                <Separator />

                                <div className="flex justify-between items-center font-bold text-lg">
                                    <span>Total Amount:</span>
                                    <span className="text-primary">৳{calculatedTotal.toFixed(2)}</span>
                                </div>

                                <div className="pt-2 text-muted-foreground text-sm">
                                    <p>Items: {formData.items.length}</p>
                                    <p>Payment: {formData.paymentMethod?.replace('_', ' ') || 'Not selected'}</p>
                                    <p>Status: {formData.orderStatus || 'Not selected'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Action Buttons */}
                <div className="flex sm:flex-row flex-col justify-end gap-3 pt-6">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        className="w-full sm:w-auto"
                        disabled={loading}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        disabled={loading || formData.items.length === 0}
                        className="flex items-center gap-2 w-full sm:w-auto"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Creating Order...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4" />
                                Create Order
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}