import axios from "axios";
import { toast } from "@/components/ui/use-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

// Request interceptor for adding auth token
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("token");
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
		const message = error.response?.data?.message || "An error occurred";
		toast({
			title: "Error",
			description: message,
			variant: "destructive",
		});
		return Promise.reject(error);
	}
);

export interface FileUploadResponse {
	id: string;
	filename: string;
	size: number;
	type: string;
	status: "processing" | "completed" | "failed";
	error?: string;
}

export interface FileListResponse {
	files: Array<{
		id: string;
		filename: string;
		size: number;
		type: string;
		status: "processing" | "completed" | "failed";
		created_at: string;
		updated_at: string;
	}>;
}

export interface AnalysisResponse {
	id: string;
	file_id: string;
	type: string;
	status: "running" | "completed" | "failed";
	results?: any;
	error?: string;
	created_at: string;
	completed_at?: string;
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface RegisterRequest {
	email: string;
	password: string;
	name: string;
}

export interface AuthResponse {
	token: string;
	user: {
		id: string;
		email: string;
		name: string;
	};
}

class ApiService {
	// Authentication
	async login(data: LoginRequest): Promise<AuthResponse> {
		const response = await api.post("/api/auth/login", data);
		const { token, user } = response.data;
		localStorage.setItem("token", token);
		return { token, user };
	}

	async register(data: RegisterRequest): Promise<AuthResponse> {
		const response = await api.post("/api/auth/register", {
			username: data.name.toLowerCase().replace(/\s+/g, '_'),
			email: data.email,
			password: data.password,
			full_name: data.name
		});
		const { token, user } = response.data;
		localStorage.setItem("token", token);
		return { token, user };
	}

	async logout(): Promise<void> {
		localStorage.removeItem("token");
		await api.post("/api/auth/logout");
	}

	// File operations
	async uploadFile(file: File): Promise<FileUploadResponse> {
		const formData = new FormData();
		formData.append("file", file);
		const response = await api.post("/api/files/upload", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		return response.data;
	}

	async getFiles(): Promise<FileListResponse> {
		const response = await api.get("/api/files");
		return response.data;
	}

	async deleteFile(fileId: string): Promise<void> {
		await api.delete(`/api/files/${fileId}`);
	}

	// Analysis operations
	async startAnalysis(fileId: string, type: string): Promise<AnalysisResponse> {
		const response = await api.post("/api/analysis", {
			file_id: fileId,
			type,
		});
		return response.data;
	}

	async getAnalysis(analysisId: string): Promise<AnalysisResponse> {
		const response = await api.get(`/api/analysis/${analysisId}`);
		return response.data;
	}

	async getAnalysisResults(analysisId: string): Promise<any> {
		const response = await api.get(`/api/analysis/${analysisId}/results`);
		return response.data;
	}

	// Generic HTTP methods
	async get<T>(url: string): Promise<T> {
		const response = await api.get(url);
		return response.data;
	}

	async post<T>(url: string, data?: any): Promise<T> {
		const response = await api.post(url, data);
		return response.data;
	}

	async put<T>(url: string, data?: any): Promise<T> {
		const response = await api.put(url, data);
		return response.data;
	}

	async delete<T>(url: string): Promise<T> {
		const response = await api.delete(url);
		return response.data;
	}

	async verifyToken() {
		const response = await api.get("/auth/verify");
		return response.data;
	}

	async getGoogleAuthUrl(): Promise<string> {
		const response = await api.get("/api/auth/google/login");
		return response.data.authorize_url;
	}

	async getGithubAuthUrl(): Promise<string> {
		const response = await api.get("/api/auth/github/login");
		return response.data.authorize_url;
	}
}

export const apiService = new ApiService();
