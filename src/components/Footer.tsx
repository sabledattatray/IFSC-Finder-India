import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building, Heart, ArrowUp, Send, CheckCircle2, Star, 
  Shield, Clock, Zap, Phone, Mail, MapPin, ChevronUp, BookOpen 
} from 'lucide-react';

interface FooterProps {
  onPageChange: (page: 'home' | 'search' | 'blogs' | 'blog-detail' | 'privacy' | 'terms' | 'disclaimer') => void;
  onSearchModeChange: (mode: 'master' | 'ifsc' | 'location' | 'pincode') => void;
}

const socialLinks = [
  { icon: Mail, href: "mailto:info@ifscfinder.in", label: "Email Support" },
  { icon: Phone, href: "tel:+918010803756", label: "Phone Desk" }
];

const badges = [
  { icon: Shield, label: "GDPR Compliant" },
  { icon: Clock, label: "99.9% Resolution Speed" },
  { icon: CheckCircle2, label: "RBI Verified Data" }
];

export default function Footer({ onPageChange, onSearchModeChange }: FooterProps) {
  const [currentYear] = useState(() => new Date().getFullYear());
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowTopBtn(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
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
    <footer className="relative bg-[#060D1B] border-t border-white/[0.04]">
      
      {/* Upper Border Accent Line */}
      <div className="h-[3px] bg-gradient-to-r from-[#0057D9] via-[#00C2FF] to-[#00E5A0]"></div>

      {/* CTA Banner Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <div className="glass-card-strong p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#0057D9]/10 via-transparent to-[#00E5A0]/5 pointer-events-none" />
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
                Need to Verify a Routing Code Instantly?
              </h2>
              <p className="text-[#94A3B8] text-sm mb-6 leading-relaxed">
                Utilize our state-of-the-art Master Search Engine to lookup IFSC, MICR, or SWIFT details across 173,000+ bank branches in India with parallel live Web AI grounding.
              </p>
              <div className="flex flex-col sm:flex-row gap-3.5 justify-center">
                <button 
                  onClick={() => handleSearchShortcut('master')}
                  className="btn-primary text-xs font-bold uppercase tracking-wider !py-3.5 !px-7 flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(0,87,217,0.3)]"
                >
                  <Zap className="w-4.5 h-4.5" />
                  Launch Master Search (AI)
                </button>
                <button 
                  onClick={() => { onPageChange('blogs'); scrollToTop(); }}
                  className="btn-secondary text-xs font-bold uppercase tracking-wider !py-3.5 !px-7 flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4.5 h-4.5 text-[#94A3B8]" />
                  Read Banking Guides
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-6 pt-4 mb-12">
          
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/[0.03] border border-white/[0.08] rounded-xl">
                <Building className="w-5 h-5 text-[#00C2FF]" />
              </div>
              <span className="font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-outfit)' }}>IFSC Finder India</span>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed max-w-sm">
              A comprehensive national banking directory facilitating seamless bank routing lookups across India. Powered by high-speed parallel local offline databases and live RBI verify syncs.
            </p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00E5A0] animate-pulse"></span>
              <span className="text-[10px] font-bold text-[#64748B] tracking-wider uppercase font-mono">Parallel Core: v2.1.0</span>
            </div>
            <div className="flex gap-2.5 pt-1.5">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-[#94A3B8] hover:text-[#00C2FF] hover:border-[#00C2FF]/30 hover:bg-[#00C2FF]/5 transition-all cursor-pointer"
                >
                  <social.icon className="w-4.5 h-4.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Search Utilities */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
              Search Directories
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: "Master AI Parallel Search", mode: "master" as const },
                { label: "11-digit IFSC Indexer", mode: "ifsc" as const },
                { label: "Location Regional Tree", mode: "location" as const },
                { label: "Pincode Coordinate Search", mode: "pincode" as const }
              ].map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => handleSearchShortcut(link.mode)}
                    className="text-xs text-[#94A3B8] hover:text-[#00C2FF] transition-colors font-medium text-left cursor-pointer"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Legal & Standards */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
              Legal Framework
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: "Terms of Service", page: "terms" as const },
                { label: "Privacy Policy", page: "privacy" as const },
                { label: "Disclaimer Register", page: "disclaimer" as const },
                { label: "Sovereign e-Rupee Guide", page: "blogs" as const }
              ].map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => { onPageChange(link.page); scrollToTop(); }}
                    className="text-xs text-[#94A3B8] hover:text-[#00C2FF] transition-colors font-medium text-left cursor-pointer"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: NPCI Rails */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
              Payments Network
            </h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Supporting Indian financial routing frameworks operating under National Payments Corporation of India (NPCI) guidelines.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-[#00E5A0]">UPI</span>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-[#00C2FF]">IMPS</span>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-[#0057D9]">NEFT</span>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-[#FF7B72]">RTGS</span>
            </div>
          </div>

        </div>

        {/* Trust Badges */}
        <div className="mt-8 pt-8 border-t border-white/[0.04]">
          <div className="flex flex-wrap items-center justify-center gap-6">
            {badges.map((badge) => (
              <div
                key={badge.label}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] text-xs text-[#94A3B8]"
              >
                <badge.icon className="w-3.5 h-3.5 text-[#00E5A0]" />
                {badge.label}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar: Copyright, Credit, and Sitemaps */}
        <div className="mt-8 pt-8 border-t border-white/[0.04] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <p className="text-xs text-[#94A3B8]">
              &copy; {currentYear} IFSC Finder India. All code indices sourced officially.
            </p>
            <span className="hidden sm:inline text-[#475569] text-xs">|</span>
            
            {/* Datta Sable Link - STYLED EXACTLY TO THE RULES */}
            <div className="text-xs text-[#94A3B8] flex items-center flex-wrap gap-1.5 justify-center sm:justify-start">
              <span>Created for high performance by</span>
              <a 
                href="https://dattasable.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#00E5A0]/10 border border-[#00E5A0]/20 text-[#00E5A0] hover:bg-[#00C2FF]/10 hover:border-[#00C2FF]/20 hover:text-[#00C2FF] font-semibold transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E5A0] animate-pulse" />
                Datta Sable
              </a>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-[#94A3B8]">
            <Link to="/privacy" onClick={scrollToTop} className="hover:text-[#00C2FF] transition-colors cursor-pointer">Privacy</Link>
            <Link to="/terms" onClick={scrollToTop} className="hover:text-[#00C2FF] transition-colors cursor-pointer">Terms</Link>
            <Link to="/disclaimer" onClick={scrollToTop} className="hover:text-[#00C2FF] transition-colors cursor-pointer">Disclaimer</Link>
          </div>
        </div>

      </div>

      {/* Floating Buttons Container */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-none">
        {/* Go to Top Button */}
        <AnimatePresence>
          {showTopBtn && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              onClick={scrollToTop}
              className="pointer-events-auto flex items-center justify-center w-11 h-11 bg-white/[0.05] border border-white/[0.1] backdrop-blur-md text-white rounded-full shadow-lg hover:bg-white/[0.1] hover:border-white/[0.2] transition-all duration-300 active:scale-95 group cursor-pointer"
              title="Scroll to top"
            >
              <ChevronUp className="w-5 h-5 text-[#94A3B8] group-hover:text-white transition-colors" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

    </footer>
  );
}
