import { Landmark, ShieldCheck, FileText, ChevronRight, Scale, Info, CheckCircle, ArrowLeft } from 'lucide-react';

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
      icon: <ShieldCheck className="w-8 h-8 text-[#7EE787]" />,
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
      icon: <Scale className="w-8 h-8 text-[#58A6FF]" />,
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
    <div className="w-full bg-[#0D1117] text-[#C9D1D9] py-12 md:py-20 selection:bg-[#58A6FF]/20 selection:text-[#58A6FF]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-8">
          <button onClick={() => onPageChange('home')} className="hover:text-[#58A6FF] transition-colors cursor-pointer">
            Home
          </button>
          <ChevronRight className="w-3" />
          <span className="text-[#C9D1D9]">
            {currentDoc.title}
          </span>
        </nav>

        {/* Back Button */}
        <button
          onClick={() => { onPageChange('home'); handleScrollTop(); }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#21262D] border border-[#30363D] hover:bg-[#30363D] text-xs font-bold text-[#E6EDF3] transition-colors mb-10 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return Home</span>
        </button>

        {/* Header Hero banner */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 sm:p-10 mb-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-32 w-32 bg-[radial-gradient(ellipse_at_top_right,rgba(88,166,255,0.05),transparent)]"></div>
          <div className="p-4 bg-[#0D1117] border border-[#30363D] rounded-2xl shrink-0">
            {currentDoc.icon}
          </div>
          <div className="text-center sm:text-left flex-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#21262D] border border-[#30363D] text-[10px] font-bold text-[#8B949E] uppercase tracking-wider">
              {currentDoc.tag}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#E6EDF3] tracking-tight mt-2.5 mb-2">
              {currentDoc.title}
            </h1>
            <p className="text-xs sm:text-sm text-[#8B949E] leading-relaxed mb-4">
              {currentDoc.subtitle}
            </p>
            <span className="text-[11px] font-mono font-semibold text-[#58A6FF] bg-[#58A6FF]/10 px-2 py-0.5 rounded-md border border-[#58A6FF]/15">
              {currentDoc.date}
            </span>
          </div>
        </div>

        {/* Document Sections */}
        <div className="space-y-10 mb-12">
          {currentDoc.sections.map((section, idx) => (
            <section key={`sec-${idx}`} className="bg-[#161B22]/40 border border-[#30363D]/60 rounded-xl p-6 hover:bg-[#161B22]/60 hover:border-[#30363D] transition-colors">
              <h2 className="text-lg font-bold text-[#E6EDF3] mb-3 border-b border-[#30363D] pb-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#58A6FF]"></span>
                <span>{section.heading}</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#8B949E] leading-relaxed text-justify antialiased">
                {section.body}
              </p>
            </section>
          ))}
        </div>

        {/* Action Call for Verification Info */}
        <div className="bg-[#1F242C] border border-[#30363D] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="text-center sm:text-left">
            <h4 className="text-sm font-bold text-[#FCFCFC] mb-1">Verify codes immediately utilizing official index trees</h4>
            <p className="text-xs text-[#8B949E]">Our local database contains 173,000+ branch records backed by standard RBI directories.</p>
          </div>
          <button
            onClick={() => { onPageChange('search'); handleScrollTop(); }}
            className="w-full sm:w-auto py-2.5 px-6 rounded-lg bg-[#2ea043] hover:bg-[#238636] font-bold text-xs text-white uppercase tracking-wider transition-colors shrink-0 cursor-pointer"
          >
            Launch Tools
          </button>
        </div>

      </div>
    </div>
  );
}
