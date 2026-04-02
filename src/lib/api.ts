import { createBrowserClient } from './supabase';

function getApiUrl(): string {
  // Always use relative path — requests go through the Next.js catch-all proxy
  // at /api/academy/[...path] which forwards to Henry Bot with proper auth headers.
  // NEVER call Henry directly from the browser.
  return '';
}

const BASE_PATH = '/api/academy';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  try {
    const supabase = createBrowserClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
  } catch {
    // No session available — send unauthenticated
  }

  return headers;
}

async function getAuthHeaderOnly(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};
  try {
    const supabase = createBrowserClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
  } catch {
    // noop
  }
  return headers;
}

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(`${getApiUrl()}${BASE_PATH}${path}`, window.location.origin);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

function formatErrorMessage(status: number, text: string): string {
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed?.detail)) {
      return parsed.detail
        .map((err: { loc?: string[]; msg?: string }) => {
          const field = err.loc?.filter((s: string) => s !== 'body').join('.') || 'field';
          return `${field}: ${err.msg || 'invalid'}`;
        })
        .join('; ');
    }
    if (typeof parsed?.detail === 'string') return parsed.detail;
    if (typeof parsed?.message === 'string') return parsed.message;
    if (typeof parsed?.error === 'string') return parsed.error;
  } catch {
    // not JSON
  }
  return text || `HTTP ${status}`;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text().catch(() => 'Unknown error');
    throw new Error(formatErrorMessage(response.status, text));
  }
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null as T;
  }
  return response.json() as Promise<T>;
}

const DEFAULT_TIMEOUT = 30000;

export const academyApi = {
  async get<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    const headers = await getAuthHeaders();
    const response = await fetch(buildUrl(path, params), {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
    });
    return handleResponse<T>(response);
  },

  async post<T>(path: string, body?: unknown): Promise<T> {
    const headers = await getAuthHeaders();
    const response = await fetch(buildUrl(path), {
      method: 'POST',
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
    });
    return handleResponse<T>(response);
  },

  async patch<T>(path: string, body?: unknown): Promise<T> {
    const headers = await getAuthHeaders();
    const response = await fetch(buildUrl(path), {
      method: 'PATCH',
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
    });
    return handleResponse<T>(response);
  },

  async del<T>(path: string): Promise<T> {
    const headers = await getAuthHeaders();
    const response = await fetch(buildUrl(path), {
      method: 'DELETE',
      headers,
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
    });
    return handleResponse<T>(response);
  },

  async upload<T>(path: string, file: File, fieldName: string = 'file'): Promise<T> {
    const headers = await getAuthHeaderOnly();
    const formData = new FormData();
    formData.append(fieldName, file);
    const response = await fetch(buildUrl(path), {
      method: 'POST',
      headers,
      body: formData,
      signal: AbortSignal.timeout(60000), // Longer timeout for file uploads
    });
    return handleResponse<T>(response);
  },

  async stream(
    path: string,
    body?: unknown,
    onChunk?: (chunk: string) => void,
  ): Promise<void> {
    const headers = await getAuthHeaders();
    headers['Accept'] = 'text/event-stream';
    const response = await fetch(buildUrl(path), {
      method: 'POST',
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => 'Unknown error');
      throw new Error(formatErrorMessage(response.status, text));
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body for streaming');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Process SSE lines
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          onChunk?.(data);
        }
      }
    }

    // Flush remaining buffer
    if (buffer.startsWith('data: ')) {
      const data = buffer.slice(6);
      if (data !== '[DONE]') {
        onChunk?.(data);
      }
    }
  },
};
