import { UserInfo } from '@/@types'
import { cookies } from 'next/headers'

// Server-side functions only (for server components and server actions)
export async function getSession(): Promise<{ user: UserInfo; accessToken: string; refreshToken: string } | null> {
  try {
    const cookieStore = cookies()
    const accessToken = cookieStore.get('access_token')?.value
    const refreshToken = cookieStore.get('refresh_token')?.value
    const userData = cookieStore.get('user_data')?.value

    if (!accessToken || !refreshToken || !userData) {
      return null
    }

    const user: UserInfo = JSON.parse(userData)

    return {
      user,
      accessToken,
      refreshToken,
    }
  } catch (error) {
    console.error('Session error:', error)
    return null
  }
}

export async function refreshAccessToken(): Promise<string | null> {
  try {
    const cookieStore = cookies()
    const refreshToken = cookieStore.get('refresh_token')?.value

    if (!refreshToken) {
      return null
    }

    const API_BASE_URL = process.env.BACKEND_API_URL || 'https://api.domlii.com/api/v1'

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${refreshToken}`,
      },
    })

    const data = await response.json()

    if (data.success && data.data?.accessToken) {
      // Update access token cookie
      cookieStore.set('access_token', data.data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60, // 15 minutes
      })

      return data.data.accessToken
    }

    return null
  } catch (error) {
    console.error('Token refresh error:', error)
    return null
  }
}

export async function requireAdmin(): Promise<{ user: UserInfo; accessToken: string; refreshToken: string }> {
  const session = await getSession()
  
  if (!session) {
    throw new Error('Authentication required')
  }

  if (session.user.role !== 'ADMIN') {
    throw new Error('Admin access required')
  }

  return session
}