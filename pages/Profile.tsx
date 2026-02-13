
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { Friend, Gift } from '../domain/types';
import { GiftCard } from '../components/GiftCard';
import { GiftDetailsModal } from '../components/GiftDetailsModal';
import { Button } from '../components/Button';

// --- MOCK DATA ---
const MOCK_FRIENDS: Friend[] = [
    { id: 'f1', name: 'Алина', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', birthDate: '12 мая', daysUntilBirthday: 14, quizPassed: true },
    { id: 'f2', name: 'Марк', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80', birthDate: '3 июня', daysUntilBirthday: 35, quizPassed: false },
    { id: 'f3', name: 'Катя', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80', birthDate: '20 июня', daysUntilBirthday: 52, quizPassed: true },
    { id: 'f4', name: 'Ден', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', birthDate: '15 июля', daysUntilBirthday: 77, quizPassed: true },
];

const MOCK_WISHLIST: Gift[] = [
    { id: 'w1', title: 'Dyson Airwrap', price: 49990, currency: 'RUB', imageUrl: 'https://images.unsplash.com/photo-1585751119414-ef2636f8aede?auto=format&fit=crop&w=800&q=80', merchant: 'Золотое Яблоко', productUrl: '#', category: 'Красота', description: null },
    { id: 'w2', title: 'Sony WH-1000XM5', price: 35000, currency: 'RUB', imageUrl: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80', merchant: 'Dr.Head', productUrl: '#', category: 'Технологии', description: null },
    { id: 'w3', title: 'Курс Керамики', price: 5500, currency: 'RUB', imageUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80', merchant: 'Гончарка №1', productUrl: '#', category: 'Хобби', description: null },
    { id: 'w4', title: 'Le Labo Santal 33', price: 22000, currency: 'RUB', imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea477942698?auto=format&fit=crop&w=800&q=80', merchant: 'ЦУМ', productUrl: '#', category: 'Красота', description: null },
];

// --- ICONS (Inline for stability) ---
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const TelegramIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.361 8.627-.168.9-.502 1.201-.82 1.23-.697.064-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>;

export const Profile: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    
    // Local State for Prototype
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user?.name || 'Александр');
    const [bio, setBio] = useState('Люблю технологии, кофе и хорошие книги.');
    const [telegramConnected, setTelegramConnected] = useState(false);
    
    const [selectedGift, setSelectedGift] = useState<Gift | null>(null);

    return (
        <div className="min-h-screen bg-[#F8F9FE] pb-24 pt-20">
            {/* Header / Nav Mock */}
            <div className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-100 z-50 flex items-center justify-between px-6">
                <button onClick={() => navigate('/')} className="text-sm font-bold text-gray-500 hover:text-black transition-colors">← Назад</button>
                <div className="font-black text-lg tracking-tight">Профиль</div>
                <button onClick={() => logout()} className="text-sm font-bold text-red-400 hover:text-red-500 transition-colors">Выйти</button>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
                
                {/* 1. PROFILE CARD */}
                <div className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-brand-blue/5 border border-white relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-brand-blue/10 to-brand-purple/10"></div>
                    
                    <div className="relative flex flex-col sm:flex-row items-start sm:items-end gap-6 mt-4">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100">
                                <img src={user?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80"} alt="Avatar" className="w-full h-full object-cover" />
                            </div>
                            <button className="absolute bottom-1 right-1 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-brand-blue transition-colors border border-gray-100">
                                <EditIcon />
                            </button>
                        </div>

                        {/* Info */}
                        <div className="flex-grow w-full">
                            <div className="flex justify-between items-start">
                                <div className="w-full">
                                    {isEditing ? (
                                        <input 
                                            type="text" 
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            className="text-3xl font-black text-brand-dark bg-transparent border-b border-gray-300 w-full outline-none mb-2"
                                            autoFocus
                                        />
                                    ) : (
                                        <h1 className="text-3xl font-black text-brand-dark mb-1 flex items-center gap-2 cursor-pointer" onClick={() => setIsEditing(true)}>
                                            {name}
                                        </h1>
                                    )}
                                    
                                    {isEditing ? (
                                        <textarea 
                                            value={bio}
                                            onChange={e => setBio(e.target.value)}
                                            className="w-full text-sm text-gray-500 bg-gray-50 p-2 rounded-lg outline-none resize-none"
                                            rows={2}
                                        />
                                    ) : (
                                        <p className="text-sm font-medium text-gray-500 max-w-md leading-relaxed cursor-pointer" onClick={() => setIsEditing(true)}>
                                            {bio}
                                        </p>
                                    )}
                                </div>
                                {isEditing && (
                                    <button onClick={() => setIsEditing(false)} className="bg-brand-blue text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg">
                                        Сохранить
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats & Integrations */}
                    <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex gap-6">
                            <div className="text-center">
                                <div className="text-xl font-black text-brand-dark">{MOCK_WISHLIST.length}</div>
                                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Желаний</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xl font-black text-brand-dark">{MOCK_FRIENDS.length}</div>
                                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Друга</div>
                            </div>
                        </div>

                        <button 
                            onClick={() => setTelegramConnected(!telegramConnected)}
                            className={`flex items-center gap-3 px-5 py-3 rounded-2xl transition-all font-bold text-sm shadow-sm ${
                                telegramConnected 
                                ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                                : 'bg-[#2AABEE] text-white hover:bg-[#229ED9] shadow-blue-200'
                            }`}
                        >
                            <TelegramIcon />
                            <span>{telegramConnected ? '@alex_gift' : 'Привязать Telegram'}</span>
                            {telegramConnected && <CheckIcon />}
                        </button>
                    </div>
                </div>

                {/* 2. FRIENDS SECTION */}
                <div>
                    <div className="flex items-center justify-between px-2 mb-4">
                        <h2 className="text-xl font-black text-brand-dark">Мои люди</h2>
                        <button className="text-brand-blue text-xs font-bold bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                            + Добавить
                        </button>
                    </div>
                    
                    {/* Horizontal Scroll Container */}
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 px-1 -mx-4 sm:mx-0 sm:px-0">
                        {MOCK_FRIENDS.map(friend => (
                            <div key={friend.id} className="min-w-[140px] bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center relative group cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1">
                                <div className="relative mb-3">
                                    <img src={friend.avatar} alt={friend.name} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" />
                                    {friend.quizPassed && (
                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm" title="AI знает вкусы">
                                            <div className="scale-75"><CheckIcon /></div>
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-bold text-gray-900 text-sm mb-0.5">{friend.name}</h3>
                                <p className="text-xs text-gray-400 font-medium mb-3">{friend.birthDate}</p>
                                
                                <div className={`text-[10px] font-bold px-2 py-1 rounded-lg w-full ${
                                    friend.daysUntilBirthday < 20 ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400'
                                }`}>
                                    {friend.daysUntilBirthday} дн.
                                </div>
                            </div>
                        ))}
                        <div className="min-w-[60px]"></div>
                    </div>
                </div>

                {/* 3. WISHLIST GRID */}
                <div>
                    <h2 className="text-xl font-black text-brand-dark mb-4 px-2">Мой Вишлист</h2>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {/* Add Button */}
                        <button className="aspect-[4/5] rounded-[2rem] border-2 border-dashed border-gray-200 hover:border-brand-blue/50 hover:bg-brand-blue/5 flex flex-col items-center justify-center gap-3 transition-all group">
                            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover:text-brand-blue group-hover:scale-110 transition-all">
                                <PlusIcon />
                            </div>
                            <span className="text-sm font-bold text-gray-400 group-hover:text-brand-blue">Добавить</span>
                        </button>

                        {/* Items */}
                        {MOCK_WISHLIST.map(gift => (
                            <GiftCard 
                                key={gift.id} 
                                gift={gift} 
                                onClick={setSelectedGift}
                            />
                        ))}
                    </div>
                </div>

            </div>

            {/* Modal */}
            {selectedGift && (
                <GiftDetailsModal 
                    gift={selectedGift} 
                    isOpen={!!selectedGift} 
                    onClose={() => setSelectedGift(null)} 
                    answers={null} 
                    onWishlistChange={() => {}} 
                />
            )}
        </div>
    );
};
