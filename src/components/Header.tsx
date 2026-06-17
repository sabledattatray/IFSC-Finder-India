import { useState, useEffect, useRef } from 'react';
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
  const megaMenuRef = useRef<HTMLDivElement>(null);

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
    <header className="relative w-full bg-[#161B22] border-b border-[#30363D] z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* Logo Brand */}
          <div 
            onClick={() => { onPageChange('home'); setMegaMenuOpen(false); }} 
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#1F6FEB] to-[#58A6FF] text-white shadow-md shadow-[#1F6FEB]/10 group-hover:scale-105 transition-all duration-200">
              <Building className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base md:text-lg text-[#E6EDF3] tracking-tight group-hover:text-[#58A6FF] transition-colors leading-none mb-1">
                IFSC Finder
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#8B949E] leading-none">
                National Directory
              </span>
            </div>
          </div>

          {/* Desktop Navigation Link bar */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  onPageChange(item.page);
                  setMegaMenuOpen(false);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
                  currentPage === item.page
                    ? 'text-[#58A6FF] bg-[#1F242C] border border-[#30363D]'
                    : 'text-[#8B949E] hover:text-[#C9D1D9] hover:bg-[#161B22] border border-transparent'
                }`}
              >
                {item.label}
              </button>
            ))}

            {/* Resources Trigger - Mega Menu */}
            <div className="relative" ref={megaMenuRef}>
              <button
                onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all duration-150 cursor-pointer ${
                  megaMenuOpen
                    ? 'text-[#58A6FF] bg-[#1F242C]'
                    : 'text-[#8B949E] hover:text-[#C9D1D9] hover:bg-[#161B22]'
                }`}
              >
                <span>Directories & Tools</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${megaMenuOpen ? 'rotate-180 text-[#58A6FF]' : 'text-[#8B949E]'}`} />
              </button>

              {/* Mega Menu Dropdown */}
              {megaMenuOpen && (
                <div className="absolute left-1/2 -translate-x-[72%] mt-3 w-[720px] bg-[#161B22] border border-[#30363D] rounded-xl shadow-2xl p-6 grid grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2 duration-150">
                  
                  {/* Column 1: Core Search Modes */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#30363D]">
                      <Globe className="w-4 h-4 text-[#58A6FF]" />
                      <span className="text-xs font-bold text-[#C9D1D9] uppercase tracking-wider">Search Engine</span>
                    </div>
                    <ul className="space-y-1">
                      <li>
                        <button
                          onClick={() => handleQuickLink('master')}
                          className="w-full text-left p-2 rounded-lg hover:bg-[#1F242C] transition-colors group flex flex-col"
                        >
                          <span className="text-sm font-bold text-[#E6EDF3] group-hover:text-[#58A6FF] flex items-center gap-1">
                            Master AI Search <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </span>
                          <span className="text-[11px] text-[#8B949E] mt-0.5 leading-relaxed">
                            Parallel lookup across files and live web simultaneously.
                          </span>
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => handleQuickLink('ifsc')}
                          className="w-full text-left p-2 rounded-lg hover:bg-[#1F242C] transition-colors group flex flex-col"
                        >
                          <span className="text-sm font-bold text-[#E6EDF3] group-hover:text-[#58A6FF]">IFSC Verification</span>
                          <span className="text-[11px] text-[#8B949E] mt-0.5 leading-relaxed">
                            Verify 11-digit alphanumeric branch codes directly.
                          </span>
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => handleQuickLink('location')}
                          className="w-full text-left p-2 rounded-lg hover:bg-[#1F242C] transition-colors group flex flex-col"
                        >
                          <span className="text-sm font-bold text-[#E6EDF3] group-hover:text-[#58A6FF]">Location Search</span>
                          <span className="text-[11px] text-[#8B949E] mt-0.5 leading-relaxed">
                            Browse branches by State, District, Taluka & City.
                          </span>
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => handleQuickLink('pincode')}
                          className="w-full text-left p-2 rounded-lg hover:bg-[#1F242C] transition-colors group flex flex-col"
                        >
                          <span className="text-sm font-bold text-[#E6EDF3] group-hover:text-[#58A6FF]">Pincode Directory</span>
                          <span className="text-[11px] text-[#8B949E] mt-0.5 leading-relaxed">
                            Find specific coordinates by localized postal index numbers.
                          </span>
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* Column 2: Tools & Policy Guides */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#30363D]">
                      <Activity className="w-4 h-4 text-[#7EE787]" />
                      <span className="text-xs font-bold text-[#C9D1D9] uppercase tracking-wider">Payments Info</span>
                    </div>
                    <ul className="space-y-1">
                      <li>
                        <button
                          onClick={() => { onPageChange('blogs'); setMegaMenuOpen(false); if(typeof window !== 'undefined') window.scrollTo(0,0); }}
                          className="w-full text-left p-2 rounded-lg hover:bg-[#1F242C] transition-colors group flex flex-col"
                        >
                          <span className="text-sm font-bold text-[#E6EDF3] group-hover:text-[#7EE787] flex items-center gap-1.5">
                            <Landmark className="w-3.5 h-3.5" /> Core Payment Guide
                          </span>
                          <span className="text-[11px] text-[#8B949E] mt-0.5 leading-relaxed">
                            Understand processing speeds for NEFT, RTGS, and IMPS.
                          </span>
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => { onPageChange('blogs'); setMegaMenuOpen(false); }}
                          className="w-full text-left p-2 rounded-lg hover:bg-[#1F242C] transition-colors group flex flex-col"
                        >
                          <span className="text-sm font-bold text-[#E6EDF3] group-hover:text-[#7EE787] flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5" /> Cybercrime Safety
                          </span>
                          <span className="text-[11px] text-[#8B949E] mt-0.5 leading-relaxed">
                            Proactive guides to avoid online banking and UPI frauds.
                          </span>
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => { onPageChange('disclaimer'); setMegaMenuOpen(false); }}
                          className="w-full text-left p-2 rounded-lg hover:bg-[#1F242C] transition-colors group flex flex-col"
                        >
                          <span className="text-sm font-bold text-[#E6EDF3] group-hover:text-[#7EE787] flex items-center gap-1.5">
                            <HelpCircle className="w-3.5 h-3.5" /> Disclaimers Register
                          </span>
                          <span className="text-[11px] text-[#8B949E] mt-0.5 leading-relaxed">
                            Learn regarding dynamic database limits and data caches.
                          </span>
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* Column 3: Featured & Legal Links */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#30363D]">
                      <BookOpen className="w-4 h-4 text-[#D2A8FF]" />
                      <span className="text-xs font-bold text-[#C9D1D9] uppercase tracking-wider">Legal Standards</span>
                    </div>
                    <ul className="space-y-1">
                      <li>
                        <button
                          onClick={() => { onPageChange('terms'); setMegaMenuOpen(false); }}
                          className="w-full text-left p-2 rounded-lg hover:bg-[#1F242C] transition-colors group flex flex-col"
                        >
                          <span className="text-sm font-bold text-[#E6EDF3] group-hover:text-[#D2A8FF]">Terms of Service</span>
                          <span className="text-[11px] text-[#8B949E] mt-0.5 leading-relaxed">
                            Agreement explaining official usage and routing accuracy limits.
                          </span>
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => { onPageChange('privacy'); setMegaMenuOpen(false); }}
                          className="w-full text-left p-2 rounded-lg hover:bg-[#1F242C] transition-colors group flex flex-col"
                        >
                          <span className="text-sm font-bold text-[#E6EDF3] group-hover:text-[#D2A8FF]">Privacy Policy</span>
                          <span className="text-[11px] text-[#8B949E] mt-0.5 leading-relaxed">
                            How we handle database requests, caching and zero logs policy.
                          </span>
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => { onPageChange('blogs'); setMegaMenuOpen(false); }}
                          className="w-full text-left p-2 rounded-lg hover:bg-[#1F242C] transition-colors group flex-col hidden sm:flex"
                        >
                          <span className="text-xs font-bold text-[#FF7B72] px-2 py-0.5 bg-[#FF7B72]/10 border border-[#FF7B72]/20 rounded-full self-start mb-1">Featured</span>
                          <span className="text-sm font-bold text-[#E6EDF3] leading-snug">
                            Understanding e-Rupee Blockchain in India
                          </span>
                        </button>
                      </li>
                    </ul>
                  </div>

                </div>
              )}
            </div>
          </nav>

          {/* Desktop Right Panel (Launch Apps & Favorites) */}
          <div className="hidden md:flex items-center gap-3">
            {currentPage === 'search' ? (
              <button
                onClick={onToggleMobileNav}
                className="py-2 px-4 rounded-lg bg-[#21262D] border border-[#30363D] hover:bg-[#30363D] transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <div className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3FB950] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2EA043]"></span>
                </div>
                <span className="text-xs font-bold text-[#C9D1D9] uppercase tracking-wider font-mono">Workspace Storage: {favoritesCount}</span>
              </button>
            ) : (
              <button
                onClick={() => onPageChange('search')}
                className="py-2.5 px-5 rounded-lg bg-gradient-to-r from-[#238636] to-[#2ea043] text-white hover:from-[#2ea043] hover:to-[#238636] transition-all duration-200 font-bold text-sm tracking-wide shadow-md shadow-[#238636]/10 flex items-center gap-2 cursor-pointer"
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
              className="p-2 rounded-lg bg-[#21262D] border border-[#30363D] text-[#8B949E] hover:text-[#C9D1D9] focus:outline-none focus:ring-2 focus:ring-[#58A6FF] cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden w-full bg-[#161B22] border-t border-[#30363D] px-4 py-4 space-y-4 animate-in slide-in-from-top duration-150 relative z-30">
          <div className="grid grid-cols-1 gap-2">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  onPageChange(item.page);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition-all ${
                  currentPage === item.page
                    ? 'text-[#58A6FF] bg-[#1F242C] border border-[#30363D]'
                    : 'text-[#8B949E] hover:text-[#C9D1D9] hover:bg-[#161B22]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile Mega-Menu Sections */}
          <div className="pt-4 border-t border-[#30363D] space-y-4">
            
            {/* Search Modes */}
            <div>
              <span className="text-[10px] font-bold text-[#8B949E] uppercase tracking-wider block px-4 mb-2">Search Directories</span>
              <div className="grid grid-cols-2 gap-2 px-2">
                <button
                  onClick={() => handleQuickLink('master')}
                  className="px-3 py-2 bg-[#21262D] rounded-lg text-xs font-bold text-[#C9D1D9] hover:bg-[#30363D] text-left flex items-center gap-1.5"
                >
                  <Globe className="w-3.5 h-3.5 text-[#58A6FF]" /> Master Search
                </button>
                <button
                  onClick={() => handleQuickLink('ifsc')}
                  className="px-3 py-2 bg-[#21262D] rounded-lg text-xs font-bold text-[#C9D1D9] hover:bg-[#30363D] text-left flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-[#7EE787]" /> IFSC Search
                </button>
                <button
                  onClick={() => handleQuickLink('location')}
                  className="px-3 py-2 bg-[#21262D] rounded-lg text-xs font-bold text-[#C9D1D9] hover:bg-[#30363D] text-left flex items-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#D2A8FF]" /> Location Search
                </button>
                <button
                  onClick={() => handleQuickLink('pincode')}
                  className="px-3 py-2 bg-[#21262D] rounded-lg text-xs font-bold text-[#C9D1D9] hover:bg-[#30363D] text-left flex items-center gap-1.5"
                >
                  <Map className="w-3.5 h-3.5 text-[#FF7B72]" /> Pincode Search
                </button>
              </div>
            </div>

            {/* Other Pages */}
            <div>
              <span className="text-[10px] font-bold text-[#8B949E] uppercase tracking-wider block px-4 mb-2">Legal Docs</span>
              <div className="grid grid-cols-3 gap-2 px-2">
                <button
                  onClick={() => { onPageChange('terms'); setMobileMenuOpen(false); }}
                  className="px-2 py-2 bg-[#21262D] rounded-lg text-[11px] text-[#8B949E] text-center font-medium"
                >
                  Terms
                </button>
                <button
                  onClick={() => { onPageChange('privacy'); setMobileMenuOpen(false); }}
                  className="px-2 py-2 bg-[#21262D] rounded-lg text-[11px] text-[#8B949E] text-center font-medium"
                >
                  Privacy
                </button>
                <button
                  onClick={() => { onPageChange('disclaimer'); setMobileMenuOpen(false); }}
                  className="px-2 py-2 bg-[#21262D] rounded-lg text-[11px] text-[#8B949E] text-center font-medium"
                >
                  Disclaimers
                </button>
              </div>
            </div>

            <div className="px-2">
              <button
                onClick={() => { onPageChange('search'); setMobileMenuOpen(false); }}
                className="w-full py-3 bg-[#238636] hover:bg-[#2ea043] rounded-lg text-xs font-bold text-white text-center flex items-center justify-center gap-2 shadow-lg"
              >
                <Search className="w-4 h-4" />
                <span>Launch IFSC Finder Tools</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </header>
  );
}
