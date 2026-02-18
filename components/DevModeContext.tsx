
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface DevLog {
    id: string;
    timestamp: string;
    method: string;
    endpoint: string;
    payload?: any;
    type: 'request' | 'response' | 'error';
}

interface DevModeContextType {
  isDevMode: boolean;
  enableDevMode: (password: string) => boolean;
  disableDevMode: () => void;
  isInfoOpen: boolean;
  setInfoOpen: (v: boolean) => void;
  useMockData: boolean;
  setUseMockData: (v: boolean) => void;
  logs: DevLog[];
  addLog: (log: Omit<DevLog, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
}

const DevModeContext = createContext<DevModeContextType | null>(null);

export const useDevMode = () => {
  const context = useContext(DevModeContext);
  if (!context) throw new Error('useDevMode must be used within DevModeProvider');
  return context;
};

// --- Dev Global Indicator ---
const DevBadge = () => {
    const { useMockData, setInfoOpen } = useDevMode();
    return (
        <div className="fixed top-24 right-4 z-[9999] flex flex-col items-end gap-2 pointer-events-none">
            <div 
                className="bg-green-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.5)] flex items-center gap-2 animate-pulse-slow border border-white/20 pointer-events-auto cursor-help"
                onClick={() => setInfoOpen(true)}
            >
                <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                DEV MODE ACTIVE
            </div>
            {useMockData && (
                <div className="bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-lg border border-white/20 animate-pop">
                    MOCK DATA ENABLED
                </div>
            )}
        </div>
    );
};

export const DevInfoModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { useMockData, setUseMockData } = useDevMode();
    
    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in" onClick={onClose}>
            <div className="bg-[#0F172A] border-2 border-green-500/50 w-full max-w-lg rounded-3xl p-8 shadow-[0_0_50px_rgba(34,197,94,0.2)] relative overflow-hidden animate-pop" onClick={e => e.stopPropagation()}>
                <h2 className="text-3xl font-black text-white mb-2 tracking-tight flex items-center gap-3"><span className="text-green-400">⚡️</span> Dev Panel</h2>
                <p className="text-green-400/60 font-mono text-[10px] uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Configuration & System</p>
                
                <div className="bg-white/5 rounded-2xl p-5 mb-8 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h3 className="text-white font-bold text-sm">Использовать моковые данные</h3>
                            <p className="text-white/40 text-xs mt-0.5">Принудительно отключает запросы к API.</p>
                        </div>
                        <button 
                            onClick={() => setUseMockData(!useMockData)}
                            className={`w-12 h-6 rounded-full transition-all relative ${useMockData ? 'bg-green-500' : 'bg-gray-700'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${useMockData ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex gap-4"><div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-xl">🚀</div><div><h3 className="text-white font-bold text-sm">Fast Track</h3><p className="text-gray-400 text-xs">В результатах теперь работает полный сценарий подбора.</p></div></div>
                    <div className="flex gap-4"><div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-xl">🌐</div><div><h3 className="text-white font-bold text-sm">Network Logs</h3><p className="text-gray-400 text-xs">Консоль снизу показывает все "вызовы" бэкенда.</p></div></div>
                </div>
                
                <button onClick={onClose} className="w-full mt-8 bg-white text-black font-black py-4 rounded-2xl transition-all shadow-lg active:scale-95">Закрыть</button>
            </div>
        </div>,
        document.body
    );
};

export const DevModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDevMode, setIsDevMode] = useState(false);
  const [isInfoOpen, setInfoOpen] = useState(false);
  const [useMockData, setUseMockDataState] = useState(false);
  const [logs, setLogs] = useState<DevLog[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('gifty_dev_mode');
    if (saved === 'true') setIsDevMode(true);
    
    const savedMock = localStorage.getItem('gifty_use_mock_data');
    if (savedMock === 'true') setUseMockDataState(true);
  }, []);

  const setUseMockData = (v: boolean) => {
      setUseMockDataState(v);
      localStorage.setItem('gifty_use_mock_data', v ? 'true' : 'false');
  };

  const addLog = useCallback((log: Omit<DevLog, 'id' | 'timestamp'>) => {
    setLogs(prev => [{
        ...log,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleTimeString('ru-RU', { hour12: false })
    }, ...prev].slice(0, 50));
  }, []);

  const clearLogs = useCallback(() => setLogs([]), []);

  const enableDevMode = (password: string) => {
    if (password === (import.meta as any).env?.VITE_DEV_PASSWORD || password === 'dev') {
      setIsDevMode(true);
      localStorage.setItem('gifty_dev_mode', 'true');
      setInfoOpen(true);
      return true;
    }
    return false;
  };

  const disableDevMode = () => {
    setIsDevMode(false);
    localStorage.removeItem('gifty_dev_mode');
  };

  return (
    <DevModeContext.Provider value={{ isDevMode, enableDevMode, disableDevMode, isInfoOpen, setInfoOpen, useMockData, setUseMockData, logs, addLog, clearLogs }}>
      {children}
      {isDevMode && <DevBadge />}
    </DevModeContext.Provider>
  );
};
