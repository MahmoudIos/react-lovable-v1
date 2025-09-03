import { toast } from 'react-toastify';
import type { ApiResponseDto } from '@/types/apiResponse';

export const handleApiResponse = <T>(
  response: ApiResponseDto<T>,
  options?: {
    successMessage?: string;
    skipSuccessToast?: boolean;
    skipErrorToast?: boolean;
  }
) => {
  const { successMessage, skipSuccessToast = false, skipErrorToast = false } = options || {};

  if (!response.success) {
    if (!skipErrorToast) {
      const errorMessage = response.errors[0] || 'An unknown error occurred';
      toast.error(errorMessage);
    }
    return false;
  } else {
    if (!skipSuccessToast) {
      const message = successMessage || response.message;
      toast.success(message);
    }
    return true;
  }
};

export const handleApiError = (error: any, fallbackMessage = 'Something went wrong') => {
  const errorMessage = error?.response?.data?.message || error?.message || fallbackMessage;
  toast.error(errorMessage);
};