import { IconType } from 'react-icons';
import { Role } from '@prisma/client';

import { FaGear } from 'react-icons/fa6';
import {  FaBookmark ,FaUsers } from 'react-icons/fa';
import { IoGrid } from 'react-icons/io5';

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
          href: '/dashboard',
          label: 'Dashboard',
          active: pathname.includes('/dashboard'),
          icon: IoGrid,
          submenus: [],
          role: getRoles('ADMIN')
        }
      ],
      role: getRoles('ADMIN')
    },
    {
      groupLabel: 'Contents',
      menus: [
       
        // {
        //   href: '/dashboard/posts/my-posts',
        //   label: 'Posts',
        //   active: pathname.includes('/dashboard/posts'),
        //   icon: FaPenSquare,
        //   submenus: [
        //     {
        //       href: '/dashboard/posts/my-posts',
        //       label: 'My Posts',
        //       active: pathname === 'dashboard/posts/my-posts'
        //     },
        //     {
        //       href: '/dashboard/posts',
        //       label: 'All Posts',
        //       active: pathname === '/dashboard/posts'
        //     },
        //     {
        //       href: '/dashboard/posts/draft-posts',
        //       label: 'Draft Posts',
        //       active: pathname === 'dashboard/posts/draft-posts'
        //     },
        //     {
        //       href: '/dashboard/posts/new',
        //       label: 'New Post',
        //       active: pathname === '/dashboard/posts/new'
        //     }
        //   ],
        //   role: getRoles('ADMIN')
        // },
        // {
        //   href: '/dashboard/categories',
        //   label: 'Categories',
        //   active: pathname.includes('/dashboard/categories'),
        //   icon: FaBookmark,
        //   submenus: [
        //     {
        //       href: '/dashboard/categories',
        //       label: 'All Categories',
        //       active: pathname === 'dashboard/categories'
        //     },
        //     {
        //       href: '/dashboard/categories/new-category',
        //       label: 'New Category',
        //       active: pathname === 'dashboard/categories/new-category'
        //     }
        //   ],
        //   role: getRoles('ADMIN')
        // },
        // {
        //   href: '/dashboard/comments',
        //   label: 'Comments',
        //   active: pathname.includes('/dashboard/comments'),
        //   icon: FaFileUpload,
        //   submenus: [],
        //   role: getRoles('ADMIN')
        // },
        // {
        //   href: '/dashboard/tags',
        //   label: 'Tags',
        //   active: pathname.includes('/dashboard/tags'),
        //   icon: FaTag,
        //   submenus: [],
        //   role: getRoles('ADMIN')
        // }
      ],
      role: getRoles('ADMIN')
    },
    {
      groupLabel: 'Access',
      menus: [

        {
          href: '/dashboard/vacancies/all-vacancy-categories',
          label: 'View Tokens',
          active: pathname.includes('/dashboard/vacancies/all-vacancy-categories'),
          icon: FaBookmark,
          submenus: [
            {
              href: '/dashboard/tokens',
              label: 'All Tokens',
              active: pathname === '/dashboard/tokens'
            },
            {
              href: '/dashboard/tokens/create',
              label: 'New Token',
              active: pathname === '/dashboard/tokens/creat'
            }
          ],
          role: getRoles('ADMIN')
        }
      ],
      role: getRoles('ADMIN')
    },
    // {
    //   groupLabel: 'Payments',
    //   menus: [
    //     {
    //       href: '/dashboard/payments/invoices',
    //       label: 'Invoices',
    //       active: pathname.includes('/dashboard/payments/invoices'),
    //       icon: FaDollarSign,
    //       submenus: [],
    //       role: getRoles('ADMIN')
    //     },
    //     {
    //       href: '/dashboard/customer/invoices',
    //       label: 'My Invoices',
    //       active: pathname.includes('/dashboard/customer'),
    //       icon: FaFileInvoiceDollar,
    //       submenus: [],
    //       role: getRoles('ADMIN')
    //     }
    //   ],
    //   role: getRoles('ADMIN')
    // },
    {
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
    }
  ];
}