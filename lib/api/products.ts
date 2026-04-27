const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Product {
  id: string;
  name: string;
  description?: string;
  categoryId?: string;
  brandId?: string;
  baseImageUrl?: string;
  tags: string[];
  isPublished: boolean;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    description?: string;
  };
  brand?: {
    id: string;
    name: string;
    logoUrl?: string;
    description?: string;
  };
  variations: ProductVariation[];
  images: ProductImage[];
  maxPrice: number;
  minPrice: number;
  reviews: ProductReview[];
}
export interface ProductReview {
  id: string;
  email: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ProductVariation {
  id: string;
  name?: string;
  price: number;
  salePrice?: number;
  discount?: number;
  volume?: string;
  stockQuantity: number;
  imageUrl?: string;
  attributes?: Record<string, any>;
  tags?: ("HOT" | "NEW" | "SALE" | "FEATURED")[];
  weightGrams?: number;
  productId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  filename: string;
  originalName: string;
  imageUrl: string;
  altText?: string;
  isMainImage: boolean;
  productId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  price: number;
  salePrice?: number;
  stockQuantity?: number;
  volume?: string;
  weightGrams?: number;
  description?: string;
  categoryId?: string;
  brandId?: string;
  tags?: string;
  isPublished?: boolean;
  expiryDate?: string;
  image?: File;
  additionalImages?: File[];
}

export interface ProductsResponse {
  data: any;
  products: Product[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface GetProductsParams {
  page?: number;
  limit?: number;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: "price" | "name" | "createdAt" | "rating" | "expiryDate";
  sortOrder?: "asc" | "desc";
  variationTags?: string | string[];
  tags?: string[];
  categoryId?: string;
  brandId?: string;
  inStock?: boolean;
  isExpired?: boolean;
  expiresWithin?: number;
  featured?: boolean;
  includeVariations?: boolean;
  includeImages?: boolean;
  includeReviews?: boolean;
  includeCategory?: boolean;
  includeBrand?: boolean;
}

export const getProducts = async (
  params: GetProductsParams = {}
): Promise<ProductsResponse> => {
  const {
    page = 1,
    limit = 20,
    category,
    brand,
    minPrice,
    maxPrice,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
    variationTags,
    tags,
    categoryId,
    brandId,
    inStock,
    isExpired,
    expiresWithin,
    featured,
    includeVariations = false,
    includeImages = false,
    includeReviews = false,
    includeCategory = false,
    includeBrand = false,
  } = params;

  const searchParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sortBy,
    sortOrder,
  });

  if (category) searchParams.append("category", category);
  if (brand) searchParams.append("brand", brand);
  if (categoryId) searchParams.append("categoryId", categoryId);
  if (brandId) searchParams.append("brandId", brandId);
  if (minPrice !== undefined)
    searchParams.append("minPrice", minPrice.toString());
  if (maxPrice !== undefined)
    searchParams.append("maxPrice", maxPrice.toString());
  if (search !== undefined) searchParams.append("search", search);
  if (inStock !== undefined) searchParams.append("inStock", inStock.toString());
  if (isExpired !== undefined)
    searchParams.append("isExpired", isExpired.toString());
  if (expiresWithin !== undefined)
    searchParams.append("expiresWithin", expiresWithin.toString());
  if (featured !== undefined)
    searchParams.append("featured", featured.toString());
  if (includeVariations) searchParams.append("includeVariations", "true");
  if (includeImages) searchParams.append("includeImages", "true");
  if (includeReviews) searchParams.append("includeReviews", "true");
  if (includeCategory) searchParams.append("includeCategory", "true");
  if (includeBrand) searchParams.append("includeBrand", "true");

  // Handle tags array
  if (tags && tags.length > 0) {
    tags.forEach((tag) => searchParams.append("tags", tag));
  }

  // Handle variationTags
  if (variationTags !== undefined) {
    if (Array.isArray(variationTags)) {
      variationTags.forEach((tag) => searchParams.append("variationTags", tag));
    } else {
      searchParams.append("variationTags", variationTags);
    }
  }

  const response = await fetch(
    `${API_BASE_URL}/products/public?${searchParams.toString()}`,
    { next: { revalidate: 60 } }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return response.json();
};
export const deleteProduct = async (
  token: string,
  id: string
): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Product not found");
    }
    if (response.status === 401) {
      throw new Error("Unauthorized");
    }
    throw new Error("Failed to delete product");
  }

  return await response.json();
};
export const createProduct = async (
  token: string,
  productData: CreateProductRequest
): Promise<Product> => {
  const formData = new FormData();

  // Ensure isPublished defaults to true if not specified
  const dataWithDefaults = {
    ...productData,
    isPublished:
      productData.isPublished !== undefined ? productData.isPublished : true,
  };

  Object.entries(dataWithDefaults).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (key === "additionalImages" && Array.isArray(value)) {
        value.forEach((file) => formData.append("additionalImages", file));
      } else if (value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, value.toString());
      }
    }
  });

  const response = await fetch(`${API_BASE_URL}/products`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to create product");
  }

  const result = await response.json();
  return result.data;
};

