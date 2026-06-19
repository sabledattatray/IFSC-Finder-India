import { Link } from 'react-router-dom';
import { 
  Building, Globe, FileText, MapPin, Map, ShieldCheck, 
  ArrowRight, Search, Activity, Heart, Clock, Star, Landmark, ChevronRight, Zap, CheckCircle 
} from 'lucide-react';
import { AnimatedSection, StaggerContainer, StaggerItem } from './animations/AnimatedSection';

interface LandingPageProps {
  onPageChange: (page: 'home' | 'search' | 'blogs' | 'blog-detail' | 'privacy' | 'terms' | 'disclaimer', slug?: string) => void;
  onSearchModeChange: (mode: 'master' | 'ifsc' | 'location' | 'pincode') => void;
  onPopularBankTrigger?: (bankName: string) => void;
}

export default function LandingPage({
  onPageChange,
  onSearchModeChange,
  onPopularBankTrigger
}: LandingPageProps) {

  const popularBanks = [
    { name: 'SBI', code: 'SBIN', icon: '🏦', color: 'text-[#00C2FF]', label: 'State Bank of India' },
    { name: 'HDFC', code: 'HDFC', icon: '💰', color: 'text-[#00E5A0]', label: 'HDFC Bank Ltd' },
    { name: 'ICICI', code: 'ICIC', icon: '🏛️', color: 'text-[#FF7B72]', label: 'ICICI Bank Ltd' },
    { name: 'PNB', code: 'PUNB', icon: '💳', color: 'text-[#00E5A0]', label: 'Punjab National Bank' },
    { name: 'BOB', code: 'BARB', icon: '💎', color: 'text-[#00C2FF]', label: 'Bank of Baroda' },
    { name: 'UBI', code: 'UBIN', icon: '🎯', color: 'text-[#0057D9]', label: 'Union Bank of India' }
  ];

  const coreFeatures = [
    {
      icon: <Globe className="w-6 h-6 text-[#00C2FF]" />,
      title: 'Master AI Lookup',
      desc: 'Type normal, conversational addresses. Our parallel parser index crawls the local database files and live internet sources instantly.',
      mode: 'master' as const
    },
    {
      icon: <FileText className="w-6 h-6 text-[#00E5A0]" />,
      title: 'IFSC Alphanumeric Checker',
      desc: 'Verify structured Eleven-digit IFSC coordinates to check NEFT, UPI, and RTGS clearance flags directly.',
      mode: 'ifsc' as const
    },
    {
      icon: <MapPin className="w-6 h-6 text-[#0057D9]" />,
      title: 'Cascading Geographic Search',
      desc: 'Navigate down our complete routing hierarchy: State → District → Tahsil → City → Bank Name → Branch Name.',
      mode: 'location' as const
    },
    {
      icon: <Map className="w-6 h-6 text-[#FF7B72]" />,
      title: 'Pincode Coordinates Directory',
      desc: 'Locate central and regional financial branches utilizing official six-digit local postal indexing values.',
      mode: 'pincode' as const
    }
  ];

  const paymentRails = [
    { name: 'UPI', speed: 'Immediate (Instant)', limit: 'Up to ₹1 Lakh/day', charge: '₹0 (Free always)', desc: 'Retail micropayments and mobile quick scans.', status: 'Active' },
    { name: 'IMPS', speed: 'Immediate (24x7)', limit: 'Up to ₹5 Lakh/day', charge: 'Extremely Low / Nominal', desc: 'Secure retail-to-corporate wire allocations.', status: 'Active' },
    { name: 'NEFT', speed: 'Batch Cleared (Half-hourly)', limit: 'No Static Upper Boundary', charge: '₹0 online at most banks', desc: 'Settle payrolls and vendor invoices continuously.', status: 'Active' },
    { name: 'RTGS', speed: 'Immediate (Continuous)', limit: 'Minimum ₹2 Lakhs required', charge: 'Nominal for high limits', desc: 'High-value treasury shifts and real estate deposits.', status: 'Active' }
  ];

  const handleLaunchMode = (mode: 'master' | 'ifsc' | 'location' | 'pincode') => {
    onSearchModeChange(mode);
    onPageChange('search');
    if (typeof window !== 'undefined') window.scrollTo(0,0);
  };

  const handlePopularClick = (bankName: string) => {
    if (onPopularBankTrigger) {
      onPopularBankTrigger(bankName);
    } else {
      onSearchModeChange('master');
      onPageChange('search');
    }
    if (typeof window !== 'undefined') window.scrollTo(0,0);
  };

  return (
    <div className="w-full text-[#E2E8F0] relative overflow-hidden flex flex-col mesh-gradient grid-pattern noise-overlay">
      
      {/* Hero Banner Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 md:pt-24 md:pb-20 relative z-10 text-center">
        
        {/* Release Tag */}
        <AnimatedSection direction="down" delay={0.1}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] mb-6 glow-blue shadow-lg">
            <div className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C2FF] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0057D9]"></span>
            </div>
            <span className="text-xs font-semibold text-[#94A3B8] tracking-wide">
              State-of-the-art Parallel Search Technology
            </span>
          </div>
        </AnimatedSection>

        <AnimatedSection direction="up" delay={0.2}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto mb-6">
            The Ultimate National Indian <span className="gradient-text-hero">Bank Directory</span> & Payment Router
          </h1>
        </AnimatedSection>

        <AnimatedSection direction="up" delay={0.3}>
          <p className="text-base sm:text-lg md:text-xl text-[#94A3B8] font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
            Instantly search, crawl, and verify IFSC, MICR, and SWIFT details across 173,000+ bank branches in India. Powered by high-speed parallel local index indexes and live internet verification.
          </p>
        </AnimatedSection>

        {/* CTA Actions */}
        <AnimatedSection direction="up" delay={0.4}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={() => handleLaunchMode('master')}
              className="btn-primary w-full sm:w-auto !py-3.5 !px-8 flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(0,87,217,0.4)]"
            >
              <Search className="w-4.5 h-4.5" />
              <span>Launch Master Search (AI)</span>
            </button>
            
            <Link
              to="/blogs"
              className="btn-secondary w-full sm:w-auto !py-3.5 !px-8 flex items-center justify-center gap-2"
            >
              <span>Read Financial Guides</span>
              <ArrowRight className="w-4.5 h-4.5 text-[#94A3B8]" />
            </Link>
          </div>
        </AnimatedSection>

        {/* Stats Strip ticker */}
        <AnimatedSection direction="none" delay={0.5}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto bg-[#0F172A]/40 border border-white/[0.06] rounded-2xl p-6 backdrop-blur-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0057D9]/5 rounded-full blur-[35px] pointer-events-none" />
            <div className="text-center p-2 flex flex-col gap-1 items-center">
              <span className="text-2xl sm:text-3xl font-black text-[#00C2FF] font-mono leading-none">173,000+</span>
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mt-1">Indexed Branches</span>
            </div>
            <div className="text-center p-2 flex flex-col gap-1 items-center border-l border-white/[0.06]">
              <span className="text-2xl sm:text-3xl font-black text-[#00E5A0] font-mono leading-none">150+</span>
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mt-1">Commercial Banks</span>
            </div>
            <div className="text-center p-2 flex flex-col gap-1 items-center border-l border-white/[0.06]">
              <span className="text-2xl sm:text-3xl font-black text-white font-mono leading-none">99.99%</span>
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mt-1">Resolution Speed</span>
            </div>
            <div className="text-center p-2 flex flex-col gap-1 items-center border-l border-white/[0.06]">
              <span className="text-2xl sm:text-3xl font-black text-[#FF7B72] font-mono leading-none">24/7/365</span>
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mt-1">NPCI Integration ready</span>
            </div>
          </div>
        </AnimatedSection>

      </section>

      {/* Popular Banks Shortcut Grid */}
      <section className="bg-white/[0.02] border-y border-white/[0.04] py-10 relative z-10 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold text-[#64748B] uppercase tracking-widest text-center block mb-8">
            Quick Lookup by National Banking Institutions
          </span>
          <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularBanks.map((bank, index) => (
              <StaggerItem key={bank.name}>
                <div
                  onClick={() => handlePopularClick(bank.name)}
                  className="glass-card hover-3d-lift p-5 flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center group h-full hover:border-[#00C2FF]/30 hover:bg-[#00C2FF]/5 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-12 h-12 bg-white/[0.02] rounded-full blur-[10px] pointer-events-none" />
                  <span className="text-3xl mb-1.5 filter drop-shadow-sm group-hover:scale-110 transition-transform duration-300">
                    {bank.icon}
                  </span>
                  <span className="text-sm font-bold text-white group-hover:text-[#00C2FF] transition-colors">
                    {bank.name}
                  </span>
                  <span className="text-[11px] text-[#64748B] group-hover:text-slate-400 transition-colors leading-tight">
                    {bank.label}
                  </span>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Core Utilities Features List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Comprehensive Suite of Bank Routing Utilities
          </h2>
          <p className="text-sm sm:text-base text-[#94A3B8] mt-3 leading-relaxed">
            Every route is optimized for high fidelity. Toggle specialized engines depending on the variables available to you.
          </p>
        </div>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {coreFeatures.map((feat) => (
            <StaggerItem key={feat.title}>
              <div 
                className="glass-card p-6 flex flex-col h-full border border-white/[0.05] hover:border-white/[0.1] hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300 group"
              >
                <div className="p-3 bg-[#081120] border border-white/[0.06] rounded-xl w-fit mb-5 group-hover:bg-[#0057D9]/15 group-hover:border-[#00C2FF]/30 transition-colors">
                  {feat.icon}
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-[#00C2FF] transition-colors mb-3">
                  {feat.title}
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed mb-6 flex-grow group-hover:text-slate-400 transition-colors">
                  {feat.desc}
                </p>
                <button
                  onClick={() => handleLaunchMode(feat.mode)}
                  className="text-xs font-bold text-[#00C2FF] hover:text-[#00E5A0] flex items-center gap-1.5 self-start cursor-pointer group-hover:translate-x-1.5 transition-transform duration-200"
                >
                  <span>Utilize Tool</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* National Payment Rails Analytics Summary Panel */}
      <section className="bg-white/[0.01] border-t border-white/[0.04] py-16 md:py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            
            {/* Descriptive Content */}
            <AnimatedSection direction="left" className="lg:col-span-1 flex flex-col gap-4">
              <span className="text-xs font-extrabold text-[#00C2FF] uppercase tracking-widest">Digital Infrastructure</span>
              <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
                National Indian Payment Rails
              </h2>
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                When sending digital payments in India, matching the transaction coordinates with the correct national settlement rail is essential. We index support coordinates to help you choose perfectly.
              </p>
              <div className="flex flex-col gap-2.5 mt-2">
                {[
                  "Real-time checking on up-to-date local lists",
                  "Crawl active RTGS vs NEFT flags continuously",
                  "100% compliant with Central Bank rules"
                ].map((txt, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-[#94A3B8]">
                    <CheckCircle className="w-4 h-4 text-[#00E5A0]" />
                    <span>{txt}</span>
                  </div>
                ))}
              </div>
            </AnimatedSection>

            {/* Timetable comparisons */}
            <AnimatedSection direction="right" className="lg:col-span-2 overflow-x-auto w-full">
              <div className="min-w-[600px] bg-[#0F172A]/40 border border-white/[0.06] backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-[#081120] text-[10px] font-bold text-[#64748B] border-b border-white/[0.06] uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4.5">Settlement Rail</th>
                      <th className="px-6 py-4.5">Processing Speed</th>
                      <th className="px-6 py-4.5">Transaction Size Limit</th>
                      <th className="px-6 py-4.5">Average Online Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {paymentRails.map((rail) => (
                      <tr key={rail.name} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 flex items-center gap-2.5">
                          <span className="font-extrabold text-white font-mono bg-white/[0.02] px-2 py-0.5 border border-white/[0.06] rounded-lg">
                            {rail.name}
                          </span>
                          <span className="text-[9px] text-[#00E5A0] font-bold bg-[#00E5A0]/10 border border-[#00E5A0]/20 px-2 rounded-full">
                            {rail.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-slate-200">
                          {rail.speed}
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-[#94A3B8]">
                          {rail.limit}
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-[#00E5A0]">
                          {rail.charge}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AnimatedSection>

          </div>

        </div>
      </section>

      {/* Featured Educational Blog guides */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10 w-full">
        <AnimatedSection direction="up" className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
          <div>
            <span className="text-xs font-extrabold text-[#00C2FF] uppercase tracking-widest block mb-2">Knowledge Base</span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Latest Banking & FinTech Insights
            </h2>
          </div>
          <Link
            to="/blogs"
            className="text-sm font-bold text-[#00C2FF] hover:text-[#00E5A0] flex items-center gap-1 mt-4 sm:mt-0 cursor-pointer group"
          >
            <span>Explore All Guides</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </AnimatedSection>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <StaggerItem>
            <div className="glass-card overflow-hidden flex flex-col hover:border-[#00C2FF]/30 transition-all duration-300 group h-full">
              <div className="h-48 overflow-hidden bg-[#081120] relative">
                <img 
                  src="https://picsum.photos/seed/bankingcodes/800/450" 
                  alt="IFSC and MICR Guide" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-4 left-4 bg-[#081120]/90 text-[10px] font-bold text-[#00C2FF] px-2.5 py-0.5 border border-white/[0.08] rounded-md backdrop-blur-md uppercase tracking-wider">
                  Banking Letters
                </span>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <span className="text-[11px] text-[#64748B] font-medium block mb-2">June 15, 2026 • 9 min read</span>
                <h3 className="text-base font-bold text-white group-hover:text-[#00C2FF] transition-colors leading-snug mb-3">
                  The Ultimate Guide to IFSC and MICR Codes in Indian Banking
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed flex-1 mb-6 text-justify">
                  Understand the exact physical-digital anatomy of banking routing structures and how check clearing automation mechanisms operate.
                </p>
                <Link
                  to="/blogs/ultimate-guide-ifsc-micr-codes"
                  className="text-xs font-bold text-[#00C2FF] flex items-center gap-1.5 self-start cursor-pointer hover:text-white transition-colors"
                >
                  <span>Read Full Article</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="glass-card overflow-hidden flex flex-col hover:border-[#00C2FF]/30 transition-all duration-300 group h-full">
              <div className="h-48 overflow-hidden bg-[#081120] relative">
                <img 
                  src="https://picsum.photos/seed/indiapayments/800/450" 
                  alt="Digital Payments India" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-4 left-4 bg-[#081120]/90 text-[10px] font-bold text-[#00E5A0] px-2.5 py-0.5 border border-white/[0.08] rounded-md backdrop-blur-md uppercase tracking-wider">
                  Payment Systems
                </span>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <span className="text-[11px] text-[#64748B] font-medium block mb-2">June 16, 2026 • 10 min read</span>
                <h3 className="text-base font-bold text-white group-hover:text-[#00C2FF] transition-colors leading-snug mb-3">
                  Understanding Digital Payment Systems in India: UPI, NEFT, RTGS, & IMPS
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed flex-1 mb-6 text-justify">
                  An exhaustive breakdown of payment limits, settlement speeds, and transaction charges across leading national electronic networks.
                </p>
                <Link
                  to="/blogs/digital-payment-systems-india-upi-neft-rtgs-imps"
                  className="text-xs font-bold text-[#00C2FF] flex items-center gap-1.5 self-start cursor-pointer hover:text-white transition-colors"
                >
                  <span>Read Full Article</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="glass-card overflow-hidden flex flex-col hover:border-[#00C2FF]/30 transition-all duration-300 group h-full">
              <div className="h-48 overflow-hidden bg-[#081120] relative">
                <img 
                  src="https://picsum.photos/seed/cybersecurity/800/450" 
                  alt="Banking Fraud Protection" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-4 left-4 bg-[#081120]/90 text-[10px] font-bold text-[#FF7B72] px-2.5 py-0.5 border border-white/[0.08] rounded-md backdrop-blur-md uppercase tracking-wider">
                  Cybersecurity
                </span>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <span className="text-[11px] text-[#64748B] font-medium block mb-2">June 17, 2026 • 8 min read</span>
                <h3 className="text-base font-bold text-white group-hover:text-[#00C2FF] transition-colors leading-snug mb-3">
                  How to Protect Yourself from Online Banking & UPI Frauds in 2026
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed flex-1 mb-6 text-justify">
                  A security guideline checklist decoding UPI requests, duplicate OTP collection forms, and smart physical credential management.
                </p>
                <Link
                  to="/blogs/protect-online-banking-upi-frauds-security"
                  className="text-xs font-bold text-[#00C2FF] flex items-center gap-1.5 self-start cursor-pointer hover:text-white transition-colors"
                >
                  <span>Read Full Article</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </StaggerItem>

        </StaggerContainer>
      </section>

    </div>
  );
}
