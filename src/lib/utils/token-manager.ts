import { cookies } from 'next/headers';

interface TokenInfo {
  isValid: boolean;
  isExpiring: boolean;
  expiresAt?: Date;
  needsRefresh: boolean;
}

export function getTokenInfo(): TokenInfo {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    
    if (!accessToken) 
      return {
        isValid: false,
        isExpiring: false,
        needsRefresh: true
      };

    
    return {
      isValid: true,
      isExpiring: false,
      needsRefresh: false
    };
    
  } catch (error) {
    console.error('Error checking token info:', error);
    return {
      isValid: false,
      isExpiring: false,
      needsRefresh: true
    };
  }
}

export async function extendTokenLife() {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    
    if (accessToken) {
      // Extend the cookie life
      cookieStore.set('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 2 * 60 * 60 // 2 hours
      });
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error extending token life:', error);
    return false;
  }
}