export const getProduct = async (
  id: string,
  params: {
    includeVariations?: boolean;
    includeImages?: boolean;
    includeReviews?: boolean;
    includeCategory?: boolean;
    includeBrand?: boolean;
  } = {}
): Promise<Product> => {
  const {
    includeVariations = true,
    includeImages = true,
    includeReviews = true,
    includeCategory = true,
    includeBrand = true,
  } = params;

  const searchParams = new URLSearchParams();

  if (includeVariations) searchParams.append("includeVariations", "true");
  if (includeImages) searchParams.append("includeImages", "true");
  if (includeReviews) searchParams.append("includeReviews", "true");
  if (includeCategory) searchParams.append("includeCategory", "true");
  if (includeBrand) searchParams.append("includeBrand", "true");

  const response = await fetch(
    `${API_BASE_URL}/products/public/${id}?${searchParams.toString()}`,
    { next: { revalidate: 120 } }
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Product not found");
    }
    if (response.status === 401) {
      throw new Error("Unauthorized");
    }
    throw new Error("Failed to fetch product");
  }

  const result = await response.json();
  return result;
};

export const updateProduct = async (
  token: string,
  id: string,
  productData: UpdateProductRequest
): Promise<Product> => {
  const formData = new FormData();

  // Add all fields to FormData, filtering out null/undefined values
  Object.entries(productData).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (key === "additionalImages" && Array.isArray(value)) {
        // Handle multiple file uploads for additional images
        value.forEach((file) => formData.append("additionalImages", file));
      } else if (key === "removeImageIds" && Array.isArray(value)) {
        // Convert array to comma-separated string
        formData.append("removeImageIds", value.join(","));
      } else if (key === "tags" && Array.isArray(value)) {
        // Convert tags array to comma-separated string
        formData.append("tags", value.join(","));
      } else if (value instanceof File) {
        // Handle single file upload (main image)
        formData.append(key, value);
      } else {
        // Handle regular form fields
        formData.append(key, value.toString());
      }
    }
  });

  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      // Don't set Content-Type header - let browser set it for multipart/form-data
    },
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Product not found");
    }
    if (response.status === 401) {
      throw new Error("Unauthorized");
    }
    throw new Error("Failed to update product");
  }

  const result = await response.json();
  return result.data;
};

// Add these new interfaces
export interface CreateVariationRequest {
  name: string;
  price: number;
  salePrice?: number;
  volume?: string;
  stockQuantity?: number;
  attributes?: Record<string, any>;
  tags?: ("HOT" | "NEW" | "SALE" | "FEATURED")[];
  weightGrams?: number;
}

export interface UpdateVariationRequest {
  name?: string;
  price?: number;
  salePrice?: number;
  volume?: string;
  stockQuantity?: number;
  attributes?: Record<string, any>;
  tags?: ("HOT" | "NEW" | "SALE" | "FEATURED")[];
  weightGrams?: number;
}

export interface UpdateImageRequest {
  isPrimary?: boolean;
  altText?: string;
}

// Add these new API functions
export const createProductVariation = async (
  token: string,
  productId: string,
  variationData: CreateVariationRequest
): Promise<ProductVariation> => {
  const url = `${API_BASE_URL}/products/${productId}/variations`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(variationData),
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Product not found");
    }
    if (response.status === 401) {
      throw new Error("Unauthorized");
    }
    throw new Error("Failed to create variation");
  }

  const result = await response.json();
  return result;
};

export const updateProductVariation = async (
  token: string,
  productId: string,
  variationId: string,
  variationData: UpdateVariationRequest
): Promise<ProductVariation> => {
  const response = await fetch(
    `${API_BASE_URL}/products/${productId}/variations/${variationId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(variationData),
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Product or variation not found");
    }
    if (response.status === 401) {
      throw new Error("Unauthorized");
    }
    throw new Error("Failed to update variation");
  }

  const result = await response.json();
  return result;
};

export const deleteProductVariation = async (
  token: string,
  productId: string,
  variationId: string
): Promise<void> => {
  const response = await fetch(
    `${API_BASE_URL}/products/${productId}/variations/${variationId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Product or variation not found");
    }
    if (response.status === 401) {
      throw new Error("Unauthorized");
    }
    throw new Error("Failed to delete variation");
  }
};

export const addProductImages = async (
  token: string,
  productId: string,
  images: File[],
  isPrimary?: boolean
): Promise<ProductImage[]> => {
  const formData = new FormData();

  images.forEach((image) => {
    formData.append("image", image);
  });

  if (isPrimary !== undefined) {
    formData.append("isPrimary", String(isPrimary));
  }

  const response = await fetch(`${API_BASE_URL}/products/${productId}/images`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Product not found");
    }
    if (response.status === 401) {
      throw new Error("Unauthorized");
    }
    throw new Error("Failed to add images");
  }

  const result = await response.json();
  return result;
};

export const updateProductImage = async (
  token: string,
  productId: string,
  imageId: string,
  imageData: UpdateImageRequest
): Promise<ProductImage> => {
  const response = await fetch(
    `${API_BASE_URL}/products/${productId}/images/${imageId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(imageData),
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Product or image not found");
    }
    if (response.status === 401) {
      throw new Error("Unauthorized");
    }
    throw new Error("Failed to update image");
  }

  const result = await response.json();
  return result;
};

export const deleteProductImage = async (
  token: string,
  productId: string,
  imageId: string
): Promise<void> => {
  const response = await fetch(
    `${API_BASE_URL}/products/${productId}/images/${imageId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Product or image not found");
    }
    if (response.status === 401) {
      throw new Error("Unauthorized");
    }
    throw new Error("Failed to delete image");
  }
};

// Update the existing UpdateProductRequest interface
export interface UpdateProductRequest {
  name?: string;
  description?: string;
  categoryId?: string;
  brandId?: string;
  tags?: string[];
  isPublished?: boolean;
  expiryDate?: string;
  baseImageUrl?: string;
  // Image management fields
  removeImageIds?: string[];
  // File upload fields
  image?: File;
  additionalImages?: File[];
}
