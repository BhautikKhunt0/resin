import { apiRequest } from './queryClient';

export const api = {
  // Categories
  getCategories: () => fetch('/api/categories').then(res => res.json()),
  getSubcategories: (categoryId: number) => 
    fetch(`/api/categories/${categoryId}/subcategories`).then(res => res.json()),

  // Products
  getProducts: (params?: { categoryId?: number; subcategoryId?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.categoryId) searchParams.set('categoryId', params.categoryId.toString());
    if (params?.subcategoryId) searchParams.set('subcategoryId', params.subcategoryId.toString());
    
    return fetch(`/api/products?${searchParams}`).then(res => res.json());
  },
  getProduct: (id: number) => fetch(`/api/products/${id}`).then(res => res.json()),

  // Orders
  createOrder: (orderData: any) => apiRequest('POST', '/api/orders', orderData),

  // Admin Auth
  adminLogin: (credentials: { email: string; password: string }) =>
    apiRequest('POST', '/api/admin/login', credentials),

  // Admin - Categories
  createCategory: (token: string, data: any) =>
    fetch('/api/admin/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }),
  updateCategory: (token: string, id: number, data: any) =>
    fetch(`/api/admin/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }),
  deleteCategory: (token: string, id: number) =>
    fetch(`/api/admin/categories/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),

  // Admin - Products
  createProduct: (token: string, data: any) =>
    fetch('/api/admin/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }),
  updateProduct: (token: string, id: number, data: any) =>
    fetch(`/api/admin/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }),
  deleteProduct: (token: string, id: number) =>
    fetch(`/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),

  // Admin - Orders
  getOrders: (token: string) =>
    fetch('/api/admin/orders', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }).then(res => res.json()),
  updateOrderStatus: (token: string, id: number, status: string) =>
    fetch(`/api/admin/orders/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    }),
  deleteOrder: (token: string, id: number) =>
    fetch(`/api/admin/orders/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),
};
