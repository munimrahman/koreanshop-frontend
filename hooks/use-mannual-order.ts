// hooks/use-manual-order.ts
import { useState } from 'react';
import { toast } from './use-toast';
import { createManualOrder, CreateManualOrderRequest } from '@/lib/api/orders';
import { useAdmin } from '@/contexts/AdminContext';
import { getProducts, ProductVariation } from '@/lib/api/products';
interface CutstomProducvariation extends ProductVariation{
    productName:string;
}

export const useManualOrder = () => {
  const [loading, setLoading] = useState(false);
//   const [productVariations, setProductVariations] = useState<ProductVariation[]>([]);
   const [products, setProducts] = useState<CutstomProducvariation[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const { token } = useAdmin();

  const createOrder = async (orderData: CreateManualOrderRequest) => {
    if (!token) {
      toast({ variant: "destructive", title: "Authentication required" });
      return null;
    }

    try {
      setLoading(true);
      const response = await createManualOrder(token, orderData);
      toast({ 
        variant: "default", 
        title: "Order created successfully",
        description: `Order ${response.data.order.orderNumber} has been created.`
      });
      return response.data.order;
    } catch (error) {
      console.error('Error creating manual order:', error);
      toast({ 
        variant: "destructive", 
        title: "Failed to create order",
        description: error instanceof Error ? error.message : "Unknown error occurred"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

   const searchProducts = async (search: string) => {
    try {
      setLoadingProducts(true);
      // Use the existing getProducts API with search functionality
      const response = await getProducts({
        limit: 50,
        search: search,
        includeVariations: true
        // Assuming your API supports search, otherwise we'll filter client-side
      });
      
      // Filter products by name if API doesn't support search
      
      
    // Combine all variations from all products into a single array
    const allVariations = response.products.flatMap((product: any) =>
        (product.variations || []).map((variation: ProductVariation) => ({
            ...variation,
            productName: product.name,
        }))
    );
    console.log(allVariations)
    setProducts(allVariations);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({ variant: "destructive", title: "Failed to fetch products" });
    } finally {
      setLoadingProducts(false);
    }
  };

  const clearProductVariations = () => {
    setProducts([]);
  };

  return {
    loading,
    products,
    loadingProducts,
    createOrder,
    searchProducts,
    clearProductVariations,
  };
};