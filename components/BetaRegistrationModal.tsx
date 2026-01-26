import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';
import { Mascot } from './Mascot';

interface Props {
  onClose: () => void;
}

export const BetaRegistrationModal: React.FC<Props> = ({ onClose }) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    telegram: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.telegram) {
      // In a real app, send data to backend here
      setStep('success');
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[110] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#0B0033]/80 backdrop-blur-md animate-fade-in" />

      {/* Card */}
      <div className="bg-white relative z-10 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-pop border-4 border-white/20">
        
        {/* Close Button */}
        <button 
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors z-20 text-gray-500"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
        </button>

        <div className="p-8 pt-10">
            {step === 'form' ? (
                <div className="flex flex-col h-full">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-tr from-brand-blue to-brand-purple rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-lg mb-4">
                            🚀
                        </div>
                        <h2 className="text-2xl font-black text-brand-dark leading-tight">
                            Оформить заказ
                        </h2>
                        <p className="text-gray-500 text-sm font-medium mt-2">
                            Заполните данные, чтобы забронировать товар
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 ml-2">Ваше Имя</label>
                            <input 
                                required
                                type="text" 
                                placeholder="Александр"
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 font-bold text-brand-dark outline-none focus:ring-2 focus:ring-brand-blue/50 transition-all placeholder-gray-300"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 ml-2">Email</label>
                            <input 
                                required
                                type="email" 
                                placeholder="hello@example.com"
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 font-bold text-brand-dark outline-none focus:ring-2 focus:ring-brand-blue/50 transition-all placeholder-gray-300"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 ml-2">Telegram Ник</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">@</span>
                                <input 
                                    required
                                    type="text" 
                                    placeholder="username"
                                    value={formData.telegram}
                                    onChange={e => setFormData({...formData, telegram: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 pl-8 font-bold text-brand-dark outline-none focus:ring-2 focus:ring-brand-blue/50 transition-all placeholder-gray-300"
                                />
                            </div>
                        </div>

                        <Button type="submit" fullWidth className="mt-4 shadow-xl">
                            Зарегистрироваться
                        </Button>
                    </form>
                </div>
            ) : (
                <div className="flex flex-col items-center text-center animate-pop">
                     <div className="relative mb-6">
                        <div className="absolute inset-0 bg-yellow-400 blur-[40px] opacity-30 rounded-full"></div>
                        <Mascot emotion="cool" accessory="glasses" className="w-32 h-32 relative z-10" />
                     </div>
                     
                     <div className="bg-brand-blue/10 text-brand-blue font-bold px-3 py-1 rounded-lg text-xs uppercase tracking-widest mb-3">
                         Early Access
                     </div>

                     <h2 className="text-3xl font-black text-brand-dark mb-3">
                         Добро пожаловать в клуб! 🤫
                     </h2>
                     
                     <p className="text-gray-600 font-medium leading-relaxed mb-6">
                         Мы пока работаем в <b>Бета-режиме</b>. Ваша заявка принята! <br/><br/>
                         Как только мы запустим продажи на полную мощность, мы свяжемся с вами лично и подарим <span className="text-brand-purple font-bold">Premium-подписку</span> навсегда.
                     </p>

                     <Button onClick={onClose} fullWidth variant="secondary" className="border-2 border-brand-blue/10">
                         Круто, жду!
                     </Button>
                </div>
            )}
        </div>
      </div>
    </div>,
    document.body
  );
};