import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
  showFooter?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, showNav = true, showFooter = true }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isQuizPage = location.pathname === '/quiz';

  const linkClass = ({ isActive }: { isActive: boolean }) => 
    `flex flex-col items-center justify-end gap-1 h-full pb-3 w-full transition-all duration-300 group ${isActive ? 'text-brand-blue' : 'text-slate-400 hover:text-slate-600'}`;

  const iconClass = (isActive: boolean) => 
    `h-6 w-6 mb-0.5 transition-transform duration-300 group-active:scale-90 ${isActive ? 'scale-110' : ''}`;

  // Define bottom padding based on context:
  // 1. Nav visible -> pb-28 (space for navbar)
  // 2. Quiz page -> pb-0 (immersive full screen, no leaks)
  // 3. Default (e.g. Login, Blog) -> pb-8 (standard spacing)
  const bottomPadding = showNav ? 'pb-28' : (isQuizPage ? 'pb-0' : 'pb-8');

  return (
    <div className={`min-h-screen flex flex-col w-full relative overflow-x-hidden ${isLoginPage ? 'bg-brand-dark' : 'bg-transparent'}`}>
      
      <main className={`flex-grow relative z-10 flex flex-col ${bottomPadding}`}>
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
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
          <nav className="w-full max-w-lg bg-white/95 backdrop-blur-2xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] border-t border-white/50 pointer-events-auto rounded-t-[2.5rem] relative pb-safe">
             
             <div className="grid grid-cols-5 h-[5.5rem] px-2 items-end pb-2">
                 
                 <NavLink to="/" className={linkClass}>
                    {({ isActive }) => (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass(isActive)} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span className="text-[10px] font-bold tracking-wide">Главная</span>
                      </>
                    )}
                 </NavLink>

                 <NavLink to="/wishlist" className={linkClass}>
                    {({ isActive }) => (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass(isActive)} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span className="text-[10px] font-bold tracking-wide">Вишлист</span>
                      </>
                    )}
                 </NavLink>
                 
                 <div className="relative flex justify-center items-end h-full pointer-events-none">
                     <div className="absolute bottom-6 pointer-events-auto">
                         <NavLink 
                            to="/quiz" 
                            className={({ isActive }) => `flex flex-col items-center gap-1 bg-gradient-to-br from-brand-blue to-brand-purple p-4 rounded-full shadow-[0_8px_25px_-6px_rgba(0,111,255,0.5)] border-[6px] border-white text-white transition-all duration-300 ${isActive ? 'scale-110 shadow-brand-blue/50' : 'scale-100 hover:scale-105 active:scale-95'}`}
                         >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 animate-pulse-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                         </NavLink>
                     </div>
                 </div>

                 <NavLink to="/results" className={linkClass}>
                    {({ isActive }) => (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass(isActive)} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-[10px] font-bold tracking-wide">История</span>
                      </>
                    )}
                 </NavLink>

                 <NavLink to="/profile" className={linkClass}>
                    {({ isActive }) => (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass(isActive)} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-[10px] font-bold tracking-wide">Профиль</span>
                      </>
                    )}
                 </NavLink>

             </div>
          </nav>
        </div>
      )}
    </div>
  );
};