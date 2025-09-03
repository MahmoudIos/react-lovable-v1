import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';
import { handleApiResponse, handleApiError } from '@/utils/toastHandler';
import type { ApiResponseDto } from '@/types/apiResponse';
import type { VendorDto, CreateVendorDto, UpdateVendorDto } from '@/types/api';

// Query Keys
export const vendorKeys = {
  all: ['vendors'] as const,
  lists: () => [...vendorKeys.all, 'list'] as const,
  list: (filters: string) => [...vendorKeys.lists(), { filters }] as const,
  details: () => [...vendorKeys.all, 'detail'] as const,
  detail: (id: string) => [...vendorKeys.details(), id] as const,
};

// API Functions
const fetchVendors = async (): Promise<ApiResponseDto<VendorDto[]>> => {
  const { data } = await api.get<ApiResponseDto<VendorDto[]>>(endpoints.vendors.list);
  return data;
};

const fetchVendor = async (id: string): Promise<ApiResponseDto<VendorDto>> => {
  const { data } = await api.get<ApiResponseDto<VendorDto>>(endpoints.vendors.detail(id));
  return data;
};

const createVendor = async (vendorData: CreateVendorDto): Promise<ApiResponseDto<VendorDto>> => {
  const { data } = await api.post<ApiResponseDto<VendorDto>>(endpoints.vendors.create, vendorData);
  return data;
};

const updateVendor = async (id: string, vendorData: UpdateVendorDto): Promise<ApiResponseDto<VendorDto>> => {
  const { data } = await api.put<ApiResponseDto<VendorDto>>(endpoints.vendors.update(id), vendorData);
  return data;
};

const deleteVendor = async (id: string): Promise<ApiResponseDto<void>> => {
  const { data } = await api.delete<ApiResponseDto<void>>(endpoints.vendors.delete(id));
  return data;
};

// React Query Hooks
export const useVendors = () => {
  return useQuery({
    queryKey: vendorKeys.lists(),
    queryFn: fetchVendors,
    select: (response) => response.data || [], // Map directly to the data
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useVendor = (id: string) => {
  return useQuery({
    queryKey: vendorKeys.detail(id),
    queryFn: () => fetchVendor(id),
    select: (response) => response.data,
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVendor,
    onSuccess: (response) => {
      if (handleApiResponse(response, { successMessage: 'Vendor created successfully' })) {
        queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
      }
    },
    onError: (error: any) => {
      handleApiError(error, 'Failed to create vendor');
    },
  });
};

export const useUpdateVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVendorDto }) =>
      updateVendor(id, data),
    onSuccess: (response, { id }) => {
      if (handleApiResponse(response, { successMessage: 'Vendor updated successfully' })) {
        queryClient.invalidateQueries({ queryKey: vendorKeys.detail(id) });
        queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
      }
    },
    onError: (error: any) => {
      handleApiError(error, 'Failed to update vendor');
    },
  });
};

export const useDeleteVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVendor,
    onSuccess: (response) => {
      if (handleApiResponse(response, { successMessage: 'Vendor deleted successfully' })) {
        queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
      }
    },
    onError: (error: any) => {
      handleApiError(error, 'Failed to delete vendor');
    },
  });
};