import { IconType } from 'react-icons';
import { Role } from '@prisma/client';

import { FaGear } from 'react-icons/fa6';
import { IoGrid } from 'react-icons/io5';
import { MdSubscriptions } from 'react-icons/md';

type Submenu = {
  href: string;
  label: string;
  active: boolean;
};

type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: IconType;
  submenus: Submenu[];
  role: Role[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
  role: Role[];
};

const TEACHER_AND_ADMIN_ROLES = ['TEACHER', 'ADMIN'] as Role[];

function isPathActive(pathname: string, target: string): boolean {
  return pathname === target || pathname.startsWith(`${target}/`);
}

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: '',
      menus: [
        {
          href: '/',
          label: 'Overview',
          active: pathname === '/',
          icon: IoGrid,
          submenus: [],
          role: TEACHER_AND_ADMIN_ROLES
        },
        {
          href: '/dashboard',
          label: 'Class Management',
          active:
            isPathActive(pathname, '/dashboard') ||
            isPathActive(pathname, '/class-management'),
          icon: MdSubscriptions,
          role: TEACHER_AND_ADMIN_ROLES,
          submenus: [
            {
              href: '/class-management',
              label: 'All Classes',
              active: isPathActive(pathname, '/class-management')
            },
            {
              href: '/class-management/new',
              label: 'New Class',
              active: isPathActive(pathname, '/class-management/new')
            }
          ]
        }
      ],
      role: TEACHER_AND_ADMIN_ROLES
    }
  ];
}

export function getSettingsMenu(pathname: string): Group {
  return {
    groupLabel: 'Settings',
    menus: [
      {
        href: '/dashboard/account',
        label: 'Account',
        active: pathname.includes('/account'),
        icon: FaGear,
        submenus: [],
        role: TEACHER_AND_ADMIN_ROLES
      }
    ],
    role: TEACHER_AND_ADMIN_ROLES
  };
}
