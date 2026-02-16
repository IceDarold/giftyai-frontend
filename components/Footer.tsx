
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useDevMode, DevInfoModal } from './DevModeContext';

const DevLoginModal = ({ onClose, onLogin }: { onClose: () => void, onLogin: (p: string) => boolean }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onLogin(password)) {
            onClose();
        } else {
            setError(true);
            setPassword('');
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
            <div className="w-full max-w-xs bg-[#0F172A] border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden animate-pop" onClick={e => e.stopPropagation()}>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-blue via-brand-purple to-pink-500"></div>
                <h3 className="text-white font-bold text-lg mb-1 tracking-tight">Developer Mode</h3>
                <p className="text-gray-500 text-xs mb-6 font-medium">Введите ключ доступа</p>
                
                <form onSubmit={handleSubmit}>
                    <input 
                        autoFocus
                        type="password"
                        placeholder="Access Key"
                        value={password}
                        onChange={e => { setPassword(e.target.value); setError(false); }}
                        className={`w-full bg-black/50 text-white border ${error ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 outline-none focus:border-brand-blue transition-all mb-4 font-mono text-sm placeholder-gray-600`}
                    />
                    <div className="flex gap-2">
                        <button type="button" onClick={onClose} className="flex-1 bg-white/5 text-gray-400 py-2.5 rounded-xl text-xs font-bold hover:bg-white/10 transition-colors">
                            Отмена
                        </button>
                        <button type="submit" className="flex-1 bg-white text-black py-2.5 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors shadow-lg">
                            Войти
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

interface FooterProps {
    variant?: 'default' | 'light';
}

export const Footer: React.FC<FooterProps> = ({ variant = 'default' }) => {
  const { isDevMode, enableDevMode, disableDevMode, isInfoOpen, setInfoOpen } = useDevMode();
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();

  const isLight = variant === 'light';
  
  // Dynamic Styles
  const textColor = isLight ? 'text-slate-400' : 'text-indigo-200/60';
  const hoverColor = isLight ? 'hover:text-brand-blue' : 'hover:text-white';
  const dividerColor = isLight ? 'via-slate-200' : 'via-indigo-200/20';
  const copyrightColor = isLight ? 'text-slate-400/60' : 'text-indigo-200/40';

  const handleDevTrigger = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isDevMode) {
        disableDevMode();
    } else {
        setShowAuth(true);
    }
  };

  return (
    <>
        <footer className="w-full py-8 text-center relative z-20 mt-auto">
           <div className={`w-full h-px bg-gradient-to-r from-transparent ${dividerColor} to-transparent mb-6`}></div>
           
           <div className="flex flex-wrap items-center justify-center gap-6 mb-4 px-6">
              <a href="#" className={`${textColor} ${hoverColor} text-[10px] font-bold uppercase tracking-widest transition-colors`}>О сервисе</a>
              <Link to="/blog" className={`${textColor} ${hoverColor} text-[10px] font-bold uppercase tracking-widest transition-colors`}>Блог</Link>
              <Link to="/partners" className={`${textColor} ${hoverColor} text-[10px] font-bold uppercase tracking-widest transition-colors`}>Партнерам</Link>
              <Link to="/investors" className={`${textColor} ${hoverColor} text-[10px] font-bold uppercase tracking-widest transition-colors`}>Инвесторам</Link>
              <a href="#" className={`${textColor} ${hoverColor} text-[10px] font-bold uppercase tracking-widest transition-colors`}>Политика</a>
           </div>
           
           <div className={`${copyrightColor} text-[10px] px-8 leading-relaxed font-medium flex flex-col items-center`}>
              <p className="mb-2">© 2025 Gifty AI</p>
              <p>Мы используем магию и алгоритмы,<br/>чтобы вы дарили лучшие подарки.</p>
              
              <div className="mt-4 min-h-[24px] flex items-center justify-center gap-2">
                <button 
                    onClick={handleDevTrigger}
                    className={`font-mono text-[10px] transition-all duration-300 cursor-pointer select-none px-3 py-1 rounded-full ${
                        isDevMode 
                        ? 'text-green-400 bg-green-400/10 font-bold opacity-100 hover:bg-red-500/20 hover:text-red-400' 
                        : (isLight ? 'text-slate-300 hover:text-slate-500 hover:bg-slate-100' : 'text-white/30 hover:text-white hover:bg-white/10') + ' opacity-0 hover:opacity-100'
                    }`}
                    title={isDevMode ? "Exit Dev Mode" : "Dev Mode"}
                >
                    {isDevMode ? 'DEV ACTIVE' : 'π'}
                </button>
                
                {isDevMode && (
                    <>
                        <button 
                            onClick={() => setInfoOpen(true)}
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-serif italic text-xs transition-all ${isLight ? 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600' : 'bg-white/10 text-white/50 hover:bg-white/20 hover:text-white'}`}
                            title="Dev Mode Info"
                        >
                            i
                        </button>
                        <button 
                            onClick={() => navigate('/experiments')}
                            className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 hover:bg-purple-500 hover:text-white font-bold text-[10px] uppercase tracking-wider transition-all flex items-center gap-1 border border-purple-500/30"
                            title="Experimental Interfaces"
                        >
                            🧪 Lab
                        </button>
                    </>
                )}
              </div>
           </div>
        </footer>
        {showAuth && <DevLoginModal onClose={() => setShowAuth(false)} onLogin={enableDevMode} />}
        {isInfoOpen && <DevInfoModal onClose={() => setInfoOpen(false)} />}
    </>
  );
};
