import { Role } from '@prisma/client';

export type Locale = 'en' | 'fr'

export type NavLink = {
  label: string;
  href: string;
};

export interface UserInfo {
  id: string;
  name: string | null;
  email: string | null;
  role: Role;
  image: string | null;
}