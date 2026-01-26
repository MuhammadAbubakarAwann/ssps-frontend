'use client';

import { cn } from '@/lib/utils';
import { useStore } from '@/lib/hooks/use-store';
import { Sidebar } from '@/components/sections/side-bar';
import { useSidebarToggle } from '@/lib/hooks/use-sidebar-toggle';
import { Role } from '@prisma/client';

export default function AdminPanelLayout({
  children, activeRole
}: {
  children: React.ReactNode;
  activeRole: Role;
}) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const sidebar = useStore(useSidebarToggle, (state) => state);

  if (!sidebar) return null;

  return (
    <>
      <Sidebar activeRole={activeRole} />
      <main
        className={cn(
          'min-h-[calc(100vh_-_56px)] dark:bg-bg-default bg-bg-default transition-[margin-left] ease-in-out duration-300',
          sidebar?.isOpen === false ? 'lg:ml-[90px]' : 'lg:ml-72'
        )}
      >
        {children}
      </main>
      <footer
        className={cn(
          'transition-[margin-left] ease-in-out duration-300',
          sidebar?.isOpen === false ? 'lg:ml-[90px]' : 'lg:ml-72'
        )}
      >
      </footer>
    </>
  );
}
