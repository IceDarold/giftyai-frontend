import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mascot } from '../components/Mascot';
import { Button } from '../components/Button';
import { api } from '../api';
import { UserProfile, CalendarEvent } from '../domain/types';
import { track } from '../utils/analytics';
import { RELATIONSHIPS } from '../constants';
import { useAuth } from '../components/AuthContext';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Editing States
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  
  // Event Form State
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState<{ title: string; date: string; personName: string; relationship: string }>({
    title: '', date: '', personName: '', relationship: RELATIONSHIPS[0]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [userProfile, wishlistIds] = await Promise.all([
        api.user.get(),
        api.wishlist.getAll()
      ]);
      setProfile(userProfile);
      setNewName(user?.name || userProfile.name);
      setWishlistCount(wishlistIds.length);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateName = async () => {
    if (!newName.trim()) return;
    const updated = await api.user.update({ name: newName });
    setProfile(updated);
    setIsEditingName(false);
  };

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.date) return;
    await api.user.addEvent(newEvent);
    setShowEventForm(false);
    setNewEvent({ title: '', date: '', personName: '', relationship: RELATIONSHIPS[0] });
    loadData();
    track('add_calendar_event');
  };

  const handleRemoveEvent = async (id: string) => {
    if (confirm('Удалить событие?')) {
        await api.user.removeEvent(id);
        loadData();
    }
  };

  const handleQuickSearch = (event: CalendarEvent) => {
    track('quick_search_from_profile', { event: event.title });
    navigate('/quiz', { 
        state: { 
            name: event.personName || event.title,
            relationship: event.relationship 
        } 
    });
  };

  const getDaysUntil = (dateStr: string) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const target = new Date(dateStr);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Прошло';
    if (diffDays === 0) return 'Сегодня!';
    if (diffDays === 1) return 'Завтра';
    return `Через ${diffDays} дн.`;
  };

  if (loading || !profile) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
  }

  return (
    <div className="pt-24 px-4 pb-20 max-w-3xl mx-auto">
      
      {/* Header Card */}
      <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-6 shadow-xl mb-6 border border-white/50 relative overflow-hidden animate-slide-up-mobile">
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg>
        </div>
        
        <div className="flex items-center gap-4 relative z-10">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center overflow-hidden shadow-inner border-4 border-white">
                {user?.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name || ''} className="w-full h-full object-cover" />
                ) : (
                    <span className="text-4xl">{profile.avatarEmoji}</span>
                )}
            </div>
            <div className="flex-1">
                {isEditingName ? (
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={newName} 
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full bg-indigo-50 rounded-lg px-2 py-1 font-bold text-lg text-indigo-900 outline-none border border-indigo-200"
                            autoFocus
                        />
                        <button onClick={handleUpdateName} className="bg-green-500 text-white p-2 rounded-lg">✓</button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2" onClick={() => setIsEditingName(true)}>
                        <h1 className="text-2xl font-black text-gray-900">{user?.name || profile.name}</h1>
                        <svg className="w-4 h-4 text-gray-400 cursor-pointer hover:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </div>
                )}
                <div className="flex items-center gap-2 mt-1">
                    <div className="text-sm font-bold text-indigo-500 bg-indigo-50 inline-block px-2 py-0.5 rounded-md">
                        {profile.level}
                    </div>
                    <button 
                        onClick={logout}
                        className="text-xs font-bold text-red-400 hover:text-red-500 underline"
                    >
                        Выйти
                    </button>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-indigo-50/50 rounded-xl p-3 text-center border border-indigo-100">
                <div className="text-2xl font-black text-indigo-600">{wishlistCount}</div>
                <div className="text-[10px] text-gray-500 font-bold uppercase">В вишлисте</div>
            </div>
            <div className="bg-yellow-50/50 rounded-xl p-3 text-center border border-yellow-100">
                <div className="text-2xl font-black text-yellow-600">{profile.events.length}</div>
                <div className="text-[10px] text-gray-500 font-bold uppercase">Событий</div>
            </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                🗓 Календарь
            </h2>
            <button 
                onClick={() => setShowEventForm(!showEventForm)}
                className="bg-white/20 hover:bg-white/30 text-white text-sm font-bold px-3 py-1.5 rounded-lg transition-colors"
            >
                {showEventForm ? 'Отмена' : '+ Событие'}
            </button>
        </div>

        {showEventForm && (
            <div className="bg-white p-4 rounded-2xl shadow-lg mb-4 animate-pop">
                <h3 className="font-bold text-gray-800 mb-3">Добавить важное событие</h3>
                <div className="space-y-3">
                    <input 
                        type="text" 
                        placeholder="Название (например, ДР Папы)" 
                        className="w-full bg-gray-50 p-3 rounded-xl border border-gray-200 outline-none focus:border-indigo-400"
                        value={newEvent.title}
                        onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                    />
                     <div className="grid grid-cols-2 gap-3">
                        <input 
                            type="date" 
                            className="w-full bg-gray-50 p-3 rounded-xl border border-gray-200 outline-none focus:border-indigo-400 text-gray-600"
                            value={newEvent.date}
                            onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                        />
                         <select 
                            className="w-full bg-gray-50 p-3 rounded-xl border border-gray-200 outline-none focus:border-indigo-400 text-gray-600"
                            value={newEvent.relationship}
                            onChange={e => setNewEvent({...newEvent, relationship: e.target.value})}
                         >
                             {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
                         </select>
                     </div>
                     <input 
                        type="text" 
                        placeholder="Имя получателя (для поиска)" 
                        className="w-full bg-gray-50 p-3 rounded-xl border border-gray-200 outline-none focus:border-indigo-400"
                        value={newEvent.personName}
                        onChange={e => setNewEvent({...newEvent, personName: e.target.value})}
                    />
                    <Button fullWidth onClick={handleAddEvent}>Сохранить</Button>
                </div>
            </div>
        )}

        <div className="space-y-3">
            {profile.events.length === 0 && !showEventForm ? (
                <div className="text-center py-8 bg-white/10 rounded-2xl border border-white/10">
                    <Mascot emotion="thinking" className="w-16 h-16 mx-auto mb-2 opacity-80" />
                    <p className="text-indigo-100 text-sm">Пока нет событий.<br/>Добавьте дни рождения, чтобы не забыть!</p>
                </div>
            ) : (
                profile.events.map(event => (
                    <div key={event.id} className="bg-white rounded-2xl p-4 shadow-md flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="bg-indigo-50 w-14 h-14 rounded-xl flex flex-col items-center justify-center text-indigo-900 border border-indigo-100">
                                <span className="text-xs font-bold uppercase">{new Date(event.date).toLocaleDateString('ru-RU', { month: 'short' })}</span>
                                <span className="text-xl font-black">{new Date(event.date).getDate()}</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 leading-tight">{event.title}</h3>
                                <p className="text-xs font-bold text-indigo-500 mt-0.5">{getDaysUntil(event.date)}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                             <button 
                                onClick={() => handleQuickSearch(event)}
                                className="bg-yellow-400 hover:bg-yellow-300 text-indigo-900 text-xs font-bold px-3 py-2 rounded-lg shadow-sm active:scale-95 transition-all flex items-center gap-1"
                             >
                                <span>🎁</span> Найти
                             </button>
                             <button 
                                onClick={() => handleRemoveEvent(event.id)}
                                className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-400"
                             >
                                ×
                             </button>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};