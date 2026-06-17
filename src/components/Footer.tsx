import { Building, Heart, ArrowUp, Send, CheckCircle2, Star } from 'lucide-react';

interface FooterProps {
  onPageChange: (page: 'home' | 'search' | 'blogs' | 'blog-detail' | 'privacy' | 'terms' | 'disclaimer') => void;
  onSearchModeChange: (mode: 'master' | 'ifsc' | 'location' | 'pincode') => void;
}

export default function Footer({ onPageChange, onSearchModeChange }: FooterProps) {
  const handleScrollTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSearchShortcut = (mode: 'master' | 'ifsc' | 'location' | 'pincode') => {
    onSearchModeChange(mode);
    onPageChange('search');
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        const inputElem = document.querySelector('input');
        if (inputElem) inputElem.focus();
      }
    }, 100);
  };

  return (
    <footer className="w-full bg-[#0D1117] border-t border-[#30363D] relative select-none">
      
      {/* Upper Border Accent Line */}
      <div className="h-1 bg-gradient-to-r from-[#1F6FEB] via-[#58A6FF] to-[#238636]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-12">
          
          {/* Column 1: Brand & Purpose */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="p-1 px-2 bg-[#1F242C] border border-[#30363D] rounded-lg">
                <Building className="w-4 h-4 text-[#58A6FF]" />
              </div>
              <span className="font-bold text-[#E6EDF3] tracking-tight">IFSC Finder India</span>
            </div>
            <p className="text-xs text-[#8B949E] leading-relaxed max-w-xs">
              A comprehensive national banking directory facilitating seamless bank routing lookups across India. Powered by high-speed parallel local offline structures and live RBI verify syncs.
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex h-2 w-2 rounded-full bg-[#2EA043]"></span>
              <span className="text-[10px] font-bold text-[#8B949E] tracking-wider uppercase font-mono">Parallel Core Version: 2.1.0</span>
            </div>
          </div>

          {/* Column 2: Search Utilities */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-[#8B949E] uppercase tracking-wider">Search Directories</span>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleSearchShortcut('master')}
                  className="text-xs text-[#8B949E] hover:text-[#58A6FF] transition-colors font-medium text-left cursor-pointer"
                >
                  Master AI Parallel Search
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleSearchShortcut('ifsc')}
                  className="text-xs text-[#8B949E] hover:text-[#58A6FF] transition-colors font-medium text-left cursor-pointer"
                >
                  11-digit IFSC Indexer
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleSearchShortcut('location')}
                  className="text-xs text-[#8B949E] hover:text-[#58A6FF] transition-colors font-medium text-left cursor-pointer"
                >
                  Location-wise Regional Tree
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleSearchShortcut('pincode')}
                  className="text-xs text-[#8B949E] hover:text-[#58A6FF] transition-colors font-medium text-left cursor-pointer"
                >
                  National Pincode Coordinate Search
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Standards */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-[#8B949E] uppercase tracking-wider">Legal Framework</span>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => { onPageChange('terms'); handleScrollTop(); }}
                  className="text-xs text-[#8B949E] hover:text-[#58A6FF] transition-colors font-medium text-left cursor-pointer"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => { onPageChange('privacy'); handleScrollTop(); }}
                  className="text-xs text-[#8B949E] hover:text-[#58A6FF] transition-colors font-medium text-left cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => { onPageChange('disclaimer'); handleScrollTop(); }}
                  className="text-xs text-[#8B949E] hover:text-[#58A6FF] transition-colors font-medium text-left cursor-pointer"
                >
                  Disclaimer & Verification Standards
                </button>
              </li>
              <li>
                <button
                  onClick={() => { onPageChange('blogs'); handleScrollTop(); }}
                  className="text-xs text-[#8B949E] hover:text-[#58A6FF] transition-colors font-medium text-left cursor-pointer"
                >
                  Sovereign e-Rupee Guide
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: National Infrastructure Accents */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-[#8B949E] uppercase tracking-wider">Payments Network</span>
            <p className="text-xs text-[#8B949E] leading-relaxed">
              Officially supporting bank branches participating under National Payments Corporation of India (NPCI) frameworks.
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#1F242C] border border-[#30363D] text-[#7EE787]">UPI</span>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#1F242C] border border-[#30363D] text-[#58A6FF]">IMPS</span>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#1F242C] border border-[#30363D] text-[#D2A8FF]">NEFT</span>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#1F242C] border border-[#30363D] text-[#FF7B72]">RTGS</span>
            </div>
          </div>

        </div>

        {/* Lower bar - Developer Credits & Back to Top */}
        <div className="pt-8 border-t border-[#30363D] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-center md:text-left">
            <p className="text-xs text-[#8B949E]">
              &copy; {new Date().getFullYear()} IFSC Finder India. All code indices sourced officially from central repositories.
            </p>
            <span className="hidden md:block text-[#30363D]">|</span>
            
            {/* Datta Sable Link - STYLED EXACTLY TO THE RULES */}
            <a 
              href="https://dattasable.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-xs text-[#E6EDF3] hover:text-[#58A6FF] transition-all flex items-center gap-1.5 font-bold group px-3 py-1.5 rounded-lg bg-[#161B22] border border-[#30363D] hover:shadow-md hover:shadow-[#58A6FF]/5"
            >
              <span>Created for High performance by</span>
              <span className="text-[#58A6FF] cursor-pointer inline-flex items-center gap-0.5 relative after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-[1px] after:bg-[#58A6FF] after:transition-all">
                Datta Sable
              </span>
            </a>

          </div>

          <button
            onClick={handleScrollTop}
            className="p-2.5 rounded-xl bg-[#21262D] border border-[#30363D] hover:bg-[#30363D] text-[#8B949E] hover:text-[#C9D1D9] transition-all duration-150 cursor-pointer"
            title="Scroll to top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>

      </div>
    </footer>
  );
}
