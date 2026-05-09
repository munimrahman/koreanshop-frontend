"use client";

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, FolderOpen, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
// import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  Category, 
  CreateCategoryRequest,
  CategoriesResponse 
} from '@/lib/api/categories';
import { useAdmin } from '@/contexts/AdminContext';
import { toast } from 'sonner';

export function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CreateCategoryRequest>({
    name: '',
    description: '',
    slug: '',
    metaTitle: '',
    metaDescription: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const { token } = useAdmin();

  useEffect(() => {
    fetchCategories();
  }, [currentPage]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getCategories(currentPage, 20);
      setCategories(response.categories);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      setFormLoading(true);
      if (editingCategory) {
        await updateCategory(token, editingCategory.id, formData);
        toast.success('Category updated successfully');
      } else {
        await createCategory(token, formData);
        toast.success('Category created successfully');
      }
      
      fetchCategories();
      resetForm();
      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      slug: category.slug || '',
      metaTitle: category.metaTitle || '',
      metaDescription: category.metaDescription || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!categoryToDelete || !token) return;

    try {
      await deleteCategory(token, categoryToDelete.id);
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    } finally {
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      slug: '',
      metaTitle: '',
      metaDescription: '',
    });
    setEditingCategory(null);
  };

  const filteredCategories = categories?.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="mx-auto px-4 py-8 container">
        <div className="space-y-4 animate-pulse">
          <div className="bg-gray-200 rounded w-1/4 h-8"></div>
          <div className="bg-gray-200 rounded h-10"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded h-16"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-4 sm:py-6 lg:py-8 container">
  {/* Header Section - Responsive */}
  <div className="flex sm:flex-row flex-col sm:justify-between sm:items-start gap-4 mb-6 sm:mb-8">
    <div className="flex-1">
      <h1 className="mb-2 font-bold text-2xl sm:text-3xl">Categories Management</h1>
      <p className="text-muted-foreground text-sm sm:text-base">
        Organize your products with categories
      </p>
    </div>
    <div className="flex-shrink-0">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button onClick={resetForm} className="w-full sm:w-auto">
            <Plus className="mr-2 w-4 h-4" />
            <span className="sm:inline">Add Category</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="mx-4 sm:mx-0 w-full max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="font-medium text-sm">
                Category Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter category name"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description" className="font-medium text-sm">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter category description"
                rows={3}
                className="mt-1 resize-none"
              />
            </div>

            <div>
              <Label htmlFor="cat-slug" className="font-medium text-sm">URL Slug</Label>
              <div className="flex items-center mt-1">
                <span className="inline-flex items-center px-2 border border-r-0 border-input rounded-l-md bg-muted text-muted-foreground text-xs h-10">?category=</span>
                <Input
                  id="cat-slug"
                  className="rounded-l-none"
                  value={formData.slug || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-') }))}
                  placeholder="category-slug (Leave blank to auto-generate)"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <Label htmlFor="cat-metaTitle" className="font-medium text-sm">Meta Title</Label>
                <span className="text-muted-foreground text-xs">{(formData.metaTitle || '').length}/60</span>
              </div>
              <Input
                id="cat-metaTitle"
                value={formData.metaTitle || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                placeholder="Leave blank to use category name"
                maxLength={60}
                className="mt-1"
              />
            </div>

            <div>
              <div className="flex justify-between items-center">
                <Label htmlFor="cat-metaDescription" className="font-medium text-sm">Meta Description</Label>
                <span className="text-muted-foreground text-xs">{(formData.metaDescription || '').length}/160</span>
              </div>
              <Textarea
                id="cat-metaDescription"
                value={formData.metaDescription || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                placeholder="Leave blank to use category description"
                rows={2}
                maxLength={160}
                className="mt-1 resize-none"
              />
            </div>

            <div className="flex sm:flex-row flex-col gap-2 sm:gap-3 pt-4">
              <Button type="submit" disabled={formLoading} className="flex-1 sm:flex-none">
                {formLoading ? (
                  <div className="flex justify-center items-center gap-2">
                    <div className="border-2 border-white border-t-transparent rounded-full w-4 h-4 animate-spin" />
                    <span className="text-sm">
                      {editingCategory ? 'Updating...' : 'Creating...'}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm">
                    {editingCategory ? 'Update Category' : 'Create Category'}
                  </span>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  </div>

  {/* Main Content Card */}
  <Card className="overflow-hidden">
    <CardHeader className="pb-4">
      <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4">
        <CardTitle className="text-lg sm:text-xl">
          All Categories ({pagination.total || 0})
        </CardTitle>
        <div className="relative w-full sm:w-auto">
          <Search className="top-1/2 left-3 absolute w-4 h-4 text-muted-foreground -translate-y-1/2" />
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full sm:w-64"
          />
        </div>
      </div>
    </CardHeader>
    
    <CardContent className="p-0">
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Category</TableHead>
              <TableHead className="w-[35%]">Description</TableHead>
              <TableHead className="w-[15%]">Created</TableHead>
              <TableHead className="w-[10%] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories?.map((category) => (
              <TableRow key={category.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-shrink-0 justify-center items-center bg-primary/10 rounded-lg w-10 h-10">
                      <FolderOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{category.name}</div>
                      <div className="text-muted-foreground text-sm truncate">
                        ID: {category.id}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-xs truncate">
                    {category.description || 'No description'}
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  {new Date(category.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(category)}>
                        <Edit className="mr-2 w-4 h-4" />
                        Edit Category
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600 focus:text-red-600"
                        onClick={() => {
                          setCategoryToDelete(category);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="mr-2 w-4 h-4" />
                        Delete Category
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden block">
        <div className="space-y-3 p-4">
          {filteredCategories?.map((category) => (
            <Card key={category.id} className="shadow-sm border">
              <CardContent className="p-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex flex-1 items-start gap-3 min-w-0">
                    <div className="flex flex-shrink-0 justify-center items-center bg-primary/10 rounded-lg w-10 h-10">
                      <FolderOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{category.name}</h3>
                      <p className="mt-1 text-muted-foreground text-xs truncate">
                        ID: {category.id}
                      </p>
                      {category.description && (
                        <p className="mt-2 text-muted-foreground text-xs line-clamp-2">
                          {category.description}
                        </p>
                      )}
                      <p className="mt-2 text-muted-foreground text-xs">
                        Created: {new Date(category.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-8 h-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(category)}>
                          <Edit className="mr-2 w-4 h-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600 focus:text-red-600"
                          onClick={() => {
                            setCategoryToDelete(category);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 w-4 h-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Empty State */}
      {(filteredCategories?.length === 0 || !filteredCategories) && (
        <div className="py-12 text-muted-foreground text-center">
          <div className="flex flex-col items-center gap-3">
            <FolderOpen className="w-12 h-12 text-muted-foreground/50" />
            <div>
              <p className="font-medium text-sm">No categories found</p>
              <p className="mt-1 text-muted-foreground text-xs">
                {searchQuery ? 'Try adjusting your search terms' : 'Get started by creating your first category'}
              </p>
            </div>
            {!searchQuery && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  resetForm();
                  setDialogOpen(true);
                }}
                className="mt-2"
              >
                <Plus className="mr-2 w-4 h-4" />
                Add Category
              </Button>
            )}
          </div>
        </div>
      )}
    </CardContent>
  </Card>

  {/* Pagination Controls */}
  {pagination.totalPages > 1 && (
    <div className="flex sm:flex-row flex-col justify-between items-center gap-4 mt-6">
      <div className="text-muted-foreground text-sm">
        Showing {((currentPage - 1) * pagination.limit) + 1} to {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} categories
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(1)}
          disabled={!pagination.hasPrev}
        >
          First
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={!pagination.hasPrev}
        >
          Previous
        </Button>
        
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
            let pageNum = 1;
            if (pagination.totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= pagination.totalPages - 2) {
              pageNum = pagination.totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(pageNum)}
                className="p-0 w-8 h-8"
              >
                {pageNum}
              </Button>
            );
          })}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={!pagination.hasNext}
        >
          Next
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(pagination.totalPages)}
          disabled={!pagination.hasNext}
        >
          Last
        </Button>
      </div>
    </div>
  )}

  {/* Delete Confirmation Dialog */}
  <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
    <AlertDialogContent className="mx-4 sm:mx-0 w-full max-w-md">
      <AlertDialogHeader>
        <AlertDialogTitle className="text-lg">Are you sure?</AlertDialogTitle>
        <AlertDialogDescription className="text-sm">
          This action cannot be undone. This will permanently delete the category
          <span className="font-medium"> "{categoryToDelete?.name}"</span> and may affect associated products.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter className="sm:flex-row flex-col gap-2">
        <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
        <AlertDialogAction 
          onClick={handleDelete}
          className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
        >
          Delete Category
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</div>
  );
}