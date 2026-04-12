import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

type UserData = {
  id?: string;
  role?: string;
  name?: string | null;
  email?: string | null;
};

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userDataRaw = cookieStore.get('user_data')?.value;

    if (!userDataRaw)
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const parsed = JSON.parse(userDataRaw) as UserData;

    if (!parsed?.id || !parsed?.role)
      return NextResponse.json({ success: false, message: 'Invalid session user data' }, { status: 400 });

    return NextResponse.json({
      success: true,
      user: {
        id: String(parsed.id),
        role: String(parsed.role).toUpperCase(),
        name: parsed.name ?? null,
        email: parsed.email ?? null
      }
    });
  } catch (error) {
    console.error('Error resolving current user:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
