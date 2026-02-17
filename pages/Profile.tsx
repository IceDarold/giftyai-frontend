
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { Friend, Gift } from '../domain/types';
import { GiftCard } from '../components/GiftCard';
import { GiftDetailsModal } from '../components/GiftDetailsModal';
import { Button } from '../components/Button';
import { Footer } from '../components/Footer';
import { api } from '../api';

// --- ICONS ---
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const TelegramIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.361 8.627-.168.9-.502 1.201-.82 1.23-.697.064-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>;

// --- HELPER: Birthday Logic ---
const calculateDaysUntilBirthday = (dateString?: string | null): number | null => {
    if (!dateString) return null;
    const today = new Date();
    const birth = new Date(dateString);
    if (isNaN(birth.getTime())) return null;

    const currentYearBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
    
    // If birthday has passed this year, next one is next year
    if (currentYearBirthday < today && currentYearBirthday.toDateString() !== today.toDateString()) {
        currentYearBirthday.setFullYear(today.getFullYear() + 1);
    }

    const diffTime = Math.abs(currentYearBirthday.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays;
};

// --- COMPONENT: Friends Wishlist Modal ---
const FriendsWishlistModal: React.FC<{ friendId: string; friendName: string; onClose: () => void }> = ({ friendId, friendName, onClose }) => {
    const [gifts, setGifts] = useState<Gift[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewGift, setViewGift] = useState<Gift | null>(null);

    useEffect(() => {
        api.social.getFriendWishlist(friendId)
            .then(setGifts)
            .catch(e => console.error("Could not load friend wishlist", e))
            .finally(() => setLoading(false));
    }, [friendId]);

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-none">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={onClose} />
            <div className="bg-[#F8F9FE] w-full max-w-2xl h-[90vh] sm:rounded-[3rem] rounded-t-[3rem] relative z-10 flex flex-col pointer-events-auto shadow-2xl animate-slide-up overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-white flex justify-between items-center">
                    <h3 className="text-xl font-black text-brand-dark">Вишлист {friendName}</h3>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">✕</button>
                </div>
                <div className="flex-grow overflow-y-auto p-6">
                    {loading ? (
                        <div className="text-center py-20 text-gray-400">Загрузка желаний...</div>
                    ) : gifts.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="text-4xl mb-4">📭</div>
                            <p className="text-gray-500 font-medium">Список пока пуст</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            {gifts.map(g => (
                                <GiftCard key={g.id} gift={g} onClick={setViewGift} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {viewGift && (
                <GiftDetailsModal gift={viewGift} isOpen={!!viewGift} onClose={() => setViewGift(null)} answers={null} onWishlistChange={() => {}} />
            )}
        </div>
    );
};

export const Profile: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout, refresh } = useAuth();
    
    // State
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [birthDate, setBirthDate] = useState('');
    
    const [myWishlist, setMyWishlist] = useState<Gift[]>([]);
    const [friends, setFriends] = useState<Friend[]>([]);
    
    const [loadingData, setLoadingData] = useState(true);
    const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
    const [selectedFriend, setSelectedFriend] = useState<{id: string, name: string} | null>(null);

    // Initial Data Load
    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setBio(user.bio || '');
            // Format ISO date to YYYY-MM-DD for input
            setBirthDate(user.birth_date ? user.birth_date.split('T')[0] : '');
        }
    }, [user]);

    useEffect(() => {
        const fetchData = async () => {
            setLoadingData(true);
            try {
                const [wList, fList] = await Promise.all([
                    api.profile.getWishlist(),
                    api.social.getFriends()
                ]);
                setMyWishlist(wList);
                setFriends(fList);
            } catch (e) {
                console.error("Profile data load error", e);
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, []);

    const handleSaveProfile = async () => {
        try {
            await api.profile.update({
                name,
                bio,
                birth_date: birthDate ? new Date(birthDate).toISOString() : null
            });
            setIsEditing(false);
            refresh();
        } catch (e) {
            alert('Ошибка при сохранении профиля');
        }
    };

    const handleConnectTelegram = async () => {
        try {
            const { url } = await api.profile.getTelegramLink();
            if (url) window.open(url, '_blank');
        } catch (e) {
            alert('Не удалось получить ссылку');
        }
    };

    const handleReloadWishlist = async () => {
        const wList = await api.profile.getWishlist();
        setMyWishlist(wList);
    };

    const daysUntilBirthday = useMemo(() => calculateDaysUntilBirthday(user?.birth_date), [user?.birth_date]);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#F8F9FE] pb-0 pt-20">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-100 z-50 flex items-center justify-between px-6">
                <button onClick={() => navigate('/')} className="text-sm font-bold text-gray-500 hover:text-black transition-colors">← Назад</button>
                <div className="font-black text-lg tracking-tight">Профиль</div>
                <button onClick={() => logout()} className="text-sm font-bold text-red-400 hover:text-red-500 transition-colors">Выйти</button>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8 pb-32">
                
                {/* 1. PROFILE CARD */}
                <div className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-brand-blue/5 border border-white relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-brand-blue/10 to-brand-purple/10"></div>
                    
                    <div className="relative flex flex-col sm:flex-row items-start sm:items-end gap-6 mt-4">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100">
                                <img src={user.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80"} alt="Avatar" className="w-full h-full object-cover" />
                            </div>
                            <button 
                                onClick={() => setIsEditing(!isEditing)}
                                className="absolute bottom-1 right-1 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-brand-blue transition-colors border border-gray-100"
                            >
                                <EditIcon />
                            </button>
                        </div>

                        {/* Info Form / Display */}
                        <div className="flex-grow w-full">
                            <div className="flex justify-between items-start">
                                <div className="w-full">
                                    {isEditing ? (
                                        <div className="space-y-3 mb-2 animate-fade-in">
                                            <input 
                                                type="text" 
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                className="text-2xl font-black text-brand-dark bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-full outline-none focus:border-brand-blue"
                                                placeholder="Имя"
                                            />
                                            <div className="flex gap-2 items-center">
                                                <span className="text-xs font-bold text-gray-400 uppercase">ДР:</span>
                                                <input 
                                                    type="date"
                                                    value={birthDate}
                                                    onChange={e => setBirthDate(e.target.value)}
                                                    className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 text-sm font-bold outline-none"
                                                />
                                            </div>
                                            <textarea 
                                                value={bio}
                                                onChange={e => setBio(e.target.value)}
                                                className="w-full text-sm text-gray-600 bg-gray-50 border border-gray-200 p-2 rounded-lg outline-none resize-none h-20"
                                                placeholder="Пару слов о себе..."
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <h1 className="text-3xl font-black text-brand-dark mb-1 flex items-center gap-2">
                                                {user.name}
                                                {daysUntilBirthday !== null && (
                                                    <span className="text-[10px] bg-brand-pink/10 text-brand-pink px-2 py-1 rounded-full font-bold uppercase tracking-wide">
                                                        ДР через {daysUntilBirthday} дн.
                                                    </span>
                                                )}
                                            </h1>
                                            <p className="text-sm font-medium text-gray-500 max-w-md leading-relaxed">
                                                {user.bio || 'Здесь пока нет описания, но человек наверняка хороший.'}
                                            </p>
                                        </>
                                    )}
                                </div>
                                
                                {isEditing && (
                                    <div className="flex flex-col gap-2 ml-4">
                                        <button onClick={handleSaveProfile} className="bg-brand-blue text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg hover:bg-blue-600 transition-colors">
                                            Сохранить
                                        </button>
                                        <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600 text-xs font-bold py-1">
                                            Отмена
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats & Integrations */}
                    <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex gap-6">
                            <div className="text-center">
                                <div className="text-xl font-black text-brand-dark">{myWishlist.length}</div>
                                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Желаний</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xl font-black text-brand-dark">{friends.length}</div>
                                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Друга</div>
                            </div>
                        </div>

                        <button 
                            onClick={handleConnectTelegram}
                            className={`flex items-center gap-3 px-5 py-3 rounded-2xl transition-all font-bold text-sm shadow-sm ${
                                user.telegram_connected 
                                ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                                : 'bg-[#2AABEE] text-white hover:bg-[#229ED9] shadow-blue-200'
                            }`}
                        >
                            <TelegramIcon />
                            <span>{user.telegram_connected ? 'Telegram подключен' : 'Привязать Telegram'}</span>
                            {user.telegram_connected && <CheckIcon />}
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
                    
                    {loadingData ? (
                        <div className="flex gap-4 px-2">
                            {[1,2,3].map(i => <div key={i} className="w-32 h-40 bg-white rounded-3xl animate-pulse"></div>)}
                        </div>
                    ) : (
                        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 px-1 -mx-4 sm:mx-0 sm:px-0">
                            {friends.map(item => {
                                const f = item.friend;
                                const fDays = calculateDaysUntilBirthday(f.birth_date);
                                return (
                                    <div key={f.id} className="min-w-[150px] bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center relative group transition-all hover:-translate-y-1">
                                        <div className="relative mb-3">
                                            <img src={f.avatar_url || "https://via.placeholder.com/150"} alt={f.name || 'Friend'} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" />
                                        </div>
                                        <h3 className="font-bold text-gray-900 text-sm mb-0.5 truncate max-w-full px-2">{f.name}</h3>
                                        
                                        {fDays !== null && (
                                            <div className={`text-[9px] font-bold px-2 py-0.5 rounded-md mb-3 ${fDays < 14 ? 'bg-red-50 text-red-500' : 'text-gray-400'}`}>
                                                {fDays === 0 ? 'Сегодня!' : `${fDays} дн.`}
                                            </div>
                                        )}
                                        
                                        <button 
                                            onClick={() => setSelectedFriend({ id: f.id, name: f.name || 'Друг' })}
                                            className="w-full mt-auto bg-brand-blue/10 text-brand-blue hover:bg-brand-blue hover:text-white transition-colors text-[10px] font-bold py-2 rounded-xl"
                                        >
                                            Посмотреть вишлист
                                        </button>
                                    </div>
                                );
                            })}
                            
                            {/* Empty state if no friends */}
                            {friends.length === 0 && (
                                <div className="p-6 text-gray-400 text-sm font-medium w-full text-center border-2 border-dashed border-gray-200 rounded-3xl">
                                    У вас пока нет друзей в списке
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 3. WISHLIST GRID */}
                <div>
                    <h2 className="text-xl font-black text-brand-dark mb-4 px-2">Мой Вишлист</h2>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {/* Add Button (Trigger Search/Quiz) */}
                        <button onClick={() => navigate('/wishlist')} className="aspect-[4/5] rounded-[2rem] border-2 border-dashed border-gray-200 hover:border-brand-blue/50 hover:bg-brand-blue/5 flex flex-col items-center justify-center gap-3 transition-all group bg-white/50">
                            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover:text-brand-blue group-hover:scale-110 transition-all">
                                <PlusIcon />
                            </div>
                            <span className="text-sm font-bold text-gray-400 group-hover:text-brand-blue">Управление</span>
                        </button>

                        {/* Items */}
                        {loadingData ? (
                            [1,2].map(i => <div key={i} className="aspect-[4/5] bg-white rounded-[2rem] animate-pulse"></div>)
                        ) : myWishlist.map(gift => (
                            <GiftCard 
                                key={gift.id} 
                                gift={gift} 
                                onClick={setSelectedGift}
                                onToggleWishlist={handleReloadWishlist}
                            />
                        ))}
                    </div>
                </div>

                <div className="mt-20">
                    <Footer variant="light" />
                </div>

            </div>

            {/* My Gift Details Modal */}
            {selectedGift && (
                <GiftDetailsModal 
                    gift={selectedGift} 
                    isOpen={!!selectedGift} 
                    onClose={() => setSelectedGift(null)} 
                    answers={null} 
                    onWishlistChange={handleReloadWishlist} 
                />
            )}

            {/* Friend Wishlist Modal */}
            {selectedFriend && (
                <FriendsWishlistModal 
                    friendId={selectedFriend.id} 
                    friendName={selectedFriend.name}
                    onClose={() => setSelectedFriend(null)} 
                />
            )}
        </div>
    );
};
