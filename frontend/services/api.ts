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
	(error) => {
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

	// Analysis operations
	getAnalysisStatus: async (fileId: number): Promise<AnalysisResponse> => {
		const response = await api.get(`/analysis/${fileId}`);
		return response.data;
	},

	reanalyzeFile: async (fileId: number): Promise<AnalysisResponse> => {
		const response = await api.post(`/files/${fileId}/reanalyze`);
		return response.data;
	},

	// Network analysis
	getNetworkAnalysis: async (fileId: number): Promise<any> => {
		const response = await api.get(`/network-analysis/${fileId}`);
		return response.data;
	},

	// Memory analysis
	getMemoryAnalysis: async (fileId: number): Promise<any> => {
		const response = await api.get(`/memory-analysis/${fileId}`);
		return response.data;
	},

	// File analysis
	getFileAnalysis: async (fileId: number): Promise<any> => {
		const response = await api.get(`/file-analysis/${fileId}`);
		return response.data;
	},

	// WebSocket connection
	connectWebSocket: (analysisId: number, token: string): WebSocket => {
		const wsUrl = `${API_BASE_URL.replace(
			'http',
			'ws'
		)}/network/ws/${analysisId}?token=${token}`;
		return new WebSocket(wsUrl);
	},

	// Add a more general WebSocket connection function for other channels
	connectRealtimeWebSocket: (
		channel: string,
		token: string,
		sessionId?: string
	): WebSocket => {
		const wsUrl = `${API_BASE_URL.replace(
			'http',
			'ws'
		)}/realtime/ws/${channel}?token=${token}${
			sessionId ? `&session_id=${sessionId}` : ''
		}`;
		return new WebSocket(wsUrl);
	},
};
