import NextTopLoader from 'nextjs-toploader';
import { Toaster } from 'sonner';
import '../globals.css';

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='font-graphik'>
      <div className='app-grid-bg' />
      <NextTopLoader color='#4FA6F8' />
      {children}
      <Toaster />
    </div>
  );
}
