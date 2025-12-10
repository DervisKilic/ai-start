export interface HealthCheckResponse {
  status: 'ok';
  timestamp: string;
}

const HEALTH_CHECK_TIMEOUT = 5000; // 5 seconds

/**
 * Check backend health status
 * This endpoint does not require authentication
 */
export async function checkBackendHealth(): Promise<HealthCheckResponse> {
  const API_BASE = import.meta.env.VITE_API_URL || '';
  const healthEndpoint = `${API_BASE}/health`;

  // Create an AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT);

  try {
    const response = await fetch(healthEndpoint, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    // Check if response is actually JSON (not HTML error page)
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Backend returned non-JSON response - server may not be running');
    }

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      // If JSON parsing fails, it might be HTML
      throw new Error('Backend returned invalid JSON - server may not be running');
    }
    
    // Validate response structure
    if (data.status === 'ok' && data.timestamp) {
      return data as HealthCheckResponse;
    }
    
    throw new Error('Invalid health check response');
  } catch (error) {
    clearTimeout(timeoutId);

    // Handle different error types
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - backend may be slow or unavailable');
      }
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('Cannot connect to backend - server may be down');
      }
      if (error.message.includes('CORS')) {
        throw new Error('CORS error - backend may not be configured correctly');
      }
      throw error;
    }
    
    throw new Error('Unknown error occurred while checking backend status');
  }
}
