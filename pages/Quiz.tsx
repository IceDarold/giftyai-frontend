
import React, { useState, useEffect, useRef, useLayoutEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/Button';
import { Mascot } from '../components/Mascot';
import { QuizAnswers, StepId } from '../domain/types';
import { analytics } from '../utils/analytics';
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
};

const GOALS = [
    { id: 'impress', label: 'Впечатлить (WOW)', desc: 'Эмоции важнее пользы' },
    { id: 'care', label: 'Позаботиться', desc: 'Тепло, уют и польза' },
    { id: 'protocol', label: 'Соблюсти приличие', desc: 'Без рисков (Протокол)' },
    { id: 'hobby', label: 'Поддержать хобби', desc: 'Вклад в увлечение' }
];

const EFFORT_OPTIONS = [
    { id: 'link', label: 'Дайте ссылку — я куплю', desc: 'Минимум времени' },
    { id: 'pack', label: 'Могу собрать набор / упаковать', desc: 'Есть пара часов' },
    { id: 'diy', label: 'Готов сделать своими руками / квест', desc: 'Максимум усилий' }
];

const ATTITUDE_HINTS = [
    '«Главное — бренд и статус»', '«Лишь бы работало и не ломалось»', 
    '«Люблю красивые мелочи»', '«Лучше впечатления, чем вещи»'
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
  exclude: '',
  
  roles: [],
  roleConfidence: 'sure',
  archetype: '',
  selfWorth: '',
  conversationTopics: '',
  topicDuration: 'long_term',
  painPoints: [],
  painStyle: 'endurer',
  riskyTopics: false,
  effortLevel: '',
  idealWeekend: '',
  materialAttitude: ''
};

const FLOATING_QUESTIONS = [
    'Играет на музыкальных инструментах? 🎸',
    'Какую музыку слушает? 🎧',
    'Каким спортом увлекается? ⚽️',
    'Любит готовить дома? 🍳',
    'Есть домашние животные? 🐱',
    'Как проводит выходные? 🛌',
    'Любит походы или отели? ⛺️',
    'Коллекционирует что-то? 💎',
    'Следит за модой? 👗',
    'Фанат какой-то вселенной? ⚡️',
    'Любит настольные игры? 🎲',
    'Много работает за компьютером? 💻',
    'Кофеман или чайный пьяница? ☕️',
    'Любит сладкое? 🍭',
    'Занимается саморазвитием? 📚',
    'Любит что-то мастерить руками? 🛠',
    'Водит машину? 🚗',
    'Есть дача или сад? 🌿',
    'Учит иностранные языки? 🇬🇧',
    'Любит принимать гостей? 🥂'
];

const WEEKEND_TAGS_FULL = [
    'Сон до обеда 😴', 'Сериал 🎬', 'Поход в горы 🏔', 'Тусовка 🎉', 
    'Уборка 🧹', 'Учеба 📚', 'SPA 🧖‍♀️', 'Бар с друзьями 🍻',
    'Игры 🎮', 'Прогулка 🌳', 'Шоппинг 🛍', 'Театр 🎭',
    'Спорт 🏃', 'Дача 🏡'
];

const EXCLUDE_TAGS = [
  'Одежда', 'Косметика', 'Алкоголь', '18+', 'Сувениры', 
  'Еда', 'Сладости', 'Сертификаты', 'Деньги', 'Книги'
];

const STEP_IDS: StepId[] = [
  'name',         // 0
  'age',          // 1
  'occasion',     // 2
  'relationship', // 3
  'vibe',         // 4
  'roles',        // 5
  'budget',       // 6 (Moved Up)
  'interests',    // 7
  'pain',         // 8
  'topics',       // 9
  'archetype',    // 10
  'exclude' as any // 11
];

const STEP_LABELS = [
  'Профиль', 'Возраст', 'Повод', 'Связь',
  'Задача', 'Время', 'Бюджет', 'Интересы',
  'Проблемы', 'Выходной', 'Отношение', 'Стоп-лист'
];

const TOTAL_STEPS_COUNT = 12;

