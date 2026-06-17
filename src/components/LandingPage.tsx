import { 
  Building, Globe, FileText, MapPin, Map, ShieldCheck, 
  ArrowRight, Search, Activity, Heart, Clock, Star, Landmark, ChevronRight, Zap, CheckCircle
} from 'lucide-react';

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
    { name: 'SBI', code: 'SBIN', icon: '🏦', color: 'text-[#1F6FEB]', label: 'State Bank of India' },
    { name: 'HDFC', code: 'HDFC', icon: '💰', color: 'text-[#E3B341]', label: 'HDFC Bank Ltd' },
    { name: 'ICICI', code: 'ICIC', icon: '🏛️', color: 'text-[#FF7B72]', label: 'ICICI Bank Ltd' },
    { name: 'PNB', code: 'PUNB', icon: '💳', color: 'text-[#7EE787]', label: 'Punjab National Bank' },
    { name: 'BOB', code: 'BARB', icon: '💎', color: 'text-[#D2A8FF]', label: 'Bank of Baroda' },
    { name: 'UBI', code: 'UBIN', icon: '🎯', color: 'text-[#58A6FF]', label: 'Union Bank of India' }
  ];

  const coreFeatures = [
    {
      icon: <Globe className="w-6 h-6 text-[#1F6FEB]" />,
      title: 'Master AI Lookup',
      desc: 'Type normal, conversational addresses. Our parallel parser index crawls the local file system and live internet sources instantly.',
      mode: 'master' as const
    },
    {
      icon: <FileText className="w-6 h-6 text-[#7EE787]" />,
      title: 'IFSC Alphanumeric Checker',
      desc: 'Verify structured Eleven-digit IFSC coordinates to check NEFT, UPI, and RTGS clearance flags directly.',
      mode: 'ifsc' as const
    },
    {
      icon: <MapPin className="w-6 h-6 text-[#D2A8FF]" />,
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
      // Fallback
      onSearchModeChange('master');
      onPageChange('search');
    }
    if (typeof window !== 'undefined') window.scrollTo(0,0);
  };

  return (
    <div className="w-full bg-[#0D1117] text-[#C9D1D9] relative overflow-hidden flex flex-col">
      
      {/* Abstract Glowing Grid Background Visual */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-[radial-gradient(circle_at_center,rgba(31,111,235,0.06)_0,transparent_65%)] pointer-events-none z-0"></div>
      
      {/* Hero Banner Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 md:pt-24 md:pb-20 relative z-10 text-center">
        
        {/* Release Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F242C] border border-[#30363D] mb-6 animate-fade-in animate-duration-300">
          <Zap className="w-3.5 h-3.5 text-[#58A6FF]" />
          <span className="text-xs font-semibold text-[#8B949E] tracking-wide">
            State-of-the-art Parallel Search Technology
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#E6EDF3] tracking-tight leading-none max-w-4xl mx-auto mb-6">
          The Ultimate National Indian <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#58A6FF] to-[#7EE787]">Bank Directory</span> & Payment Router
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-[#8B949E] font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
          Instantly search, crawl, and verify IFSC, MICR, and SWIFT details across 173,000+ bank branches in India. Powered by a high-speed parallel local index and live internet verification.
        </p>

        {/* CTA Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={() => handleLaunchMode('master')}
            className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-[#238636] hover:bg-[#2ea043] font-bold text-sm text-white tracking-wide shadow-lg shadow-[#238636]/15 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Search className="w-4 h-4" />
            <span>Launch Master Search (AI)</span>
          </button>
          
          <button
            onClick={() => { onPageChange('blogs'); if (typeof window !== 'undefined') window.scrollTo(0,0); }}
            className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-[#21262D] border border-[#30363D] hover:bg-[#30363D] font-bold text-sm text-[#C9D1D9] flex items-center justify-center gap-2 transition-all cursor-pointer border-opacity-70"
          >
            <span>Read Financial Guides</span>
            <ArrowRight className="w-4 h-4 text-[#8B949E]" />
          </button>
        </div>

        {/* Stats Strip ticker */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto bg-[#161B22]/60 border border-[#30363D] rounded-2xl p-6 backdrop-blur-xs">
          <div className="text-center p-2 flex flex-col gap-1 items-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#58A6FF] font-mono leading-none">173,000+</span>
            <span className="text-[11px] sm:text-xs font-bold text-[#8B949E] uppercase tracking-widest mt-1">Indexed Branches</span>
          </div>
          <div className="text-center p-2 flex flex-col gap-1 items-center border-l border-[#30363D]">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#7EE787] font-mono leading-none">150+</span>
            <span className="text-[11px] sm:text-xs font-bold text-[#8B949E] uppercase tracking-widest mt-1">Commercial Banks</span>
          </div>
          <div className="text-center p-2 flex flex-col gap-1 items-center border-l lg:border-l border-[#30363D]">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#D2A8FF] font-mono leading-none">99.99%</span>
            <span className="text-[11px] sm:text-xs font-bold text-[#8B949E] uppercase tracking-widest mt-1">Resolution Speed</span>
          </div>
          <div className="text-center p-2 flex flex-col gap-1 items-center border-l border-[#30363D]">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#FF7B72] font-mono leading-none">24/7/365</span>
            <span className="text-[11px] sm:text-xs font-bold text-[#8B949E] uppercase tracking-widest mt-1">NPCI Integration ready</span>
          </div>
        </div>

      </section>

      {/* Popular Banks Shortcut Grid */}
      <section className="bg-[#161B22]/30 border-y border-[#30363D] py-8 relative z-10 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold text-[#8B949E] uppercase tracking-widest text-center block mb-6">
            Quick Lookup by National Banking Institutions
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularBanks.map((bank) => (
              <button
                key={bank.name}
                onClick={() => handlePopularClick(bank.name)}
                className="p-4 bg-[#161B22] border border-[#30363D] rounded-xl hover:border-[#58A6FF] hover:bg-[#1F242C] transition-all group flex flex-col items-center justify-center gap-1 cursor-pointer hover:shadow-lg text-center"
              >
                <span className="text-2xl mb-1 filter drop-shadow-sm group-hover:scale-110 transition-transform duration-200">
                  {bank.icon}
                </span>
                <span className="text-sm font-bold text-[#E6EDF3] group-hover:text-[#58A6FF]">
                  {bank.name}
                </span>
                <span className="text-[10.5px] text-[#8B949E] leading-tight">
                  {bank.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Core Utilities Features List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#E6EDF3] tracking-tight">
            Comprehensive Suite of Bank Routing Utilities
          </h2>
          <p className="text-sm sm:text-base text-[#8B949E] mt-3 leading-relaxed">
            Every route is optimized for high fidelity. Toggle specialized engines depending on the variables available to you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {coreFeatures.map((feat) => (
            <div 
              key={feat.title} 
              className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 hover:shadow-xl hover:shadow-[#010409]/80 group flex flex-col"
            >
              <div className="p-3 bg-[#0D1117] border border-[#30363D] rounded-xl w-fit mb-5">
                {feat.icon}
              </div>
              <h3 className="text-lg font-bold text-[#FCFCFC] group-hover:text-[#58A6FF] transition-colors mb-3">
                {feat.title}
              </h3>
              <p className="text-xs text-[#8B949E] leading-relaxed mb-6 flex-1">
                {feat.desc}
              </p>
              <button
                onClick={() => handleLaunchMode(feat.mode)}
                className="text-xs font-bold text-[#58A6FF] hover:text-[#79C0FF] flex items-center gap-1.5 self-start cursor-pointer group-hover:translate-x-1 transition-transform"
              >
                <span>Utilize Tool</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* National Payment Rails Analytics Summary Panel */}
      <section className="bg-[#161B22]/20 border-t border-[#30363D] py-16 md:py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            
            {/* Descriptive Content */}
            <div className="lg:col-span-1 flex flex-col gap-4">
              <span className="text-xs font-extrabold text-[#58A6FF] uppercase tracking-widest">Digital Infrastructure</span>
              <h2 className="text-3xl font-extrabold text-[#E6EDF3] tracking-tight leading-tight">
                National Indian Payment Rails
              </h2>
              <p className="text-sm text-[#8B949E] leading-relaxed">
                When sending digital payments in India, matching the transaction coordinates with the correct national settlement rail is essential. We index support coordinates to help you choose perfectly.
              </p>
              <div className="flex flex-col gap-2 mt-2">
                <div className="flex items-center gap-2 text-xs text-[#8B949E]">
                  <CheckCircle className="w-4 h-4 text-[#7EE787]" />
                  <span>Real-time checking on up-to-date local lists</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#8B949E]">
                  <CheckCircle className="w-4 h-4 text-[#7EE787]" />
                  <span>Crawl active RTGS vs NEFT flags continuously</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#8B949E]">
                  <CheckCircle className="w-4 h-4 text-[#7EE787]" />
                  <span>100% compliant with Central Bank rules</span>
                </div>
              </div>
            </div>

            {/* Timetable comparisons */}
            <div className="lg:col-span-2 overflow-x-auto w-full">
              <div className="min-w-[600px] bg-[#161B22] border border-[#30363D] rounded-2xl overflow-hidden shadow-2xl">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-[#0D1117] text-xs font-bold text-[#8B949E] border-b border-[#30363D] uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Settlement Rail</th>
                      <th className="px-6 py-4">Processing Speed</th>
                      <th className="px-6 py-4">Transaction Size Limit</th>
                      <th className="px-6 py-4">Average Online Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#30363D]">
                    {paymentRails.map((rail) => (
                      <tr key={rail.name} className="hover:bg-[#1F242C]/50 transition-colors">
                        <td className="px-6 py-4 flex items-center gap-2.5">
                          <span className="font-extrabold text-[#E6EDF3] font-mono bg-[#1F242C] px-2 py-0.5 border border-[#30363D] rounded-lg">
                            {rail.name}
                          </span>
                          <span className="text-[10px] text-[#7EE787] font-bold bg-[#13231B] border border-[#2EA043]/30 px-2 rounded-full">
                            {rail.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-[#C9D1D9]">
                          {rail.speed}
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-[#8B949E]">
                          {rail.limit}
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-[#7EE787]">
                          {rail.charge}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Featured Educational Blog guides */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
          <div>
            <span className="text-xs font-extrabold text-[#D2A8FF] uppercase tracking-widest block mb-2">Knowledge Base</span>
            <h2 className="text-3xl font-extrabold text-[#E6EDF3] tracking-tight">
              Latest Banking & FinTech Insights
            </h2>
          </div>
          <button
            onClick={() => { onPageChange('blogs'); if (typeof window !== 'undefined') window.scrollTo(0,0); }}
            className="text-sm font-bold text-[#58A6FF] hover:text-[#79C0FF] flex items-center gap-1 mt-4 sm:mt-0 cursor-pointer group"
          >
            <span>Explore All 1,200+ Word Guides</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl overflow-hidden flex flex-col hover:border-[#58A6FF] transition-all group">
            <div className="h-48 overflow-hidden bg-[#0D1117] relative">
              <img 
                src="https://picsum.photos/seed/bankingcodes/800/450" 
                alt="IFSC and MICR Guide" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-4 left-4 bg-[#1F242C]/90 text-[10px] font-bold text-[#58A6FF] px-2.5 py-0.5 border border-[#30363D] rounded-md backdrop-blur-xs uppercase tracking-wider">
                Banking Letters
              </span>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <span className="text-xs text-[#8B949E] font-medium block mb-2">June 15, 2026 • 9 min read</span>
              <h3 className="text-lg font-bold text-[#E6EDF3] group-hover:text-[#58A6FF] transition-colors leading-snug mb-3">
                The Ultimate Guide to IFSC and MICR Codes in Indian Banking
              </h3>
              <p className="text-xs text-[#8B949E] leading-relaxed flex-1 mb-6">
                Understand the exact physical-digital anatomy of banking routing structures and how check clearing automation mechanisms operate.
              </p>
              <button
                onClick={() => { onPageChange('blog-detail', 'ultimate-guide-ifsc-micr-codes'); if (typeof window !== 'undefined') window.scrollTo(0,0); }}
                className="text-xs font-bold text-[#58A6FF] flex items-center gap-1.5 self-start cursor-pointer"
              >
                <span>Read Full Article</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl overflow-hidden flex flex-col hover:border-[#58A6FF] transition-all group">
            <div className="h-48 overflow-hidden bg-[#0D1117] relative">
              <img 
                src="https://picsum.photos/seed/indiapayments/800/450" 
                alt="Digital Payments India" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-4 left-4 bg-[#1F242C]/90 text-[10px] font-bold text-[#2ea043] px-2.5 py-0.5 border border-[#30363D] rounded-md backdrop-blur-xs uppercase tracking-wider">
                Payment Systems
              </span>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <span className="text-xs text-[#8B949E] font-medium block mb-2">June 16, 2026 • 10 min read</span>
              <h3 className="text-lg font-bold text-[#E6EDF3] group-hover:text-[#58A6FF] transition-colors leading-snug mb-3">
                Understanding Digital Payment Systems in India: UPI, NEFT, RTGS, & IMPS
              </h3>
              <p className="text-xs text-[#8B949E] leading-relaxed flex-1 mb-6">
                An exhaustive breakdown of payment limits, settlement speeds, and transaction charges across leading national electronic networks.
              </p>
              <button
                onClick={() => { onPageChange('blog-detail', 'digital-payment-systems-india-upi-neft-rtgs-imps'); if (typeof window !== 'undefined') window.scrollTo(0,0); }}
                className="text-xs font-bold text-[#58A6FF] flex items-center gap-1.5 self-start cursor-pointer"
              >
                <span>Read Full Article</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl overflow-hidden flex flex-col hover:border-[#58A6FF] transition-all group">
            <div className="h-48 overflow-hidden bg-[#0D1117] relative">
              <img 
                src="https://picsum.photos/seed/cybersecurity/800/450" 
                alt="Banking Fraud Protection" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-4 left-4 bg-[#1F242C]/90 text-[10px] font-bold text-[#FF7B72] px-2.5 py-0.5 border border-[#30363D] rounded-md backdrop-blur-xs uppercase tracking-wider">
                Cybersecurity
              </span>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <span className="text-xs text-[#8B949E] font-medium block mb-2">June 17, 2026 • 8 min read</span>
              <h3 className="text-lg font-bold text-[#E6EDF3] group-hover:text-[#58A6FF] transition-colors leading-snug mb-3">
                How to Protect Yourself from Online Banking & UPI Frauds in 2026
              </h3>
              <p className="text-xs text-[#8B949E] leading-relaxed flex-1 mb-6">
                A security guideline checklist decoding UPI requests, duplicate OTP collection forms, and smart physical credential management.
              </p>
              <button
                onClick={() => { onPageChange('blog-detail', 'protect-online-banking-upi-frauds-security'); if (typeof window !== 'undefined') window.scrollTo(0,0); }}
                className="text-xs font-bold text-[#58A6FF] flex items-center gap-1.5 self-start cursor-pointer"
              >
                <span>Read Full Article</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
