import Link from 'next/link';
import { FiLayout } from 'react-icons/fi';

import { cn } from '@/lib/utils';
import { useStore } from '@/lib/hooks/use-store';
import { Button } from '@/components/ui/admin-button';
import { Menu } from '@/components/sections/menu';
import { useSidebarToggle } from '@/lib/hooks/use-sidebar-toggle';
import { SidebarToggle } from '@/components/sections/side-bar-toggle';
import { Role } from '@prisma/client';

export function Sidebar({ activeRole }: { activeRole: Role; }) {
  const sidebar = useStore(useSidebarToggle, (state) => state);

  if (!sidebar) return null;

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 z-20 h-screen -translate-x-full lg:translate-x-0 transition-[width] ease-in-out duration-300 bg-bg-bg-subtle',
        sidebar?.isOpen === false ? 'w-[90px]' : 'w-72'
      )}
    >
      <SidebarToggle isOpen={sidebar?.isOpen} setIsOpen={sidebar?.setIsOpen} />
      <div className='relative h-full flex flex-col px-3 py-4 overflow-y-auto shadow-md dark:shadow-zinc-800'>
        <Button
          className={cn(
            'transition-transform ease-in-out duration-300 mb-1',
            sidebar?.isOpen === false ? 'translate-x-1' : 'translate-x-0'
          )}
          variant='link'
          asChild
        >
          <Link href='/' className='flex items-center gap-2'>
            <FiLayout className='w-6 h-6 mr-1' />
            <h1
              className={cn(
                'font-bold text-lg whitespace-nowrap transition-[transform,opacity,display] ease-in-out duration-300',
                sidebar?.isOpen === false
                  ? '-translate-x-96 opacity-0 hidden'
                  : 'translate-x-0 opacity-100'
              )}
            >
              Domlii
            </h1>
          </Link>
        </Button>
        <Menu activeRole={activeRole} isOpen={sidebar?.isOpen} />
      </div>
    </aside>
  );
}
