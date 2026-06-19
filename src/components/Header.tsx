import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building, ChevronDown, Globe, FileText, MapPin, Map, 
  ShieldAlert, BookOpen, Clock, Landmark, CreditCard, ShieldCheck, 
  HelpCircle, Menu, X, ArrowUpRight, Search, Activity
} from 'lucide-react';

interface HeaderProps {
  currentPage: 'home' | 'search' | 'blogs' | 'blog-detail' | 'privacy' | 'terms' | 'disclaimer';
  onPageChange: (page: 'home' | 'search' | 'blogs' | 'blog-detail' | 'privacy' | 'terms' | 'disclaimer', slug?: string) => void;
  onSearchModeChange: (mode: 'master' | 'ifsc' | 'location' | 'pincode') => void;
  favoritesCount: number;
  onToggleMobileNav: () => void;
}

export default function Header({
  currentPage,
  onPageChange,
  onSearchModeChange,
  favoritesCount,
  onToggleMobileNav
}: HeaderProps) {
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const megaMenuRef = useRef<HTMLDivElement>(null);

  // Monitor scroll for glass transition
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mega menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target as Node)) {
        setMegaMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleQuickLink = (mode: 'master' | 'ifsc' | 'location' | 'pincode') => {
    onSearchModeChange(mode);
    onPageChange('search');
    setMegaMenuOpen(false);
    setMobileMenuOpen(false);
  };

  const navItems = [
    { label: 'Home', page: 'home' as const },
    { label: 'Search Engine', page: 'search' as const },
    { label: 'Banking Guides', page: 'blogs' as const },
  ];

  return (
    <>
      {/* Spacer to push content below the fixed header */}
      <div className="h-16 md:h-20 w-full shrink-0"></div>

      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-[#081120]/85 backdrop-blur-2xl border-b border-white/[0.06] shadow-2xl shadow-black/25"
            : "bg-[#081120]/30 backdrop-blur-md border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            
            {/* Logo Brand */}
            <Link 
              to="/"
              onClick={() => { setMegaMenuOpen(false); }} 
              className="flex items-center gap-3 cursor-pointer select-none group"
            >
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#0057D9] to-[#00C2FF] text-white shadow-lg shadow-[#0057D9]/20 group-hover:scale-105 transition-all duration-300">
                <Building className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base md:text-lg text-white tracking-tight group-hover:text-[#00C2FF] transition-colors leading-none mb-1.5" style={{ fontFamily: 'var(--font-outfit)' }}>
                  IFSC Finder
                </span>
                <span className="text-[9px] uppercase font-bold tracking-widest text-[#64748B] leading-none">
                  National Directory
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Link bar */}
            <nav className="hidden md:flex items-center gap-1.5">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.page === 'home' ? '/' : `/${item.page}`}
                  onClick={() => {
                    setMegaMenuOpen(false);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                    currentPage === item.page
                      ? 'text-white bg-white/[0.04] border border-white/[0.08]'
                      : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.02] border border-transparent'
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {/* Resources Trigger - Mega Menu */}
              <div className="relative" ref={megaMenuRef}>
                <button
                  onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                    megaMenuOpen
                      ? 'text-white bg-white/[0.04]'
                      : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.02]'
                  }`}
                >
                  <span>Directories & Tools</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${megaMenuOpen ? 'rotate-180 text-[#00C2FF]' : 'text-[#64748B]'}`} />
                </button>

                {/* Mega Menu Dropdown */}
                <AnimatePresence>
                  {megaMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 12, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 12, scale: 0.97 }}
                      transition={{ type: "spring", damping: 16, stiffness: 140 }}
                      className="absolute left-1/2 -translate-x-[70%] mt-3 pt-2 w-[760px]"
                    >
                      <div className="glass-card-strong !bg-[#070d19]/95 border border-white/[0.08] p-6 grid grid-cols-3 gap-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] backdrop-blur-3xl relative overflow-hidden">
                        {/* Radial Glows */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#0057D9]/10 rounded-full blur-[40px] pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#00C2FF]/5 rounded-full blur-[35px] pointer-events-none" />
                        
                        {/* Column 1: Core Search Modes */}
                        <div className="flex flex-col gap-3.5 relative z-10 pr-2">
                          <div className="flex items-center gap-2 pb-2.5 border-b border-white/[0.06]">
                            <span className="w-1 h-3 rounded-full bg-gradient-to-b from-[#0057D9] to-[#00C2FF]" />
                            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Search Engine</span>
                          </div>
                          <ul className="space-y-1">
                            <li>
                              <button
                                onClick={() => handleQuickLink('master')}
                                className="w-full text-left p-2 rounded-xl hover:bg-white/[0.03] border border-transparent hover:border-white/[0.04] transition-all duration-300 group flex flex-col"
                              >
                                <span className="text-sm font-semibold text-slate-200 group-hover:text-white flex items-center gap-1">
                                  Master AI Search <ArrowUpRight className="w-3.5 h-3.5 text-[#00C2FF] opacity-0 group-hover:opacity-100 transition-opacity" />
                                </span>
                                <span className="text-[11px] text-[#64748B] mt-1 leading-normal group-hover:text-slate-400">
                                  Parallel lookup across files and live web simultaneously.
                                </span>
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => handleQuickLink('ifsc')}
                                className="w-full text-left p-2 rounded-xl hover:bg-white/[0.03] border border-transparent hover:border-white/[0.04] transition-all duration-300 group flex flex-col"
                              >
                                <span className="text-sm font-semibold text-slate-200 group-hover:text-white">IFSC Verification</span>
                                <span className="text-[11px] text-[#64748B] mt-1 leading-normal group-hover:text-slate-400">
                                  Verify 11-digit alphanumeric branch codes directly.
                                </span>
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => handleQuickLink('location')}
                                className="w-full text-left p-2 rounded-xl hover:bg-white/[0.03] border border-transparent hover:border-white/[0.04] transition-all duration-300 group flex flex-col"
                              >
                                <span className="text-sm font-semibold text-slate-200 group-hover:text-white">Location Search</span>
                                <span className="text-[11px] text-[#64748B] mt-1 leading-normal group-hover:text-slate-400">
                                  Browse branches by State, District, Taluka & City.
                                </span>
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => handleQuickLink('pincode')}
                                className="w-full text-left p-2 rounded-xl hover:bg-white/[0.03] border border-transparent hover:border-white/[0.04] transition-all duration-300 group flex flex-col"
                              >
                                <span className="text-sm font-semibold text-slate-200 group-hover:text-white">Pincode Directory</span>
                                <span className="text-[11px] text-[#64748B] mt-1 leading-normal group-hover:text-slate-400">
                                  Find coordinates by postal index numbers.
                                </span>
                              </button>
                            </li>
                          </ul>
                        </div>

                        {/* Column 2: Tools & Policy Guides */}
                        <div className="flex flex-col gap-3.5 relative z-10 border-l border-white/[0.05] pl-4">
                          <div className="flex items-center gap-2 pb-2.5 border-b border-white/[0.06]">
                            <span className="w-1 h-3 rounded-full bg-gradient-to-b from-[#00C2FF] to-[#00E5A0]" />
                            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Payments Info</span>
                          </div>
                          <ul className="space-y-1">
                            <li>
                              <button
                                onClick={() => { onPageChange('blogs'); setMegaMenuOpen(false); if(typeof window !== 'undefined') window.scrollTo(0,0); }}
                                className="w-full text-left p-2.5 rounded-xl hover:bg-white/[0.03] border border-transparent hover:border-white/[0.04] transition-all duration-300 group flex gap-2.5"
                              >
                                <div className="w-9 h-9 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center flex-shrink-0 group-hover:bg-[#0057D9]/15 group-hover:border-[#00C2FF]/30 text-[#00C2FF] transition-all">
                                  <Landmark className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm font-semibold text-slate-200 group-hover:text-white leading-none">Core Payment Guide</span>
                                  <span className="text-[11px] text-[#64748B] mt-1.5 leading-normal group-hover:text-slate-400">NEFT, RTGS, and IMPS details.</span>
                                </div>
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => { onPageChange('blogs'); setMegaMenuOpen(false); }}
                                className="w-full text-left p-2.5 rounded-xl hover:bg-white/[0.03] border border-transparent hover:border-white/[0.04] transition-all duration-300 group flex gap-2.5"
                              >
                                <div className="w-9 h-9 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center flex-shrink-0 group-hover:bg-[#00E5A0]/15 group-hover:border-[#00E5A0]/30 text-[#00E5A0] transition-all">
                                  <ShieldCheck className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm font-semibold text-slate-200 group-hover:text-white leading-none">Cybercrime Safety</span>
                                  <span className="text-[11px] text-[#64748B] mt-1.5 leading-normal group-hover:text-slate-400">Guides to avoid banking frauds.</span>
                                </div>
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => { onPageChange('disclaimer'); setMegaMenuOpen(false); }}
                                className="w-full text-left p-2.5 rounded-xl hover:bg-white/[0.03] border border-transparent hover:border-white/[0.04] transition-all duration-300 group flex gap-2.5"
                              >
                                <div className="w-9 h-9 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center flex-shrink-0 group-hover:bg-[#0057D9]/15 group-hover:border-[#0057D9]/30 text-slate-400 transition-all">
                                  <HelpCircle className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm font-semibold text-slate-200 group-hover:text-white leading-none">Disclaimers Register</span>
                                  <span className="text-[11px] text-[#64748B] mt-1.5 leading-normal group-hover:text-slate-400">Data accuracy guidelines.</span>
                                </div>
                              </button>
                            </li>
                          </ul>
                        </div>

                        {/* Column 3: Featured & Legal Links */}
                        <div className="flex flex-col gap-3.5 relative z-10 border-l border-white/[0.05] pl-4">
                          <div className="flex items-center gap-2 pb-2.5 border-b border-white/[0.06]">
                            <span className="w-1 h-3 rounded-full bg-gradient-to-b from-[#0057D9] to-[#00E5A0]" />
                            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Legal Standards</span>
                          </div>
                          <ul className="space-y-1">
                            <li>
                              <button
                                onClick={() => { onPageChange('terms'); setMegaMenuOpen(false); }}
                                className="w-full text-left p-2 rounded-xl hover:bg-white/[0.03] border border-transparent hover:border-white/[0.04] transition-all duration-300 group flex flex-col"
                              >
                                <span className="text-sm font-semibold text-slate-200 group-hover:text-white">Terms of Service</span>
                                <span className="text-[11px] text-[#64748B] mt-1 leading-normal group-hover:text-slate-400">
                                  Official usage and routing accuracy limits.
                                </span>
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => { onPageChange('privacy'); setMegaMenuOpen(false); }}
                                className="w-full text-left p-2 rounded-xl hover:bg-white/[0.03] border border-transparent hover:border-white/[0.04] transition-all duration-300 group flex flex-col"
                              >
                                <span className="text-sm font-semibold text-slate-200 group-hover:text-white">Privacy Policy</span>
                                <span className="text-[11px] text-[#64748B] mt-1 leading-normal group-hover:text-slate-400">
                                  How we handle data and zero logs policy.
                                </span>
                              </button>
                            </li>
                            <li className="pt-2">
                              <button
                                onClick={() => { onPageChange('blogs'); setMegaMenuOpen(false); }}
                                className="w-full text-left p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl hover:bg-white/[0.04] hover:border-white/[0.08] transition-all flex flex-col"
                              >
                                <span className="text-[9px] font-extrabold text-[#00E5A0] px-2 py-0.5 bg-[#00E5A0]/10 border border-[#00E5A0]/20 rounded-full self-start mb-1.5 uppercase tracking-wider">Featured Guide</span>
                                <span className="text-xs font-semibold text-white leading-snug">
                                  Understanding e-Rupee Blockchain in India
                                </span>
                              </button>
                            </li>
                          </ul>
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            {/* Desktop Right Panel (Launch Apps & Favorites) */}
            <div className="hidden md:flex items-center gap-3">
              {currentPage === 'search' ? (
                <button
                  onClick={onToggleMobileNav}
                  className="py-2.5 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-md"
                >
                  <div className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E5A0] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00E5A0]"></span>
                  </div>
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider font-mono">Workspace Storage: {favoritesCount}</span>
                </button>
              ) : (
                <button
                  onClick={() => onPageChange('search')}
                  className="btn-primary text-sm !py-2.5 !px-5 flex items-center gap-2 hover:shadow-[0_0_20px_rgba(0,87,217,0.3)]"
                >
                  <Search className="w-4 h-4" />
                  <span>Launch Search Desk</span>
                </button>
              )}
            </div>

            {/* Mobile Navigation Trigger Button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08] text-[#94A3B8] hover:text-white active:scale-95 transition-all cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>
      </motion.header>

      {/* Mobile Drawer Overlay & Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-[#0F172A] border-l border-white/[0.06] overflow-y-auto z-50 flex flex-col justify-between"
            >
              <div className="p-6 pt-24 space-y-6 flex-1">
                <div className="space-y-1.5">
                  {navItems.map((item) => (
                    <Link
                      key={item.label}
                      to={item.page === 'home' ? '/' : `/${item.page}`}
                      onClick={() => {
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left p-3.5 rounded-xl text-sm font-semibold transition-all block ${
                        currentPage === item.page
                          ? 'text-white bg-white/[0.04] border border-white/[0.08]'
                          : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.02]'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>

                {/* Mobile Mega-Menu Sections */}
                <div className="pt-5 border-t border-white/[0.06] space-y-5">
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block px-3 mb-2.5">Search Directories</span>
                    <div className="grid grid-cols-2 gap-2 px-1">
                      <button
                        onClick={() => handleQuickLink('master')}
                        className="p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/[0.04] text-left flex items-center gap-2"
                      >
                        <Globe className="w-3.5 h-3.5 text-[#00C2FF] flex-shrink-0" />
                        <span>Master</span>
                      </button>
                      <button
                        onClick={() => handleQuickLink('ifsc')}
                        className="p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/[0.04] text-left flex items-center gap-2"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#00E5A0] flex-shrink-0" />
                        <span>IFSC</span>
                      </button>
                      <button
                        onClick={() => handleQuickLink('location')}
                        className="p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/[0.04] text-left flex items-center gap-2"
                      >
                        <MapPin className="w-3.5 h-3.5 text-[#0057D9] flex-shrink-0" />
                        <span>Location</span>
                      </button>
                      <button
                        onClick={() => handleQuickLink('pincode')}
                        className="p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/[0.04] text-left flex items-center gap-2"
                      >
                        <Map className="w-3.5 h-3.5 text-[#FF7B72] flex-shrink-0" />
                        <span>Pincode</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block px-3 mb-2.5">Legal Docs</span>
                    <div className="grid grid-cols-3 gap-2 px-1">
                      <button
                        onClick={() => { onPageChange('terms'); setMobileMenuOpen(false); }}
                        className="py-2.5 bg-white/[0.02] border border-white/[0.05] rounded-xl text-[10.5px] text-[#94A3B8] hover:text-white font-medium text-center"
                      >
                        Terms
                      </button>
                      <button
                        onClick={() => { onPageChange('privacy'); setMobileMenuOpen(false); }}
                        className="py-2.5 bg-white/[0.02] border border-white/[0.05] rounded-xl text-[10.5px] text-[#94A3B8] hover:text-white font-medium text-center"
                      >
                        Privacy
                      </button>
                      <button
                        onClick={() => { onPageChange('disclaimer'); setMobileMenuOpen(false); }}
                        className="py-2.5 bg-white/[0.02] border border-white/[0.05] rounded-xl text-[10.5px] text-[#94A3B8] hover:text-white font-medium text-center"
                      >
                        Disclaimer
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-white/[0.06] bg-[#0E1527]">
                <button
                  onClick={() => { onPageChange('search'); setMobileMenuOpen(false); }}
                  className="btn-primary w-full py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(0,87,217,0.35)]"
                >
                  <Search className="w-4 h-4" />
                  <span>Launch IFSC Search</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
