import { toast } from '@/hooks/use-toast';
import axios from 'axios';

const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		'Content-Type': 'application/json',
	},
});

// Request interceptor for adding auth token
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('token');
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	/// @ts-ignore
	(error: any) => {
		return Promise.reject(error);
	}
);

// Response interceptor for handling errors
api.interceptors.response.use(
	(response) => response,
	(error) => {
		const message = error.response?.data?.detail || 'An error occurred';
		toast({
			title: 'Error',
			description: message,
			variant: 'destructive',
		});
		return Promise.reject(error);
	}
);

export interface FileUploadResponse {
	status: string;
	message: string;
	file_id: number;
	filename: string;
	file_type: string;
	size: number;
	cloudinary_url: string;
	analysis_status: string;
	uploaded_at: string;
	last_analyzed: string;
}

export interface FileListResponse {
	status: string;
	message: string;
	items: FileUploadResponse[];
	total: number;
	page: number;
	page_size: number;
}

export interface AnalysisResponse {
	status: string;
	message: string;
	file_id: number;
	analysis_status: string;
	analysis_results: any;
	progress: number;
	task_id: string;
}

// Add authentication interfaces
export interface LoginRequest {
	email: string;
	password: string;
}

export interface RegisterRequest {
	username: string;
	email: string;
	password: string;
	full_name?: string;
}

export interface AuthResponse {
	access_token: string;
	token_type: string;
	user: {
		id: number;
		username: string;
		email: string;
		full_name?: string;
	};
}

export interface NetworkAnalysisResponse {
	id: number;
	file_id: number;
	status: string;
	result: {
		connections: Array<{
			id: string;
			source: string;
			destination: string;
			protocol: string;
			port: number;
			status: string;
			timestamp: string;
			bytes: number;
		}>;
		statistics: {
			total_packets: number;
			total_bytes: number;
			protocols: Record<string, number>;
		};
	};
	started_at: string;
	completed_at: string;
	error_message?: string;
}

export interface MemoryAnalysisResponse {
	id: number;
	file_id: number;
	status: string;
	result: {
		processes: Array<{
			pid: number;
			name: string;
			memory_usage: number;
			threads: number;
			status: string;
		}>;
		memory_regions: Array<{
			address: string;
			size: number;
			type: string;
			permissions: string;
			description: string;
		}>;
		statistics: {
			total_memory: number;
			used_memory: number;
			process_count: number;
		};
	};
	started_at: string;
	completed_at: string;
	error_message?: string;
}

export interface FileAnalysisResponse {
	id: number;
	file_id: number;
	status: string;
	result: {
		file_info: {
			name: string;
			size: number;
			type: string;
			created_at: string;
			modified_at: string;
		};
		metadata: {
			mime_type: string;
			hash: string;
			permissions: string;
			owner: string;
			group: string;
		};
		content_analysis: {
			text_content: string;
			entropy: number;
			is_encrypted: boolean;
			is_compressed: boolean;
		};
	};
	started_at: string;
	completed_at: string;
	error_message?: string;
}

