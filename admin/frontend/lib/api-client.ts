import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 10000, // 10s — prevents infinite "Signing in..."
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token from memory
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Refresh on 401
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    const isAuthEndpoint = originalRequest.url?.includes('/auth/');
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await apiClient.post<{ data: { accessToken: string } }>('/auth/refresh');
        const newToken = data.data.accessToken;
        setAccessToken(newToken);
        refreshQueue.forEach((cb) => cb(newToken));
        refreshQueue = [];
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch {
        clearAccessToken();
        window.location.href = '/login';
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// In-memory token storage (not localStorage — safer against XSS for SPAs)
let _accessToken: string | null = null;
export const getAccessToken = () => _accessToken;
export const setAccessToken = (token: string) => { _accessToken = token; };
export const clearAccessToken = () => { _accessToken = null; };
