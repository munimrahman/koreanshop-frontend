"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, X, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createProduct, CreateProductRequest } from "@/lib/api/products";
import { getCategories, Category } from "@/lib/api/categories";
import { getBrands, Brand } from "@/lib/api/brands";
import { useAdmin } from "@/contexts/AdminContext";
import { toast } from "sonner";
import Image from "next/image";

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CreateProductForm() {
  const [formData, setFormData] = useState<CreateProductRequest>({
    name: "",
    price: 0,
    stockQuantity: 0,
    description: "",
    isPublished: true,
    slug: "",
    metaTitle: "",
    metaDescription: "",
  });
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const { token } = useAdmin();
  const router = useRouter();

  const fetchInitialData = useCallback(async () => {
    if (!token) return;

    try {
      setLoadingData(true);

      // Fetch all categories and brands concurrently
      const [allCategories, allBrands] = await Promise.all([
        // Fetch all categories
        (async () => {
          let categories: Category[] = [];
          let categoriesPage = 1;
          let hasMoreCategories = true;

          while (hasMoreCategories) {
            const categoriesResponse = await getCategories(categoriesPage, 50);
            if (categoriesResponse.categories && categoriesResponse.categories.length > 0) {
              categories = [...categories, ...categoriesResponse.categories];
            }
            
            // Check if there are more pages using pagination info
            if (categoriesResponse.pagination && categoriesResponse.pagination.hasNext) {
              categoriesPage++;
            } else {
              hasMoreCategories = false;
            }
          }
          return categories;
        })(),

        // Fetch all brands
        (async () => {
          let brands: Brand[] = [];
          let brandsPage = 1;
          let hasMoreBrands = true;

          while (hasMoreBrands) {
            const brandsResponse = await getBrands(brandsPage, 50);
            if (brandsResponse.data && brandsResponse.data.brands && brandsResponse.data.brands.length > 0) {
              brands = [...brands, ...brandsResponse.data.brands];
            }
            
            // Check if there are more pages using pagination info
            if (brandsResponse.data && brandsResponse.data.pagination && brandsResponse.data.pagination.hasNext) {
              brandsPage++;
            } else {
              hasMoreBrands = false;
            }
          }
          return brands;
        })()
      ]);

      setCategories(allCategories);
      setBrands(allBrands);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      toast.error("Failed to load categories and brands");
    } finally {
      setLoadingData(false);
    }
  }, [token]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    if (!slugManuallyEdited) {
      setFormData((prev) => ({ ...prev, slug: toSlug(prev.name || "") }));
    }
  }, [formData.name, slugManuallyEdited]);

  const handleInputChange = (field: keyof CreateProductRequest, value: any) => {
    if (field === "slug") setSlugManuallyEdited(true);
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainImage(file);
    }
  };

  const handleAdditionalImagesChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    if (additionalImages.length + files.length > 10) {
      toast.error("Maximum 10 additional images allowed");
      return;
    }
    setAdditionalImages((prev) => [...prev, ...files]);
  };

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!formData.name || formData.price <= 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const productData: CreateProductRequest = {
        ...formData,
        image: mainImage || undefined,
        additionalImages:
          additionalImages.length > 0 ? additionalImages : undefined,
      };

      await createProduct(token, productData);
      toast.success("Product created successfully!");
      router.push("/admin/products");
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="mx-auto px-4 py-8 container">
        <div className="space-y-4 animate-pulse">
          <div className="bg-gray-200 rounded w-1/4 h-8"></div>
          <div className="bg-gray-200 rounded h-96"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-8 container">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="font-bold text-3xl">Create New Product</h1>
          <p className="text-muted-foreground">
            Add a new product to your catalog
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="gap-8 grid grid-cols-1 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Enter product description"
                    rows={4}
                  />
                </div>

                <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      onValueChange={(value) =>
                        handleInputChange("categoryId", value)
                      }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="brand">Brand</Label>
                    <Select
                      onValueChange={(value) =>
                        handleInputChange("brandId", value)
                      }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>

                  {/* Selected tags display */}
                  {formData.tags && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.tags
                        .split(",")
                        .filter(Boolean)
                        .map((tag) => (
                          <div
                            key={tag}
                            className="inline-flex items-center bg-primary/10 dark:bg-primary/20 px-3 py-1 border border-input dark:border-gray-700 rounded-full font-medium text-primary dark:text-primary-foreground text-sm">
                            {tag}
                            <button
                              type="button"
                              onClick={() => {
                                const newTags = (formData.tags ?? "")
                                  .split(",")
                                  .filter((t) => t !== tag)
                                  .join(",");
                                handleInputChange("tags", newTags);
                              }}
                              className="hover:bg-primary/20 dark:hover:bg-primary/30 ml-2 p-1 rounded-full">
                              <span className="sr-only">Remove tag</span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </button>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Select component */}
                  <Select
                    value=""
                    onValueChange={(selectedTag) => {
                      const currentTags = formData.tags
                        ? formData.tags.split(",")
                        : [];
                      const newTags = currentTags.includes(selectedTag)
                        ? currentTags.filter((tag) => tag !== selectedTag)
                        : [...currentTags, selectedTag];
                      handleInputChange(
                        "tags",
                        newTags.filter(Boolean).join(",")
                      );
                    }}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select tags...">
                        <span className="text-muted-foreground">Add tags</span>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {["HOT", "NEW", "SALE", "FEATURED"].map((tag) => (
                        <SelectItem
                          key={tag}
                          value={tag}
                          className={`${
                            formData.tags?.includes(tag)
                              ? "bg-accent/50 dark:bg-accent/30"
                              : ""
                          }`}>
                          <div className="flex items-center">
                            {tag}
                            {formData.tags?.includes(tag) && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="ml-2">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Inventory */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Inventory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                  <div>
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        handleInputChange(
                          "price",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="salePrice">Sale Price</Label>
                    <Input
                      id="salePrice"
                      type="number"
                      step="0.01"
                      value={formData.salePrice || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "salePrice",
                          parseFloat(e.target.value) || undefined
                        )
                      }
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                  <div>
                    <Label htmlFor="stockQuantity">Stock Quantity</Label>
                    <Input
                      id="stockQuantity"
                      type="number"
                      value={formData.stockQuantity || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "stockQuantity",
                          parseInt(e.target.value) || 0
                        )
                      }
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="volume">Volume</Label>
                    <Input
                      id="volume"
                      value={formData.volume || ""}
                      onChange={(e) =>
                        handleInputChange("volume", e.target.value)
                      }
                      placeholder="e.g., 30ml, 100g"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="weightGrams">Weight (grams)</Label>
                  <Input
                    id="weightGrams"
                    type="number"
                    value={formData.weightGrams || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "weightGrams",
                        parseFloat(e.target.value) || undefined
                      )
                    }
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="datetime-local"
                    value={formData.expiryDate || ""}
                    onChange={(e) =>
                      handleInputChange("expiryDate", e.target.value)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Main Image */}
                <div>
                  <Label>Main Product Image</Label>
                  <div className="mt-2">
                    {mainImage ? (
                      <div className="inline-block relative">
                        <Image
                          src={URL.createObjectURL(mainImage)}
                          alt="Main product"
                          width={128}
                          height={128}
                          className="rounded-lg w-32 h-32 object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="-top-2 -right-2 absolute w-6 h-6"
                          onClick={() => setMainImage(null)}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <label className="flex flex-col justify-center items-center bg-gray-50 hover:bg-gray-100 border-2 border-gray-300 border-dashed rounded-lg w-full h-32 cursor-pointer">
                        <div className="flex flex-col justify-center items-center pt-5 pb-6">
                          <Upload className="mb-4 w-8 h-8 text-gray-500" />
                          <p className="mb-2 text-gray-500 text-sm">
                            <span className="font-semibold">
                              Click to upload
                            </span>{" "}
                            main image
                          </p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleMainImageChange}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Additional Images */}
                <div>
                  <Label>Additional Images (Max 10)</Label>
                  <div className="space-y-4 mt-2">
                    {additionalImages.length > 0 && (
                      <div className="gap-4 grid grid-cols-4">
                        {additionalImages.map((image, index) => (
                          <div key={index} className="relative">
                            <div className="relative w-full h-24 overflow-hidden rounded-lg">
                              <Image
                                src={URL.createObjectURL(image)}
                                alt={`Additional ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="-top-2 -right-2 absolute w-6 h-6"
                              onClick={() => removeAdditionalImage(index)}>
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {additionalImages.length < 10 && (
                      <label className="flex flex-col justify-center items-center bg-gray-50 hover:bg-gray-100 border-2 border-gray-300 border-dashed rounded-lg w-full h-24 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Plus className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-500 text-sm">
                            Add More Images
                          </span>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          multiple
                          onChange={handleAdditionalImagesChange}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* SEO Settings */}
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="slug">URL Slug</Label>
                  <div className="flex items-center mt-1">
                    <span className="inline-flex items-center px-3 border border-r-0 border-input rounded-l-md bg-muted text-muted-foreground text-sm h-10">/products/</span>
                    <Input
                      id="slug"
                      className="rounded-l-none"
                      value={formData.slug || ""}
                      onChange={(e) => handleInputChange("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-"))}
                      placeholder="product-url-slug (Leave blank to auto-generate)"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center">
                    <Label htmlFor="metaTitle">Meta Title</Label>
                    <span className="text-muted-foreground text-xs">{(formData.metaTitle || "").length}/60</span>
                  </div>
                  <Input
                    id="metaTitle"
                    value={formData.metaTitle || ""}
                    onChange={(e) => handleInputChange("metaTitle", e.target.value)}
                    placeholder="Leave blank to use product name"
                    maxLength={60}
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center">
                    <Label htmlFor="metaDescription">Meta Description</Label>
                    <span className="text-muted-foreground text-xs">{(formData.metaDescription || "").length}/160</span>
                  </div>
                  <Textarea
                    id="metaDescription"
                    value={formData.metaDescription || ""}
                    onChange={(e) => handleInputChange("metaDescription", e.target.value)}
                    placeholder="Leave blank to use product description"
                    rows={3}
                    maxLength={160}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardContent className="space-y-4 pt-6">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="border-2 border-white border-t-transparent rounded-full w-4 h-4 animate-spin" />
                      Creating Product...
                    </div>
                  ) : (
                    "Create Product"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => router.back()}>
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
