import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-service';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check both NextAuth session and custom session
    const authSession = await auth();
    const customSession = await getSession();
    
    if (!authSession && !customSession) 
      return NextResponse.json({ error: 'No session' }, { status: 401 });
    

    // For NextAuth sessions, check token expiration
    if (authSession?.expires) {
      const tokenExpiry = new Date(authSession.expires);
      const now = new Date();
      const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
      
      if (tokenExpiry < now) 
        return NextResponse.json({ error: 'Token expired' }, { status: 401 });
      
      
      if (tokenExpiry < thirtyMinutesFromNow) 
        return NextResponse.json({ warning: 'Token expiring soon' }, { status: 406 });
      
    }

    return NextResponse.json({ status: 'valid' }, { status: 200 });
    
  } catch (error) {
    console.error('Token check error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}