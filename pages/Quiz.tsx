import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/Button';
import { Mascot } from '../components/Mascot';
import { RELATIONSHIPS } from '../constants';
import { QuizAnswers } from '../types';
import { track } from '../utils/analytics';
import { inclineName } from '../utils/stringUtils';

// --- Icons ---
const Icons = {
  NewYear: () => <span className="text-3xl">🎄</span>,
  Birthday: () => <span className="text-3xl">🎂</span>,
  Wedding: () => <span className="text-3xl">💍</span>,
  Anniversary: () => <span className="text-3xl">💑</span>,
  JustBecause: () => <span className="text-3xl">🎁</span>,
  School: () => <span className="text-3xl">🎒</span>,
  Edit: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9"></path>
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
    </svg>
  ),
  Male: () => <span className="text-3xl">👨</span>,
  Female: () => <span className="text-3xl">👩</span>,
  Unisex: () => <span className="text-3xl">✨</span>,
  Vibes: {
    Cozy: () => <span className="text-3xl">☕️</span>,
    Practical: () => <span className="text-3xl">🛠</span>,
    Wow: () => <span className="text-3xl">🚀</span>,
    Emotional: () => <span className="text-3xl">🥹</span>,
  }
};

const VIBES = [
  { id: 'cozy', label: 'Уютный и теплый', desc: 'Для душевных вечеров', icon: Icons.Vibes.Cozy },
  { id: 'practical', label: 'Практичный и полезный', desc: 'То, что пригодится в деле', icon: Icons.Vibes.Practical },
  { id: 'wow', label: 'Вау-эффект', desc: 'Удивить и поразить', icon: Icons.Vibes.Wow },
  { id: 'emotional', label: 'Сентиментальный', desc: 'На память и для души', icon: Icons.Vibes.Emotional },
];

const INITIAL_ANSWERS: QuizAnswers = {
  name: '',
  ageGroup: '25',
  recipientGender: null,
  occasion: '',
  relationship: '',
  vibe: '',
  city: '',
  interests: '',
  budget: '',
  exclude: ''
};

const INTEREST_TAGS = [
  'Технологии', 'Кулинария', 'Спорт', 'Чтение', 'Путешествия', 
  'Дом и уют', 'Красота', 'Кино', 'Музыка', 'Творчество', 
  'Игры', 'Здоровье', 'Эко', 'Стиль'
];

const EXCLUDE_TAGS = [
  'Одежда', 'Косметика', 'Алкоголь', '18+', 'Сувениры', 
  'Еда', 'Сладости', 'Сертификаты', 'Деньги', 'Книги'
];

// --- Components ---

const StepHeader: React.FC<{ title: React.ReactNode; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="text-center mb-10 animate-fade-in-up">
    <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight mb-3 drop-shadow-xl">
      {title}
    </h2>
    {subtitle && (
      <p className="text-white/60 text-lg font-medium">
        {subtitle}
      </p>
    )}
  </div>
);

