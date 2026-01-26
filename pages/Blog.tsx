import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { BLOG_POSTS } from '../api/mock/blogData';
import { BlogPost } from '../domain/types';

const CATEGORIES = ['Все', 'Тренды', 'Психология', 'Подборки', 'DIY', 'Этикет', 'Антирейтинг'];

const parseDateValue = (dateStr: string) => {
  const [day, month] = dateStr.split(' ');
  const months: Record<string, number> = {
    'янв': 0, 'фев': 1, 'мар': 2, 'апр': 3, 'май': 4, 'июн': 5,
    'июл': 6, 'авг': 7, 'сен': 8, 'окт': 9, 'ноя': 10, 'дек': 11
  };
  
  const monthIndex = months[month.slice(0, 3).toLowerCase()] ?? 0;
  const year = monthIndex >= 10 ? 2024 : 2025;
  
  return new Date(year, monthIndex, parseInt(day)).getTime();
};

export const Blog: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('Все');
  const [searchQuery, setSearchQuery] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleArticleClick = (id: string) => {
    navigate(`/blog/${id}`);
  };

  const sortedPosts = useMemo(() => {
    return [...BLOG_POSTS].sort((a, b) => parseDateValue(b.date) - parseDateValue(a.date));
  }, []);

  const filteredPosts = useMemo(() => {
    return sortedPosts.filter(post => {
      const matchesCategory = activeCategory === 'Все' || post.category === activeCategory;
      const matchesSearch = 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery, sortedPosts]);

  const headerPosts = sortedPosts.slice(0, 5);

  return (
    <div className="pt-24 pb-20 px-4 min-h-screen relative overflow-hidden bg-[#F8F9FE]">
      
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] animate-pulse-slow" />
          <div className="absolute bottom-20 left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Header Title with Logo */}
        <div className="flex flex-col items-center text-center mb-8">
           <div className="mb-4 scale-125 origin-center">
              <Logo onClick={() => navigate('/')} />
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-brand-dark tracking-tighter">
              Journal
           </h1>
        </div>

        {/* --- HEADER CAROUSEL (Slider) --- */}
        <div className="mb-12 relative group">
            <div 
                ref={scrollContainerRef}
                className="flex overflow-x-auto gap-4 md:gap-6 pb-6 px-2 no-scrollbar snap-x snap-mandatory scroll-smooth"
            >
                {headerPosts.map((post) => (
                    <div 
                        key={`header-${post.id}`}
                        onClick={() => handleArticleClick(post.id)}
                        className="relative min-w-[85vw] md:min-w-[600px] aspect-[16/9] md:aspect-[21/9] rounded-[2.5rem] overflow-hidden snap-center cursor-pointer shadow-xl hover:shadow-2xl transition-all hover:scale-[1.01]"
                    >
                        <img 
                            src={post.image} 
                            alt={post.title} 
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80" />
                        
                        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 flex flex-col items-start gap-2">
                            <div className="flex gap-2 mb-1">
                                <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                    {post.category}
                                </span>
                                <span className="bg-brand-blue/90 text-white px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                    Новое
                                </span>
                            </div>
                            <h2 className="text-2xl md:text-4xl font-black text-white leading-tight drop-shadow-md line-clamp-2">
                                {post.title}
                            </h2>
                            <p className="text-white/80 text-sm md:text-base font-medium line-clamp-1 max-w-lg hidden md:block">
                                {post.excerpt}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
            {/* Scroll Hint */}
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#F8F9FE] to-transparent pointer-events-none md:hidden" />
        </div>

        {/* --- CONTROLS (Search & Categories) --- */}
        <div className="sticky top-4 z-40 mb-10 transition-all">
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-3 shadow-lg border border-white/50 flex flex-col md:flex-row gap-3 items-center">
                
                {/* Search Bar */}
                <div className="relative w-full md:w-80 group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-focus-within:text-brand-blue transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input 
                        type="text" 
                        placeholder="Найти статью..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-100/50 hover:bg-gray-100 focus:bg-white border-transparent focus:border-brand-blue/20 rounded-2xl py-3 pl-12 pr-4 outline-none font-bold text-brand-dark placeholder-gray-400 transition-all"
                    />
                </div>

                {/* Categories */}
                <div className="w-full overflow-x-auto no-scrollbar mask-gradient-x md:mask-none">
                    <div className="flex gap-2 px-1">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-5 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 border ${
                                    activeCategory === cat 
                                    ? 'bg-brand-dark text-white border-brand-dark shadow-lg scale-105' 
                                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-brand-dark'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* --- ARTICLES GRID --- */}
        {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {filteredPosts.map((post, idx) => (
                    <div 
                        key={post.id}
                        onClick={() => handleArticleClick(post.id)}
                        className="group flex flex-col bg-white rounded-[2.5rem] overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 h-full relative isolate border border-gray-100"
                    >
                        {/* Image Area */}
                        <div className="relative h-60 overflow-hidden shrink-0">
                            <img 
                                src={post.image} 
                                alt={post.title} 
                                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                            />
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                            
                            {/* Floating Badge */}
                            <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-md text-brand-dark px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm z-10">
                                {post.category}
                            </span>
                        </div>

                        {/* Content Area */}
                        <div className="p-6 md:p-8 flex flex-col flex-grow relative bg-white">
                            {/* Meta */}
                            <div className="flex items-center gap-3 text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-3">
                                <span className={post.date.includes('янв') ? 'text-brand-blue' : ''}>{post.date}</span>
                                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                <span>{post.readTime}</span>
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-black text-brand-dark leading-[1.2] mb-3 group-hover:text-brand-blue transition-colors line-clamp-3">
                                {post.title}
                            </h3>

                            {/* Excerpt */}
                            <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-6 flex-grow font-medium">
                                {post.excerpt}
                            </p>

                            {/* Footer / Author */}
                            <div className="flex items-center justify-between mt-auto pt-5 border-t border-gray-100">
                                <div className="flex items-center gap-2.5">
                                    <div className="text-lg bg-gray-50 w-8 h-8 flex items-center justify-center rounded-full border border-gray-100 shadow-sm">
                                        {post.authorAvatar}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase leading-none mb-0.5">Автор</span>
                                        <span className="text-xs font-bold text-gray-700 leading-none">{post.author}</span>
                                    </div>
                                </div>
                                
                                <div className="w-10 h-10 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center group-hover:bg-brand-blue group-hover:text-white transition-all duration-300 shadow-sm group-hover:-rotate-45">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-6xl mb-4">🕵️‍♂️</div>
                <h3 className="text-2xl font-bold text-brand-dark mb-2">Ничего не найдено</h3>
                <p className="text-gray-500">Попробуйте изменить запрос или выбрать другую категорию.</p>
                <button 
                    onClick={() => { setSearchQuery(''); setActiveCategory('Все'); }}
                    className="mt-6 text-brand-blue font-bold hover:underline"
                >
                    Сбросить фильтры
                </button>
            </div>
        )}

        {/* Subscribe CTA */}
        <div className="mt-20 bg-white rounded-[3rem] p-8 md:p-12 text-center relative overflow-hidden shadow-xl mx-auto max-w-4xl ring-1 ring-gray-100">
            <div className="absolute inset-0 bg-gradient-to-br from-white via-indigo-50/50 to-white" />
            
            <div className="relative z-10 flex flex-col items-center">
                <div className="bg-white p-4 rounded-3xl shadow-lg mb-6 -rotate-3 hover:rotate-0 transition-transform duration-300 border border-gray-100">
                    <span className="text-4xl">💌</span>
                </div>
                
                <h3 className="text-3xl md:text-4xl font-black text-brand-dark mb-4 tracking-tight">
                    Вдохновение в каждом письме
                </h3>
                <p className="text-gray-500 text-lg mb-8 max-w-lg mx-auto font-medium leading-relaxed">
                    Подпишитесь на рассылку. Никакого спама, только магия и секретные промокоды Gifty.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                    <input 
                        type="email" 
                        placeholder="Ваш email" 
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-brand-dark placeholder-gray-400 outline-none focus:border-brand-blue/30 focus:ring-4 focus:ring-brand-blue/10 transition-all font-bold text-lg shadow-sm"
                    />
                    <button className="bg-brand-dark text-white rounded-2xl px-8 py-4 font-bold text-lg shadow-xl shadow-brand-dark/20 hover:bg-brand-blue hover:shadow-brand-blue/30 transition-all duration-300 active:scale-95 whitespace-nowrap">
                        Подписаться
                    </button>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};