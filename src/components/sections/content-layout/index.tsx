import { UserInfo } from '@/@types';
import { Navbar } from '@/components/sections/nav-bar';



interface ContentLayoutProps {
  title: string;
  children: React.ReactNode;
  userInfo: UserInfo;
}

export function ContentLayout({ title, children, userInfo }: ContentLayoutProps) {
  return (
    <div>
      <Navbar userInfo={userInfo} title={title} />
      <div className='container dark:bg-bg-default pt-8 pb-8 px-4 sm:px-8'>{children}</div>
    </div>
  );
}
