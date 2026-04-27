import { ReactNode } from 'react';
import { Navbar } from './Navbar';

interface LayoutProps {
  children: ReactNode;
  showNavbar?: boolean;
}

export const Layout = ({ children, showNavbar = true }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d0d2b]">
      {showNavbar && <Navbar />}
      <main className={showNavbar ? 'pt-24' : ''}>{children}</main>
    </div>
  );
};

