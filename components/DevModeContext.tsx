import React, { createContext, useContext, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface DevModeContextType {
  isDevMode: boolean;
  enableDevMode: (password: string) => boolean;
  disableDevMode: () => void;
  isInfoOpen: boolean;
  setInfoOpen: (v: boolean) => void;
}

const DevModeContext = createContext<DevModeContextType | null>(null);

export const useDevMode = () => {
  const context = useContext(DevModeContext);
  if (!context) throw new Error('useDevMode must be used within DevModeProvider');
  return context;
};

// --- Dev Info Modal Component ---
export const DevInfoModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in" onClick={onClose}>
            <div className="bg-[#0F172A] border-2 border-green-500/50 w-full max-w-lg rounded-3xl p-8 shadow-[0_0_50px_rgba(34,197,94,0.2)] relative overflow-hidden animate-pop" onClick={e => e.stopPropagation()}>
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 p-4 opacity-20">
                    <svg className="w-32 h-32 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                </div>
                
                <h2 className="text-3xl font-black text-white mb-2 tracking-tight flex items-center gap-3">
                    <span className="text-green-400">⚡️</span> Dev Mode
                </h2>
                <p className="text-green-400/60 font-mono text-xs uppercase tracking-widest mb-8 border-b border-white/10 pb-4">
                    Superuser Access Granted
                </p>

                <div className="space-y-6">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-xl">🛠</div>
                        <div>
                            <h3 className="text-white font-bold">Mock Injection</h3>
                            <p className="text-gray-400 text-sm">Добавляйте любые товары в выдачу через кнопку <span className="text-white bg-green-600 px-1 rounded text-xs">+</span> на странице результатов.</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-xl">✏️</div>
                        <div>
                            <h3 className="text-white font-bold">Live Editing</h3>
                            <p className="text-gray-400 text-sm">Откройте любую карточку товара и нажмите <span className="text-white bg-white/10 border border-white/20 px-1 rounded text-xs">Edit</span>, чтобы изменить описание, цену или фото.</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center text-xl">🗑</div>
                        <div>
                            <h3 className="text-white font-bold">Quick Actions</h3>
                            <p className="text-gray-400 text-sm">Удаляйте товары из выдачи одной кнопкой. Смотрите debug-логи в консоли и JSON выдачи.</p>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={onClose}
                    className="w-full mt-8 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-green-900/20"
                >
                    Let's Build 🚀
                </button>
            </div>
        </div>,
        document.body
    );
};

export const DevModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDevMode, setIsDevMode] = useState(false);
  const [isInfoOpen, setInfoOpen] = useState(false);

  // Helper to get password from env or default
  const getCorrectPassword = () => {
    // 1. Priority: System Environment Variables (process.env)
    if (typeof process !== 'undefined' && process.env && process.env.DEV_MODE_PASSWORD) {
        return process.env.DEV_MODE_PASSWORD;
    }

    // 2. Secondary: .env files (Vite / import.meta.env)
    // @ts-ignore
    const meta = import.meta as any;
    if (typeof meta !== 'undefined' && meta.env && meta.env.VITE_DEV_PASSWORD) {
        return meta.env.VITE_DEV_PASSWORD;
    }

    // 3. Default fallback
    return 'dev';
  };

  useEffect(() => {
    const saved = localStorage.getItem('gifty_dev_mode');
    if (saved === 'true') {
        setIsDevMode(true);
        // Don't auto-open info on page reload, only on login
    }

    console.debug('🕵️‍♂️ [DevMode] Access Password:', getCorrectPassword());
  }, []);

  const enableDevMode = (password: string) => {
    if (password === getCorrectPassword()) {
      setIsDevMode(true);
      localStorage.setItem('gifty_dev_mode', 'true');
      setInfoOpen(true); // Auto open info on successful login
      return true;
    }
    return false;
  };

  const disableDevMode = () => {
    setIsDevMode(false);
    localStorage.removeItem('gifty_dev_mode');
  };

  return (
    <DevModeContext.Provider value={{ isDevMode, enableDevMode, disableDevMode, isInfoOpen, setInfoOpen }}>
      {children}
    </DevModeContext.Provider>
  );
};