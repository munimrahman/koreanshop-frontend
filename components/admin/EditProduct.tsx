"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  Upload,
  Edit,
  Star,
  Undo,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  getProduct,
  updateProduct,
  Product,
  UpdateProductRequest,
  ProductVariation,
  ProductImage,
  createProductVariation,
  updateProductVariation,
  deleteProductVariation,
  addProductImages,
  updateProductImage,
  deleteProductImage,
  CreateVariationRequest,
  UpdateVariationRequest,
  UpdateImageRequest,
} from "@/lib/api/products";
import { useAdmin } from "@/contexts/AdminContext";
import { toast } from "sonner";

export default function EditProduct() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<UpdateProductRequest>({});
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);

  // New state for image management
  const [newMainImage, setNewMainImage] = useState<File | null>(null);
  const [newAdditionalImages, setNewAdditionalImages] = useState<File[]>([]);
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);
  const [deleteMainImage, setDeleteMainImage] = useState(false);

  // Variation dialog states
  const [showVariationDialog, setShowVariationDialog] = useState(false);
  const [editingVariation, setEditingVariation] =
    useState<ProductVariation | null>(null);
  const [variationForm, setVariationForm] = useState<CreateVariationRequest>({
    name: "",
    price: 0,
    stockQuantity: 0,
  });

  // Image upload states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const additionalImagesInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const params = useParams();
  const { token } = useAdmin();
  const id = params?.id as string;

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const productData = await getProduct(id!);
      setProduct(productData);
      setFormData({
        name: productData.name,
        description: productData.description || "",
        slug: productData.slug || "",
        metaTitle: productData.metaTitle || "",
        metaDescription: productData.metaDescription || "",
        categoryId: productData.categoryId,
        brandId: productData.brandId,
        tags: productData.tags || [],
        expiryDate: productData.expiryDate
          ? productData.expiryDate.split("T")[0]
          : "",
      });
      setVariations(productData.variations || []);
      setImages(productData.images || []);

      // Debug: Log the product data to understand the structure
      console.log("Product data:", productData);
      console.log("Base image URL:", productData.baseImageUrl);
      console.log("Images array:", productData.images);
      console.log(
        "Main image in array:",
        productData.images?.find((img) => img.isMainImage)
      );
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Failed to fetch product");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id && token) {
      fetchProduct();
    }
  }, [id, token, fetchProduct]);

  const handleInputChange = (field: keyof UpdateProductRequest, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addTag = (selectedTag: string) => {
    const currentTags = formData.tags || [];
    const newTags = currentTags.includes(selectedTag)
      ? currentTags.filter((tag) => tag !== selectedTag)
      : [...currentTags, selectedTag];
    setFormData((prev) => ({
      ...prev,
      tags: newTags,
    }));
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((tag) => tag !== tagToRemove) || [],
    }));
  };

  const handleUpdateProduct = async () => {
    try {
      setSaving(true);

      // Handle main image deletion by finding the main image and adding it to removeImageIds
      let finalImagesToRemove = [...imagesToRemove];
      if (deleteMainImage) {
        const mainImage = images.find((img) => img.isMainImage);
        if (mainImage && !finalImagesToRemove.includes(mainImage.id)) {
          finalImagesToRemove.push(mainImage.id);
        }
      }

      const updateData: UpdateProductRequest = {
        ...formData,
        expiryDate: formData.expiryDate
          ? new Date(formData.expiryDate).toISOString()
          : undefined,
        // Include image management data
        image: newMainImage || undefined,
        additionalImages:
          newAdditionalImages.length > 0 ? newAdditionalImages : undefined,
        removeImageIds:
          finalImagesToRemove.length > 0 ? finalImagesToRemove : undefined,
      };

      await updateProduct(token!, id, updateData);
      toast.success("Product updated successfully");

      // Reset image management state
      setNewMainImage(null);
      setNewAdditionalImages([]);
      setImagesToRemove([]);
      setDeleteMainImage(false);

      // Refresh product data to get updated images
      await fetchProduct();
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  // Variation management functions
  const openVariationDialog = (variation?: ProductVariation) => {
    if (variation) {
      setEditingVariation(variation);
      setVariationForm({
        name: variation.name ?? "",
        price: variation.price,
        salePrice: variation.salePrice,
        stockQuantity: variation.stockQuantity,
        volume: variation.volume,
        weightGrams: variation.weightGrams,
        attributes: variation.attributes,
        tags: (variation.tags as ("HOT" | "NEW" | "SALE" | "FEATURED")[]) || [],
      });
    } else {
      setEditingVariation(null);
      setVariationForm({
        name: "",
        price: 0,
        stockQuantity: 0,
      });
    }
    setShowVariationDialog(true);
  };

  const handleVariationSubmit = async () => {
    try {
      // Clean and format the data before sending
      const cleanedData: CreateVariationRequest | UpdateVariationRequest = {
        name: variationForm.name.trim(),
        price: Number(variationForm.price),
        ...(variationForm.salePrice &&
          variationForm.salePrice > 0 && {
            salePrice: Number(variationForm.salePrice),
          }),
        ...(variationForm.volume &&
          variationForm.volume.trim() && {
            volume: variationForm.volume.trim(),
          }),
        ...(variationForm.stockQuantity !== undefined && {
          stockQuantity: Number(variationForm.stockQuantity) || 0,
        }),
        ...(variationForm.attributes &&
          Object.keys(variationForm.attributes).length > 0 && {
            attributes: variationForm.attributes,
          }),
        ...(variationForm.tags &&
          variationForm.tags.length > 0 && {
            tags: variationForm.tags,
          }),
        ...(variationForm.weightGrams &&
          variationForm.weightGrams > 0 && {
            weightGrams: Number(variationForm.weightGrams),
          }),
      };

      if (editingVariation) {
        // Update existing variation
        const updated = await updateProductVariation(
          token!,
          id,
          editingVariation.id,
          cleanedData as UpdateVariationRequest
        );
        setVariations((prev) =>
          prev.map((v) => (v.id === editingVariation.id ? updated : v))
        );
        toast.success("Variation updated successfully");
      } else {
        // Create new variation
        const created = await createProductVariation(
          token!,
          id,
          cleanedData as CreateVariationRequest
        );
        setVariations((prev) => [...prev, created]);
        toast.success("Variation created successfully");
      }
      setShowVariationDialog(false);
    } catch (error) {
      console.error("Error saving variation:", error);
      toast.error("Failed to save variation");
    }
  };

  const handleDeleteVariation = async (variationId: string) => {
    if (!confirm("Are you sure you want to delete this variation?")) return;

    try {
      await deleteProductVariation(token!, id, variationId);
      setVariations((prev) => prev.filter((v) => v.id !== variationId));
      toast.success("Variation deleted successfully");
    } catch (error) {
      console.error("Error deleting variation:", error);
      toast.error("Failed to delete variation");
    }
  };

  // Image management functions
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewMainImage(file);
    }
  };

  const handleAdditionalImagesChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    if (newAdditionalImages.length + files.length > 10) {
      toast.error("Maximum 10 additional images allowed");
      return;
    }
    setNewAdditionalImages((prev) => [...prev, ...files]);
  };

  const removeNewAdditionalImage = (index: number) => {
    setNewAdditionalImages((prev) => prev.filter((_, i) => i !== index));
  };

  const markImageForRemoval = (imageId: string) => {
    setImagesToRemove((prev) => {
      if (prev.includes(imageId)) {
        return prev.filter((id) => id !== imageId);
      }
      return [...prev, imageId];
    });
  };

  const isImageMarkedForRemoval = (imageId: string) => {
    return imagesToRemove.includes(imageId);
  };

  if (loading) {
    return (
      <div className="mx-auto px-4 py-8 container">
        <div className="space-y-4 animate-pulse">
          <div className="bg-gray-200 rounded w-1/4 h-8"></div>
          <div className="bg-gray-200 rounded h-64"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded h-16"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto px-4 py-8 container">
        <div className="text-center">
          <h1 className="mb-4 font-bold text-2xl">Product not found</h1>
          <Button onClick={() => router.push("/admin/products")}>
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-8 container">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/admin/products")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="mb-2 font-bold text-3xl">Edit Product</h1>
            <p className="text-muted-foreground">
              Update product information and settings
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/products/${id}`)}>
            Cancel
          </Button>
          <Button onClick={handleUpdateProduct} disabled={saving}>
            {saving ? (
              <>
                <div className="mr-2 border-2 border-white border-t-transparent rounded-full w-4 h-4 animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 w-4 h-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

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
                  value={formData.name || ""}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter product name"
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
            </CardContent>
          </Card>

          {/* Product Variations */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Product Variations</CardTitle>
                <Button onClick={() => openVariationDialog()}>
                  <Plus className="mr-2 w-4 h-4" />
                  Add Variation
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {variations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Sale Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Volume</TableHead>
                      <TableHead>Weight (g)</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {variations.map((variation) => (
                      <TableRow key={variation.id}>
                        <TableCell>{variation.name || "Unnamed"}</TableCell>
                        <TableCell>৳{variation.price}</TableCell>
                        <TableCell>
                          {variation.salePrice
                            ? `৳${variation.salePrice}`
                            : "-"}
                        </TableCell>
                        <TableCell>{variation.stockQuantity}</TableCell>
                        <TableCell>{variation.volume || "-"}</TableCell>
                        <TableCell>{variation.weightGrams || "-"}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openVariationDialog(variation)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleDeleteVariation(variation.id)
                              }>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-8 text-muted-foreground text-center">
                  No variations available. Add your first variation to get
                  started.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product Images */}
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main Image Management */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Main Image</Label>

                <div className="flex flex-wrap gap-4">
                  {/* Current Main Image */}
                  {product.baseImageUrl && !deleteMainImage && (
                    <div className="relative">
                      <div className="group relative w-32 h-32 overflow-hidden rounded-lg border-2 border-gray-300">
                        <Image
                          src={product.baseImageUrl}
                          alt={product.name}
                          width={128}
                          height={128}
                          className="object-cover"
                        />

                        {/* Hover overlay with controls */}
                        <div className="absolute inset-0 flex justify-center items-center gap-1 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              console.log("Deleting main image");
                              console.log("Images array:", images);
                              console.log(
                                "Main image in array:",
                                images.find((img) => img.isMainImage)
                              );
                              setDeleteMainImage(true);
                            }}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <Badge
                        className="absolute top-1 left-1 text-xs"
                        variant="secondary">
                        Current Main
                      </Badge>
                    </div>
                  )}

                  {/* Marked for deletion state */}
                  {product.baseImageUrl && deleteMainImage && (
                    <div className="relative">
                      <div className="relative w-32 h-32 overflow-hidden rounded-lg border-2 border-red-500 opacity-50 grayscale">
                        <Image
                          src={product.baseImageUrl}
                          alt={product.name}
                          width={128}
                          height={128}
                          className="object-cover"
                        />
                      </div>
                      <Badge
                        className="absolute top-1 left-1 text-xs"
                        variant="destructive">
                        Will Delete
                      </Badge>
                      <Button
                        type="button"
                        variant="default"
                        size="icon"
                        className="absolute -top-2 -right-2 w-6 h-6"
                        onClick={() => setDeleteMainImage(false)}>
                        <Undo className="w-3 h-3" />
                      </Button>
                    </div>
                  )}

                  {/* New Main Image Upload */}
                  {newMainImage ? (
                    <div className="relative">
                      <div className="relative w-32 h-32 overflow-hidden rounded-lg border-2 border-green-500">
                        <Image
                          src={URL.createObjectURL(newMainImage)}
                          alt="New main image"
                          width={128}
                          height={128}
                          className="object-cover"
                        />
                      </div>
                      <Badge
                        className="absolute top-1 left-1 text-xs"
                        variant="default">
                        New Main
                      </Badge>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 w-6 h-6"
                        onClick={() => setNewMainImage(null)}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col justify-center items-center bg-gray-50 hover:bg-gray-100 border-2 border-gray-300 border-dashed rounded-lg w-32 h-32 cursor-pointer">
                      <Upload className="mb-2 w-6 h-6 text-gray-500" />
                      <p className="text-gray-500 text-xs text-center px-2">
                        {product.baseImageUrl && !deleteMainImage
                          ? "Replace"
                          : "Upload"}{" "}
                        main image
                      </p>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleMainImageChange}
                      />
                    </label>
                  )}
                </div>

                {/* Main image info */}
                {deleteMainImage && images.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <Star className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        One of your additional images will automatically become
                        the new main image
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Images Management */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold">
                  Additional Images
                </Label>

                {/* New Additional Images */}
                {newAdditionalImages.length > 0 && (
                  <div>
                    <p className="mb-3 text-sm font-medium text-gray-700">
                      New images to add:
                    </p>
                    <div className="gap-3 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6">
                      {newAdditionalImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="relative w-full h-20 overflow-hidden rounded-lg border-2 border-green-500">
                            <Image
                              src={URL.createObjectURL(image)}
                              alt={`New additional ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 w-5 h-5"
                            onClick={() => removeNewAdditionalImage(index)}>
                            <X className="w-3 h-3" />
                          </Button>
                          <Badge
                            className="absolute top-1 left-1 text-xs"
                            variant="default">
                            New
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload More Button */}
                {newAdditionalImages.length < 10 && (
                  <label className="flex flex-col justify-center items-center bg-gray-50 hover:bg-gray-100 border-2 border-gray-300 border-dashed rounded-lg w-full h-20 cursor-pointer transition-colors">
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-500 text-sm">
                        Add More Images ({newAdditionalImages.length}/10)
                      </span>
                    </div>
                    <input
                      ref={additionalImagesInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleAdditionalImagesChange}
                    />
                  </label>
                )}
              </div>

              {/* Current Additional Images */}
              {images.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">
                    Current additional images:
                  </p>
                  <div className="gap-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                    {images.map((image) => (
                      <div key={image.id} className="group relative">
                        <div
                          className={`relative w-full h-24 overflow-hidden rounded-lg border-2 transition-all ${
                            isImageMarkedForRemoval(image.id)
                              ? "border-red-500 opacity-50 grayscale"
                              : "border-gray-300 hover:border-gray-400"
                          }`}>
                          <Image
                            src={image.imageUrl}
                            alt={image.altText || product.name}
                            fill
                            className="object-cover"
                          />
                        </div>

                        {/* Image controls overlay */}
                        <div className="absolute inset-0 flex justify-center items-center gap-1 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                          <Button
                            type="button"
                            size="sm"
                            variant={
                              isImageMarkedForRemoval(image.id)
                                ? "default"
                                : "destructive"
                            }
                            onClick={() => markImageForRemoval(image.id)}>
                            {isImageMarkedForRemoval(image.id) ? (
                              <Undo className="w-3 h-3" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                          </Button>
                        </div>

                        {/* Status badges */}
                        {image.isMainImage && (
                          <Badge
                            className="absolute top-1 left-1 text-xs"
                            variant="secondary">
                            Main
                          </Badge>
                        )}
                        {isImageMarkedForRemoval(image.id) && (
                          <Badge
                            className="absolute top-1 right-1 text-xs"
                            variant="destructive">
                            Will Remove
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Image Management Summary */}
              {(newMainImage ||
                deleteMainImage ||
                newAdditionalImages.length > 0 ||
                imagesToRemove.length > 0) && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h4 className="font-medium text-sm mb-2 text-blue-900">
                    Pending Image Changes:
                  </h4>
                  <ul className="text-sm space-y-1">
                    {deleteMainImage && (
                      <li className="flex items-center gap-2">
                        <Trash2 className="w-3 h-3 text-red-600" />
                        <span>Current main image will be deleted</span>
                        {images.filter(
                          (img) => !imagesToRemove.includes(img.id)
                        ).length > 0 && (
                          <span className="text-gray-600">
                            (one additional image will become main)
                          </span>
                        )}
                      </li>
                    )}
                    {newMainImage && (
                      <li className="flex items-center gap-2">
                        <Plus className="w-3 h-3 text-green-600" />
                        <span>New main image will be uploaded</span>
                      </li>
                    )}
                    {newAdditionalImages.length > 0 && (
                      <li className="flex items-center gap-2">
                        <Plus className="w-3 h-3 text-green-600" />
                        <span>
                          {newAdditionalImages.length} additional images will be
                          added
                        </span>
                      </li>
                    )}
                    {imagesToRemove.length > 0 && (
                      <li className="flex items-center gap-2">
                        <Trash2 className="w-3 h-3 text-red-600" />
                        <span>
                          {imagesToRemove.length} additional images will be
                          removed
                        </span>
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Empty State */}
              {!product.baseImageUrl &&
                images.length === 0 &&
                newMainImage === null && (
                  <div className="py-12 text-center text-muted-foreground">
                    <Upload className="mx-auto mb-4 w-12 h-12 text-gray-400" />
                    <h3 className="mb-2 font-medium">No images uploaded</h3>
                    <p className="text-sm">
                      Upload your first image to get started
                    </p>
                  </div>
                )}
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>

                  {/* Selected tags display */}
                  {formData.tags && formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.tags.map((tag) => (
                        <div
                          key={tag}
                          className="inline-flex items-center bg-primary/10 dark:bg-primary/20 px-3 py-1 border border-input dark:border-gray-700 rounded-full font-medium text-primary dark:text-primary-foreground text-sm">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:bg-primary/20 dark:hover:bg-primary/30 ml-2 p-1 rounded-full">
                            <span className="sr-only">Remove tag</span>
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Select component */}
                  <Select
                    value=""
                    onValueChange={(selectedTag) => addTag(selectedTag)}>
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
          {/* Category & Brand */}
          <Card>
            <CardHeader>
              <CardTitle>Category & Brand</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Current Category</Label>
                <p className="text-muted-foreground text-sm">
                  {product.category?.name || "Uncategorized"}
                </p>
              </div>

              <div>
                <Label>Current Brand</Label>
                <p className="text-muted-foreground text-sm">
                  {product.brand?.name || "No Brand"}
                </p>
              </div>

              <Separator />

              <div>
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate || ""}
                  onChange={(e) =>
                    handleInputChange("expiryDate", e.target.value)
                  }
                />
              </div>

              <p className="text-muted-foreground text-xs">
                Note: Category and Brand changes require additional
                implementation
              </p>
            </CardContent>
          </Card>

          {/* Product Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Product Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Total Variations</span>
                  <span className="font-medium text-sm">
                    {variations.length}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm">Total Stock</span>
                  <span className="font-medium text-sm">
                    {variations.reduce((sum, v) => sum + v.stockQuantity, 0)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm">Images</span>
                  <span className="font-medium text-sm">
                    {images.length + (product.baseImageUrl ? 1 : 0)}
                  </span>
                </div>

                <Separator />

                <div className="flex justify-between">
                  <span className="text-sm">Created</span>
                  <span className="font-medium text-sm">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm">Updated</span>
                  <span className="font-medium text-sm">
                    {new Date(product.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Variation Dialog */}
      <Dialog open={showVariationDialog} onOpenChange={setShowVariationDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingVariation ? "Edit Variation" : "Add New Variation"}
            </DialogTitle>
            <DialogDescription>
              {editingVariation
                ? "Update the variation details below."
                : "Add a new variation to this product."}
            </DialogDescription>
          </DialogHeader>
          <div className="gap-4 grid py-4">
            <div className="items-center gap-2 grid grid-cols-4">
              <Label htmlFor="name" className="text-right">
                Name *
              </Label>
              <Input
                id="name"
                type="text"
                value={variationForm.name}
                onChange={(e) =>
                  setVariationForm((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                className="col-span-3"
                required
              />
            </div>
            <div className="items-center gap-2 grid grid-cols-4">
              <Label htmlFor="price" className="text-right">
                Price *
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0.01"
                value={variationForm.price || ""}
                onChange={(e) =>
                  setVariationForm((prev) => ({
                    ...prev,
                    price: parseFloat(e.target.value) || 0,
                  }))
                }
                className="col-span-3"
                required
              />
            </div>
            <div className="items-center gap-2 grid grid-cols-4">
              <Label htmlFor="salePrice" className="text-right">
                Sale Price
              </Label>
              <Input
                id="salePrice"
                type="number"
                step="0.01"
                min="0.01"
                value={variationForm.salePrice || ""}
                onChange={(e) =>
                  setVariationForm((prev) => ({
                    ...prev,
                    salePrice: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  }))
                }
                className="col-span-3"
              />
            </div>
            <div className="items-center gap-2 grid grid-cols-4">
              <Label htmlFor="stockQuantity" className="text-right">
                Stock *
              </Label>
              <Input
                id="stockQuantity"
                type="number"
                min="0"
                value={variationForm.stockQuantity || ""}
                onChange={(e) =>
                  setVariationForm((prev) => ({
                    ...prev,
                    stockQuantity: parseInt(e.target.value) || 0,
                  }))
                }
                className="col-span-3"
                required
              />
            </div>
            <div className="items-center gap-2 grid grid-cols-4">
              <Label htmlFor="volume" className="text-right">
                Volume
              </Label>
              <Input
                id="volume"
                value={variationForm.volume || ""}
                onChange={(e) =>
                  setVariationForm((prev) => ({
                    ...prev,
                    volume: e.target.value,
                  }))
                }
                placeholder="e.g., 500ml"
                className="col-span-3"
              />
            </div>
            <div className="items-center gap-2 grid grid-cols-4">
              <Label htmlFor="weightGrams" className="text-right">
                Weight (g)
              </Label>
              <Input
                id="weightGrams"
                type="number"
                step="0.1"
                min="0"
                value={variationForm.weightGrams || ""}
                onChange={(e) =>
                  setVariationForm((prev) => ({
                    ...prev,
                    weightGrams: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  }))
                }
                className="col-span-3"
              />
            </div>
            <div className="items-center gap-2 grid grid-cols-4">
              <Label htmlFor="tags" className="text-right">
                Tags
              </Label>
              <div className="col-span-3 space-y-2">
                <div className="flex flex-wrap gap-2">
                  {["HOT", "NEW", "SALE", "FEATURED"].map((tag) => (
                    <Badge
                      key={tag}
                      variant={
                        variationForm.tags?.includes(tag as any)
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => {
                        const currentTags = variationForm.tags || [];
                        const updatedTags = currentTags.includes(tag as any)
                          ? currentTags.filter((t) => t !== tag)
                          : [
                              ...currentTags,
                              tag as "HOT" | "NEW" | "SALE" | "FEATURED",
                            ];
                        setVariationForm((prev) => ({
                          ...prev,
                          tags: updatedTags,
                        }));
                      }}>
                      {tag}
                    </Badge>
                  ))}
                </div>
                {variationForm.tags && variationForm.tags.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Selected: {variationForm.tags.join(", ")}
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowVariationDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleVariationSubmit}>
              {editingVariation ? "Update" : "Create"} Variation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
