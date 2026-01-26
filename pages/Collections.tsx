import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Gift } from '../domain/types';
import { GiftCard } from '../components/GiftCard';
import { Logo } from '../components/Logo';
import { GiftDetailsModal } from '../components/GiftDetailsModal';

export const Collections: React.FC = () => {
    const navigate = useNavigate();
    const [collections, setCollections] = useState<{title: string, gifts: Gift[], gradient: string}[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedGift, setSelectedGift] = useState<Gift | null>(null);

    useEffect(() => {
        const load = async () => {
            const themes = [
                { tag: 'уют', title: 'Зимний Хюгге', gradient: 'from-amber-200 to-orange-400' },
                { tag: 'технологии', title: 'Digital Nomad', gradient: 'from-blue-300 to-indigo-500' },
                { tag: 'красота', title: 'Self-Care Rituals', gradient: 'from-pink-200 to-rose-400' },
                { tag: 'еда', title: 'Гастро-находки', gradient: 'from-emerald-200 to-teal-500' }
            ];
            
            const results = await Promise.all(themes.map(async t => {
                const gifts = await api.gifts.list({ tag: t.tag, limit: 4 });
                return { ...t, gifts };
            }));
            setCollections(results);
            setLoading(false);
        };
        load();
    }, []);

    const handleGiftUpdate = (updatedGift: Gift) => {
        setCollections(prev => prev.map(col => ({
            ...col,
            gifts: col.gifts.map(g => g.id === updatedGift.id ? updatedGift : g)
        })));
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-white font-bold">Загрузка коллекций...</div>;

    return (
        <div className="min-h-screen bg-[#0B0033] pt-24 pb-32 px-6">
            <div className="fixed top-6 left-6 z-50"><Logo variant="white" onClick={() => navigate('/')} /></div>
            
            <div className="max-w-6xl mx-auto">
                <header className="mb-20 text-center">
                    <h1 className="text-6xl md:text-8xl font-black text-white tracking-[-0.08em] mb-6">Коллекции</h1>
                    <p className="text-white/40 text-[11px] font-black uppercase tracking-[0.5em]">Curated by Gifty AI</p>
                </header>

                <div className="space-y-32">
                    {collections.map((col, i) => (
                        <section key={i} className="relative">
                            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                                <h2 className={`text-5xl md:text-7xl font-black tracking-[-0.06em] text-transparent bg-clip-text bg-gradient-to-r ${col.gradient}`}>
                                    {col.title}
                                </h2>
                                <div className="h-px flex-grow bg-white/10 hidden md:block mx-8 mb-4"></div>
                                <span className="text-white/30 font-black text-sm uppercase tracking-widest">{col.gifts.length} предметов</span>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {col.gifts.map(g => (
                                    <GiftCard key={g.id} gift={g} onClick={setSelectedGift} />
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </div>

            {selectedGift && (
                <GiftDetailsModal 
                    gift={selectedGift} 
                    isOpen={!!selectedGift} 
                    onClose={() => setSelectedGift(null)} 
                    answers={null} 
                    onWishlistChange={() => {}} 
                    onUpdate={handleGiftUpdate}
                />
            )}
        </div>
    );
};