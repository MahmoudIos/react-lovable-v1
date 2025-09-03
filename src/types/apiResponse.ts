export interface ApiResponseDto<T> {
  success: boolean;
  message: string;
  data?: T | null;
  errors: string[];
  metadata?: any;
}