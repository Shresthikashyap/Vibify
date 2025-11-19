import axios from "axios";

export const axiosInstance = axios.create({
	baseURL: import.meta.env.MODE === "development" ? "http://localhost:5000/api" : "/api",
});

// Store the getToken function
let getTokenFunction: (() => Promise<string | null>) | null = null;

export const setTokenRefreshFunction = (getToken: () => Promise<string | null>) => {
	getTokenFunction = getToken;
};

// Add response interceptor for token refresh
axiosInstance.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		// If error is 401 and we haven't retried yet
		if (error.response?.status === 401 && !originalRequest._retry && getTokenFunction) {
			originalRequest._retry = true;

			try {
				// Get fresh token
				const newToken = await getTokenFunction();
				
				if (newToken) {
					// Update default headers
					axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
					// Update current request header
					originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
					
					// Retry the original request
					return axiosInstance(originalRequest);
				}
			} catch (refreshError) {
				console.error("Token refresh failed:", refreshError);
				return Promise.reject(refreshError);
			}
		}

		return Promise.reject(error);
	}
);