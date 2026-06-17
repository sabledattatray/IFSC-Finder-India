import { useState, useEffect } from 'react';
import { 
  blogsList, BlogItem, BlogSection 
} from '../data/blogsData';
import { 
  ArrowLeft, Search, Calendar, Clock, User, Tag, 
  BookOpen, ChevronRight, Share2, Printer, CheckCircle, Lightbulb, Copy
} from 'lucide-react';
import { AnimatedSection, StaggerContainer, StaggerItem } from './animations/AnimatedSection';

interface BlogPageProps {
  selectedSlug: string | null;
  onPageChange: (page: 'home' | 'search' | 'blogs' | 'blog-detail' | 'privacy' | 'terms' | 'disclaimer', slug?: string) => void;
}

export default function BlogPage({ selectedSlug, onPageChange }: BlogPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeSectionId, setActiveSectionId] = useState<string>('');
  const [blogShared, setBlogShared] = useState(false);

  // Auto-scroll to top when a blog loads
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }, [selectedSlug]);

  const categories = ['All', 'Banking Standards', 'Payment Rails', 'Cross-Border Banking', 'Cybersecurity', 'Fintech Innovation', 'Financial Inclusion'];

  // Match keyword search or title text matches
  const filteredBlogs = blogsList.filter(blog => {
    const matchesQuery = 
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || blog.category === selectedCategory;
    
    return matchesQuery && matchesCategory;
  });

  const activeBlog = blogsList.find(b => b.slug === selectedSlug);

  // Setup dynamic TOC scroll tracker if detailed view is open
  useEffect(() => {
    if (!activeBlog) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200; // Offset for sticky header
      
      let currentSection = '';
      for (const section of activeBlog.sections) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            currentSection = section.id;
          }
        }
      }
      setActiveSectionId(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeBlog]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setBlogShared(true);
      setTimeout(() => setBlogShared(false), 2500);
    }
  };

  const handleTocClick = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      const topOffset = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({
        top: topOffset,
        behavior: 'smooth'
      });
      setActiveSectionId(sectionId);
    }
  };

  // 1. RENDER DETAILED ARTICLE VIEW
  if (activeBlog) {
    return (
      <div className="w-full text-[#E2E8F0] py-10 md:py-16 selection:bg-[#00C2FF]/20 selection:text-[#00C2FF] mesh-gradient grid-pattern noise-overlay">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <meta name="keywords" content={activeBlog.keywords.join(', ')} />
          <meta name="description" content={activeBlog.summary} />
          
          {/* Breadcrumb Navigation */}
          <AnimatedSection direction="down" delay={0.1}>
            <nav className="flex items-center gap-2 text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-6">
              <button onClick={() => onPageChange('home')} className="hover:text-[#00C2FF] transition-colors cursor-pointer">
                Home
              </button>
              <ChevronRight className="w-3 h-3 text-[#64748B]" />
              <button onClick={() => onPageChange('blogs')} className="hover:text-[#00C2FF] transition-colors cursor-pointer">
                Guides
              </button>
              <ChevronRight className="w-3 h-3 text-[#64748B]" />
              <span className="text-white truncate max-w-[200px] sm:max-w-none">
                {activeBlog.title}
              </span>
            </nav>
          </AnimatedSection>

          {/* Return button */}
          <AnimatedSection direction="left" delay={0.15}>
            <button
              onClick={() => onPageChange('blogs')}
              className="btn-secondary !py-2.5 !px-5 text-xs flex items-center gap-2 mb-8 cursor-pointer select-none"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Banking Guides</span>
            </button>
          </AnimatedSection>

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left Column: Extensive Content (lg:col-span-8) */}
            <article className="lg:col-span-8 flex flex-col">
              
              <AnimatedSection direction="up" delay={0.2}>
                {/* Category tag */}
                <span className="px-3 py-1 rounded-full bg-[#00C2FF]/10 border border-[#00C2FF]/20 text-xs font-bold text-[#00C2FF] w-fit mb-4 uppercase tracking-wider">
                  {activeBlog.category}
                </span>

                {/* Title display */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-6">
                  {activeBlog.title}
                </h1>

                {/* Meta information strip */}
                <div className="flex flex-wrap items-center gap-y-4 gap-x-6 pb-6 border-b border-white/[0.06] mb-8 text-xs text-[#94A3B8] font-medium">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0057D9] to-[#00C2FF] flex items-center justify-center text-white font-bold font-mono">
                      DS
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white font-bold text-xs leading-none mb-0.5">{activeBlog.author}</span>
                      <span className="text-[10px] text-[#64748B]">{activeBlog.role}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#94A3B8]" />
                    <span>{activeBlog.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#00E5A0]" />
                    <span className="text-[#00E5A0] font-bold font-mono">{activeBlog.readTime}</span>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <button
                      onClick={handleShare}
                      className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[#94A3B8] hover:text-white transition-all cursor-pointer flex items-center gap-1.5 font-semibold"
                      title="Copy URL"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span className="text-[10px] uppercase tracking-wider">{blogShared ? 'Copied!' : 'Share'}</span>
                    </button>
                  </div>
                </div>
              </AnimatedSection>

              {/* Hero Featured Image */}
              <AnimatedSection direction="none" delay={0.25} className="w-full h-64 sm:h-96 rounded-2xl overflow-hidden bg-[#0F172A] border border-white/[0.06] mb-10 shadow-lg relative">
                <img 
                  src={activeBlog.featuredImage} 
                  alt={activeBlog.title} 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                />
              </AnimatedSection>

              {/* Summary Block */}
              <AnimatedSection direction="up" delay={0.3} className="glass-card-strong border-l-4 border-l-[#00C2FF] !rounded-l-none !bg-[#0F172A]/50 p-5 mb-8 leading-relaxed italic text-sm text-slate-200">
                &ldquo; {activeBlog.summary} &rdquo;
              </AnimatedSection>

              {/* In-article Table of Contents for Mobile View (Collapsible) */}
              <div className="lg:hidden p-5 bg-[#0F172A]/40 border border-white/[0.06] rounded-2xl mb-8">
                <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-3">
                  Jump to Section
                </span>
                <ul className="space-y-2">
                  {activeBlog.tableOfContents.map((toc) => (
                    <li key={`mob-toc-${toc.id}`}>
                      <button
                        onClick={() => handleTocClick(toc.id)}
                        className={`text-xs text-left font-medium hover:text-[#00C2FF] transition-colors leading-relaxed block ${
                          activeSectionId === toc.id ? 'text-[#00C2FF] font-bold' : 'text-[#64748B]'
                        }`}
                      >
                        {toc.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Render Sections with beautiful prose structure */}
              <div className="space-y-12">
                {activeBlog.sections.map((sec, idx) => (
                  <AnimatedSection key={sec.id} id={sec.id} direction="up" delay={0.1 + (idx * 0.05)} className="scroll-mt-24">
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight pb-2 border-b border-white/[0.06] mb-4">
                      {sec.title}
                    </h2>
                    <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed tracking-wide antialiased">
                      {sec.text.map((p, pidx) => (
                        <p key={`${sec.id}-p-${pidx}`} className="text-justify font-sans">
                          {p}
                        </p>
                      ))}
                    </div>
                  </AnimatedSection>
                ))}
              </div>

              {/* Concluding Box Component */}
              <AnimatedSection direction="up" delay={0.4} className="glass-card p-6 md:p-8 mt-12 mb-10 shadow-lg relative overflow-hidden bg-gradient-to-r from-[#0F172A]/60 to-[#070d19]/60">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <BookOpen className="w-24 h-24 text-white" />
                </div>
                <h3 className="text-base font-extrabold text-[#00E5A0] flex items-center gap-2 mb-3">
                  <Lightbulb className="w-5 h-5" />
                  <span>{activeBlog.conclusion.title}</span>
                </h3>
                <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                  {activeBlog.conclusion.text}
                </p>
              </AnimatedSection>

              {/* Keywords Tag Cloud */}
              <AnimatedSection direction="up" delay={0.45} className="pb-8 border-b border-white/[0.06] mb-10">
                <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-3">
                  SEO Target Keywords
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeBlog.keywords.map((key) => (
                    <span 
                      key={key} 
                      className="px-3 py-1 bg-white/[0.03] border border-white/[0.05] rounded-xl text-xs font-mono font-semibold text-[#94A3B8] flex items-center gap-1.5 hover:text-white hover:border-white/[0.1] transition-colors"
                    >
                      <Tag className="w-3 h-3 text-[#00C2FF]" />
                      {key}
                    </span>
                  ))}
                </div>
              </AnimatedSection>

              {/* Call to search CTA */}
              <AnimatedSection direction="up" delay={0.5} className="glass-card-strong p-6 text-center shadow-lg bg-[#0F172A]/40">
                <h4 className="text-base font-bold text-white mb-2">Need to verify an IFSC Immediately?</h4>
                <p className="text-xs text-[#94A3B8] max-w-md mx-auto mb-5 leading-relaxed">
                  Our core parallel index database has over 173,000+ branches mapped perfectly. Run checkups right away.
                </p>
                <button
                  onClick={() => onPageChange('search')}
                  className="btn-primary text-xs font-bold uppercase tracking-wider !py-3 !px-6"
                >
                  Launch IFSC search tool
                </button>
              </AnimatedSection>

            </article>

            {/* Right Column: Table of Contents Sidebar (lg:col-span-4) */}
            <aside className="hidden lg:col-span-4 lg:block">
              <div className="sticky top-28 glass-card p-6 shadow-xl bg-[#0F172A]/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#0057D9]/5 rounded-full blur-[25px] pointer-events-none" />
                
                {/* Author Info */}
                <div className="pb-5 border-b border-white/[0.06] mb-5">
                  <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-3">
                    Guide Author
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#0057D9] to-[#00C2FF] flex items-center justify-center text-white text-lg font-black font-mono shadow-md shadow-[#0057D9]/10">
                      DS
                    </div>
                    <div>
                      <span className="font-extrabold text-sm text-white block">{activeBlog.author}</span>
                      <span className="text-[11px] font-medium text-[#64748B]">{activeBlog.role}</span>
                    </div>
                  </div>
                </div>

                {/* Table of Contents Header */}
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-4 h-4 text-[#00C2FF]" />
                  <span className="text-xs font-extrabold text-white uppercase tracking-wider">
                    Table of Contents
                  </span>
                </div>

                {/* TOC List elements */}
                <nav className="space-y-1">
                  {activeBlog.tableOfContents.map((toc) => {
                    const isActive = activeSectionId === toc.id;
                    return (
                      <button
                        key={`side-toc-${toc.id}`}
                        onClick={() => handleTocClick(toc.id)}
                        className={`w-full text-left p-2.5 rounded-xl text-xs font-medium leading-relaxed transition-all cursor-pointer block border-l-2 ${
                          isActive 
                            ? 'bg-white/[0.03] border-l-[#00C2FF] text-[#00C2FF] font-bold translate-x-1.5' 
                            : 'border-l-transparent text-[#94A3B8] hover:bg-white/[0.01] hover:text-white'
                        }`}
                      >
                        {toc.title}
                      </button>
                    );
                  })}
                </nav>

                {/* Safe Seal badge */}
                <div className="mt-8 pt-6 border-t border-white/[0.06] flex items-center gap-2 text-[10.5px] text-[#64748B]">
                  <CheckCircle className="w-4 h-4 text-[#00E5A0]" />
                  <span>100% Sourced from Official RBI Registers</span>
                </div>

              </div>
            </aside>

          </div>

        </div>
      </div>
    );
  }

  // 2. RENDER THE PRIMARY DIRECTORY VIEW
  return (
    <div className="w-full text-[#E2E8F0] py-12 md:py-20 relative selection:bg-[#00C2FF]/20 selection:text-[#00C2FF] mesh-gradient grid-pattern noise-overlay">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Page Title Block */}
        <AnimatedSection direction="down" className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-extrabold text-[#00C2FF] uppercase tracking-widest bg-white/[0.03] px-3.5 py-1.5 border border-white/[0.08] rounded-full shadow-md">
            Knowledge Reserve
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mt-5">
            National Banking Knowledge Guides & Insights
          </h1>
          <p className="text-sm text-[#94A3B8] mt-3 leading-relaxed">
            Exquisite, deeply structured resources covering payment clearing processing limits, IFSC security safety audits, and modern digital fintech mechanics.
          </p>
        </AnimatedSection>

        {/* Directory Controls (Search Bar & Category Selecter) */}
        <AnimatedSection direction="up" className="flex flex-col md:flex-row gap-4 mb-10">
          
          {/* Keyword search bar */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search guides by title, summaries, or keywords (e.g. 'UPI', 'SWIFT')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0F172A]/50 border border-white/[0.06] hover:border-[#64748B] focus:border-[#00C2FF] rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#00C2FF]"
            />
          </div>

          {/* Category drop selection pill row */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-white/[0.04] text-[#00C2FF] border border-[#00C2FF]'
                    : 'bg-white/[0.01] text-[#94A3B8] border border-white/[0.05] hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </AnimatedSection>

        {/* Blog Article Cards Directory Grid */}
        {filteredBlogs.length === 0 ? (
          <AnimatedSection direction="none" className="glass-card p-16 text-center border-white/[0.05]">
            <BookOpen className="w-12 h-12 text-[#64748B] mx-auto mb-4 opacity-50" />
            <p className="font-bold text-white mb-2">No Guides Match Your Selection</p>
            <p className="text-xs text-[#94A3B8] max-w-sm mx-auto leading-normal">
              Try updating your keywords or resetting your search filter options to view other items.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="btn-secondary !py-2 !px-5 text-xs font-bold mt-6"
            >
              Reset Filters
            </button>
          </AnimatedSection>
        ) : (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.map((blog) => (
              <StaggerItem key={blog.id}>
                <div 
                  className="glass-card overflow-hidden shadow-lg flex flex-col hover:border-[#00C2FF]/30 transition-all duration-300 group h-full"
                >
                  {/* Card Featured Image */}
                  <div className="h-52 bg-[#081120] overflow-hidden relative">
                    <img 
                      src={blog.featuredImage} 
                      alt={blog.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-4 left-4 bg-[#081120]/90 text-[10px] font-extrabold text-[#00C2FF] px-2.5 py-0.5 border border-white/[0.08] rounded-md backdrop-blur-md uppercase tracking-wider shadow-sm">
                      {blog.category}
                    </span>
                  </div>

                  {/* Card Content body */}
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      {/* Meta strip */}
                      <div className="flex items-center gap-1.5 text-xs text-[#94A3B8] font-medium mb-3">
                        <User className="w-3.5 h-3.5 text-[#00C2FF]" />
                        <span>{blog.author}</span>
                        <span>•</span>
                        <Clock className="w-3.5 h-3.5 text-[#00E5A0]" />
                        <span className="text-[#00E5A0] font-bold font-mono">{blog.readTime}</span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-bold text-white group-hover:text-[#00C2FF] transition-colors leading-snug mb-3">
                        {blog.title}
                      </h3>

                      {/* Brief summary */}
                      <p className="text-xs text-[#94A3B8] leading-relaxed mb-5 text-justify group-hover:text-slate-300 transition-colors">
                        {blog.summary}
                      </p>

                      {/* Keyword Tags Preview */}
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {blog.keywords.slice(0, 3).map((key) => (
                          <span key={key} className="text-[10px] font-mono text-[#64748B] px-2.5 py-0.5 bg-white/[0.02] rounded-md border border-white/[0.05]">
                            #{key.replace(/\s+/g, '').replace('/', '')}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions buttons */}
                    <button
                      onClick={() => onPageChange('blog-detail', blog.slug)}
                      className="text-xs font-bold text-[#00C2FF] hover:text-[#00E5A0] flex items-center gap-1.5 self-start cursor-pointer hover:translate-x-1.5 transition-transform"
                    >
                      <span>Read Full 1,200+ Word Guide</span>
                      <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                    </button>

                  </div>

                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

      </div>
    </div>
  );
}
