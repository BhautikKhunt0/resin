import { apiRequest } from './queryClient';

export const api = {
  // Categories
  getCategories: () => fetch('/api/categories').then(res => res.json()),
  getCategoryById: (id: number) => fetch(`/api/categories/${id}`).then(res => res.json()),
  getSubcategories: () => fetch('/api/subcategories').then(res => res.json()),
  getSubcategoriesByCategory: (categoryId: number) => 
    fetch(`/api/categories/${categoryId}/subcategories`).then(res => res.json()),
  getSubcategoryById: (id: number) => fetch(`/api/subcategories/${id}`).then(res => res.json()),

  // Products
  getProducts: (params?: { categoryId?: number; subcategoryId?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.categoryId) searchParams.set('categoryId', params.categoryId.toString());
    if (params?.subcategoryId) searchParams.set('subcategoryId', params.subcategoryId.toString());
    
    return fetch(`/api/products?${searchParams}`).then(res => res.json());
  },
  getProduct: (id: number) => fetch(`/api/products/${id}`).then(res => res.json()),
  getProductsBySubcategory: (subcategoryId: number) => 
    fetch(`/api/products?subcategoryId=${subcategoryId}`).then(res => res.json()),
  getProductImages: (id: number) => fetch(`/api/products/${id}/images`).then(res => res.json()),

  // Orders
  createOrder: (orderData: any) => apiRequest('POST', '/api/orders', orderData),

  // Banners
  getBanners: () => fetch('/api/banners').then(res => res.json()),

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

  // Admin - Subcategories
  getAdminSubcategories: (token: string) =>
    fetch('/api/admin/subcategories', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }).then(res => res.json()),
  createSubcategory: (token: string, data: any) =>
    fetch('/api/admin/subcategories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }),
  updateSubcategory: (token: string, id: number, data: any) =>
    fetch(`/api/admin/subcategories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }),
  deleteSubcategory: (token: string, id: number) =>
    fetch(`/api/admin/subcategories/${id}`, {
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
  getAdminProductImages: (token: string, id: number) =>
    fetch(`/api/admin/products/${id}/images`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }).then(res => res.json()),

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

  // Admin - Banners
  getAdminBanners: (token: string) =>
    fetch('/api/admin/banners', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }).then(res => res.json()),
  createBanner: (token: string, data: any) =>
    fetch('/api/admin/banners', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }),
  updateBanner: (token: string, id: number, data: any) =>
    fetch(`/api/admin/banners/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }),
  deleteBanner: (token: string, id: number) =>
    fetch(`/api/admin/banners/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),

  // Image Upload
  uploadImage: (token: string, imageData: string, filename?: string) =>
    fetch('/api/admin/upload-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ imageData, filename }),
    }).then(res => res.json()),

  // Admin - Settings
  getAdminSettings: (token: string) =>
    fetch('/api/admin/settings', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }).then(res => res.json()),
  getAdminSetting: (token: string, key: string) =>
    fetch(`/api/admin/settings/${key}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }).then(res => res.json()),
  createSetting: (token: string, data: any) =>
    fetch('/api/admin/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }).then(res => res.json()),
  updateSetting: (token: string, key: string, value: string) =>
    fetch(`/api/admin/settings/${key}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ value }),
    }).then(res => res.json()),
  deleteSetting: (token: string, key: string) =>
    fetch(`/api/admin/settings/${key}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),

  // Public Settings
  getWhatsAppNumber: () => fetch('/api/settings/whatsapp').then(res => res.json()),
};
