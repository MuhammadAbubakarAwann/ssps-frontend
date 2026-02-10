'use client';

import { logout } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

interface LogoutButtonProps {
  className?: string
}

export default function LogoutButton({ className }: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={className || 'text-red-600 hover:text-red-800'}
    >
      Logout
    </button>
  );
}