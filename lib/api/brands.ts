const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Brand {
  id: string;
  name: string;
  slug?: string;
  logoUrl?: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
  productCount?: number;
}

export interface CreateBrandRequest {
  name: string;
  description?: string;
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  logo?: File;
}

export interface BrandsResponse {
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

export const getBrands = async (
    page = 1,
    limit = 50
): Promise<BrandsResponse> => {
    const response = await fetch(`${API_BASE_URL}/brands?page=${page}&limit=${limit}`, { next: { revalidate: 300 } });

    if (!response.ok) {
        throw new Error('Failed to fetch brands');
    }

    return response.json();
};

export const createBrand = async (token: string, brandData: CreateBrandRequest): Promise<Brand> => {
  const formData = new FormData();
  
  Object.entries(brandData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, value.toString());
      }
    }
  });

  const response = await fetch(`${API_BASE_URL}/brands`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to create brand');
  }

  const result = await response.json();
  return result.data;
};

export const updateBrand = async (token: string, id: string, brandData: Partial<CreateBrandRequest>): Promise<Brand> => {
  const formData = new FormData();
  
  Object.entries(brandData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, value.toString());
      }
    }
  });

  const response = await fetch(`${API_BASE_URL}/brands/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to update brand');
  }

  const result = await response.json();
  return result.data;
};

export const deleteBrand = async (token: string, id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/brands/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete brand');
  }
};