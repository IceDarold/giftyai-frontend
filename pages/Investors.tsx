import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Logo } from '../components/Logo';
import { Footer } from '../components/Footer';
import { AmbientSnow } from '../components/SnowSystem';
import { api } from '../api';
import { TeamMember } from '../domain/types';
import { track } from '../utils/analytics';

// Configuration for Cloudinary
// Tries to get from Env, falls back to placeholder if not set
const getCloudName = () => {
    try {
        return (import.meta as any).env?.VITE_PUBLIC_CLOUDINARY_CLOUD_NAME || 'gifty-ai-assets';
    } catch (e) {
        return 'gifty-ai-assets';
    }
};

const CLOUD_NAME = getCloudName();

const getTeamImageUrl = (publicId: string | null) => {
    if (!publicId) return null;
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto,c_fill,g_face,w_240,h_240/${publicId}`;
};

const TeamMemberCard: React.FC<{ member: TeamMember }> = ({ member }) => {
    const imageUrl = getTeamImageUrl(member.photo_public_id);
    const fallbackInitial = member.name.charAt(0);

    return (
        <div className="text-center group">
            <div className="w-32 h-32 rounded-full bg-[#1E293B] mx-auto mb-4 border-4 border-brand-blue/20 overflow-hidden relative shadow-xl transition-all duration-300 group-hover:border-brand-blue/50 group-hover:scale-105">
                {imageUrl ? (
                    <img src={imageUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt={member.name} />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-black text-white/20 bg-gradient-to-br from-gray-800 to-gray-900">
                        {fallbackInitial}
                    </div>
                )}
            </div>
            <h4 className="font-bold text-lg text-white mb-1 group-hover:text-brand-blue transition-colors">{member.name}</h4>
            <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2">{member.role}</p>
            {member.linkedin_url && (
                <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-brand-blue/60 hover:text-brand-blue text-xs font-medium flex items-center justify-center gap-1 transition-colors">
                    <span>in</span> LinkedIn
                </a>
            )}
        </div>
    );
};

export const Investors: React.FC = () => {
  const navigate = useNavigate();
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    linkedin: '',
    hp: '' // Honeypot field
  });

  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [teamError, setTeamError] = useState(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    window.scrollTo(0, 0);
    
    // Fetch Team Data
    const loadTeam = async () => {
        try {
            setLoadingTeam(true);
            const data = await api.public.team.list();
            setTeam(data);
        } catch (e) {
            console.error("Failed to load team", e);
            setTeamError(true);
        } finally {
            setLoadingTeam(false);
        }
    };
    loadTeam();
  }, []);

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Honeypot check (Anti-spam)
    if (formData.hp) {
        console.log("Bot detected");
        setFormState('success'); // Fake success
        return;
    }

    if (!formData.name || formData.name.length < 2) return;
    if (!formData.email || !isValidEmail(formData.email)) return;
    
    setFormState('submitting');
    try {
        await api.public.investorContact.create({
            name: formData.name,
            company: formData.company,
            email: formData.email,
            linkedin: formData.linkedin
        });
        
        track('investor_contact_submitted', {
            has_company: !!formData.company,
            has_linkedin: !!formData.linkedin
        });
        
        setFormState('success');
        setFormData({ name: '', company: '', email: '', linkedin: '', hp: '' });
    } catch (e) {
        console.error(e);
        setFormState('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] relative overflow-x-hidden text-white pt-24 selection:bg-brand-blue selection:text-white flex flex-col font-sans">
      
      {/* --- Dynamic Background --- */}
      <AmbientSnow />
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-blue/10 rounded-full blur-[120px] animate-pulse-slow" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none"></div>
      </div>

      <div className="relative z-10 px-6 max-w-6xl mx-auto flex-grow w-full">
        
        {/* Header Navigation */}
        <div className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center bg-[#0F172A]/80 backdrop-blur-xl border-b border-white/5">
            <div className="flex items-center gap-2">
                <Logo variant="white" onClick={() => navigate('/')} className="scale-75 origin-left" />
                <span className="bg-white/10 text-white/60 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border border-white/10">Investors</span>
            </div>
            <button onClick={() => navigate('/')} className="text-sm font-bold text-white/50 hover:text-white transition-colors">
                Marketplace
            </button>
        </div>

        {/* 1. VISION / MISSION HERO */}
        <section className={`pt-20 pb-24 text-center max-w-3xl mx-auto transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-block px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-bold text-brand-blue uppercase tracking-widest mb-6">
                Reinventing Gifting
            </div>
            <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight mb-8">
                Eliminating Anxiety<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-purple-400">from Human Connection.</span>
            </h1>
            <p className="text-xl text-white/60 leading-relaxed font-medium">
                Gifty AI leverages advanced LLMs to transform gift-giving from a stressful obligation into a seamless, joyful experience. We are building the world's first empathetic shopping assistant.
            </p>
        </section>

        {/* 2. MARKET OPPORTUNITY */}
        <section className="mb-24 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1 md:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors">
                <h3 className="text-2xl font-bold mb-2">The Gift Economy</h3>
                <div className="flex items-baseline gap-4 mb-4">
                    <span className="text-6xl font-black text-white">$650B+</span>
                    <span className="text-white/40 font-bold">Global Market</span>
                </div>
                <p className="text-white/60 text-sm">
                    The gifting market is massive but inefficient. 48% of gifts are unwanted, and 72% of shoppers report anxiety during the process. We are fixing the "intent-to-product" gap.
                </p>
            </div>
            <div className="bg-gradient-to-br from-brand-blue/20 to-purple-500/20 border border-white/10 rounded-3xl p-8 flex flex-col justify-center">
                <span className="text-4xl mb-4">📈</span>
                <h3 className="text-xl font-bold mb-2">High Frequency</h3>
                <p className="text-white/60 text-sm">
                    Unlike typical e-commerce, gifting is year-round: Birthdays, Holidays, Anniversaries, Corporate events.
                </p>
            </div>
        </section>

        {/* 3. PRODUCT & TRACTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24 items-center">
            <div>
                <h2 className="text-3xl font-black mb-6">Product Overview</h2>
                <ul className="space-y-6">
                    <li className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-brand-blue/20 flex items-center justify-center text-brand-blue text-xl font-bold">1</div>
                        <div>
                            <h4 className="font-bold text-lg">Deep Psychological Profiling</h4>
                            <p className="text-white/50 text-sm mt-1">Our quiz doesn't just ask "age/gender". It analyzes archetypes, psychographics, and relationship dynamics.</p>
                        </div>
                    </li>
                    <li className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-xl font-bold">2</div>
                        <div>
                            <h4 className="font-bold text-lg">Multi-Vendor Aggregation</h4>
                            <p className="text-white/50 text-sm mt-1">We don't hold stock. We aggregate the best SKUs from top marketplaces (Ozon, WB, Amazon) and niche D2C brands.</p>
                        </div>
                    </li>
                    <li className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xl font-bold">3</div>
                        <div>
                            <h4 className="font-bold text-lg">Content-Led Growth</h4>
                            <p className="text-white/50 text-sm mt-1">Our educational blog drives organic traffic by solving the "etiquette" and "psychology" problems of gifting.</p>
                        </div>
                    </li>
                </ul>
            </div>
            
            <div className="bg-[#1E293B] border border-white/10 rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/10 blur-[80px]"></div>
                <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-6">Key Metrics (Mock)</h3>
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <p className="text-3xl font-black text-white mb-1">15k+</p>
                        <p className="text-xs text-white/50 font-bold uppercase">Monthly Active Users</p>
                    </div>
                    <div>
                        <p className="text-3xl font-black text-white mb-1">8.5%</p>
                        <p className="text-xs text-white/50 font-bold uppercase">Conversion Rate</p>
                    </div>
                    <div>
                        <p className="text-3xl font-black text-white mb-1">$25</p>
                        <p className="text-xs text-white/50 font-bold uppercase">AOV Commission</p>
                    </div>
                    <div>
                        <p className="text-3xl font-black text-white mb-1">4.8/5</p>
                        <p className="text-xs text-white/50 font-bold uppercase">NPS Score</p>
                    </div>
                </div>
            </div>
        </div>

        {/* 4. BUSINESS MODEL */}
        <section className="mb-24 text-center">
            <h2 className="text-3xl font-black mb-12">Business Model</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <h3 className="text-xl font-bold mb-2">CPA / Affiliate</h3>
                    <p className="text-sm text-white/50">Commission from partner sales (5-15%) via major marketplaces.</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <h3 className="text-xl font-bold mb-2">B2B Placement</h3>
                    <p className="text-sm text-white/50">Listing fees and promoted placement for niche D2C brands in our collections.</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <h3 className="text-xl font-bold mb-2">Premium Subscription</h3>
                    <p className="text-sm text-white/50">(Roadmap) Calendar automation, personal concierge, and zero-markup deals.</p>
                </div>
            </div>
        </section>

        {/* 5. TEAM */}
        <section className="mb-24">
            <h2 className="text-3xl font-black mb-12 text-center">Core Team</h2>
            
            {loadingTeam ? (
                <div className="flex justify-center gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse flex flex-col items-center">
                            <div className="w-32 h-32 rounded-full bg-white/5 mb-4"></div>
                            <div className="h-4 w-20 bg-white/5 rounded mb-2"></div>
                            <div className="h-3 w-16 bg-white/5 rounded"></div>
                        </div>
                    ))}
                </div>
            ) : teamError ? (
                <div className="text-center text-white/40 text-sm">Team info is temporarily unavailable</div>
            ) : (
                <div className="flex flex-wrap justify-center gap-12">
                    {team.map((member, i) => (
                        <TeamMemberCard key={i} member={member} />
                    ))}
                </div>
            )}
        </section>

        {/* 6. CONTACT FORM */}
        <section className="mb-20 max-w-2xl mx-auto">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-blue to-purple-500"></div>
                
                {formState === 'success' ? (
                    <div className="text-center py-10 animate-pop">
                        <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-green-500/30">✓</div>
                        <h3 className="text-2xl font-bold text-white mb-2">Message Received</h3>
                        <p className="text-white/60">Thank you for your interest. We will be in touch shortly.</p>
                    </div>
                ) : formState === 'error' ? (
                    <div className="text-center py-10">
                        <div className="text-red-400 text-3xl mb-2">⚠️</div>
                        <h3 className="text-xl font-bold text-white mb-2">Something went wrong</h3>
                        <p className="text-white/60 mb-6">Please try again later.</p>
                        <Button variant="secondary" onClick={() => setFormState('idle')}>Try Again</Button>
                    </div>
                ) : (
                    <>
                        <h2 className="text-3xl font-black mb-2 text-center">Invest in Gifty AI</h2>
                        <p className="text-white/50 text-center mb-8 text-sm">Request our Pitch Deck and financial projections.</p>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Honeypot Field - Hidden from humans */}
                            <input 
                                type="text" 
                                name="hp" 
                                value={formData.hp} 
                                onChange={e => setFormData({...formData, hp: e.target.value})} 
                                className="hidden" 
                                tabIndex={-1} 
                                autoComplete="off" 
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-white/40 uppercase mb-1 ml-1">Name</label>
                                    <input 
                                        type="text" 
                                        required
                                        minLength={2}
                                        className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-blue outline-none transition-colors disabled:opacity-50"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                        disabled={formState === 'submitting'}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-white/40 uppercase mb-1 ml-1">Company / Fund</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-blue outline-none transition-colors disabled:opacity-50"
                                        placeholder="Ventures LLC"
                                        value={formData.company}
                                        onChange={e => setFormData({...formData, company: e.target.value})}
                                        disabled={formState === 'submitting'}
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-white/40 uppercase mb-1 ml-1">Work Email</label>
                                <input 
                                    type="email" 
                                    required
                                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-blue outline-none transition-colors disabled:opacity-50"
                                    placeholder="john@fund.com"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                    disabled={formState === 'submitting'}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-white/40 uppercase mb-1 ml-1">LinkedIn (Optional)</label>
                                <input 
                                    type="url" 
                                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-blue outline-none transition-colors disabled:opacity-50"
                                    placeholder="https://linkedin.com/in/john"
                                    value={formData.linkedin}
                                    onChange={e => setFormData({...formData, linkedin: e.target.value})}
                                    disabled={formState === 'submitting'}
                                />
                            </div>

                            <Button 
                                type="submit" 
                                fullWidth 
                                disabled={formState === 'submitting'}
                                className="mt-4"
                            >
                                {formState === 'submitting' ? 'Sending...' : 'Request Pitch Deck'}
                            </Button>
                        </form>
                    </>
                )}
            </div>
        </section>

      </div>

      {/* Integrated Dark Footer */}
      <div className="relative mt-auto border-t border-white/5 bg-[#0F172A]">
         <Footer />
      </div>
    </div>
  );
};