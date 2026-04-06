import { LoginRequest, AuthResponse } from './auth-types';

// Client-side authentication functions
export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    const contentType = response.headers.get('content-type') || '';

    if (!contentType.includes('application/json')) {
      return {
        success: false,
        message: 'Authentication service returned an invalid response'
      };
    }

    const data: AuthResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'Network error occurred'
    };
  }
}

export async function logout() {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST'
    });
  } catch (error) {
    console.error('Logout error:', error);
  }
}