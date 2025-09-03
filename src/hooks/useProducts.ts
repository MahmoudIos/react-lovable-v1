import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';
import { handleApiResponse, handleApiError } from '@/utils/toastHandler';
import type { ApiResponseDto } from '@/types/apiResponse';
import type { ProductDto, CreateProductDto, UpdateProductDto, ApproveProductDto } from '@/types/api';

// Query Keys
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: string) => [...productKeys.lists(), { filters }] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  byVendor: (vendorId: string) => [...productKeys.all, 'vendor', vendorId] as const,
};

// API Functions
const fetchProducts = async (): Promise<ApiResponseDto<ProductDto[]>> => {
  const { data } = await api.get<ApiResponseDto<ProductDto[]>>(endpoints.products.list);
  return data;
};

const fetchProduct = async (id: string): Promise<ApiResponseDto<ProductDto>> => {
  const { data } = await api.get<ApiResponseDto<ProductDto>>(endpoints.products.legacyDetail(id));
  return data;
};

const fetchProductsByVendor = async (vendorId: string): Promise<ApiResponseDto<ProductDto[]>> => {
  const { data } = await api.get<ApiResponseDto<ProductDto[]>>(endpoints.products.listByVendor(vendorId));
  return data;
};

const createProduct = async (vendorId: string, productData: CreateProductDto): Promise<ApiResponseDto<ProductDto>> => {
  const { data } = await api.post<ApiResponseDto<ProductDto>>(
    endpoints.products.create(vendorId), 
    productData
  );
  return data;
};

const updateProduct = async (vendorId: string, id: string, productData: UpdateProductDto): Promise<ApiResponseDto<ProductDto>> => {
  const { data } = await api.put<ApiResponseDto<ProductDto>>(
    endpoints.products.update(vendorId, id), 
    productData
  );
  return data;
};

const approveProduct = async (id: string, approvalData: ApproveProductDto): Promise<ApiResponseDto<ProductDto>> => {
  const { data } = await api.post<ApiResponseDto<ProductDto>>(
    endpoints.products.approve(id), 
    approvalData
  );
  return data;
};

const deleteProduct = async (vendorId: string, id: string): Promise<ApiResponseDto<void>> => {
  const { data } = await api.delete<ApiResponseDto<void>>(endpoints.products.delete(vendorId, id));
  return data;
};

// React Query Hooks
export const useProducts = () => {
  return useQuery({
    queryKey: productKeys.lists(),
    queryFn: fetchProducts,
    select: (response) => response.data || [],
    staleTime: 5 * 60 * 1000,
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => fetchProduct(id),
    select: (response) => response.data,
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useProductsByVendor = (vendorId: string) => {
  return useQuery({
    queryKey: productKeys.byVendor(vendorId),
    queryFn: () => fetchProductsByVendor(vendorId),
    select: (response) => response.data || [],
    enabled: !!vendorId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vendorId, data }: { vendorId: string; data: CreateProductDto }) =>
      createProduct(vendorId, data),
    onSuccess: (response, { vendorId }) => {
      if (handleApiResponse(response, { successMessage: 'Product created successfully' })) {
        queryClient.invalidateQueries({ queryKey: productKeys.lists() });
        queryClient.invalidateQueries({ queryKey: productKeys.byVendor(vendorId) });
        // Also invalidate vendors list to update product counts
        queryClient.invalidateQueries({ queryKey: ['vendors'] });
      }
    },
    onError: (error: any) => {
      handleApiError(error, 'Failed to create product');
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vendorId, id, data }: { vendorId: string; id: string; data: UpdateProductDto }) =>
      updateProduct(vendorId, id, data),
    onSuccess: (response, { vendorId, id }) => {
      if (handleApiResponse(response, { successMessage: 'Product updated successfully' })) {
        queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
        queryClient.invalidateQueries({ queryKey: productKeys.lists() });
        queryClient.invalidateQueries({ queryKey: productKeys.byVendor(vendorId) });
        queryClient.invalidateQueries({ queryKey: ['vendors'] });
      }
    },
    onError: (error: any) => {
      handleApiError(error, 'Failed to update product');
    },
  });
};

export const useApproveProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ApproveProductDto }) =>
      approveProduct(id, data),
    onSuccess: (response, { id }) => {
      if (handleApiResponse(response, { successMessage: 'Product approved successfully' })) {
        queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
        queryClient.invalidateQueries({ queryKey: productKeys.lists() });
        queryClient.invalidateQueries({ queryKey: productKeys.all });
        queryClient.invalidateQueries({ queryKey: ['vendors'] });
      }
    },
    onError: (error: any) => {
      handleApiError(error, 'Failed to approve product');
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vendorId, id }: { vendorId: string; id: string }) =>
      deleteProduct(vendorId, id),
    onSuccess: (response, { vendorId }) => {
      if (handleApiResponse(response, { successMessage: 'Product deleted successfully' })) {
        queryClient.invalidateQueries({ queryKey: productKeys.lists() });
        queryClient.invalidateQueries({ queryKey: productKeys.byVendor(vendorId) });
        queryClient.invalidateQueries({ queryKey: ['vendors'] });
      }
    },
    onError: (error: any) => {
      handleApiError(error, 'Failed to delete product');
    },
  });
};