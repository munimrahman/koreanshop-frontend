// /lib/api/shipping.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;


export interface ShippingCharge {
  id: string;
  region: 'dhaka' | 'outside_dhaka';
  charge: number;
  description: string;
  updatedAt: string;
}

export interface ShippingChargesResponse {
  success: boolean;
  message: string;
  data: {
    dhaka: number;
    outsideDhaka: number;
    details: ShippingCharge[];
  };
}

export interface ShippingChargeResponse {
  success: boolean;
  message: string;
  data: ShippingCharge;
}

export interface ShippingCalculationRequest {
  address: string;
}

export interface ShippingCalculationResponse {
  success: boolean;
  message: string;
  data: {
    region: 'dhaka' | 'outside_dhaka';
    charge: number;
    isDhaka: boolean;
    address: string;
    description: string;
  };
}

export interface UpdateShippingChargeRequest {
  charge: number;
  description: string;
}

// Get all shipping charges
export const getAllShippingCharges = async (): Promise<ShippingChargesResponse> => {
  try {
    if (!API_BASE_URL) {
      throw new Error('API_BASE_URL is not configured');
    }

    const response = await fetch(`${API_BASE_URL}/shipping-charges`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Failed to fetch shipping charges: ${response.status} - ${errorText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Shipping charges API Error:', {
      error,
      apiUrl: API_BASE_URL,
      endpoint: `${API_BASE_URL}/shipping-charges`
    });
    throw error;
  }
};

// Get shipping charge for specific region
export const getShippingChargeByRegion = async (region: 'dhaka' | 'outside_dhaka'): Promise<ShippingChargeResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/shipping-charges/${region}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch shipping charge for region');
    }

    return response.json();
  } catch (error) {
    console.error('Shipping charge API Error:', error);
    throw error;
  }
};

// Calculate shipping charge based on address
export const calculateShippingCharge = async (request: ShippingCalculationRequest): Promise<ShippingCalculationResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/shipping-charges/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to calculate shipping charge');
    }

    return response.json();
  } catch (error) {
    console.error('Shipping calculation API Error:', error);
    throw error;
  }
};

// Admin: Update shipping charge for specific region
export const updateShippingCharge = async (
  region: 'dhaka' | 'outside_dhaka',
  request: UpdateShippingChargeRequest
): Promise<ShippingChargeResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/shipping-charges/${region}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to update shipping charge');
    }

    return response.json();
  } catch (error) {
    console.error('Update shipping charge API Error:', error);
    throw error;
  }
};