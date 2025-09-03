// Centralized API endpoints following REST conventions

export const endpoints = {
  // Vendors
  vendors: {
    list: '/api/v1/vendors',
    create: '/api/v1/vendors',
    detail: (id: string) => `/api/v1/vendors/${id}`,
    update: (id: string) => `/api/v1/vendors/${id}`,
    delete: (id: string) => `/api/v1/vendors/${id}`,
  },
  
  // Products (nested under vendors)
  products: {
    listByVendor: (vendorId: string) => `/api/v1/vendors/${vendorId}/products`,
    create: (vendorId: string) => `/api/v1/vendors/${vendorId}/products`,
    detail: (vendorId: string, id: string) => `/api/v1/vendors/${vendorId}/products/${id}`,
    update: (vendorId: string, id: string) => `/api/v1/vendors/${vendorId}/products/${id}`,
    delete: (vendorId: string, id: string) => `/api/v1/vendors/${vendorId}/products/${id}`,
    
    // Legacy endpoints for backward compatibility
    list: '/api/v1/products',
    legacyDetail: (id: string) => `/api/v1/products/${id}`,
    approve: (id: string) => `/api/v1/products/${id}/approve`,
  },
  
  // Assessment Analysis
  assessmentAnalysis: {
    analyze: (assessmentId: string) => `/api/v1/assessmentanalysis/${assessmentId}/analyze`,
    results: (assessmentId: string) => `/api/v1/assessmentanalysis/${assessmentId}/results`,
    notImplemented: (assessmentId: string) => `/api/v1/assessmentanalysis/${assessmentId}/not-implemented`,
    updateStatus: (assessmentId: string) => `/api/v1/assessmentanalysis/${assessmentId}/update-status`,
  },
} as const;