export const apiService = {
	// Authentication methods
	login: async (data: LoginRequest): Promise<AuthResponse> => {
		try {
			const response = await api.post('/auth/login', data);
			// Store the token in localStorage
			if (response.data.access_token) {
				localStorage.setItem('token', response.data.access_token);
			}
			return response.data;
		} catch (error) {
			console.error('Login error:', error);
			throw error;
		}
	},

	register: async (data: RegisterRequest): Promise<AuthResponse> => {
		try {
			const response = await api.post('/auth/register', data);
			return response.data;
		} catch (error) {
			console.error('Registration error:', error);
			throw error;
		}
	},

	logout: () => {
		localStorage.removeItem('token');
	},

	// File operations
	uploadFile: async (file: File): Promise<FileUploadResponse> => {
		const formData = new FormData();
		formData.append('file', file);
		const response = await api.post('/upload', formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
		return response.data;
	},

	listFiles: async (params: {
		page?: number;
		page_size?: number;
		status?: string;
		search?: string;
	}): Promise<FileListResponse> => {
		const response = await api.get('/files', { params });
		return response.data;
	},

	deleteFile: async (fileId: number): Promise<void> => {
		await api.delete(`/files/${fileId}`);
	},

	searchFiles: async (query: string): Promise<FileUploadResponse[]> => {
		const response = await api.get('/files/search', { params: { query } });
		return response.data;
	},

	// Analysis operations
	getAnalysisStatus: async (fileId: number): Promise<AnalysisResponse> => {
		const response = await api.get(`/analysis/${fileId}`);
		return response.data;
	},

	reanalyzeFile: async (fileId: number): Promise<AnalysisResponse> => {
		const response = await api.post(`/files/${fileId}/reanalyze`);
		return response.data;
	},

	getAnalysisProgress: async (
		taskId: string
	): Promise<{
		task_id: string;
		status: string;
		progress: number;
		result: any;
	}> => {
		const response = await api.get(`/analysis/${taskId}/progress`);
		return response.data;
	},

	// Network analysis
	getNetworkAnalysis: async (
		fileId: number
	): Promise<NetworkAnalysisResponse> => {
		const response = await api.get(`/network-analysis/${fileId}`);
		return response.data;
	},

	getNetworkStatistics: async (
		fileId: number
	): Promise<{
		total_packets: number;
		total_bytes: number;
		protocols: Record<string, number>;
	}> => {
		const response = await api.get(`/network-analysis/${fileId}/statistics`);
		return response.data;
	},

	// Memory analysis
	getMemoryAnalysis: async (
		fileId: number
	): Promise<MemoryAnalysisResponse> => {
		const response = await api.get(`/memory-analysis/${fileId}`);
		return response.data;
	},

	getMemoryStatistics: async (
		fileId: number
	): Promise<{
		total_memory: number;
		used_memory: number;
		process_count: number;
	}> => {
		const response = await api.get(`/memory-analysis/${fileId}/statistics`);
		return response.data;
	},

	// File analysis
	getFileAnalysis: async (fileId: number): Promise<FileAnalysisResponse> => {
		const response = await api.get(`/file-analysis/${fileId}`);
		return response.data;
	},

	getFileStatistics: async (
		fileId: number
	): Promise<{
		total_files: number;
		total_size: number;
		file_types: Record<string, number>;
	}> => {
		const response = await api.get(`/file-analysis/${fileId}/statistics`);
		return response.data;
	},

	// WebSocket connections
	connectNetworkWebSocket: (analysisId: number): WebSocket => {
		const token = localStorage.getItem('token');
		if (!token) throw new Error('No authentication token found');

		const wsUrl = `${API_BASE_URL.replace(
			'http',
			'ws'
		)}/network/ws/${analysisId}?token=${token}`;
		return new WebSocket(wsUrl);
	},

	connectMemoryWebSocket: (analysisId: number): WebSocket => {
		const token = localStorage.getItem('token');
		if (!token) throw new Error('No authentication token found');

		const wsUrl = `${API_BASE_URL.replace(
			'http',
			'ws'
		)}/memory/ws/${analysisId}?token=${token}`;
		return new WebSocket(wsUrl);
	},

	connectFileWebSocket: (analysisId: number): WebSocket => {
		const token = localStorage.getItem('token');
		if (!token) throw new Error('No authentication token found');

		const wsUrl = `${API_BASE_URL.replace(
			'http',
			'ws'
		)}/file/ws/${analysisId}?token=${token}`;
		return new WebSocket(wsUrl);
	},

	// OAuth methods
	getGithubAuthUrl: async (): Promise<string> => {
		const response = await api.get('/auth/github/login');
		return response.data.authorize_url;
	},

	getGoogleAuthUrl: async (): Promise<string> => {
		const response = await api.get('/auth/google/login');
		return response.data.authorize_url;
	},

	// Process OAuth tokens from URL
	processOAuthRedirect: (urlParams: URLSearchParams): string | null => {
		const token = urlParams.get('token');
		if (token) {
			localStorage.setItem('token', token);
			return token;
		}
		return null;
	},
};
