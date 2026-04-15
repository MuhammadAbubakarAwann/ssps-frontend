import { IconType } from 'react-icons';
import { Role } from '@prisma/client';

import { FaGear } from 'react-icons/fa6';
import { IoGrid } from 'react-icons/io5';
import { MdCompareArrows, MdHistory, MdSubscriptions } from 'react-icons/md';
import { FiBarChart2, FiUser } from 'react-icons/fi';

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
const ALL_DASHBOARD_ROLES = ['TEACHER', 'STUDENT', 'ADMIN'] as Role[];

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
          role: ALL_DASHBOARD_ROLES
        },
        {
          href: '/class-management',
          label: 'Class Management',
          active: isPathActive(pathname, '/class-management'),
          icon: MdSubscriptions,
          role: TEACHER_AND_ADMIN_ROLES,
          submenus: [
            {
              href: '/class-management/all-classes',
              label: 'All Classes',
              active: isPathActive(pathname, '/class-management/all-classes') || pathname === '/class-management'
            },
            {
              href: '/class-management/new-class',
              label: 'New Class',
              active: isPathActive(pathname, '/class-management/new-class')
            }
          ]
        },
        {
          href: '/predictions',
          label: 'Predictions',
          active: isPathActive(pathname, '/predictions'),
          icon: FiBarChart2,
          submenus: [],
          role: TEACHER_AND_ADMIN_ROLES
        },
        {
          href: '/student-details',
          label: 'Student Details',
          active: isPathActive(pathname, '/student-details'),
          icon: FiUser,
          submenus: [],
          role: ALL_DASHBOARD_ROLES
        },
        {
          href: '/report-history',
          label: 'Report History',
          active: isPathActive(pathname, '/report-history'),
          icon: MdHistory,
          submenus: [],
          role: TEACHER_AND_ADMIN_ROLES
        },
        {
          href: '/report-comparison',
          label: 'Report Comparison',
          active: isPathActive(pathname, '/report-comparison'),
          icon: MdCompareArrows,
          submenus: [],
          role: TEACHER_AND_ADMIN_ROLES
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
