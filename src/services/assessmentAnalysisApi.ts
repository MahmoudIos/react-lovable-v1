import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';
import { handleApiResponse, handleApiError } from '@/utils/toastHandler';
import type { ApiResponseDto } from '@/types/apiResponse';
import type {
	AnalyzeAssessmentRequestDto,
	AssessmentAnalysisResultDto,
	AssessmentResultsDto,
	NotImplementedItemsDto,
	UpdateStatusRequestDto,
	StatusUpdateResultDto,
} from '@/types/api';

// Query Keys
export const assessmentAnalysisKeys = {
	all: ['assessment-analysis'] as const,
	results: (assessmentId: string) =>
		[...assessmentAnalysisKeys.all, 'results', assessmentId] as const,
	notImplemented: (assessmentId: string, threshold?: number) =>
		[
			...assessmentAnalysisKeys.all,
			'not-implemented',
			assessmentId,
			{ threshold },
		] as const,
};

// API Functions
export const useAssessmentAnalysisApi = () => {
	const analyzeAssessment = async (
		assessmentId: string,
		data: AnalyzeAssessmentRequestDto
	): Promise<ApiResponseDto<AssessmentAnalysisResultDto>> => {
		const response = await api.post<ApiResponseDto<AssessmentAnalysisResultDto>>(
			endpoints.assessmentAnalysis.analyze(assessmentId),
			data
		);
		return response.data;
	};

	const getAssessmentResults = async (
		assessmentId: string
	): Promise<ApiResponseDto<AssessmentResultsDto>> => {
		const response = await api.get<ApiResponseDto<AssessmentResultsDto>>(
			endpoints.assessmentAnalysis.results(assessmentId)
		);
		return response.data;
	};

	const getNotImplementedItems = async (
		assessmentId: string,
		scoreThreshold?: number
	): Promise<ApiResponseDto<NotImplementedItemsDto>> => {
		const url = endpoints.assessmentAnalysis.notImplemented(assessmentId);
		const params = scoreThreshold ? `?scoreThreshold=${scoreThreshold}` : '';
		const response = await api.get<ApiResponseDto<NotImplementedItemsDto>>(`${url}${params}`);
		return response.data;
	};

	const updateItemStatuses = async (
		assessmentId: string,
		data: UpdateStatusRequestDto
	): Promise<ApiResponseDto<StatusUpdateResultDto>> => {
		const response = await api.post<ApiResponseDto<StatusUpdateResultDto>>(
			endpoints.assessmentAnalysis.updateStatus(assessmentId),
			data
		);
		return response.data;
	};

	return {
		analyzeAssessment,
		getAssessmentResults,
		getNotImplementedItems,
		updateItemStatuses,
	};
};

// React Query Hooks
export const useAssessmentResults = (assessmentId: string) => {
	const { getAssessmentResults } = useAssessmentAnalysisApi();

	return useQuery({
		queryKey: assessmentAnalysisKeys.results(assessmentId),
		queryFn: () => getAssessmentResults(assessmentId),
		select: (response) => response.data,
		enabled: !!assessmentId,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
};

export const useNotImplementedItems = (
	assessmentId: string,
	scoreThreshold?: number
) => {
	const { getNotImplementedItems } = useAssessmentAnalysisApi();

	return useQuery({
		queryKey: assessmentAnalysisKeys.notImplemented(
			assessmentId,
			scoreThreshold
		),
		queryFn: () => getNotImplementedItems(assessmentId, scoreThreshold),
		select: (response) => response.data,
		enabled: !!assessmentId,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
};

export const useAnalyzeAssessment = () => {
	const queryClient = useQueryClient();
	const { analyzeAssessment } = useAssessmentAnalysisApi();

	return useMutation({
		mutationFn: ({
			assessmentId,
			data,
		}: {
			assessmentId: string;
			data: AnalyzeAssessmentRequestDto;
		}) => analyzeAssessment(assessmentId, data),
		onSuccess: (response, { assessmentId }) => {
			if (handleApiResponse(response, { successMessage: 'Assessment analysis completed successfully' })) {
				queryClient.invalidateQueries({
					queryKey: assessmentAnalysisKeys.results(assessmentId),
				});
				queryClient.invalidateQueries({
					queryKey: assessmentAnalysisKeys.notImplemented(assessmentId),
				});
			}
		},
		onError: (error: any) => {
			handleApiError(error, 'Failed to analyze assessment');
		},
	});
};

export const useUpdateItemStatuses = () => {
	const queryClient = useQueryClient();
	const { updateItemStatuses } = useAssessmentAnalysisApi();

	return useMutation({
		mutationFn: ({
			assessmentId,
			data,
		}: {
			assessmentId: string;
			data: UpdateStatusRequestDto;
		}) => updateItemStatuses(assessmentId, data),
		onSuccess: (response, { assessmentId }) => {
			if (handleApiResponse(response, { successMessage: 'Item statuses updated successfully' })) {
				queryClient.invalidateQueries({
					queryKey: assessmentAnalysisKeys.results(assessmentId),
				});
				queryClient.invalidateQueries({
					queryKey: assessmentAnalysisKeys.notImplemented(assessmentId),
				});
			}
		},
		onError: (error: any) => {
			handleApiError(error, 'Failed to update item statuses');
		},
	});
};