const SelectionCard: React.FC<{ 
  selected: boolean; 
  onClick: () => void; 
  icon?: React.ReactNode; 
  label: string; 
  desc?: string;
  className?: string;
}> = ({ selected, onClick, icon, label, desc, className = '' }) => (
  <button
    onClick={onClick}
    className={`group relative w-full text-left p-5 rounded-3xl transition-all duration-300 border backdrop-blur-md flex items-center gap-5 outline-none focus:ring-4 focus:ring-brand-purple/30 ${
      selected 
        ? 'bg-white text-brand-dark border-white shadow-[0_0_30px_rgba(255,255,255,0.2)] scale-[1.02] z-10' 
        : 'bg-white/5 text-white border-white/10 hover:bg-white/10 hover:border-white/20 active:scale-[0.98]'
    } ${className}`}
  >
    {icon && (
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-300 ${
        selected ? 'bg-brand-blue/10' : 'bg-white/10 group-hover:bg-white/20'
      }`}>
        {icon}
      </div>
    )}
    <div className="flex-1 min-w-0">
      <div className="font-bold text-lg leading-tight truncate">{label}</div>
      {desc && (
        <div className={`text-xs font-medium mt-1 truncate ${selected ? 'text-brand-dark/60' : 'text-white/40'}`}>
          {desc}
        </div>
      )}
    </div>
    
    {/* Radio Indicator */}
    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
      selected ? 'border-brand-blue' : 'border-white/20 group-hover:border-white/40'
    }`}>
      {selected && <div className="w-3 h-3 bg-brand-blue rounded-full" />}
    </div>
  </button>
);

const AgePicker: React.FC<{ value: string, onChange: (val: string) => void }> = ({ value, onChange }) => {
  const ages = Array.from({ length: 100 }, (_, i) => i);
  const scrollRef = useRef<HTMLDivElement>(null);
  const ITEM_WIDTH = 60;
  const GAP = 16; 
  const STRIDE = ITEM_WIDTH + GAP;

  useEffect(() => {
    if (scrollRef.current) {
        const parsed = parseInt(value);
        const initial = isNaN(parsed) ? 25 : parsed;
        scrollRef.current.scrollLeft = initial * STRIDE;
    }
  }, []);

  const handleScroll = () => {
      if (scrollRef.current) {
          const container = scrollRef.current;
          const containerCenter = container.getBoundingClientRect().left + container.clientWidth / 2;
          
          let closestIndex = 0;
          let minDistance = Infinity;

          const buttons = container.children;
          // Loop through buttons to find which one is geometrically closest to center
          for (let i = 0; i < buttons.length; i++) {
              const button = buttons[i] as HTMLElement;
              const rect = button.getBoundingClientRect();
              const buttonCenter = rect.left + rect.width / 2;
              const distance = Math.abs(containerCenter - buttonCenter);
              
              if (distance < minDistance) {
                  minDistance = distance;
                  closestIndex = i;
              }
          }
          
          if (closestIndex.toString() !== value) {
              onChange(closestIndex.toString());
          }
      }
  };

  const handleClick = (age: number) => {
      if (scrollRef.current) {
          scrollRef.current.scrollTo({
              left: age * STRIDE,
              behavior: 'smooth'
          });
      }
  };

  return (
    <div className="relative w-full h-32 flex items-center group">
        <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-brand-dark/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-brand-dark/80 to-transparent z-10 pointer-events-none" />
        
        {/* Selection Marker */}
        <div className="absolute left-1/2 top-0 bottom-0 w-[64px] -translate-x-1/2 border-x-2 border-brand-purple/50 bg-white/5 rounded-2xl z-0 pointer-events-none backdrop-blur-sm" />

        <div 
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex items-center gap-4 overflow-x-auto no-scrollbar pl-[calc(50%-30px)] pr-[calc(50%-30px)] snap-x snap-mandatory py-4 w-full"
        >
            {ages.map((age) => (
                <button
                    key={age}
                    onClick={() => handleClick(age)}
                    className={`snap-center shrink-0 w-[60px] h-[60px] rounded-xl flex items-center justify-center text-3xl font-black transition-all duration-300 ${
                        value === age.toString() 
                            ? 'text-white scale-125 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]' 
                            : 'text-white/20 hover:text-white/50 scale-90'
                    }`}
                >
                    {age}
                </button>
            ))}
        </div>
        <div className="absolute bottom-[-20px] left-0 right-0 text-center text-xs font-bold text-brand-purple uppercase tracking-widest opacity-80">
            {parseInt(value) % 10 === 1 && parseInt(value) !== 11 ? 'год' : (parseInt(value) % 10 >= 2 && parseInt(value) % 10 <= 4 && (parseInt(value) < 10 || parseInt(value) > 20)) ? 'года' : 'лет'}
        </div>
    </div>
  );
};

// --- City Autocomplete Component ---

const CityAutocomplete: React.FC<{ 
    value: string; 
    onChange: (val: string) => void;
    onSelect: () => void;
}> = ({ value, onChange, onSelect }) => {
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Debounce fetch
    useEffect(() => {
        const fetchCities = async () => {
            if (value.length < 2) {
                setSuggestions([]);
                return;
            }
            
            // Only fetch if it looks like user is typing, not if they just selected
            if (!showSuggestions) return; 

            setLoading(true);
            try {
                // Using OpenStreetMap Nominatim API (Free, no key required for moderate use)
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&accept-language=ru&limit=5&featuretype=city`);
                const data = await res.json();
                setSuggestions(data);
            } catch (e) {
                console.error("City fetch error", e);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchCities, 500);
        return () => clearTimeout(timeoutId);
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (city: any) => {
        // Extract city name clearly (removing region info if it's too long, but keeping helpful context if needed)
        const name = city.display_name.split(',')[0];
        onChange(name);
        setShowSuggestions(false);
        onSelect();
    };

    const handleInputClick = () => {
        if (value.length >= 2) setShowSuggestions(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
        setShowSuggestions(true);
    };

    return (
        <div ref={wrapperRef} className="relative group w-full">
            <div className="absolute top-1/2 left-0 -translate-y-1/2 text-white/30 pointer-events-none">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            </div>
            <input
                type="text"
                value={value}
                onChange={handleInputChange}
                onClick={handleInputClick}
                placeholder="Введите город..."
                className="w-full bg-transparent pl-12 text-4xl font-black text-white placeholder-white/10 outline-none border-b-2 border-white/20 focus:border-brand-blue transition-all pb-4 caret-brand-blue"
                autoComplete="off"
            />
            {loading && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
            )}
            
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#2A0A18] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto">
                    {suggestions.map((city: any, i) => (
                        <div 
                            key={city.place_id || i}
                            onClick={() => handleSelect(city)}
                            className="px-4 py-3 hover:bg-white/10 cursor-pointer text-white border-b border-white/5 last:border-0 transition-colors text-left"
                        >
                            <div className="font-bold text-sm">{city.display_name.split(',')[0]}</div>
                            <div className="text-xs text-white/40 truncate">{city.display_name}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Main Quiz Component ---

export const Quiz: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(0);
  
  const [answers, setAnswers] = useState<QuizAnswers>(() => {
    if (location.state) {
        const { name, relationship } = location.state as { name: string, relationship: string };
        return { ...INITIAL_ANSWERS, name: name || '', relationship: relationship || '' };
    }
    try {
        const saved = localStorage.getItem('gifty_draft');
        // Merge with INITIAL_ANSWERS to ensure no keys are missing
        return saved ? { ...INITIAL_ANSWERS, ...JSON.parse(saved) } : INITIAL_ANSWERS;
    } catch (e) {
        return INITIAL_ANSWERS;
    }
  });

  // Force dark background on body to prevent white/purple leaks on overscroll
  useLayoutEffect(() => {
    const originalBackground = document.body.style.background;
    const originalBackgroundColor = document.body.style.backgroundColor;
    
    document.body.style.background = 'none';
    document.body.style.backgroundColor = '#2A0A18'; // brand-dark (Valentine)

    return () => {
      document.body.style.background = originalBackground;
      document.body.style.backgroundColor = originalBackgroundColor;
    };
  }, []);

  // Custom inputs state
  const [customOccasion, setCustomOccasion] = useState('');
  const [isCustomOccasion, setIsCustomOccasion] = useState(false);
  const [customRelationship, setCustomRelationship] = useState('');
  const [isCustomRelationship, setIsCustomRelationship] = useState(false);
  const [customVibe, setCustomVibe] = useState('');
  const [isCustomVibe, setIsCustomVibe] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedExcludeTags, setSelectedExcludeTags] = useState<string[]>([]);
  const [customExclude, setCustomExclude] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    localStorage.setItem('gifty_draft', JSON.stringify(answers));
  }, [answers]);

  const updateAnswer = (field: keyof QuizAnswers, value: any) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    track('quiz_step', { step: step + 1 });
    if (step === 9) { // Budget is now step 9
      const finalAnswers = { ...answers };
      const combinedInterests = [...selectedTags, ...(answers.interests ? [answers.interests] : [])].join(', ');
      finalAnswers.interests = combinedInterests;
      
      const allExcludes = [...selectedExcludeTags];
      if (customExclude.trim()) allExcludes.push(customExclude.trim());
      finalAnswers.exclude = allExcludes.join(', ');
      
      if (isCustomOccasion) finalAnswers.occasion = customOccasion;
      if (isCustomRelationship) finalAnswers.relationship = customRelationship;
      if (isCustomVibe) finalAnswers.vibe = customVibe;
      
      // Ensure budget is clean number
      finalAnswers.budget = (finalAnswers.budget || '').replace(/\D/g, '');
      
      localStorage.setItem('gifty_answers', JSON.stringify(finalAnswers));
      navigate('/results');
    } else {
      setStep(s => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (step > 0) {
        setStep(s => s - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        navigate('/');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Prevent Next step on enter for CityAutocomplete as it uses Enter to select
    if (step === 6) return; 
    if (e.key === 'Enter' && isCurrentStepValid()) nextStep();
  };

  const isCurrentStepValid = () => {
    switch (step) {
      case 0: return (answers.name || '').trim().length > 0;
      case 1: return true; 
      case 2: return !!answers.recipientGender;
      case 3: return isCustomOccasion ? customOccasion.trim().length > 0 : (answers.occasion || '').length > 0;
      case 4: return isCustomRelationship ? customRelationship.trim().length > 0 : (answers.relationship || '').length > 0;
      case 5: return isCustomVibe ? customVibe.trim().length > 0 : (answers.vibe || '').length > 0;
      case 6: return (answers.city || '').trim().length > 0;
      case 7: return ((answers.interests || '').trim().length > 0 || selectedTags.length > 0);
      case 8: return true; // Exclude is optional
      case 9: return (answers.budget || '').length > 0 && parseInt(answers.budget) > 0;
      default: return false;
    }
  };

  const toggleTag = (tag: string) => {
      setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const toggleExcludeTag = (tag: string) => {
      setSelectedExcludeTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const getGenderLabels = () => {
      const age = parseInt(answers.ageGroup) || 25;
      if (age <= 12) return { female: 'Девочка', male: 'Мальчик' };
      if (age <= 20) return { female: 'Девушка', male: 'Парень' };
      return { female: 'Женщина', male: 'Мужчина' };
  };

  // --- Dynamic Occasions Logic ---
  const getOccasions = () => {
      const age = parseInt(answers.ageGroup) || 25;
      
      const baseOccasions = [
          { id: '14feb', label: '14 февраля', desc: 'Романтика', Icon: Icons.Anniversary },
          { id: 'birthday', label: 'День рождения', desc: 'Личный праздник', Icon: Icons.Birthday },
          { id: 'just_because', label: 'Просто так', desc: 'Без повода', Icon: Icons.JustBecause }
      ];

      if (age >= 18) {
          baseOccasions.splice(2, 0, { id: 'wedding', label: 'Свадьба', desc: 'Начало истории', Icon: Icons.Wedding });
          baseOccasions.splice(3, 0, { id: 'anniversary', label: 'Годовщина', desc: 'Важная дата', Icon: Icons.Anniversary });
      } else if (age >= 6) {
          baseOccasions.push({ id: 'school', label: 'Школа / Учеба', desc: '1 сентября, выпускной', Icon: Icons.School });
      }

      return baseOccasions;
  };

  // --- Dynamic Relationships Logic ---
  const getRelationships = () => {
      const age = parseInt(answers.ageGroup) || 25;
      const g = answers.recipientGender;

      if (age < 13) {
          if (g === 'male') return ['Сын', 'Внук', 'Брат', 'Племянник', 'Друг', 'Крестник'];
          if (g === 'female') return ['Дочь', 'Внучка', 'Сестра', 'Племянница', 'Подруга', 'Крестница'];
          return ['Ребенок', 'Внук/Внучка', 'Брат/Сестра', 'Племянник/ца', 'Друг'];
      }
      
      if (age < 18) {
          if (g === 'male') return ['Парень', 'Сын', 'Брат', 'Друг', 'Одноклассник', 'Племянник'];
          if (g === 'female') return ['Девушка', 'Дочь', 'Сестра', 'Подруга', 'Одноклассница', 'Племянница'];
          return ['Пара', 'Ребенок', 'Брат/Сестра', 'Друг'];
      }

      if (age <= 50) {
          if (g === 'male') return ['Муж', 'Парень', 'Папа', 'Брат', 'Друг', 'Коллега'];
          if (g === 'female') return ['Жена', 'Девушка', 'Мама', 'Сестра', 'Подруга', 'Коллега'];
          return ['Партнер', 'Родитель', 'Брат/Сестра', 'Друг', 'Коллега'];
      }

      // 50+
      if (g === 'male') return ['Папа', 'Дедушка', 'Муж', 'Коллега', 'Начальник', 'Друг'];
      if (g === 'female') return ['Мама', 'Бабушка', 'Жена', 'Коллега', 'Начальница', 'Подруга'];
      
      return ['Родитель', 'Бабушка/Дедушка', 'Партнер', 'Коллега', 'Друг'];
  };

  const renderContent = () => {
    const genderLabels = getGenderLabels();
    const occasions = getOccasions();
    const relationships = getRelationships();

    return (
        <div key={step} className={`w-full max-w-lg mx-auto animate-fade-in`}>
            {step === 0 && (
                <>
                    <StepHeader title="Как зовут счастливчика?" subtitle="Начнем с малого" />
                    <div className="relative group">
                        <input
                            ref={inputRef}
                            type="text"
                            value={answers.name}
                            onChange={(e) => updateAnswer('name', e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Имя"
                            className="w-full bg-transparent text-center text-5xl font-black text-white placeholder-white/10 outline-none border-b-2 border-white/20 focus:border-brand-blue transition-all pb-4 caret-brand-blue"
                        />
                    </div>
                </>
            )}

            {step === 1 && (
                <>
                    <StepHeader title={`Сколько лет ${inclineName(answers.name || '', 'dative')}?`} subtitle="Чтобы попасть в точку" />
                    <div className="py-10">
                        <AgePicker value={answers.ageGroup} onChange={(val) => updateAnswer('ageGroup', val)} />
                    </div>
                </>
            )}

            {step === 2 && (
                <>
                    <StepHeader title="Пол получателя" subtitle="Для уточнения интересов" />
                    <div className="grid grid-cols-1 gap-4">
                        {[
                            { id: 'female', label: genderLabels.female, Icon: Icons.Female },
                            { id: 'male', label: genderLabels.male, Icon: Icons.Male },
                            { id: 'unisex', label: 'Не важно', Icon: Icons.Unisex }
                        ].map((g) => (
                            <SelectionCard
                                key={g.id}
                                label={g.label}
                                icon={<g.Icon />}
                                selected={answers.recipientGender === g.id}
                                onClick={() => { updateAnswer('recipientGender', g.id); setTimeout(nextStep, 250); }}
                            />
                        ))}
                    </div>
                </>
            )}

            {step === 3 && (
                <>
                    <StepHeader title="По какому поводу?" subtitle="Контекст решает всё" />
                    <div className="grid grid-cols-1 gap-3 mb-6">
                        {occasions.map(occ => (
                            <SelectionCard
                                key={occ.id}
                                label={occ.label}
                                desc={occ.desc}
                                icon={<occ.Icon />}
                                selected={!isCustomOccasion && answers.occasion === occ.label}
                                onClick={() => { setIsCustomOccasion(false); updateAnswer('occasion', occ.label); setTimeout(nextStep, 250); }}
                            />
                        ))}
                        <SelectionCard 
                            label="Свой вариант"
                            desc="Опишите своими словами"
                            icon={<Icons.Edit />}
                            selected={isCustomOccasion}
                            onClick={() => { setIsCustomOccasion(true); updateAnswer('occasion', ''); }}
                        />
                    </div>
                    {isCustomOccasion && (
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Например: Выпускной"
                            value={customOccasion}
                            onChange={(e) => setCustomOccasion(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full bg-white/10 rounded-2xl px-6 py-4 text-white placeholder-white/30 font-bold outline-none border border-white/20 focus:border-brand-purple"
                        />
                    )}
                </>
            )}

            {step === 4 && (
                <>
                    <StepHeader title="Кто этот человек для вас?" />
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {relationships.map(rel => (
                            <button
                                key={rel}
                                onClick={() => { setIsCustomRelationship(false); updateAnswer('relationship', rel); setTimeout(nextStep, 250); }}
                                className={`p-4 rounded-2xl font-bold text-sm transition-all border ${
                                    !isCustomRelationship && answers.relationship === rel
                                    ? 'bg-white text-brand-blue border-white shadow-lg scale-105' 
                                    : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
                                }`}
                            >
                                {rel}
                            </button>
                        ))}
                        <button
                            onClick={() => { setIsCustomRelationship(true); updateAnswer('relationship', ''); }}
                            className={`p-4 rounded-2xl font-bold text-sm transition-all border col-span-2 ${
                                isCustomRelationship
                                ? 'bg-white text-brand-blue border-white shadow-lg'
                                : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
                            }`}
                        >
                            Другое
                        </button>
                    </div>
                    {isCustomRelationship && (
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Кем приходится?"
                            value={customRelationship}
                            onChange={(e) => setCustomRelationship(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full bg-white/10 rounded-2xl px-6 py-4 text-white placeholder-white/30 font-bold outline-none border border-white/20 focus:border-brand-purple"
                        />
                    )}
                </>
            )}

            {step === 5 && (
                <>
                    <StepHeader title="Какое настроение?" subtitle="Эмоциональный окрас" />
                    <div className="grid grid-cols-1 gap-3 mb-6">
                        {VIBES.map(v => (
                            <SelectionCard
                                key={v.id}
                                label={v.label}
                                desc={v.desc}
                                icon={<v.icon />}
                                selected={!isCustomVibe && answers.vibe === v.label}
                                onClick={() => { setIsCustomVibe(false); updateAnswer('vibe', v.label); setTimeout(nextStep, 250); }}
                            />
                        ))}
                        <SelectionCard
                            label="Свой вариант"
                            icon={<Icons.Edit />}
                            selected={isCustomVibe}
                            onClick={() => { setIsCustomVibe(true); updateAnswer('vibe', ''); }}
                        />
                    </div>
                    {isCustomVibe && (
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Опишите вайб..."
                            value={customVibe}
                            onChange={(e) => setCustomVibe(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full bg-white/10 rounded-2xl px-6 py-4 text-white placeholder-white/30 font-bold outline-none border border-white/20 focus:border-brand-purple"
                        />
                    )}
                </>
            )}

            {step === 6 && (
                <>
                    <StepHeader title="Город доставки" subtitle="Чтобы найти товары рядом" />
                    <div className="mb-6 relative z-50">
                        <CityAutocomplete 
                            value={answers.city} 
                            onChange={(val) => updateAnswer('city', val)} 
                            onSelect={() => setTimeout(nextStep, 250)}
                        />
                    </div>
                    {/* Popular cities buttons removed as per request to focus on search */}
                </>
            )}

            {step === 7 && (
                <>
                    <StepHeader title="Интересы и хобби" subtitle="Чем подробнее, тем лучше" />
                    <div className="flex flex-wrap gap-2 mb-8 justify-center">
                        {INTEREST_TAGS.map(tag => (
                            <button
                                key={tag}
                                onClick={() => toggleTag(tag)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                                    selectedTags.includes(tag) 
                                    ? 'bg-white text-brand-dark border-white shadow-lg scale-105' 
                                    : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
                                }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <textarea
                            ref={textAreaRef}
                            value={answers.interests}
                            onChange={(e) => updateAnswer('interests', e.target.value)}
                            placeholder="Напишите всё, что знаете: любит Гарри Поттера, мечтает о собаке, пьет много кофе..."
                            className="w-full h-40 bg-white/10 rounded-3xl p-6 text-white placeholder-white/30 font-medium text-lg outline-none border border-white/10 focus:border-brand-purple focus:bg-white/15 transition-all resize-none shadow-inner"
                        />
                    </div>
                </>
            )}

            {step === 8 && (
                <>
                    <StepHeader title="Чего точно НЕ дарить?" subtitle="Исключим провальные варианты" />
                    <div className="flex flex-wrap gap-2 mb-6 justify-center">
                        {EXCLUDE_TAGS.map(tag => (
                            <button
                                key={tag}
                                onClick={() => toggleExcludeTag(tag)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                                    selectedExcludeTags.includes(tag) 
                                    ? 'bg-red-500 text-white border-red-400 shadow-lg scale-105' 
                                    : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
                                }`}
                            >
                                {selectedExcludeTags.includes(tag) ? '✕ ' : ''}{tag}
                            </button>
                        ))}
                    </div>
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Что-то еще? (например: живые цветы)"
                            value={customExclude}
                            onChange={(e) => setCustomExclude(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full bg-white/10 rounded-2xl px-6 py-4 text-white placeholder-white/30 font-bold outline-none border border-white/20 focus:border-brand-purple transition-all"
                        />
                    </div>
                    <p className="text-center text-white/40 text-sm mt-6">
                        Можно пропустить, если ограничений нет
                    </p>
                </>
            )}

            {step === 9 && (
                <>
                    <StepHeader title="Бюджет" subtitle="Сколько готовы потратить?" />
                    <div className="relative mb-8">
                        <input
                            ref={inputRef}
                            type="text"
                            inputMode="numeric"
                            placeholder="0"
                            value={(answers.budget || '').replace(/\D/g, '')}
                            onChange={(e) => updateAnswer('budget', e.target.value.replace(/\D/g, ''))}
                            onKeyDown={handleKeyDown}
                            className="w-full bg-transparent text-center text-6xl font-black text-white placeholder-white/10 outline-none border-b-2 border-white/20 focus:border-brand-blue transition-all pb-4"
                        />
                        <span className="absolute top-1/2 right-4 -translate-y-1/2 text-2xl font-bold text-white/30">₽</span>
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-3">
                        {[1000, 3000, 5000, 10000, 15000, 25000].map(amount => (
                            <button
                                key={amount}
                                onClick={() => updateAnswer('budget', amount.toString())}
                                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all border border-white/5"
                            >
                                {amount.toLocaleString()} ₽
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
  };

  return (
    <div className="min-h-screen pt-safe-top pb-safe-bottom flex flex-col relative overflow-hidden bg-brand-dark">
      
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-brand-blue/20 rounded-full blur-[120px] animate-pulse-slow" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-purple/20 rounded-full blur-[120px] animate-blob" />
      </div>

      {/* Navigation Bar */}
      <div className="relative z-50 px-6 py-6 flex items-center justify-between">
          <button 
            onClick={prevStep}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-all active:scale-90 border border-white/10 backdrop-blur-md"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80"><path d="M15 18l-6-6 6-6"/></svg>
          </button>

          {/* Segmented Progress */}
          <div className="flex gap-1 absolute left-1/2 -translate-x-1/2">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                  <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                        i <= step ? 'w-4 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'w-1.5 bg-white/10'
                    }`} 
                  />
              ))}
          </div>

          <div className="w-12 h-12" /> {/* Spacer */}
      </div>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col items-center justify-center px-6 relative z-10">
          
          {/* Mascot stays constant but reacts */}
          <div className="mb-8 transition-transform duration-500 hover:scale-105 cursor-pointer">
             <Mascot 
                className="w-32 h-32 md:w-40 md:h-40 drop-shadow-2xl" 
                emotion={step === 0 ? 'happy' : step === 7 ? 'thinking' : step === 8 ? 'cool' : step === 9 ? 'excited' : 'happy'}
                accessory="santa-hat"
                variant="cupid"
             />
          </div>

          <div className="w-full">
              {renderContent()}
          </div>
      </div>

      {/* Bottom Action Area */}
      <div className="p-6 pb-8 relative z-50">
         <div className="max-w-lg mx-auto">
            <Button 
                onClick={nextStep} 
                disabled={!isCurrentStepValid()} 
                fullWidth 
                className={`h-16 text-xl rounded-2xl shadow-xl transition-all duration-500 ${
                    !isCurrentStepValid() 
                    ? 'opacity-30 grayscale cursor-not-allowed bg-white/10 text-white' 
                    : 'bg-gradient-to-r from-brand-blue to-brand-purple text-white hover:scale-[1.02] active:scale-95 shadow-[0_0_40px_rgba(255,77,109,0.4)]'
                }`}
            >
                <div className="flex items-center justify-center gap-2">
                    {step === 9 ? 'Сотворить магию' : 'Далее'}
                    {isCurrentStepValid() && step !== 9 && (
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                    )}
                    {step === 9 && <span className="text-2xl">💘</span>}
                </div>
            </Button>
         </div>
      </div>

      {/* Animations Styles */}
      <style>{`
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-in {
            animation: fadeInUp 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};