const detectGender = (name: string): 'male' | 'female' | null => {
    const lower = name.trim().toLowerCase();
    if (!lower) return null;
    const maleExceptions = ['никита', 'илья', 'лука', 'савва', 'данила', 'кузьма', 'фома', 'лёша', 'леша', 'сережа', 'саша', 'женя', 'валя', 'паша', 'миша', 'дима', 'юра', 'слава'];
    const femaleExceptions = ['любовь', 'нинель', 'рахиль', 'руфь', 'адель', 'изабель'];
    if (maleExceptions.includes(lower)) return null;
    if (femaleExceptions.includes(lower)) return 'female';
    if (lower.endsWith('а') || lower.endsWith('я')) {
        if (maleExceptions.some(ex => lower === ex)) return null;
        return 'female';
    }
    if (/[бвгджзклмнпрстфхцчшщй]$/.test(lower)) return 'male';
    if (lower.endsWith('ь')) {
        if (lower.endsWith('тель') || lower.endsWith('арь')) return 'male';
        if (lower.endsWith('ость') || lower.endsWith('чь') || lower.endsWith('шь') || lower.endsWith('щь')) return 'female';
    }
    return null;
};

// --- Components ---

const StepHeader: React.FC<{ title: React.ReactNode; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="text-center mb-8 animate-fade-in-up relative z-20">
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
    className={`group relative w-full text-left p-4 rounded-3xl transition-all duration-300 border backdrop-blur-md flex flex-col justify-between outline-none focus:ring-4 focus:ring-brand-purple/30 h-full min-h-[100px] ${
      selected 
        ? 'bg-white text-brand-dark border-white shadow-[0_0_30px_rgba(255,255,255,0.2)] scale-[1.02] z-10' 
        : 'bg-white/5 text-white border-white/10 hover:bg-white/10 hover:border-white/20 active:scale-[0.98]'
    } ${className}`}
  >
    <div className="flex items-start justify-between w-full mb-2">
        {icon && (
        <div className={`text-2xl transition-transform duration-300 ${selected ? 'scale-110' : 'group-hover:scale-110'}`}>
            {icon}
        </div>
        )}
        {selected && <div className="w-3 h-3 bg-brand-blue rounded-full" />}
    </div>
    
    <div>
      <div className="font-bold text-base leading-tight">{label}</div>
      {desc && (
        <div className={`text-xs font-medium mt-1 ${selected ? 'text-brand-dark/60' : 'text-white/40'}`}>
          {desc}
        </div>
      )}
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

interface CloudData {
    x: number;
    y: number;
    vx: number;
    vy: number;
    width: number;
    height: number;
    text: string;
}

// --- Main Quiz Component ---

export const Quiz: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Analytics Timer
  const stepStartTimeRef = useRef<number>(Date.now());
  const quizStartTimeRef = useRef<number>(Date.now());

  // --- Physics State ---
  const containerRef = useRef<HTMLDivElement>(null);
  const centerBoxRef = useRef<HTMLDivElement>(null);
  const cloudRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const cloudsDataRef = useRef<CloudData[]>([]);
  const requestRef = useRef<number>(0);
  
  const [answers, setAnswers] = useState<QuizAnswers>(() => {
    if (location.state) {
        const { name, relationship } = location.state as { name: string, relationship: string };
        return { ...INITIAL_ANSWERS, name: name || '', relationship: relationship || '' };
    }
    return INITIAL_ANSWERS;
  });

  // Init randomized question subset
  const [currentQuestions] = useState<string[]>(() => [...FLOATING_QUESTIONS].sort(() => 0.5 - Math.random()).slice(0, 16));

  useLayoutEffect(() => {
    const originalBackground = document.body.style.background;
    const originalBackgroundColor = document.body.style.backgroundColor;
    document.body.style.background = 'none';
    document.body.style.backgroundColor = '#2A0A18'; 
    return () => {
      document.body.style.background = originalBackground;
      document.body.style.backgroundColor = originalBackgroundColor;
    };
  }, []);

  useEffect(() => {
      localStorage.removeItem('gifty_draft');
      stepStartTimeRef.current = Date.now();
      quizStartTimeRef.current = Date.now();
  }, []);

  // --- PHYSICS ENGINE LOGIC ---
  useEffect(() => {
    if (step === 7) {
        const initClouds = () => {
            if (!containerRef.current || !centerBoxRef.current) return;
            
            const containerW = containerRef.current.offsetWidth;
            const containerH = containerRef.current.offsetHeight;
            const centerRect = centerBoxRef.current.getBoundingClientRect();
            const containerRect = containerRef.current.getBoundingClientRect();
            
            const box = {
                left: centerRect.left - containerRect.left - 20, 
                top: centerRect.top - containerRect.top - 20,
                right: centerRect.right - containerRect.left + 20,
                bottom: centerRect.bottom - containerRect.top + 20,
                width: centerRect.width + 40,
                height: centerRect.height + 40
            };

            const newClouds: CloudData[] = [];
            
            currentQuestions.forEach((q, i) => {
                const el = cloudRefs.current[i];
                if (!el) return;
                
                const w = el.offsetWidth;
                const h = el.offsetHeight;
                let valid = false;
                let attempts = 0;
                let x = 0, y = 0;

                while(!valid && attempts < 100) {
                    attempts++;
                    x = Math.random() * (containerW - w);
                    y = Math.random() * (containerH - h);
                    
                    if (x + w > box.left && x < box.right && y + h > box.top && y < box.bottom) {
                        continue;
                    }
                    valid = true;
                }

                newClouds.push({
                    x, y,
                    vx: (Math.random() - 0.5) * 0.8,
                    vy: (Math.random() - 0.5) * 0.8,
                    width: w,
                    height: h,
                    text: q
                });
            });
            cloudsDataRef.current = newClouds;
        };

        setTimeout(initClouds, 100);

        const update = () => {
            if (!containerRef.current || !centerBoxRef.current) {
                requestRef.current = requestAnimationFrame(update);
                return;
            }

            const containerW = containerRef.current.offsetWidth;
            const containerH = containerRef.current.offsetHeight;
            const centerRect = centerBoxRef.current.getBoundingClientRect();
            const containerRect = containerRef.current.getBoundingClientRect();
            
            const box = {
                left: centerRect.left - containerRect.left - 10,
                top: centerRect.top - containerRect.top - 10,
                right: centerRect.right - containerRect.left + 10,
                bottom: centerRect.bottom - containerRect.top + 10
            };

            cloudsDataRef.current.forEach((cloud, i) => {
                cloud.x += cloud.vx;
                cloud.y += cloud.vy;

                if (cloud.x <= 0) { cloud.x = 0; cloud.vx *= -1; }
                if (cloud.x + cloud.width >= containerW) { cloud.x = containerW - cloud.width; cloud.vx *= -1; }
                if (cloud.y <= 0) { cloud.y = 0; cloud.vy *= -1; }
                if (cloud.y + cloud.height >= containerH) { cloud.y = containerH - cloud.height; cloud.vy *= -1; }

                if (cloud.x + cloud.width > box.left && cloud.x < box.right && 
                    cloud.y + cloud.height > box.top && cloud.y < box.bottom) {
                    
                    const centerX = cloud.x + cloud.width / 2;
                    const centerY = cloud.y + cloud.height / 2;
                    const boxCenterX = (box.left + box.right) / 2;
                    const boxCenterY = (box.top + box.bottom) / 2;
                    
                    const dx = centerX - boxCenterX;
                    const dy = centerY - boxCenterY;
                    
                    if (Math.abs(dx) / (box.right - box.left) > Math.abs(dy) / (box.bottom - box.top)) {
                        cloud.vx *= -1;
                        cloud.x += dx > 0 ? 2 : -2;
                    } else {
                        cloud.vy *= -1;
                        cloud.y += dy > 0 ? 2 : -2;
                    }
                }

                for (let j = i + 1; j < cloudsDataRef.current.length; j++) {
                    const other = cloudsDataRef.current[j];
                    const dx = (cloud.x + cloud.width/2) - (other.x + other.width/2);
                    const dy = (cloud.y + cloud.height/2) - (other.y + other.height/2);
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    const minDist = (cloud.width + other.width) / 2 * 0.9;

                    if (dist < minDist) {
                        const nx = dx / dist;
                        const ny = dy / dist;
                        const overlap = minDist - dist;
                        const moveX = nx * overlap * 0.5;
                        const moveY = ny * overlap * 0.5;
                        
                        cloud.x += moveX;
                        cloud.y += moveY;
                        other.x -= moveX;
                        other.y -= moveY;

                        const tempVx = cloud.vx;
                        const tempVy = cloud.vy;
                        cloud.vx = other.vx;
                        cloud.vy = other.vy;
                        other.vx = tempVx;
                        other.vy = tempVy;
                    }
                }

                const el = cloudRefs.current[i];
                if (el) {
                    el.style.transform = `translate(${cloud.x}px, ${cloud.y}px)`;
                }
            });

            requestRef.current = requestAnimationFrame(update);
        };

        requestRef.current = requestAnimationFrame(update);
        return () => cancelAnimationFrame(requestRef.current!);
    }
  }, [step]);

  // Custom inputs state
  const [customOccasion, setCustomOccasion] = useState('');
  const [isCustomOccasion, setIsCustomOccasion] = useState(false);
  const [customRelationship, setCustomRelationship] = useState('');
  const [isCustomRelationship, setIsCustomRelationship] = useState(false);
  
  // Strategy Custom
  const [customVibe, setCustomVibe] = useState('');
  const [isCustomVibe, setIsCustomVibe] = useState(false);

  // Interest Tags Logic
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Weekend Tags Logic
  const [selectedWeekendTags, setSelectedWeekendTags] = useState<string[]>([]);
  const [shownWeekendCount, setShownWeekendCount] = useState(8);

  // Exclude Logic - Default 18+ checked
  const [selectedExcludeTags, setSelectedExcludeTags] = useState<string[]>(['18+']);
  const [customExclude, setCustomExclude] = useState('');
  
  const [noComplaints, setNoComplaints] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLInputElement>(null);

  const updateAnswer = (field: keyof QuizAnswers, value: any) => {
    setAnswers(prev => {
        const next = { ...prev, [field]: value };
        if (field === 'name') {
            const detected = detectGender(value as string);
            if (detected) next.recipientGender = detected;
        }
        return next;
    });
  };

  const nextStep = () => {
    const timeSpent = (Date.now() - stepStartTimeRef.current) / 1000;
    const questionId = STEP_IDS[step] || `step_${step}`;
    analytics.quizStepCompleted(step + 1, questionId, null, timeSpent);
    stepStartTimeRef.current = Date.now();

    if (step === TOTAL_STEPS_COUNT - 1) { 
      const finalAnswers = { ...answers };
      // ... (Rest of finalization logic same)
      const interestParts = [];
      if (answers.interests && answers.interests.trim()) interestParts.push(answers.interests);
      if (selectedTags.length > 0) interestParts.push(...selectedTags);
      finalAnswers.interests = interestParts.join(', ');

      const weekendParts = [];
      if (answers.idealWeekend && answers.idealWeekend.trim()) weekendParts.push(answers.idealWeekend);
      if (selectedWeekendTags.length > 0) weekendParts.push(...selectedWeekendTags);
      finalAnswers.idealWeekend = weekendParts.join(', ');
      
      const allExcludes = [...selectedExcludeTags];
      if (customExclude.trim()) allExcludes.push(customExclude.trim());
      finalAnswers.exclude = allExcludes.join(', ');
      
      if (isCustomOccasion) finalAnswers.occasion = customOccasion;
      if (isCustomRelationship) finalAnswers.relationship = customRelationship;
      
      if (isCustomVibe) {
          finalAnswers.vibe = customVibe;
      } else {
          const goalLabel = GOALS.find(g => g.id === finalAnswers.vibe)?.label || '';
          const effortLabel = EFFORT_OPTIONS.find(e => e.id === finalAnswers.effortLevel)?.label || '';
          finalAnswers.vibe = `${goalLabel} (${effortLabel})`;
      }

      finalAnswers.budget = (finalAnswers.budget || '').replace(/\D/g, '');
      
      const totalDuration = (Date.now() - quizStartTimeRef.current) / 1000;
      analytics.quizCompleted(TOTAL_STEPS_COUNT, totalDuration);

      localStorage.setItem('gifty_answers', JSON.stringify(finalAnswers));
      navigate('/results');
    } else {
      setStep(s => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const startExperimentFlow = () => {
      navigate('/experiments/dialogue');
  };

  const prevStep = () => {
    if (step > 0) {
        setStep(s => s - 1);
        stepStartTimeRef.current = Date.now(); 
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        navigate('/');
    }
  };

  const handleRestart = () => {
      if(confirm('Начать тест заново? Текущий прогресс будет сброшен.')) {
          window.location.reload();
      }
  };

  const handleJumpToStep = (index: number) => {
      setStep(index);
      setIsMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ([7, 8, 9, 10].includes(step)) return; 
    if (e.key === 'Enter' && isCurrentStepValid()) nextStep();
  };

  const isCurrentStepValid = () => {
    switch (step) {
      case 0: return (answers.name || '').trim().length > 0 && !!answers.recipientGender; // Name + Gender
      case 1: return true; // Age
      case 2: return isCustomOccasion ? customOccasion.trim().length > 0 : (answers.occasion || '').length > 0;
      case 3: return isCustomRelationship ? customRelationship.trim().length > 0 : (answers.relationship || '').length > 0;
      case 4: return isCustomVibe ? customVibe.trim().length > 0 : !!answers.vibe; // Strategy (Goal)
      case 5: return !!answers.effortLevel; // Effort (Time)
      case 6: return (answers.budget || '').length > 0 && parseInt(answers.budget) > 0; // Budget moved here
      case 7: return ((answers.interests || '').trim().length > 0 || selectedTags.length > 0); // Interests
      case 8: return noComplaints || (answers.painPoints && answers.painPoints.length > 0); // Complaints
      case 9: return true; // Weekend
      case 10: return true; // Attitude
      case 11: return true; // Excludes
      default: return false;
    }
  };

  const toggleInterestTag = (tag: string) => {
      setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const toggleWeekendTag = (tag: string) => {
      setSelectedWeekendTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const toggleExcludeTag = (tag: string) => {
      setSelectedExcludeTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const renderContent = () => {
    switch (step) {
      case 0: // Profile
        return (
          <div className="w-full max-w-md mx-auto animate-fade-in">
            <StepHeader title="С кем случится магия?" subtitle="Как зовут счастливчика?" />
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-2 flex items-center border border-white/20 shadow-inner mb-6">
                <input 
                    ref={inputRef}
                    type="text" 
                    value={answers.name}
                    onChange={(e) => updateAnswer('name', e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Имя (например, Саша)"
                    className="w-full bg-transparent text-white placeholder-white/40 text-2xl font-bold px-4 py-3 outline-none text-center"
                    autoFocus
                />
            </div>
            {/* Gender Selection */}
            <div className="flex gap-4 justify-center">
                <button 
                    onClick={() => updateAnswer('recipientGender', 'male')}
                    className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-all border ${answers.recipientGender === 'male' ? 'bg-blue-600 border-blue-400 text-white shadow-lg scale-105' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}
                >
                    👨 Он
                </button>
                <button 
                    onClick={() => updateAnswer('recipientGender', 'female')}
                    className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-all border ${answers.recipientGender === 'female' ? 'bg-pink-600 border-pink-400 text-white shadow-lg scale-105' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}
                >
                    👩 Она
                </button>
            </div>
          </div>
        );

      case 1: // Age
        return (
          <div className="w-full max-w-2xl mx-auto animate-fade-in">
             <StepHeader title={`Сколько лет ${inclineName(answers.name, 'dative')}?`} />
             <AgePicker value={answers.ageGroup} onChange={(val) => updateAnswer('ageGroup', val)} />
          </div>
        );

      case 2: // Occasion
        const occasions = [
            { id: 'ny', label: 'Новый год', icon: Icons.NewYear },
            { id: 'bday', label: 'День рождения', icon: Icons.Birthday },
            { id: 'date', label: 'Свидание / Годовщина', icon: Icons.Anniversary },
            { id: 'wedding', label: 'Свадьба', icon: Icons.Wedding },
            { id: 'house', label: 'Новоселье', icon: Icons.JustBecause },
            { id: 'random', label: 'Просто так', icon: Icons.JustBecause },
        ];
        return (
          <div className="w-full max-w-4xl mx-auto animate-fade-in">
            <StepHeader title="Какой повод?" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {occasions.map(occ => (
                    <SelectionCard 
                        key={occ.id}
                        selected={!isCustomOccasion && answers.occasion === occ.label}
                        onClick={() => { setIsCustomOccasion(false); updateAnswer('occasion', occ.label); nextStep(); }}
                        label={occ.label}
                        icon={<occ.icon />}
                    />
                ))}
            </div>
            {/* Custom Input Toggle */}
            <div className={`transition-all duration-300 ${isCustomOccasion ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}>
                <div 
                    onClick={() => setIsCustomOccasion(true)}
                    className={`bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3 cursor-pointer ${isCustomOccasion ? 'ring-2 ring-brand-purple bg-white/10' : ''}`}
                >
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">✍️</div>
                    <input 
                        type="text"
                        value={customOccasion}
                        onChange={(e) => { setCustomOccasion(e.target.value); setIsCustomOccasion(true); }}
                        placeholder="Свой вариант (например, Выпускной)"
                        className="bg-transparent w-full text-white font-bold outline-none placeholder-white/30"
                    />
                </div>
            </div>
          </div>
        );

      case 3: // Relationship
        const rels = ['Партнер', 'Родитель', 'Друг/Подруга', 'Коллега', 'Ребенок', 'Родственник'];
        return (
            <div className="w-full max-w-4xl mx-auto animate-fade-in">
                <StepHeader title={`Кем ${answers.name} вам приходится?`} />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {rels.map(rel => (
                        <SelectionCard 
                            key={rel}
                            selected={!isCustomRelationship && answers.relationship === rel}
                            onClick={() => { setIsCustomRelationship(false); updateAnswer('relationship', rel); nextStep(); }}
                            label={rel}
                        />
                    ))}
                </div>
                <div 
                    onClick={() => setIsCustomRelationship(true)}
                    className={`bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3 cursor-pointer ${isCustomRelationship ? 'ring-2 ring-brand-purple bg-white/10' : ''}`}
                >
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">🤝</div>
                    <input 
                        type="text"
                        value={customRelationship}
                        onChange={(e) => { setCustomRelationship(e.target.value); setIsCustomRelationship(true); }}
                        placeholder="Другое (например, Сосед)"
                        className="bg-transparent w-full text-white font-bold outline-none placeholder-white/30"
                    />
                </div>
            </div>
        );

      case 4: // Strategy (Vibe/Goal)
        return (
            <div className="w-full max-w-2xl mx-auto animate-fade-in">
                <StepHeader title="Какая у нас цель?" subtitle="Какую эмоцию хотим вызвать?" />
                <div className="flex flex-col gap-3">
                    {GOALS.map(goal => (
                        <SelectionCard 
                            key={goal.id}
                            selected={!isCustomVibe && answers.vibe === goal.id}
                            onClick={() => { setIsCustomVibe(false); updateAnswer('vibe', goal.id); }}
                            label={goal.label}
                            desc={goal.desc}
                        />
                    ))}
                     <div 
                        onClick={() => setIsCustomVibe(true)}
                        className={`bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3 cursor-pointer transition-all ${isCustomVibe ? 'ring-2 ring-brand-purple bg-white/10' : ''}`}
                    >
                        <input 
                            type="text"
                            value={customVibe}
                            onChange={(e) => { setCustomVibe(e.target.value); setIsCustomVibe(true); }}
                            placeholder="Своя цель (например, Рассмешить)"
                            className="bg-transparent w-full text-white font-bold outline-none placeholder-white/30"
                        />
                    </div>
                </div>
            </div>
        );

      case 5: // Effort (Roles/Time)
        return (
            <div className="w-full max-w-2xl mx-auto animate-fade-in">
                <StepHeader title="Ваша готовность" subtitle="Сколько сил вы готовы вложить?" />
                <div className="flex flex-col gap-3">
                    {EFFORT_OPTIONS.map(opt => (
                        <SelectionCard 
                            key={opt.id}
                            selected={answers.effortLevel === opt.id}
                            onClick={() => { updateAnswer('effortLevel', opt.id); nextStep(); }}
                            label={opt.label}
                            desc={opt.desc}
                        />
                    ))}
                </div>
            </div>
        );

      case 6: // Budget
        const budgets = [1000, 3000, 5000, 10000, 20000, 50000];
        return (
            <div className="w-full max-w-md mx-auto animate-fade-in text-center">
                <StepHeader title="Бюджет" subtitle="Примерная сумма" />
                <div className="relative mb-8">
                    <input 
                        type="text"
                        inputMode="numeric"
                        value={answers.budget}
                        onChange={(e) => updateAnswer('budget', e.target.value.replace(/\D/g, ''))}
                        onKeyDown={handleKeyDown}
                        placeholder="0"
                        className="w-full bg-transparent text-6xl font-black text-white text-center outline-none border-b-2 border-white/20 focus:border-brand-purple pb-2 placeholder-white/10"
                        autoFocus
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-white/30">₽</span>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                    {budgets.map(b => (
                        <button 
                            key={b}
                            onClick={() => updateAnswer('budget', b.toString())}
                            className="bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2 rounded-xl transition-all"
                        >
                            {b.toLocaleString()}
                        </button>
                    ))}
                </div>
            </div>
        );

      case 7: // Interests (Physics Clouds)
        return (
            <div className="w-full h-[60vh] relative animate-fade-in">
                <div className="text-center mb-4 relative z-20 pointer-events-none">
                    <h2 className="text-3xl font-black text-white drop-shadow-md">Интересы</h2>
                    <p className="text-white/70 text-sm">Нажимайте на то, что подходит, или пишите своё</p>
                </div>
                
                {/* Physics Container */}
                <div ref={containerRef} className="absolute inset-0 z-0 overflow-hidden">
                    <div 
                        ref={centerBoxRef} 
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-white/10 rounded-full flex items-center justify-center bg-white/5 backdrop-blur-sm z-10 pointer-events-none"
                    >
                        <div className="text-center px-4">
                            <span className="text-4xl block mb-2">🎁</span>
                            <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Drop zone</span>
                        </div>
                    </div>

                    {currentQuestions.map((q, i) => {
                        const isSelected = selectedTags.includes(q);
                        return (
                            <button
                                key={i}
                                ref={el => { if (el) cloudRefs.current[i] = el; }}
                                onClick={() => toggleInterestTag(q)}
                                className={`absolute whitespace-nowrap px-4 py-2 rounded-full font-bold text-sm transition-colors duration-300 shadow-lg select-none will-change-transform ${
                                    isSelected 
                                    ? 'bg-brand-blue text-white z-20 scale-110 ring-2 ring-white' 
                                    : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/10 z-10'
                                }`}
                                style={{ top: 0, left: 0 }} // Positioned by physics engine
                            >
                                {q}
                            </button>
                        );
                    })}
                </div>

                {/* Manual Input Overlay */}
                <div className="absolute bottom-0 left-0 right-0 z-30 p-4">
                    <div className="max-w-md mx-auto bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 flex gap-2 shadow-2xl">
                        <input 
                            ref={textAreaRef}
                            value={answers.interests}
                            onChange={(e) => updateAnswer('interests', e.target.value)}
                            placeholder="Что еще? (например: любит корги и матчу)"
                            className="bg-transparent w-full text-white px-3 outline-none placeholder-white/40 font-medium"
                            onKeyDown={(e) => { if(e.key === 'Enter') nextStep(); }}
                        />
                    </div>
                </div>
            </div>
        );

      case 8: // Pain Points
        return (
            <div className="w-full max-w-2xl mx-auto animate-fade-in">
                <StepHeader title="На что жалуется?" subtitle="Что отравляет жизнь?" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    {['Устает на работе', 'Болит спина/шея', 'Не высыпается', 'Мерзнет', 'Скучно дома', 'Нет времени на себя', 'Телефон садится', 'Все ломается'].map(pain => (
                        <button 
                            key={pain}
                            onClick={() => {
                                const current = answers.painPoints || [];
                                const next = current.includes(pain) ? current.filter(p => p !== pain) : [...current, pain];
                                updateAnswer('painPoints', next);
                                setNoComplaints(false);
                            }}
                            className={`p-4 rounded-xl text-left font-bold transition-all border ${
                                (answers.painPoints || []).includes(pain)
                                ? 'bg-red-500/20 border-red-500 text-white'
                                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                            }`}
                        >
                            {pain}
                        </button>
                    ))}
                </div>
                <button 
                    onClick={() => { updateAnswer('painPoints', []); setNoComplaints(!noComplaints); }}
                    className={`w-full py-3 rounded-xl font-bold border transition-all ${noComplaints ? 'bg-green-500/20 border-green-500 text-green-200' : 'bg-transparent border-white/20 text-white/50 hover:bg-white/5'}`}
                >
                    Ни на что не жалуется (Счастливый человек)
                </button>
            </div>
        );

      case 9: // Weekend
        return (
            <div className="w-full max-w-3xl mx-auto animate-fade-in">
                <StepHeader title="Идеальный выходной" subtitle="Как восстанавливает ресурс?" />
                <div className="flex flex-wrap justify-center gap-3 mb-6">
                    {WEEKEND_TAGS_FULL.slice(0, shownWeekendCount).map(tag => (
                        <button
                            key={tag}
                            onClick={() => toggleWeekendTag(tag)}
                            className={`px-5 py-3 rounded-2xl font-bold text-sm border transition-all ${
                                selectedWeekendTags.includes(tag)
                                ? 'bg-white text-brand-dark border-white shadow-lg transform scale-105'
                                : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
                            }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
                {shownWeekendCount < WEEKEND_TAGS_FULL.length && (
                    <button onClick={() => setShownWeekendCount(prev => prev + 6)} className="block mx-auto text-white/50 hover:text-white text-sm font-bold mb-6">
                        Показать еще...
                    </button>
                )}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <textarea 
                        value={answers.idealWeekend}
                        onChange={(e) => updateAnswer('idealWeekend', e.target.value)}
                        placeholder="Свой вариант..."
                        className="w-full bg-transparent text-white outline-none resize-none h-20 placeholder-white/30"
                    />
                </div>
            </div>
        );

      case 10: // Attitude (Material)
        return (
            <div className="w-full max-w-2xl mx-auto animate-fade-in">
                <StepHeader title="Отношение к вещам" subtitle="Что важнее?" />
                <div className="grid grid-cols-1 gap-3">
                    {ATTITUDE_HINTS.map((hint, idx) => (
                        <SelectionCard 
                            key={idx}
                            selected={answers.materialAttitude === hint}
                            onClick={() => { updateAnswer('materialAttitude', hint); nextStep(); }}
                            label={hint}
                        />
                    ))}
                </div>
            </div>
        );

      case 11: // Exclude (Stop list)
        return (
            <div className="w-full max-w-2xl mx-auto animate-fade-in text-center">
                <StepHeader title="Стоп-лист" subtitle="Что точно НЕ дарить?" />
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                    {EXCLUDE_TAGS.map(tag => (
                        <button
                            key={tag}
                            onClick={() => toggleExcludeTag(tag)}
                            className={`px-4 py-2 rounded-xl font-bold text-sm border transition-all ${
                                selectedExcludeTags.includes(tag)
                                ? 'bg-red-500/20 border-red-500 text-red-200 line-through'
                                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                            }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
                <div className="max-w-md mx-auto relative">
                    <input 
                        type="text"
                        value={customExclude}
                        onChange={(e) => setCustomExclude(e.target.value)}
                        placeholder="Что еще исключить?"
                        className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-red-400 outline-none text-center placeholder-white/30"
                    />
                </div>
            </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pt-safe-top pb-safe-bottom flex flex-col relative overflow-hidden bg-brand-dark">
      
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-brand-blue/20 rounded-full blur-[120px] animate-pulse-slow" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-purple/20 rounded-full blur-[120px] animate-blob" />
      </div>

      {/* Navigation Bar - Same */}
      <div className="relative z-50 px-6 py-6 flex items-center justify-between">
          <button 
            onClick={prevStep}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-all active:scale-90 border border-white/10 backdrop-blur-md shrink-0"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80"><path d="M15 18l-6-6 6-6"/></svg>
          </button>

          {/* Interactive Step Indicator */}
          <div className="flex gap-1.5 absolute left-1/2 -translate-x-1/2 max-w-[55vw] md:max-w-[400px] overflow-x-auto no-scrollbar py-2 px-4 justify-start md:justify-center">
              {Array.from({ length: TOTAL_STEPS_COUNT }).map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setStep(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 shrink-0 ${
                        i === step 
                        ? 'w-8 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]' 
                        : i < step 
                            ? 'w-3 bg-white/60 hover:bg-white' 
                            : 'w-2 bg-white/20 hover:bg-white/40'
                    }`}
                    title={`Step ${i + 1}`}
                  />
              ))}
          </div>

          <div className="relative">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-all active:scale-90 border border-white/10 backdrop-blur-md"
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
                    <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              {isMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-64 bg-[#2A0A18]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-pop max-h-[70vh] overflow-y-auto no-scrollbar">
                        <div className="p-4 border-b border-white/10 bg-white/5">
                            <button 
                                onClick={handleRestart}
                                className="w-full text-center py-2 text-xs font-bold text-white/50 hover:text-white border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                ↺ Сбросить прогресс
                            </button>
                        </div>
                        {STEP_LABELS.map((label, idx) => (
                            <button 
                                key={idx}
                                onClick={() => handleJumpToStep(idx)}
                                className={`w-full text-left px-5 py-3 text-sm font-bold flex items-center justify-between transition-colors border-b border-white/5 last:border-0 ${
                                    idx === step 
                                    ? 'bg-brand-purple/20 text-white border-l-4 border-l-brand-purple' 
                                    : idx < step 
                                        ? 'text-white/70 hover:bg-white/10' 
                                        : 'text-white/30 hover:text-white/50 hover:bg-white/5'
                                }`}
                            >
                                <span>{label}</span>
                                {idx < step && <span className="text-green-400 text-xs">✓</span>}
                                {idx === step && <span className="w-2 h-2 rounded-full bg-brand-purple animate-pulse"></span>}
                            </button>
                        ))}
                        <div className="p-2 bg-white/5">
                            <button 
                                onClick={() => navigate('/')}
                                className="w-full text-center py-3 text-sm font-bold text-red-300 hover:bg-white/5 rounded-xl transition-colors"
                            >
                                Выйти
                            </button>
                        </div>
                    </div>
                  </>
              )}
          </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col items-center justify-center px-6 relative z-10">
          
          <div className="mb-8 transition-transform duration-500 hover:scale-105 cursor-pointer">
             <Mascot 
                className="w-32 h-32 md:w-40 md:h-40 drop-shadow-2xl" 
                emotion={step === 0 ? 'happy' : step === 9 ? 'excited' : step === 10 ? 'thinking' : step === 11 ? 'cool' : 'happy'}
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
                    {step === 11 ? 'Сотворить магию' : 'Далее'}
                    {isCurrentStepValid() && step !== 11 && (
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                    )}
                    {step === 11 && <span className="text-2xl">💘</span>}
                </div>
            </Button>

            {/* Experiment Entry Point (Only at last step) */}
            {step === 11 && (
                <button 
                    onClick={startExperimentFlow}
                    className="w-full mt-4 py-3 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-xl font-bold text-xs uppercase tracking-widest border border-cyan-500/30 transition-all flex items-center justify-center gap-2"
                >
                    <span>🚀</span> Test: Dialogue Algorithm (Alpha)
                </button>
            )}
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
