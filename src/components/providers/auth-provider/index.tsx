'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  isTokenExpiring: boolean;
  refreshToken: () => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isTokenExpiring, setIsTokenExpiring] = useState(false);
  const router = useRouter();

  // Check token status every 5 minutes
  useEffect(() => {
    const checkTokenStatus = async () => {
      try {
        const response = await fetch('/api/auth/check-token', {
          method: 'GET',
          credentials: 'include'
        });

        if (response.status === 401) {
          // Token is expired or invalid
          setIsTokenExpiring(true);
          
          // Try to refresh the token
          const refreshSuccess = await refreshToken();
          
          if (!refreshSuccess) 
            // Refresh failed, logout user
            logout();
          
        } else if (response.status === 406) {
          // Token is expiring soon
          setIsTokenExpiring(true);
          await refreshToken();
        } else 
          setIsTokenExpiring(false);
        
      } catch (error) {
        console.error('Token status check failed:', error);
      }
    };

    // Initial check
    void checkTokenStatus();

    // Set up interval to check every 5 minutes
    const interval = setInterval(() => {
      void checkTokenStatus();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        setIsTokenExpiring(false);
        return true;
      } else 
        return false;
      
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  };

  const logout = () => {
    // Clear any client-side auth data
    document.cookie.split(';').forEach((c) => {
      const eqPos = c.indexOf('=');
      const name = eqPos > -1 ? c.substring(0, eqPos).trim() : c.trim();
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    });
    
    // Redirect to login
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ isTokenExpiring, refreshToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) 
    throw new Error('useAuth must be used within an AuthProvider');
  
  return context;
}

// Hook to automatically handle auth issues in components
export function useAuthGuard() {
  const { isTokenExpiring, refreshToken, logout } = useAuth();

  useEffect(() => {
    if (isTokenExpiring) 
      console.log('Token is expiring, attempting refresh...');
    
  }, [isTokenExpiring, refreshToken]);

  return { isTokenExpiring, logout };
}