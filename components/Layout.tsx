
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
  showFooter?: boolean;
  mainClassName?: string;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  showNav = true, 
  showFooter = true,
  mainClassName = ""
}) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  const linkClass = ({ isActive }: { isActive: boolean }) => 
    `flex flex-col items-center justify-center h-full w-full transition-all duration-300 relative group ${isActive ? 'text-brand-accent' : 'text-slate-400 hover:text-slate-200'}`;

  const iconClass = (isActive: boolean) => 
    `h-6 w-6 transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]' : 'group-hover:scale-105'}`;

  // If nav is hidden (e.g. quiz), reduce bottom padding
  const bottomPadding = showNav ? 'pb-32' : 'pb-8';

  return (
    <div className={`min-h-screen flex flex-col w-full relative overflow-x-hidden ${isLoginPage ? 'bg-brand-dark' : 'bg-brand-dark'}`}>
      
      <main className={`flex-grow relative z-10 flex flex-col ${bottomPadding} ${mainClassName}`}>
        <div className="flex-grow w-full">
          {children}
        </div>
        {showFooter && (
            <div className="w-full max-w-5xl mx-auto">
                <Footer />
            </div>
        )}
      </main>

      {showNav && (
        <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
          <nav className="w-full max-w-[380px] bg-brand-surface/95 backdrop-blur-2xl border border-white/10 pointer-events-auto rounded-[2.5rem] shadow-[0_20px_40px_-5px_rgba(0,0,0,0.6)] relative">
             
             {/* Central Floating Action Button */}
             <div className="absolute left-1/2 -translate-x-1/2 -top-6 w-16 h-16 pointer-events-auto z-20">
                 <NavLink 
                    to="/quiz" 
                    className={({ isActive }) => `flex items-center justify-center w-full h-full bg-white text-brand-dark rounded-full shadow-[0_0_25px_rgba(255,255,255,0.25)] transition-all duration-300 border-[6px] border-brand-dark hover:scale-105 active:scale-95 ${isActive ? 'bg-brand-accent' : ''}`}
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                 </NavLink>
             </div>

             {/* 5-Column Grid for perfect symmetry */}
             <div className="grid grid-cols-5 h-[4.5rem] items-center px-2 relative z-10">
                 
                 {/* 1. Home */}
                 <NavLink to="/" className={linkClass}>
                    {({ isActive }) => (
                      <svg xmlns="http://www.w3.org/2000/svg" className={iconClass(isActive)} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    )}
                 </NavLink>

                 {/* 2. Wishlist */}
                 <NavLink to="/wishlist" className={linkClass}>
                    {({ isActive }) => (
                      <svg xmlns="http://www.w3.org/2000/svg" className={iconClass(isActive)} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    )}
                 </NavLink>
                 
                 {/* 3. Center Spacer */}
                 <div className="w-full h-full pointer-events-none"></div>

                 {/* 4. History / Results */}
                 <NavLink to="/results" className={linkClass}>
                    {({ isActive }) => (
                      <svg xmlns="http://www.w3.org/2000/svg" className={iconClass(isActive)} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )}
                 </NavLink>

                 {/* 5. Profile */}
                 <NavLink to="/profile" className={linkClass}>
                    {({ isActive }) => (
                      <svg xmlns="http://www.w3.org/2000/svg" className={iconClass(isActive)} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                 </NavLink>

             </div>
          </nav>
        </div>
      )}
    </div>
  );
};
