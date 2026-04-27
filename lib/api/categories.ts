const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Category {
    id: string;
    name: string;
    description?: string;
    parentId?: string;
    imageUrl?: string;
    isActive?: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCategoryRequest {
    name: string;
    description?: string;
    parentId?: string;
    image?: File;
}

export interface CategoriesResponse {
    categories: Category[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export const getCategories = async (page = 1, limit: number = 20): Promise<CategoriesResponse> => {
    const params = new URLSearchParams({ page: page.toString() });
    if (limit !== undefined) {
        params.append('limit', limit.toString());
    }
    const response = await fetch(`${API_BASE_URL}/categories?${params.toString()}`,
        { next: { revalidate: 300 } }
    );

    if (!response.ok) {
        throw new Error('Failed to fetch categories');
    }

    return response.json();
};

export const createCategory = async (token: string, categoryData: CreateCategoryRequest): Promise<Category> => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
        throw new Error('Failed to create category');
    }

    const result = await response.json();
    return result.data;
};

export const updateCategory = async (token: string, id: string, categoryData: Partial<CreateCategoryRequest>): Promise<Category> => {
    const formData = new FormData();

    Object.entries(categoryData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            if (value instanceof File) {
                formData.append(key, value);
            } else {
                formData.append(key, value.toString());
            }
        }
    });

    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Failed to update category');
    }

    const result = await response.json();
    return result.data;
};

export const deleteCategory = async (token: string, id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to delete category');
    }
};