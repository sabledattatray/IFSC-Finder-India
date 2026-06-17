import { Landmark, ShieldCheck, FileText, ChevronRight, Scale, Info, CheckCircle, ArrowLeft } from 'lucide-react';
import { AnimatedSection } from './animations/AnimatedSection';

interface LegalPagesProps {
  pageType: 'privacy' | 'terms' | 'disclaimer';
  onPageChange: (page: 'home' | 'search' | 'blogs' | 'blog-detail' | 'privacy' | 'terms' | 'disclaimer') => void;
}

export default function LegalPages({ pageType, onPageChange }: LegalPagesProps) {
  
  const handleScrollTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0,0);
    }
  };

  const pageContent = {
    privacy: {
      tag: 'Data Safety Policy',
      title: 'Privacy Policy Agreement',
      subtitle: 'How we process requests, secure local browser memories, and maintain zero lookup logs.',
      date: 'Updated: June 17, 2026',
      icon: <ShieldCheck className="w-8 h-8 text-[#00E5A0]" />,
      sections: [
        {
          heading: '1. No Personal Data Processing',
          body: 'IFSC Finder India values individual privacy. Our tool is built to offer direct routing validations without requiring user account creation, profile registers, email logs, or banking credentials. We do not prompt, collect, or store any sensitive personal data.'
        },
        {
          heading: '2. Request Queries Caching & Resolution logs',
          body: 'We operate state-of-the-art parallel offline systems. Searching via IFSC codes, location trees, or pincodes is processed entirely on client-side state hooks or through anonymous server-side requests. We do not store, link, or analyze what specific codes you are searching for.'
        },
        {
          heading: '3. Local Client Storage Usage',
          body: "When you select bank branches as 'Saved' or 'Favorites', we write these choices to your browser's localized `localStorage` files. This is a local process; no files are sent to remote servers or third-party networks. You can clear this data at any point by purging your cache."
        },
        {
          heading: '4. Absolute Zero Tracking Cookies',
          body: 'We do not implement persistent analytics cookies, marketing pixel trackers, or targeted advertising networks. Our platform is dedicated purely as high-performance public utility software.'
        }
      ]
    },
    terms: {
      tag: 'Usage Agreement',
      title: 'Terms of Service',
      subtitle: 'Understanding structural conditions, copyright permissions, and bank code directory usages.',
      date: 'Updated: June 17, 2026',
      icon: <Scale className="w-8 h-8 text-[#00C2FF]" />,
      sections: [
        {
          heading: '1. Technical Utility Purpose',
          body: 'Our systems serve as a public routing directory mapping central databases. Users are permitted to use this tool for search, query, and administrative double-checks. You must not abuse our search endpoints through automatic web scrapers or server stress-testing commands.'
        },
        {
          heading: '2. Zero Warranties & Accuracy Thresholds',
          body: 'While we pre-compute and process master indices published by the Reserve Bank of India, routing standards and operational branch statuses may change without notice. IFSC Finder India provides these directories ON AN "AS IS" BASIS, without express accuracy warranties.'
        },
        {
          heading: '3. Intellectual Property Coordinates',
          body: 'The structured templates, design layouts, and parallel computing codes inside IFSC Finder India are protected. Commercial bank trade marks and logos displayed belong explicitly to their respective parent corporations.'
        },
        {
          heading: '4. Service Modification & Decommissioning',
          body: 'We reserve the right to modify, adjust, or discontinue specific lookup components to adapt to RBI network protocols or server configurations.'
        }
      ]
    },
    disclaimer: {
      tag: 'Fidelity Guard',
      title: 'Disclaimers & Verification Guidelines',
      subtitle: 'Critical safety measures regarding offline caches, branch mergers, and high-value wire transfers.',
      date: 'Updated: June 17, 2026',
      icon: <Info className="w-8 h-8 text-[#FF7B72]" />,
      sections: [
        {
          heading: '1. Mergers & Consolidated Branches Warning',
          body: "In recent years, several public banks (e.g. Allahabad Bank into Indian Bank, Syndicate Bank into Canara Bank) merged. In these events, millions of old IFSC codes were decommissioned. If you execute transfers using old codes, your money may bounce or experience long holding times. Always verify codes on the beneficiary's physical banking passbook."
        },
        {
          heading: '2. High-Value RTGS/NEFT Transaction Rules',
          body: 'When initiating high-sum wire transfers (e.g., purchasing property or multi-lakh company invoices), do not rely solely on online searches. ALWAYS confirm the destination branch coordinates directly with the bank teller or run an official test transaction of ₹1 to ₹10 first.'
        },
        {
          heading: '3. Educational & Utility Limits',
          body: 'This platform is not an official branch of the Reserve Bank of India or any Commercial Bank. It has been built as an independent, high-performance portal by Datta Sable. The final authority on routing and codes remains the official central bank registry.'
        },
        {
          heading: '4. Dynamic Database Updates',
          body: 'While we strive to synchronize local caches with periodic government releases, minor lags can occur in updating newly opened rural banking divisions. Verification with official passbooks is always recommended.'
        }
      ]
    }
  };

  const currentDoc = pageContent[pageType];

  return (
    <div className="w-full text-[#E2E8F0] py-12 md:py-20 selection:bg-[#00C2FF]/20 selection:text-[#00C2FF] mesh-gradient grid-pattern noise-overlay">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Breadcrumbs */}
        <AnimatedSection direction="down" delay={0.1}>
          <nav className="flex items-center gap-2 text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-6">
            <button onClick={() => onPageChange('home')} className="hover:text-[#00C2FF] transition-colors cursor-pointer">
              Home
            </button>
            <ChevronRight className="w-3 text-[#64748B]" />
            <span className="text-white">
              {currentDoc.title}
            </span>
          </nav>
        </AnimatedSection>

        {/* Back Button */}
        <AnimatedSection direction="left" delay={0.15}>
          <button
            onClick={() => { onPageChange('home'); handleScrollTop(); }}
            className="btn-secondary !py-2.5 !px-5 text-xs flex items-center gap-2 mb-10 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return Home</span>
          </button>
        </AnimatedSection>

        {/* Header Hero banner */}
        <AnimatedSection direction="up" delay={0.2} className="glass-card-strong p-6 sm:p-10 mb-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-xl relative overflow-hidden bg-[#0F172A]/40">
          <div className="absolute top-0 right-0 h-32 w-32 bg-[radial-gradient(ellipse_at_top_right,rgba(0,194,255,0.06),transparent)] pointer-events-none"></div>
          <div className="p-4 bg-[#081120] border border-white/[0.08] rounded-2xl shrink-0 text-white shadow-lg">
            {currentDoc.icon}
          </div>
          <div className="text-center sm:text-left flex-1">
            <span className="px-2.5 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
              {currentDoc.tag}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2.5 mb-2.5">
              {currentDoc.title}
            </h1>
            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed mb-5">
              {currentDoc.subtitle}
            </p>
            <span className="text-[11px] font-mono font-semibold text-[#00C2FF] bg-[#00C2FF]/10 px-2.5 py-1 rounded-md border border-[#00C2FF]/15">
              {currentDoc.date}
            </span>
          </div>
        </AnimatedSection>

        {/* Document Sections */}
        <div className="space-y-8 mb-12">
          {currentDoc.sections.map((section, idx) => (
            <AnimatedSection key={`sec-${idx}`} direction="up" delay={0.25 + (idx * 0.05)} className="glass-card p-6 border-white/[0.05] hover:border-white/[0.1] transition-all duration-300">
              <h2 className="text-base font-bold text-white mb-3 border-b border-white/[0.06] pb-2.5 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#00C2FF] shadow-lg shadow-[#00C2FF]/50 animate-pulse"></span>
                <span>{section.heading}</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed text-justify antialiased">
                {section.body}
              </p>
            </AnimatedSection>
          ))}
        </div>

        {/* Action Call for Verification Info */}
        <AnimatedSection direction="up" delay={0.4} className="glass-card-strong p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md bg-[#0F172A]/40">
          <div className="text-center sm:text-left">
            <h4 className="text-sm font-bold text-white mb-1.5">Verify codes immediately utilizing official index trees</h4>
            <p className="text-xs text-[#94A3B8]">Our local database contains 173,000+ branch records backed by standard RBI directories.</p>
          </div>
          <button
            onClick={() => { onPageChange('search'); handleScrollTop(); }}
            className="btn-primary text-xs font-bold uppercase tracking-wider !py-3 !px-6 shrink-0"
          >
            Launch Tools
          </button>
        </AnimatedSection>

      </div>
    </div>
  );
}
