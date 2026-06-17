import { useState, useEffect } from 'react';
import { 
  blogsList, BlogItem, BlogSection 
} from '../data/blogsData';
import { 
  ArrowLeft, Search, Calendar, Clock, User, Tag, 
  BookOpen, ChevronRight, Share2, Printer, CheckCircle, Lightbulb, Copy
} from 'lucide-react';

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
      <div className="w-full bg-[#0D1117] text-[#C9D1D9] py-10 md:py-16 selection:bg-[#58A6FF]/20 selection:text-[#58A6FF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* SEO Structured Keywords Helper Inside DOM */}
          <meta name="keywords" content={activeBlog.keywords.join(', ')} />
          <meta name="description" content={activeBlog.summary} />
          
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-8">
            <button onClick={() => onPageChange('home')} className="hover:text-[#58A6FF] transition-colors cursor-pointer">
              Home
            </button>
            <ChevronRight className="w-3 h-3" />
            <button onClick={() => onPageChange('blogs')} className="hover:text-[#58A6FF] transition-colors cursor-pointer">
              Guides
            </button>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#C9D1D9] truncate max-w-[200px] sm:max-w-none">
              {activeBlog.title}
            </span>
          </nav>

          {/* Return button */}
          <button
            onClick={() => onPageChange('blogs')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#21262D] border border-[#30363D] hover:bg-[#30363D] text-xs font-bold text-[#E6EDF3] transition-colors mb-8 cursor-pointer select-none"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Banking Guides</span>
          </button>

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left Column: Extensive Content (lg:col-span-8) */}
            <article className="lg:col-span-8 flex flex-col">
              
              {/* Category tag */}
              <span className="px-3 py-1 rounded-full bg-[#58A6FF]/10 border border-[#58A6FF]/20 text-xs font-bold text-[#58A6FF] w-fit mb-4 uppercase tracking-wider">
                {activeBlog.category}
              </span>

              {/* Title display */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#E6EDF3] tracking-tight leading-tight mb-6">
                {activeBlog.title}
              </h1>

              {/* Meta information strip */}
              <div className="flex flex-wrap items-center gap-y-4 gap-x-6 pb-6 border-b border-[#30363D] mb-8 text-xs text-[#8B949E] font-medium">
                <div className="flex items-center gap-1.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1F6FEB] to-[#58A6FF] flex items-center justify-center text-white font-bold font-mono">
                    DS
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[#E6EDF3] font-bold text-xs">{activeBlog.author}</span>
                    <span className="text-[10px] leading-tight text-[#8B949E]">{activeBlog.role}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#8B949E]" />
                  <span>{activeBlog.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#7EE787]" />
                  <span className="text-[#7EE787] font-bold font-mono">{activeBlog.readTime}</span>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-lg bg-[#21262D] hover:bg-[#30363D] border border-[#30363D] text-[#8B949E] hover:text-[#C9D1D9] transition-all cursor-pointer flex items-center gap-1.5 font-bold"
                    title="Copy URL"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span className="text-[11px] uppercase tracking-wider">{blogShared ? 'Copied!' : 'Share'}</span>
                  </button>
                </div>
              </div>

              {/* Hero Featured Image */}
              <div className="w-full h-64 sm:h-96 rounded-2xl overflow-hidden bg-[#161B22] border border-[#30363D] mb-10 shadow-lg relative">
                <img 
                  src={activeBlog.featuredImage} 
                  alt={activeBlog.title} 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Summary Block */}
              <div className="bg-[#1C2128] border-l-4 border-[#58A6FF] rounded-r-xl p-5 mb-8 leading-relaxed italic text-sm text-[#C9D1D9]">
                &ldquo; {activeBlog.summary} &rdquo;
              </div>

              {/* In-article Table of Contents for Mobile View (Collapsible) */}
              <div className="lg:hidden p-5 bg-[#161B22] border border-[#30363D] rounded-xl mb-8">
                <span className="text-xs font-bold text-[#8B949E] uppercase tracking-wider block mb-3">
                  Jump to Section
                </span>
                <ul className="space-y-2">
                  {activeBlog.tableOfContents.map((toc) => (
                    <li key={`mob-toc-${toc.id}`}>
                      <button
                        onClick={() => handleTocClick(toc.id)}
                        className={`text-xs text-left font-medium hover:text-[#58A6FF] transition-colors leading-relaxed block ${
                          activeSectionId === toc.id ? 'text-[#58A6FF] font-bold' : 'text-[#8B949E]'
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
                {activeBlog.sections.map((sec) => (
                  <section key={sec.id} id={sec.id} className="scroll-mt-24">
                    <h2 className="text-xl sm:text-2xl font-black text-[#E6EDF3] tracking-tight pb-2 border-b border-[#30363D] mb-4">
                      {sec.title}
                    </h2>
                    <div className="space-y-4 text-xs sm:text-sm text-[#C9D1D9] leading-relaxed tracking-wide antialiased">
                      {sec.text.map((p, idx) => (
                        <p key={`${sec.id}-p-${idx}`} className="text-justify font-sans">
                          {p}
                        </p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              {/* Concluding Box Component */}
              <div className="bg-gradient-to-r from-[#1F242C] to-[#161B22] border border-[#30363D] rounded-2xl p-6 md:p-8 mt-12 mb-10 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <BookOpen className="w-24 h-24 text-white" />
                </div>
                <h3 className="text-lg font-extrabold text-[#7EE787] flex items-center gap-2 mb-3">
                  <Lightbulb className="w-5 h-5" />
                  <span>{activeBlog.conclusion.title}</span>
                </h3>
                <p className="text-xs sm:text-sm text-[#8B949E] leading-relaxed">
                  {activeBlog.conclusion.text}
                </p>
              </div>

              {/* Keywords Tag Cloud */}
              <div className="pb-8 border-b border-[#30363D] mb-10">
                <span className="text-xs font-bold text-[#8B949E] uppercase tracking-wider block mb-3">
                  SEO Target Keywords
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeBlog.keywords.map((key) => (
                    <span 
                      key={key} 
                      className="px-2.5 py-1 bg-[#21262D] border border-[#30363D] rounded-lg text-xs font-mono font-semibold text-[#8B949E] flex items-center gap-1.5"
                    >
                      <Tag className="w-3 h-3 text-[#58A6FF]" />
                      {key}
                    </span>
                  ))}
                </div>
              </div>

              {/* Call to search CTA */}
              <div className="bg-[#1f242c]/50 border border-[#30363D] rounded-2xl p-6 text-center shadow-lg">
                <h4 className="text-base font-bold text-[#E6EDF3] mb-2">Need to verify an IFSC Immediately?</h4>
                <p className="text-xs text-[#8B949E] max-w-md mx-auto mb-5 leading-normal">
                  Our core parallel index database has over 173,000+ branches mapped perfectly. Run checkups right away.
                </p>
                <button
                  onClick={() => onPageChange('search')}
                  className="py-2.5 px-6 rounded-lg bg-[#238636] hover:bg-[#2ea043] font-bold text-xs text-white uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Launch IFSC search tool
                </button>
              </div>

            </article>

            {/* Right Column: Sticky Table of Contents Sidebar (lg:col-span-4) */}
            <aside className="hidden lg:col-span-4 lg:block">
              <div className="sticky top-28 bg-[#161B22] border border-[#30363D] rounded-2xl p-6 shadow-xl">
                
                {/* Author Info */}
                <div className="pb-5 border-b border-[#30363D] mb-5">
                  <span className="text-xs font-bold text-[#8B949E] uppercase tracking-wider block mb-3">
                    Guide Author
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#1F6FEB] to-[#58A6FF] flex items-center justify-center text-white text-lg font-black font-mono shadow-md">
                      DS
                    </div>
                    <div>
                      <span className="font-extrabold text-sm text-[#E6EDF3] block">{activeBlog.author}</span>
                      <span className="text-[11px] font-medium text-[#8B949E]">{activeBlog.role}</span>
                    </div>
                  </div>
                </div>

                {/* Table of Contents Header */}
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-4 h-4 text-[#58A6FF]" />
                  <span className="text-xs font-extrabold text-[#E6EDF3] uppercase tracking-wider">
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
                        className={`w-full text-left p-2.5 rounded-lg text-xs font-medium leading-relaxed transition-all cursor-pointer block border-l-2 ${
                          isActive 
                            ? 'bg-[#1F242C] border-l-[#58A6FF] text-[#58A6FF] font-bold translate-x-1' 
                            : 'border-l-transparent text-[#8B949E] hover:bg-[#1C2128] hover:text-[#C9D1D9]'
                        }`}
                      >
                        {toc.title}
                      </button>
                    );
                  })}
                </nav>

                {/* Safe Seal badge */}
                <div className="mt-8 pt-6 border-t border-[#30363D] flex items-center gap-2 text-[10.5px] text-[#8B949E]">
                  <CheckCircle className="w-4 h-4 text-[#7EE787]" />
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
    <div className="w-full bg-[#0D1117] text-[#C9D1D9] py-12 md:py-20 relative selection:bg-[#58A6FF]/20 selection:text-[#58A6FF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Title Block */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-extrabold text-[#58A6FF] uppercase tracking-widest bg-[#1F242C] px-3 py-1 border border-[#30363D] rounded-full">
            Knowledge Reserve
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#E6EDF3] tracking-tight mt-4">
            National Banking Knowledge Guides & Insights
          </h1>
          <p className="text-xs sm:text-sm text-[#8B949E] mt-3 leading-relaxed">
            Exquisite, deeply structured resources covering payment clearing processing limits, IFSC security safety audits, and modern digital fintech mechanics.
          </p>
        </div>

        {/* Directory Controls (Search Bar & Category Selecter) */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          
          {/* Keyword search bar */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-[#8B949E] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search guides by title, summaries, or keywords (e.g. 'UPI', 'SWIFT')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#161B22] border border-[#30363D] hover:border-[#8B949E] focus:border-[#58A6FF] rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#58A6FF]"
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
                    ? 'bg-[#1f242c] text-[#58A6FF] border border-[#58A6FF]'
                    : 'bg-[#161B22] text-[#8B949E] border border-[#30363D] hover:text-[#C9D1D9] hover:bg-[#21262D]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>

        {/* Blog Article Cards Directory Grid */}
        {filteredBlogs.length === 0 ? (
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-16 text-center">
            <BookOpen className="w-12 h-12 text-[#8B949E] mx-auto mb-4 opacity-50" />
            <p className="font-bold text-[#E6EDF3] mb-2">No Guides Match Your Selection</p>
            <p className="text-xs text-[#8B949E] max-w-sm mx-auto leading-normal">
              Try updating your keywords or resetting your search filter options to view other items.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="mt-6 py-2 px-5 rounded-lg bg-[#21262D] border border-[#30363D] text-[#8B949E] hover:text-[#C9D1D9] text-xs font-bold transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.map((blog) => (
              <article 
                key={blog.id} 
                className="bg-[#161B22] border border-[#30363D] rounded-2xl overflow-hidden shadow-lg flex flex-col hover:border-[#58A6FF] transition-all group"
              >
                {/* Card Featured Image */}
                <div className="h-52 bg-[#0D1117] overflow-hidden relative">
                  <img 
                    src={blog.featuredImage} 
                    alt={blog.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute top-4 left-4 bg-[#1F242C]/90 text-[10px] font-extrabold text-[#58A6FF] px-2.5 py-0.5 border border-[#30363D] rounded-md backdrop-blur-xs uppercase tracking-wider shadow-sm">
                    {blog.category}
                  </span>
                </div>

                {/* Card Content body */}
                <div className="p-6 flex-1 flex flex-col">
                  
                  {/* Meta strip */}
                  <div className="flex items-center gap-1.5 text-xs text-[#8B949E] font-medium mb-3">
                    <User className="w-3.5 h-3.5 text-[#58A6FF]" />
                    <span>{blog.author}</span>
                    <span>•</span>
                    <Clock className="w-3.5 h-3.5 text-[#7EE787]" />
                    <span className="text-[#7EE787] font-bold font-mono">{blog.readTime}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-[#E6EDF3] group-hover:text-[#58A6FF] transition-colors leading-snug mb-3">
                    {blog.title}
                  </h3>

                  {/* Brief summary */}
                  <p className="text-xs text-[#8B949E] leading-relaxed mb-6 flex-1 text-justify">
                    {blog.summary}
                  </p>

                  {/* Keyword Tags Preview */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {blog.keywords.slice(0, 3).map((key) => (
                      <span key={key} className="text-[10px] font-mono text-[#8B949E] px-2 py-0.5 bg-[#21262D] rounded-md border border-[#30363D]">
                        #{key.replace(/\s+/g, '').replace('/', '')}
                      </span>
                    ))}
                  </div>

                  {/* Actions buttons */}
                  <button
                    onClick={() => onPageChange('blog-detail', blog.slug)}
                    className="text-xs font-bold text-[#58A6FF] hover:text-[#79C0FF] flex items-center gap-1.5 self-start cursor-pointer hover:translate-x-1 transition-transform"
                  >
                    <span>Read Full 1,200+ Word Guide</span>
                    <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                  </button>

                </div>

              </article>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
