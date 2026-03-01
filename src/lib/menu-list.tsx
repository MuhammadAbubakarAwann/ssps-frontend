import { IconType } from 'react-icons';
import { Role } from '@prisma/client';

import { FaGear } from 'react-icons/fa6';
import { FaUsers, FaUtensils } from 'react-icons/fa';
import { IoGrid } from 'react-icons/io5';
import { MdShoppingCart, MdSubscriptions } from 'react-icons/md';
import { FaMotorcycle } from 'react-icons/fa';

import { getRoles } from './utils/auth-helpers/role';

type Submenu = {
  href: string;
  label: string;
  active: boolean;
};

type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: IconType
  submenus: Submenu[];
  role: Role[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
  role: Role[];
};

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: '',
      menus: [
        {
          href: '/',
          label: 'Dashboard',
          active: pathname === '/',
          icon: IoGrid,
          submenus: [],
          role: getRoles('ADMIN')
        },
        {
          href: '/order-management',
          label: 'Orders',
          active: pathname.includes('/order-management'),
          icon: MdShoppingCart,
          submenus: [],
          role: getRoles('ADMIN')
        },
        {
          href: '/restaurants',
          label: 'Restaurants',
          active: pathname.includes('/restaurants'),
          icon: FaUtensils,
          submenus: [],
          role: getRoles('ADMIN')
        },
        {
          href: '/riders',
          label: 'Riders',
          active: pathname.includes('/riders'),
          icon: FaMotorcycle,
          submenus: [],
          role: getRoles('ADMIN')
        },
        {
          href: '/subscription-management',
          label: 'Subscription Plans',
          active: pathname.includes('/subscription-management'),
          icon: MdSubscriptions,
          submenus: [],
          role: getRoles('ADMIN')
        }
      ],
      role: getRoles('ADMIN')
    }
  ];
}

export function getSettingsMenu(pathname: string): Group {
  return {
    groupLabel: 'Settings',
    menus: [
      {
        href: '/dashboard/users',
        label: 'Users',
        active: pathname.includes('/dashboard/users'),
        icon: FaUsers,
        submenus: [],
        role: getRoles('ADMIN')
      },
      {
        href: '/dashboard/account',
        label: 'Account',
        active: pathname.includes('/account'),
        icon: FaGear,
        submenus: [],
        role: getRoles('ADMIN')
      }
    ],
    role: getRoles('ADMIN')
  };
}