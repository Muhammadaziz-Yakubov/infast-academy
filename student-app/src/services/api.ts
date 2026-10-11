import { AuthStorage } from './storage';
import { Platform } from 'react-native';

// Production InFast Academy backend domain
const PRODUCTION_API_URL = 'https://www.infastacademy.uz';

const getBaseUrl = (): string => {
  // If EXPO_PUBLIC_API_URL is explicitly provided in environment, prioritize it
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  // Local development fallback only when explicitly enabled via flag
  if (typeof __DEV__ !== 'undefined' && __DEV__ && process.env.EXPO_PUBLIC_USE_LOCALHOST === 'true') {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000';
    }
    return 'http://localhost:3000';
  }

  // Default to live production server
  return PRODUCTION_API_URL;
};

export const API_BASE_URL = getBaseUrl();

export async function apiRequest<T = any>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    headers?: Record<string, string>;
  } = {}
): Promise<T> {
  const token = await AuthStorage.getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    let data: any;
    const text = await response.text();
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { error: text || `Server xatosi: ${response.status} ${response.statusText}` };
    }

    if (!response.ok) {
      throw new Error(data?.error || `Xatolik yuz berdi (${response.status})`);
    }

    return data;
  } catch (error: any) {
    console.warn(`[API] Error on ${endpoint}:`, error.message);
    throw error;
  }
}
