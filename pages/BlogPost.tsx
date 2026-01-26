import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBlogPost, BLOG_POSTS, BlogPost as BlogPostType } from '../api/mock/blogData';
import { Button } from '../components/Button';
import { Mascot } from '../components/Mascot';
import { Logo } from '../components/Logo';
import { track } from '../utils/analytics';

export const BlogPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (id) {
      const found = getBlogPost(id);
      if (found) {
          setPost(found);
          // Scroll to top when opening a new article
          window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
          navigate('/blog');
      }
    }
  }, [id, navigate]);

  // SEO Update Effect
  useEffect(() => {
    if (!post) return;

    // 1. Update Title
    const baseTitle = 'Gifty AI';
    document.title = post.metaTitle 
        ? post.metaTitle 
        : `${post.title} — ${baseTitle}`;

    // 2. Update Meta Description
    let metaDesc = document.querySelector("meta[name='description']");
    if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', post.metaDescription || post.excerpt);

    // 3. Update Canonical (Optional but good practice)
    let linkCanonical = document.querySelector("link[rel='canonical']");
    if (!linkCanonical) {
        linkCanonical = document.createElement('link');
        linkCanonical.setAttribute('rel', 'canonical');
        document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', window.location.href);

  }, [post]);

  useEffect(() => {
    const handleScroll = () => {
        const totalScroll = document.documentElement.scrollTop;
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scroll = `${totalScroll / windowHeight}`;
        setScrollProgress(Number(scroll));
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Recommendations Logic
  const recommendations = useMemo(() => {
      if (!post) return [];
      
      // 1. Filter out current post
      const others = BLOG_POSTS.filter(p => p.id !== post.id);
      
      // 2. Score by category match
      const scored = others.map(p => ({
          ...p,
          score: p.category === post.category ? 10 : 0
      }));

      // 3. Sort by score desc, then by date (assuming array order is roughly date order or we can shuffle)
      scored.sort((a, b) => b.score - a.score);

      // 4. Take top 2
      return scored.slice(0, 2);
  }, [post]);

  const handleStartQuiz = () => {
      track('blog_inline_cta_click', { articleId: id });
      navigate('/quiz');
  };

  const handleRecommendationClick = (recId: string) => {
      track('blog_rec_click', { from: id, to: recId });
      navigate(`/blog/${recId}`);
  };

  const renderInlineCTA = () => (
      <div 
        onClick={handleStartQuiz}
        className="my-10 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-5 shadow-sm group cursor-pointer relative overflow-hidden transform transition-all hover:scale-[1.01]"
      >
          {/* Decorative background element */}
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-brand-blue/10 rounded-full blur-2xl group-hover:bg-brand-blue/20 transition-colors"></div>
          
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-md group-hover:rotate-12 transition-transform relative z-10">
            🎁
          </div>
          <div className="flex-1 text-center sm:text-left relative z-10">
              <h4 className="font-black text-brand-dark text-lg leading-tight mb-1">Сложно выбрать подарок?</h4>
              <p className="text-sm text-gray-600 font-medium leading-relaxed">Доверьте это Искусственному Интеллекту. Мы подберем идеальный вариант за 1 минуту.</p>
          </div>
          <button className="bg-brand-blue text-white px-6 py-3 rounded-xl font-bold text-sm shadow-brand-blue/30 shadow-lg hover:bg-brand-blue/90 active:scale-95 transition-all whitespace-nowrap relative z-10">
              Подобрать сейчас
          </button>
      </div>
  );

  if (!post) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FE] pb-24">
      
      {/* Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1.5 bg-gradient-to-r from-brand-blue to-brand-purple z-[60]" 
        style={{ width: `${scrollProgress * 100}%` }}
      />

      {/* Floating Home/Brand Button */}
      <div className="fixed top-6 left-6 z-50">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl px-3 py-1.5 shadow-lg border border-white/40 hover:bg-white transition-all">
             <Logo onClick={() => navigate('/')} />
          </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-[60vh] w-full overflow-hidden rounded-b-[3rem] shadow-2xl">
          <img 
            src={post.image} 
            alt={post.title} 
            className="absolute inset-0 w-full h-full object-cover animate-pop"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-brand-dark/90" />
          
          <div className="absolute bottom-0 left-0 right-0 p-6 pb-12 z-10">
              <span className="inline-block bg-brand-purple/90 backdrop-blur-md text-white px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider mb-4 shadow-lg border border-white/10">
                  {post.category}
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-4 drop-shadow-lg tracking-tight">
                  {post.title}
              </h1>
              
              <div className="flex items-center gap-4 text-white/90">
                  <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-lg border border-white/20">
                          {post.authorAvatar}
                      </div>
                      <div className="text-xs font-bold">
                          <p className="opacity-70 uppercase tracking-widest text-[9px]">Автор</p>
                          <p>{post.author}</p>
                      </div>
                  </div>
                  <div className="h-8 w-px bg-white/20"></div>
                  <div className="text-xs font-bold">
                      <p className="opacity-70 uppercase tracking-widest text-[9px]">Время</p>
                      <p>{post.readTime} чтения</p>
                  </div>
              </div>
          </div>
      </div>

      {/* Content Container */}
      <div className="px-4 relative z-20 -mt-8">
          <div className="bg-white rounded-[2.5rem] shadow-xl p-6 md:p-10 text-gray-800 leading-relaxed text-lg font-medium border border-gray-100">
             
             {/* Dynamic Content Rendering */}
             {post.content.map((block, idx) => {
                 const contentBlock = (
                    <React.Fragment key={idx}>
                        {block.type === 'h2' && (
                             <h2 className="text-2xl font-black text-brand-dark mt-10 mb-5 tracking-tight">
                                 {block.text}
                             </h2>
                        )}
                        {block.type === 'paragraph' && (
                             <p className="mb-5 text-gray-600">
                                 {block.text}
                             </p>
                        )}
                        {block.type === 'quote' && (
                             <div className="my-10 relative pl-6 border-l-4 border-brand-purple bg-purple-50/50 p-6 rounded-r-2xl">
                                 <p className="text-xl font-bold italic text-brand-dark/80">
                                     "{block.text}"
                                 </p>
                             </div>
                        )}
                        {block.type === 'list' && (
                             <ul className="space-y-4 mb-8 bg-gray-50 p-6 rounded-3xl">
                                 {block.items?.map((item, i) => (
                                     <li key={i} className="flex items-start gap-3 text-gray-700">
                                         <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-sm">
                                             {i + 1}
                                         </div>
                                         <span>{item}</span>
                                     </li>
                                 ))}
                             </ul>
                        )}
                    </React.Fragment>
                 );

                 // Inject CTA after the 3rd block (usually Intro + H2 + First Paragraph)
                 // This catches the user when they are engaged but not yet finished.
                 if (idx === 2) {
                     return (
                         <React.Fragment key={`cta-${idx}`}>
                             {contentBlock}
                             {renderInlineCTA()}
                         </React.Fragment>
                     );
                 }

                 return contentBlock;
             })}

             {/* Divider */}
             <div className="h-px bg-gray-100 my-12 w-full" />

             {/* Recommendations Section */}
             <div className="mb-12">
                <h3 className="text-2xl font-black text-brand-dark mb-6 tracking-tight">Читайте также</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {recommendations.map(rec => (
                        <div 
                            key={rec.id}
                            onClick={() => handleRecommendationClick(rec.id)}
                            className="group cursor-pointer bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 rounded-[2rem] p-4 flex gap-4 transition-all hover:shadow-lg hover:-translate-y-1"
                        >
                            <div className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden relative">
                                <img src={rec.image} alt={rec.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            </div>
                            <div className="flex flex-col justify-center">
                                <span className="text-[10px] font-bold uppercase text-gray-400 mb-1 tracking-wider">{rec.category}</span>
                                <h4 className="font-bold text-brand-dark leading-tight line-clamp-2 group-hover:text-brand-blue transition-colors">
                                    {rec.title}
                                </h4>
                                <div className="mt-2 text-xs font-bold text-gray-400 flex items-center gap-1 group-hover:text-brand-blue">
                                    Читать 
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
             </div>

             {/* Bottom CTA Interaction */}
             <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-8 text-center relative overflow-hidden shadow-2xl">
                 <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                 <div className="relative z-10">
                    <Mascot emotion="happy" className="w-24 h-24 mx-auto mb-4" />
                    <h3 className="font-black text-white text-2xl mb-2">Понравилась статья?</h3>
                    <p className="text-indigo-100 text-base mb-8 max-w-sm mx-auto font-medium">
                        Наш умный алгоритм уже изучил эти советы и готов применить их на практике для вас.
                    </p>
                    <Button 
                        onClick={() => {
                            track('blog_bottom_cta_click');
                            navigate('/quiz');
                        }} 
                        fullWidth
                        variant="secondary"
                        className="py-4 text-lg shadow-xl"
                    >
                        Подобрать подарок
                    </Button>
                 </div>
             </div>

          </div>
      </div>
    </div>
  );
};