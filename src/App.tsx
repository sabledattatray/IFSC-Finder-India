import { useState, FormEvent, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Search, Clock, Star, Copy, FileText, CheckCircle2, ChevronRight, Share2, MapPin, Building, Globe, Activity, Map, Navigation, Database, Phone, Mail, Box, Shield, Calendar, Calculator, Bookmark, RotateCcw, ChevronDown, Check, X } from 'lucide-react';

// Custom Portal Components
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import BlogPage from './components/BlogPage';
import LegalPages from './components/LegalPages';
import { AnimatedSection, StaggerContainer, StaggerItem } from './components/animations/AnimatedSection';

// Define the shape of our API response based on Razorpay IFSC API
interface IfscDetails {
  BANK: string;
  BRANCH: string;
  IFSC: string;
  MICR: string;
  SWIFT?: string;
  BRANCH_CODE?: string;
  ADDRESS: string;
  CITY: string;
  DISTRICT: string;
  STATE: string;
  CONTACT: string;
  EMAIL?: string;
  IMPS: boolean;
  NEFT: boolean;
  RTGS: boolean;
  UPI: boolean;
  ATM?: boolean;
  CASH_DEPOSIT?: boolean;
  LOCKER?: boolean;
  BANKCODE: string;
}

type SearchMode = 'master' | 'ifsc' | 'bank' | 'branch' | 'pincode' | 'location';

function SearchableSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  allOptionText
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: { label: string; value: string }[];
  placeholder: string;
  disabled?: boolean;
  allOptionText?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Synchronize searchQuery with current value's label when dropdown is closed or value changes
  useEffect(() => {
    const selectedOpt = options.find(o => o.value === value);
    if (selectedOpt) {
      setSearchQuery(selectedOpt.label);
    } else if (value === 'ALL') {
      setSearchQuery(allOptionText || 'All');
    } else {
      setSearchQuery('');
    }
  }, [value, options, allOptionText]);

  // Close dropdown gracefully when clicking outside options container
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Try to select if there is a case-insensitive exact matching option for the typed text
        const trimmedQuery = searchQuery.trim().toLowerCase();
        const matchedOpt = options.find(o => o.label.toLowerCase() === trimmedQuery || o.value.toLowerCase() === trimmedQuery);
        if (matchedOpt) {
          onChange(matchedOpt.value);
          setSearchQuery(matchedOpt.label);
        } else {
          // Reset query status to match selected
          const selectedOpt = options.find(o => o.value === value);
          if (selectedOpt) {
            setSearchQuery(selectedOpt.label);
          } else if (value === 'ALL') {
            setSearchQuery(allOptionText || 'All');
          } else {
            setSearchQuery('');
          }
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen, value, options, allOptionText]);

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    opt.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div ref={containerRef} className="flex flex-col gap-1.5 w-full relative">
      <div className="flex justify-between items-center px-1">
        <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">{label}</label>
        {value && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
              setSearchQuery('');
            }}
            type="button"
            className="text-[10px] text-[#FF7B72] hover:text-[#FFA198] font-semibold transition-colors cursor-pointer focus:outline-none"
          >
            Clear
          </button>
        )}
      </div>

      <div className="relative">
        <div className="flex items-center relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={() => {
              if (!disabled) setIsOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredOptions.length > 0) {
                  const firstMatch = filteredOptions[0];
                  onChange(firstMatch.value);
                  setSearchQuery(firstMatch.label);
                  setIsOpen(false);
                }
              }
            }}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full bg-[#010409]/60 border border-white/[0.08] rounded-xl pl-3.5 pr-10 py-2.5 focus:border-[#00C2FF] text-sm text-[#E2E8F0] focus:outline-none focus:ring-1 focus:ring-[#00C2FF] shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-text transition-all"
          />
          <div className="absolute right-3 flex items-center gap-1.5">
            {value && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onChange('');
                  setSearchQuery('');
                }}
                type="button"
                className="text-[#64748B] hover:text-white p-0.5 focus:outline-none cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => {
                if (!disabled) setIsOpen(!isOpen);
              }}
              type="button"
              disabled={disabled}
              className="text-[#64748B] hover:text-white focus:outline-none cursor-pointer"
            >
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {isOpen && !disabled && (
          <div className="absolute left-0 right-0 mt-2 max-h-56 overflow-y-auto bg-[#0F172A]/95 backdrop-blur-2xl border border-white/[0.08] rounded-xl shadow-2xl z-20 py-1.5">
            {allOptionText && (
              <button
                onClick={() => {
                  onChange('ALL');
                  setSearchQuery(allOptionText);
                  setIsOpen(false);
                }}
                type="button"
                className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between cursor-pointer focus:outline-none
                  ${value === 'ALL' ? 'bg-white/[0.04] text-[#00C2FF] font-semibold' : 'text-[#94A3B8] hover:bg-white/[0.03] hover:text-white'}`}
              >
                <span>{allOptionText}</span>
                {value === 'ALL' && <Check className="w-4 h-4" />}
              </button>
            )}
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-2 text-xs text-[#64748B] italic">
                No matching options found
              </div>
            ) : (
              filteredOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setSearchQuery(opt.label);
                    setIsOpen(false);
                  }}
                  type="button"
                  className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between cursor-pointer focus:outline-none
                    ${value === opt.value ? 'bg-white/[0.04] text-[#00C2FF] font-semibold' : 'text-[#94A3B8] hover:bg-white/[0.03] hover:text-white'}`}
                >
                  <span className="truncate pr-4">{opt.label}</span>
                  {value === opt.value && <Check className="w-4 h-4" />}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------------
// MICR LOCATOR MODAL
// ------------------------------------------------------------------------
function MicrModal({ onClose, onGoToIfsc }: { onClose: () => void; onGoToIfsc: (ifsc: string) => void }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/search-micr?q=')
      .then(res => res.json())
      .then(data => {
        setResults(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSearch = (val: string) => {
    setQuery(val);
    setLoading(true);
    fetch(`/api/search-micr?q=${encodeURIComponent(val)}`)
      .then(res => res.json())
      .then(data => {
        setResults(data);
        setError(null);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Failed to fetch results");
        setLoading(false);
      });
  };

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const copyText = (txt: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(txt);
      setCopiedCode(txt);
      setTimeout(() => setCopiedCode(null), 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-4xl glass-card-strong !bg-[#070d19]/95 border border-white/[0.08] flex flex-col h-[85vh] max-h-[750px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden relative animate-in zoom-in-95 duration-300">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#0057D9]/10 rounded-full blur-[45px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#00C2FF]/5 rounded-full blur-[40px] pointer-events-none" />

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/[0.06] bg-[#081120]/40 relative z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/[0.03] border border-white/[0.06] text-[#00C2FF] rounded-xl shadow-md">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base md:text-lg text-white">MICR Locator</h3>
              <p className="text-xs text-[#64748B]">Find, search and verify banking check routing codes (Magnetic Ink Character Recognition)</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 text-[#64748B] hover:text-white transition-colors cursor-pointer border border-transparent hover:border-white/[0.06] active:scale-95">
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:grid md:grid-cols-3 md:gap-6 flex flex-col gap-6 relative z-10">
          {/* Left search pane - col-span-2 */}
          <div className="md:col-span-2 flex flex-col gap-4 overflow-hidden h-full">
            <div className="relative shrink-0">
              <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-[#64748B]" />
              <input 
                type="text"
                placeholder="Enter 9-digit MICR code (e.g. 400002002) or partial number..."
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#0F172A]/60 border border-white/[0.08] rounded-xl text-white placeholder-[#64748B] focus:outline-none focus:border-[#00C2FF] focus:ring-1 focus:ring-[#00C2FF] text-sm transition-all"
              />
            </div>

            {loading ? (
              <div className="flex-grow flex flex-col items-center justify-center py-12 text-[#64748B] gap-2">
                <div className="w-6 h-6 border-2 border-t-transparent border-[#00C2FF] rounded-full animate-spin"></div>
                <span className="text-xs font-semibold font-mono tracking-wider">Scanning index records...</span>
              </div>
            ) : error ? (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-[#FF7B72] rounded-xl text-xs shrink-0">{error}</div>
            ) : results.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center text-center py-12">
                <span className="text-sm text-[#64748B] italic">No branches matching your MICR query found.</span>
              </div>
            ) : (
              <div className="flex-grow space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-2 shrink-0">Showing {results.length} Bank Branches</div>
                {results.map((b, i) => (
                  <div key={i} className="p-4.5 bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] rounded-xl transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="text-[10px] font-bold text-[#00C2FF] uppercase tracking-wider">{b.BANK}</div>
                      <div className="text-sm font-bold text-white break-words">{b.BRANCH}</div>
                      <div className="text-xs text-[#94A3B8] leading-relaxed break-words">{b.ADDRESS}</div>
                      <div className="flex flex-wrap gap-1.5 pt-1.5">
                        {b.IMPS && <span className="bg-[#081120] border border-white/[0.06] text-[#00E5A0] text-[9px] px-2 py-0.5 rounded font-mono font-semibold">IMPS</span>}
                        {b.NEFT && <span className="bg-[#081120] border border-white/[0.06] text-[#00C2FF] text-[9px] px-2 py-0.5 rounded font-mono font-semibold">NEFT</span>}
                        {b.RTGS && <span className="bg-[#081120] border border-white/[0.06] text-[#FF7B72] text-[9px] px-2 py-0.5 rounded font-mono font-semibold">RTGS</span>}
                        {b.UPI && <span className="bg-[#081120] border border-white/[0.06] text-[#00E5A0] text-[9px] px-2 py-0.5 rounded font-mono font-semibold">UPI</span>}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-3 shrink-0 sm:border-l sm:border-white/[0.06] sm:pl-5">
                      <div>
                        <div className="text-[10px] text-[#64748B] font-bold text-right uppercase tracking-wider">MICR CODE</div>
                        <div className="font-mono text-sm text-[#00E5A0] font-bold flex items-center gap-1.5 bg-[#081120] px-3 py-1.5 rounded-lg border border-white/[0.06] shadow-inner mt-1">
                          <span>{b.MICR}</span>
                          <button onClick={() => copyText(b.MICR)} className="p-0.5 hover:text-white text-[#64748B] transition-colors cursor-pointer">
                            {copiedCode === b.MICR ? <Check className="w-3.5 h-3.5 text-[#00C2FF]" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <button 
                          onClick={() => { onGoToIfsc(b.IFSC); }}
                          className="text-xs text-[#00C2FF] hover:text-[#00E5A0] hover:underline flex items-center gap-1.5 font-bold cursor-pointer"
                        >
                          View IFSC: {b.IFSC} <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right info pane - educational */}
          <div className="glass-card !bg-white/[0.01] border-white/[0.05] p-5 flex flex-col justify-between gap-4 overflow-y-auto h-full">
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white border-b border-white/[0.06] pb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#00C2FF]" />
                What is an MICR Code?
              </h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                MICR stands for <strong>Magnetic Ink Character Recognition</strong>. It is a 9-digit character recognition technology used mainly by the banking industry to ease the processing and clearing of cheques.
              </p>

              <div className="space-y-2.5">
                <h5 className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider font-mono">Structure of 9-Digit Code:</h5>
                <ul className="space-y-2">
                  <li className="text-xs bg-[#081120]/80 p-2.5 border border-white/[0.06] rounded-xl">
                    <span className="font-bold text-[#00C2FF] block font-mono">Digits 1, 2, 3</span>
                    <span className="text-[#94A3B8] text-[11px] leading-relaxed block mt-0.5">Represent the <strong>City Code</strong> matching the PIN code of the city. (e.g. 400 for Mumbai)</span>
                  </li>
                  <li className="text-xs bg-[#081120]/80 p-2.5 border border-white/[0.06] rounded-xl">
                    <span className="font-bold text-[#00E5A0] block font-mono">Digits 4, 5, 6</span>
                    <span className="text-[#94A3B8] text-[11px] leading-relaxed block mt-0.5">Represent the <strong>Bank Code</strong> unique to that bank institution. (e.g. 002 for SBI)</span>
                  </li>
                  <li className="text-xs bg-[#081120]/80 p-2.5 border border-white/[0.06] rounded-xl">
                    <span className="font-bold text-[#FF7B72] block font-mono">Digits 7, 8, 9</span>
                    <span className="text-[#94A3B8] text-[11px] leading-relaxed block mt-0.5">Represent the particular bank's <strong>Branch Code</strong>. (e.g. 001 for main branch)</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-[10px] text-[#64748B] bg-white/[0.02] p-3 rounded-lg border border-white/[0.04] italic leading-normal">
              * Unlike IFSC (which is alphanumeric, designed for digital transactions), MICR is strictly printed using security magnetic ink on physical cheques for high-speed scanners.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------------
// SWIFT SEARCH MODAL
// ------------------------------------------------------------------------
function SwiftModal({ onClose, onGoToIfsc }: { onClose: () => void; onGoToIfsc: (ifsc: string) => void }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/search-swift?q=')
      .then(res => res.json())
      .then(data => {
        setResults(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSearch = (val: string) => {
    setQuery(val);
    setLoading(true);
    fetch(`/api/search-swift?q=${encodeURIComponent(val)}`)
      .then(res => res.json())
      .then(data => {
        setResults(data);
        setError(null);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Failed to fetch results");
        setLoading(false);
      });
  };

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const copyText = (txt: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(txt);
      setCopiedCode(txt);
      setTimeout(() => setCopiedCode(null), 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-4xl glass-card-strong !bg-[#070d19]/95 border border-white/[0.08] flex flex-col h-[85vh] max-h-[750px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden relative animate-in zoom-in-95 duration-300">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#00C2FF]/10 rounded-full blur-[45px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#0057D9]/5 rounded-full blur-[40px] pointer-events-none" />

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/[0.06] bg-[#081120]/40 relative z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/[0.03] border border-white/[0.06] text-[#00C2FF] rounded-xl shadow-md">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base md:text-lg text-white">SWIFT / BIC Search</h3>
              <p className="text-xs text-[#64748B]">Search international wire transfer routing codes for cross-border banking</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 text-[#64748B] hover:text-white transition-colors cursor-pointer border border-transparent hover:border-white/[0.06] active:scale-95">
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:grid md:grid-cols-3 md:gap-6 flex flex-col gap-6 relative z-10">
          {/* Left search pane - col-span-2 */}
          <div className="md:col-span-2 flex flex-col gap-4 overflow-hidden h-full">
            <div className="relative shrink-0">
              <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-[#64748B]" />
              <input 
                type="text"
                placeholder="Enter SWIFT/BIC code (e.g. SBININ) or bank name..."
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#0F172A]/60 border border-white/[0.08] rounded-xl text-white placeholder-[#64748B] focus:outline-none focus:border-[#00C2FF] focus:ring-1 focus:ring-[#00C2FF] text-sm transition-all"
              />
            </div>

            {loading ? (
              <div className="flex-grow flex flex-col items-center justify-center py-12 text-[#64748B] gap-2">
                <div className="w-6 h-6 border-2 border-t-transparent border-[#00C2FF] rounded-full animate-spin"></div>
                <span className="text-xs font-semibold font-mono tracking-wider">Scanning Forex SWIFT records...</span>
              </div>
            ) : error ? (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-[#FF7B72] rounded-xl text-xs shrink-0">{error}</div>
            ) : results.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center text-center py-12">
                <span className="text-sm text-[#64748B] italic">No branches matching your SWIFT query found.</span>
              </div>
            ) : (
              <div className="flex-grow space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-2 shrink-0">Showing {results.length} SWIFT-Enabled Branches</div>
                {results.map((b, i) => (
                  <div key={i} className="p-4.5 bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] rounded-xl transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="text-[10px] font-bold text-[#00C2FF] uppercase tracking-wider">{b.BANK}</div>
                      <div className="text-sm font-bold text-white break-words">{b.BRANCH}</div>
                      <div className="text-xs text-[#94A3B8] leading-relaxed break-words">{b.ADDRESS}</div>
                      <div className="flex items-center gap-2 pt-2">
                        <span className="bg-[#081120] border border-white/[0.06] text-[#94A3B8] text-[10px] px-2.5 py-0.5 rounded font-mono font-semibold">City: {b.CITY}</span>
                        <span className="bg-[#081120] border border-white/[0.06] text-[#94A3B8] text-[10px] px-2.5 py-0.5 rounded font-mono font-semibold">State: {b.STATE}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-3 shrink-0 sm:border-l sm:border-white/[0.06] sm:pl-5">
                      <div>
                        <div className="text-[10px] text-[#64748B] font-bold text-right uppercase tracking-wider">SWIFT / BIC</div>
                        <div className="font-mono text-base text-[#00C2FF] font-bold flex items-center gap-1.5 bg-[#081120] px-3 py-1.5 rounded-lg border border-white/[0.06] shadow-inner mt-1">
                          <span>{b.SWIFT}</span>
                          <button onClick={() => copyText(b.SWIFT)} className="p-0.5 hover:text-white text-[#64748B] transition-colors cursor-pointer">
                            {copiedCode === b.SWIFT ? <Check className="w-3.5 h-3.5 text-[#00C2FF]" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <button 
                          onClick={() => { onGoToIfsc(b.IFSC); }}
                          className="text-xs text-[#00C2FF] hover:text-[#00E5A0] hover:underline flex items-center gap-1.5 font-bold cursor-pointer"
                        >
                          Check IFSC: {b.IFSC} <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right info pane - educational */}
          <div className="glass-card !bg-white/[0.01] border-white/[0.05] p-5 flex flex-col justify-between gap-4 overflow-y-auto h-full">
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white border-b border-white/[0.06] pb-2 flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#00C2FF]" />
                SWIFT Code Info
              </h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                SWIFT stands for <strong>Society for Worldwide Interbank Financial Telecommunication</strong> (also called BIC - Bank Identifier Code).
              </p>

              <div className="space-y-2">
                <h5 className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-2">Wire Checklist:</h5>
                <div className="space-y-2 text-xs text-slate-200">
                  <p className="text-[11px] text-[#64748B]">To receive money from overseas, you always need:</p>
                  <div className="p-3 bg-[#081120]/80 border border-white/[0.06] rounded-xl space-y-2 font-sans">
                    <div className="flex justify-between border-b border-white/[0.03] pb-1"><span className="text-xs text-[#64748B]">1. Bank Name</span><span className="font-bold text-white text-right text-[11px]">e.g. State Bank of India</span></div>
                    <div className="flex justify-between border-b border-white/[0.03] pb-1"><span className="text-xs text-[#64748B]">2. SWIFT Code</span><span className="font-mono text-[#00C2FF] font-semibold text-right">8 or 11 Character Code</span></div>
                    <div className="flex justify-between border-b border-white/[0.03] pb-1"><span className="text-xs text-[#64748B]">3. IFSC Code</span><span className="font-mono text-[#00E5A0] text-[11px] font-semibold text-right">Local branch IFSC</span></div>
                    <div className="flex justify-between border-b border-white/[0.03] pb-1"><span className="text-xs text-[#64748B]">4. Account No</span><span className="font-semibold text-white text-right font-mono">Your savings account</span></div>
                    <div className="flex justify-between"><span className="text-xs text-[#64748B]">5. Beneficiary</span><span className="font-semibold text-white text-right text-[11px]">Match exact banking name</span></div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#081120]/80 border border-white/[0.06] rounded-xl text-xs text-[#94A3B8]">
                <strong className="text-white block mb-1 font-semibold">💡 Important Note</strong>
                Not every branch has a unique SWIFT code. Often only Forex Hubs or Head Offices have their own SWIFT code and process international transactions for smaller branches in the region.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------------
// BANK HOLIDAYS MODAL
// ------------------------------------------------------------------------
function HolidaysModal({ onClose }: { onClose: () => void }) {
  const [selectedState, setSelectedState] = useState<string>('National');
  const [selectedMonth, setSelectedMonth] = useState<string>('All');

  const states = [
    'National', 'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 
    'West Bengal', 'Uttar Pradesh', 'Gujarat', 'Kerala', 'Telangana'
  ];

  const months = ['All', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const holidayList = [
    { date: '2026-01-01', day: 'Thursday', name: "New Year's Day", type: 'Restricted', state: 'National', desc: 'Restricted bank holiday celebrating the New Year' },
    { date: '2026-01-14', day: 'Wednesday', name: 'Makar Sankranti / Pongal', type: 'State Holiday', state: 'Tamil Nadu, Maharashtra, Gujarat', desc: 'Harvest festival celebrated across several Indian states' },
    { date: '2026-01-26', day: 'Monday', name: 'Republic Day', type: 'National Holiday', state: 'National', desc: 'National Gazetted Holiday celebrating foundation of Republic of India' },
    { date: '2026-02-15', day: 'Sunday', name: 'Maha Shivratri', type: 'State Holiday', state: 'Maharashtra, Delhi, Gujarat, Karnataka', desc: 'Major Hindu festival in honor of Lord Shiva' },
    { date: '2026-03-03', day: 'Tuesday', name: 'Holi', type: 'State Holiday', state: 'National (except South)', desc: 'Festival of Colors celebrated widely' },
    { date: '2026-04-02', day: 'Thursday', name: 'Good Friday', type: 'State Holiday', state: 'National', desc: 'Christian religious holiday preceding Easter Sunday' },
    { date: '2026-04-18', day: 'Saturday', name: 'Eid-ul-Fitr / Ramzan Eid', type: 'State Holiday', state: 'National', desc: 'End of Islamic holy fasting month of Ramadan' },
    { date: '2026-05-01', day: 'Friday', name: 'Maharashtra Day / May Day', type: 'State Holiday', state: 'Maharashtra', desc: 'Foundation day of the state of Maharashtra' },
    { date: '2026-05-25', day: 'Monday', name: 'Bakrid / Eid-al-Adha', type: 'State Holiday', state: 'National', desc: 'Islamic Festival of Sacrifice' },
    { date: '2026-07-25', day: 'Saturday', name: 'Muharram', type: 'State Holiday', state: 'National', desc: 'Islamic day of solemn remembrance' },
    { date: '2026-08-15', day: 'Saturday', name: 'Independence Day', type: 'National Holiday', state: 'National', desc: 'National Gazetted Holiday celebrating freedom from British Rule' },
    { date: '2026-09-04', day: 'Friday', name: 'Janmashtami', type: 'State Holiday', state: 'Uttar Pradesh, Delhi, Gujarat', desc: 'Hindu festival celebrating birth of Lord Krishna' },
    { date: '2026-09-15', day: 'Tuesday', name: 'Ganesh Chaturthi', type: 'State Holiday', state: 'Maharashtra, Tamil Nadu, Karnataka', desc: 'Ten-day Hindu festival for Lord Ganesha' },
    { date: '2026-10-02', day: 'Friday', name: 'Gandhi Jayanti', type: 'National Holiday', state: 'National', desc: 'National Gazetted Holiday celebrating Father of Nation Mohandas Gandhi' },
    { date: '2026-10-20', day: 'Tuesday', name: 'Dussehra / Vijayadashami', type: 'State Holiday', state: 'National', desc: 'Victory of good over evil (Lord Rama defeating Ravana)' },
    { date: '2026-11-08', day: 'Sunday', name: 'Diwali / Deepavali', type: 'National Holiday', state: 'National', desc: 'Hindu Festival of Lights celebrated with lamps and sweets' },
    { date: '2026-11-09', day: 'Monday', name: 'Govardhan Puja / New Year', type: 'State Holiday', state: 'Gujarat, Maharashtra', desc: 'Day after Diwali custom holidays' },
    { date: '2026-11-23', day: 'Monday', name: 'Guru Nanak Jayanti', type: 'State Holiday', state: 'Punjab, Delhi, Maharashtra', desc: 'Birth of the first Sikh Guru' },
    { date: '2026-12-25', day: 'Friday', name: 'Christmas Day', type: 'National Holiday', state: 'National', desc: 'Christian holiday celebrating the birth of Jesus Christ' }
  ];

  const getMonthAbbr = (dateStr: string) => {
    const parts = dateStr.split('-');
    const m = parseInt(parts[1]);
    const monthsAbbr = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthsAbbr[m] || '';
  };

  const filteredHolidays = holidayList.filter(h => {
    const stateMatch = selectedState === 'National' || 
                       h.state === 'National' || 
                       h.state.toUpperCase().includes(selectedState.toUpperCase());
                       
    const mAbbr = getMonthAbbr(h.date);
    const monthMatch = selectedMonth === 'All' || mAbbr === selectedMonth;
    
    return stateMatch && monthMatch;
  });

  const getDaysCountLeft = (targetDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize to start of today
    const target = new Date(targetDateStr);
    const diff = target.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const nextHoliday = holidayList
    .filter(h => getDaysCountLeft(h.date) >= 0)
    .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-4xl glass-card-strong !bg-[#070d19]/95 border border-white/[0.08] flex flex-col h-[85vh] max-h-[750px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden relative animate-in zoom-in-95 duration-300">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#00C2FF]/10 rounded-full blur-[45px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#00E5A0]/5 rounded-full blur-[40px] pointer-events-none" />

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/[0.06] bg-[#081120]/40 relative z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/[0.03] border border-white/[0.06] text-[#FF7B72] rounded-xl shadow-md">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base md:text-lg text-white">Bank Holidays Calendar — 2026</h3>
              <p className="text-xs text-[#64748B]">Official RBI recognized bank closures for national & state-wise holidays in India</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 text-[#64748B] hover:text-white transition-colors cursor-pointer border border-transparent hover:border-white/[0.06] active:scale-95">
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Current Info Panel */}
        <div className="px-6 py-3 bg-[#0F172A]/85 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 relative z-10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00C2FF] animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-200">Current Date: {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          {nextHoliday && (
            <div className="text-xs text-[#94A3B8]">
              Next up: <strong className="text-white font-bold">{nextHoliday.name}</strong> on <span className="text-[#FF7B72] font-mono font-semibold">{nextHoliday.date}</span> (~{getDaysCountLeft(nextHoliday.date)} days away)
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-grow overflow-hidden flex flex-col md:flex-row relative z-10">
          {/* Main List */}
          <div className="flex-grow p-6 overflow-y-auto flex flex-col gap-5 h-full">
            {/* Filters */}
            <div className="flex flex-wrap gap-3.5 shrink-0">
              <div className="flex flex-col gap-1.5 w-44">
                <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Select State / Region</label>
                <div className="relative">
                  <select 
                    value={selectedState} 
                    onChange={e => setSelectedState(e.target.value)}
                    className="w-full bg-[#0F172A]/80 border border-white/[0.08] focus:border-[#00C2FF] rounded-xl px-3 py-2 text-xs text-white outline-none appearance-none cursor-pointer"
                  >
                    {states.map(s => <option key={s} value={s} className="bg-[#0F172A]">{s === 'National' ? 'National / All States' : s}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 w-3.5 h-3.5 text-[#64748B] pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 w-32">
                <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Month</label>
                <div className="relative">
                  <select 
                    value={selectedMonth} 
                    onChange={e => setSelectedMonth(e.target.value)}
                    className="w-full bg-[#0F172A]/80 border border-white/[0.08] focus:border-[#00C2FF] rounded-xl px-3 py-2 text-xs text-white outline-none appearance-none cursor-pointer"
                  >
                    {months.map(m => <option key={m} value={m} className="bg-[#0F172A]">{m === 'All' ? 'All Months' : m}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 w-3.5 h-3.5 text-[#64748B] pointer-events-none" />
                </div>
              </div>
            </div>

            {/* List */}
            <div className="space-y-3 overflow-y-auto pr-2 flex-grow custom-scrollbar">
              {filteredHolidays.length === 0 ? (
                <div className="text-center py-12 text-sm text-[#64748B] italic">
                  No holidays match your filter criteria in 2026.
                </div>
              ) : (
                filteredHolidays.map((h, i) => {
                  const isPastStr = getDaysCountLeft(h.date) < 0;
                  return (
                    <div 
                      key={i} 
                      className={`p-4 border rounded-xl transition-all duration-300 flex items-center justify-between gap-4
                        ${isPastStr ? 'bg-white/[0.01] border-dashed border-white/[0.04] opacity-50' : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'}`}
                    >
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full font-mono uppercase tracking-wider
                            ${h.type === 'National Holiday' ? 'bg-red-500/10 text-[#FF7B72] border border-red-500/20' : 'bg-[#00C2FF]/10 text-[#00C2FF] border border-[#00C2FF]/20'}`}>
                            {h.type}
                          </span>
                          {isPastStr && <span className="text-[9px] font-bold text-[#64748B] bg-white/[0.04] px-2 py-0.5 rounded-full uppercase">Completed</span>}
                        </div>
                        <h4 className="text-sm font-bold text-white leading-snug break-words">{h.name}</h4>
                        <p className="text-xs text-[#94A3B8] leading-relaxed break-words">{h.desc}</p>
                        <p className="text-[10px] text-[#00C2FF] font-semibold">Applicable: <span className="text-slate-300 font-medium">{h.state}</span></p>
                      </div>

                      <div className="text-center shrink-0 bg-[#081120] px-4 py-3.5 border border-white/[0.06] rounded-xl min-w-[100px] shadow-md">
                        <div className="text-[9px] font-mono font-bold text-[#64748B] uppercase leading-none">{getMonthAbbr(h.date)} 2026</div>
                        <div className="text-xl font-bold text-white font-mono leading-none my-1.5">{h.date.split('-')[2]}</div>
                        <div className="text-[9px] font-bold text-[#64748B] uppercase leading-none tracking-wide">{h.day}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Rules/Info sidebar */}
          <div className="w-full md:w-80 bg-white/[0.01] border-t md:border-t-0 md:border-l border-white/[0.06] p-6 space-y-4 text-xs overflow-y-auto h-full">
            <h4 className="text-sm font-bold text-white border-b border-white/[0.06] pb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#FF7B72]" />
              RBI Weekend Closure Rules
            </h4>
            <div className="space-y-4 leading-relaxed text-[#94A3B8]">
              <p>Under official RBI directives, commercial banks in India follow strict weekend closed schedules:</p>
              
              <div className="space-y-2.5 text-white">
                <div className="p-3 bg-[#081120]/80 border border-white/[0.06] rounded-xl flex gap-2.5 items-center">
                  <CheckCircle2 className="w-4 h-4 text-[#00E5A0] shrink-0" />
                  <div>
                    <span className="font-bold text-xs block">Sundays:</span>
                    <span className="text-[11px] text-[#64748B] block mt-0.5">All Sundays are strict bank holidays across India.</span>
                  </div>
                </div>
                
                <div className="p-3 bg-[#081120]/80 border border-white/[0.06] rounded-xl flex gap-2.5 items-center">
                  <CheckCircle2 className="w-4 h-4 text-[#00C2FF] shrink-0" />
                  <div>
                    <span className="font-bold text-xs block">2nd & 4th Saturdays:</span>
                    <span className="text-[11px] text-[#64748B] block mt-0.5">Complete closure / official banking shut downs.</span>
                  </div>
                </div>

                <div className="p-3 bg-[#081120]/80 border border-white/[0.06] rounded-xl flex gap-2.5 items-center">
                  <X className="w-4 h-4 text-[#FF7B72] shrink-0" />
                  <div>
                    <span className="font-bold text-xs block">1st, 3rd, 5th Saturdays:</span>
                    <span className="text-[11px] text-[#64748B] block mt-0.5">Full normal working days for all branches.</span>
                  </div>
                </div>
              </div>
              
              <div className="pt-2 border-t border-white/[0.04]">
                <h5 className="font-semibold text-white mb-1.5">Electronic Money status:</h5>
                <p className="text-[11px] leading-relaxed">
                  During bank holidays, digital transfers like <strong>NEFT, IMPS, RTGS, and UPI remain 100% active and running</strong> 24/7/365, while physical cheque clearings, gold desk work, and local accounts desk operations are closed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------------
// EMI CALCULATOR MODAL
// ------------------------------------------------------------------------
function EmiModal({ onClose }: { onClose: () => void }) {
  const [loanAmount, setLoanAmount] = useState<number>(1500000); // Default 15 Lakhs
  const [interestRate, setInterestRate] = useState<number>(8.5); // Default 8.5%
  const [tenureYears, setTenureYears] = useState<number>(15); // Default 15 Years

  // Mathematical Calculation blocks
  const P = loanAmount;
  const r = (interestRate / 12) / 100;
  const n = tenureYears * 12;

  // EMI formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
  const emi = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  const totalPayment = emi * n;
  const totalInterest = totalPayment - P;

  const ratioPrincipal = totalPayment > 0 ? (P / totalPayment) * 100 : 100;
  const ratioInterest = 100 - ratioPrincipal;

  const formatINR = (num: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  };

  // Yearly Amortization calculations
  const schedule = [];
  let remainingBalance = P;
  for (let i = 1; i <= tenureYears; i++) {
    let yearInterest = 0;
    let yearPrincipal = 0;
    for (let m = 1; m <= 12; m++) {
      const im = remainingBalance * r;
      const pm = emi - im;
      yearInterest += im;
      yearPrincipal += pm;
      remainingBalance -= pm;
    }
    schedule.push({
      year: i,
      principalPaid: Math.max(0, yearPrincipal),
      interestPaid: Math.max(0, yearInterest),
      balance: Math.max(0, remainingBalance)
    });
  }

  // Pure SVG Arc mathematics to bypass charting dependencies
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeOffsetInterest = circumference - (ratioInterest / 100) * circumference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-4xl glass-card-strong !bg-[#070d19]/95 border border-white/[0.08] flex flex-col h-[85vh] max-h-[750px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden relative animate-in zoom-in-95 duration-300">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#00E5A0]/10 rounded-full blur-[45px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#0057D9]/5 rounded-full blur-[40px] pointer-events-none" />

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/[0.06] bg-[#081120]/40 relative z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/[0.03] border border-white/[0.06] text-[#00E5A0] rounded-xl shadow-md">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base md:text-lg text-white">EMI Calculator</h3>
              <p className="text-xs text-[#64748B]">Calculate monthly EMIs, total interest payouts, and schedule your Home, Personal, or Car loans</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 text-[#64748B] hover:text-white transition-colors cursor-pointer border border-transparent hover:border-white/[0.06] active:scale-95">
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto p-6 md:grid md:grid-cols-2 md:gap-8 flex flex-col gap-6 relative z-10">
          {/* Left panel - Inputs */}
          <div className="space-y-6 flex flex-col justify-between h-full">
            <div className="space-y-5">
              {/* Loan Amount */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Loan Amount</span>
                  <span className="font-mono text-sm text-[#00E5A0] font-black">{formatINR(loanAmount)}</span>
                </div>
                <input 
                  type="range"
                  min="100000"
                  max="30000000"
                  step="50000"
                  value={loanAmount}
                  onChange={e => setLoanAmount(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-[#081120] rounded-lg appearance-none cursor-pointer accent-[#00E5A0]"
                />
                <div className="flex justify-between text-[10px] text-[#64748B] font-semibold tracking-wide">
                  <span>₹1 LAKH</span>
                  <span>₹1.5 CRORE</span>
                  <span>₹3 CRORE</span>
                </div>
              </div>

              {/* Interest Rate */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Interest Rate (p.a.)</span>
                  <span className="font-mono text-sm text-[#FF7B72] font-black">{interestRate}%</span>
                </div>
                <input 
                  type="range"
                  min="5"
                  max="15"
                  step="0.1"
                  value={interestRate}
                  onChange={e => setInterestRate(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-[#081120] rounded-lg appearance-none cursor-pointer accent-[#FF7B72]"
                />
                <div className="flex justify-between text-[10px] text-[#64748B] font-semibold tracking-wide">
                  <span>5%</span>
                  <span>10%</span>
                  <span>15%</span>
                </div>
              </div>

              {/* Tenure */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Tenure (Years)</span>
                  <span className="font-mono text-sm text-[#00C2FF] font-black">{tenureYears} Years ({tenureYears*12} Months)</span>
                </div>
                <input 
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={tenureYears}
                  onChange={e => setTenureYears(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-[#081120] rounded-lg appearance-none cursor-pointer accent-[#00C2FF]"
                />
                <div className="flex justify-between text-[10px] text-[#64748B] font-semibold tracking-wide">
                  <span>1 YR</span>
                  <span>15 YRS</span>
                  <span>30 YEARS</span>
                </div>
              </div>
            </div>

            {/* Amortization Breakdown Table */}
            <div className="space-y-2 mt-4 flex-grow flex flex-col justify-end">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block px-1">Yearly Payment Schedule</span>
              <div className="border border-white/[0.06] rounded-xl overflow-hidden bg-white/[0.01]">
                <div className="grid grid-cols-4 bg-white/[0.03] p-2.5 text-[10px] font-bold text-[#64748B] uppercase border-b border-white/[0.06]">
                  <span>Yr</span>
                  <span className="text-right">Principal</span>
                  <span className="text-right">Interest</span>
                  <span className="text-right">Balance</span>
                </div>
                <div className="max-h-40 overflow-y-auto divide-y divide-white/[0.04] pr-1 custom-scrollbar">
                  {schedule.map((item) => (
                    <div key={item.year} className="grid grid-cols-4 p-2 text-xs text-[#94A3B8] hover:bg-white/[0.02] transition-colors font-mono">
                      <span className="font-sans text-[#64748B] font-bold">Y{item.year}</span>
                      <span className="text-right text-[#00E5A0]">{formatINR(item.principalPaid)}</span>
                      <span className="text-right text-[#FF7B72]">{formatINR(item.interestPaid)}</span>
                      <span className="text-right text-white">{formatINR(item.balance)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Outputs & Custom SVG Pizza Diagram */}
          <div className="glass-card !bg-white/[0.01] border-white/[0.05] p-5 flex flex-col justify-between gap-4 h-full">
            <div className="grid grid-cols-2 gap-3 shrink-0">
              <div className="p-4 bg-[#081120] border border-white/[0.06] rounded-xl text-center col-span-2 shadow-inner">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Estimated Monthly EMI</span>
                <div className="text-2xl font-black text-[#00E5A0] mt-1 font-mono">{formatINR(emi)}</div>
              </div>
              
              <div className="p-3 bg-[#081120]/60 border border-white/[0.06] rounded-xl">
                <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider block">Total Principal</span>
                <span className="text-xs font-bold text-[#00E5A0] block mt-0.5">{formatINR(loanAmount)}</span>
                <span className="text-[10px] text-[#64748B] font-medium block">({ratioPrincipal.toFixed(1)}% ratio)</span>
              </div>

              <div className="p-3 bg-[#081120]/60 border border-white/[0.06] rounded-xl">
                <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider block">Total Interest Cost</span>
                <span className="text-xs font-bold text-[#FF7B72] block mt-0.5">{formatINR(totalInterest)}</span>
                <span className="text-[10px] text-[#64748B] font-medium block">({ratioInterest.toFixed(1)}% ratio)</span>
              </div>
            </div>

            {/* Donut Chart with clean SVG */}
            <div className="flex flex-col items-center justify-center p-3 relative bg-[#081120]/45 rounded-xl border border-white/[0.06] my-1 flex-grow">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    className="text-[#00E5A0] stroke-current"
                    strokeWidth="11"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                  />
                  <circle
                    className="text-[#FF7B72] stroke-current transition-all duration-300"
                    strokeWidth="11"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeOffsetInterest}
                    strokeLinecap="round"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                  />
                </svg>
                {/* Center text overlay */}
                <div className="absolute text-center">
                  <span className="text-[8.5px] font-bold text-[#64748B] uppercase block tracking-wider">Total Payout</span>
                  <span className="text-[10.5px] font-bold text-white font-mono leading-none">{formatINR(totalPayment)}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-3 text-xs w-full justify-center">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00E5A0] shadow-sm"></span> Principal
                </span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF7B72] shadow-sm"></span> Interest
                </span>
              </div>
            </div>

            <div className="text-[10px] text-[#64748B] leading-relaxed italic bg-[#081120]/60 p-2.5 rounded-xl border border-white/[0.06] shrink-0">
              * Note: Higher loan tenures drastically increase total interest payouts. Prioritize a higher monthly EMI to minimize interest loading!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [currentPage, setCurrentPageState] = useState<'home' | 'search' | 'blogs' | 'blog-detail' | 'privacy' | 'terms' | 'disclaimer'>('home');
  const [selectedBlogSlug, setSelectedBlogSlugState] = useState<string | null>(null);
  const [activeTool, setActiveToolState] = useState<'micr' | 'swift' | 'holidays' | 'emi' | null>(null);
  const [queryInput, setQueryInput] = useState('');
  const [searchMode, setSearchModeState] = useState<SearchMode>('master');

  const setCurrentPage = (page: 'home' | 'search' | 'blogs' | 'blog-detail' | 'privacy' | 'terms' | 'disclaimer') => {
    setCurrentPageState(page);
  };
  const setSelectedBlogSlug = (slug: string | null) => {
    setSelectedBlogSlugState(slug);
  };

  const handlePageChange = (page: 'home' | 'search' | 'blogs' | 'blog-detail' | 'privacy' | 'terms' | 'disclaimer', slug?: string) => {
    if (page === 'home') {
      navigate('/');
    } else if (page === 'search') {
      navigate('/search/' + searchMode);
    } else if (page === 'blogs') {
      navigate('/blogs');
    } else if (page === 'blog-detail' && slug) {
      navigate('/blogs/' + slug);
    } else if (page === 'privacy' || page === 'terms' || page === 'disclaimer') {
      navigate('/' + page);
    }
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  };

  const setSearchMode = (mode: SearchMode) => {
    navigate('/search/' + mode + (queryInput ? '?q=' + encodeURIComponent(queryInput) : ''));
  };

  const setActiveTool = (tool: 'micr' | 'swift' | 'holidays' | 'emi' | null) => {
    if (tool) {
      navigate('/tools/' + tool);
    } else {
      navigate('/search/' + searchMode);
    }
  };

  // Parse path and update state
  useEffect(() => {
    const path = location.pathname;
    const queryQ = searchParams.get('q') || '';

    // 1. Legal routes
    if (path === '/privacy') {
      setCurrentPageState('privacy');
      setSelectedBlogSlugState(null);
      setActiveToolState(null);
    } else if (path === '/terms') {
      setCurrentPageState('terms');
      setSelectedBlogSlugState(null);
      setActiveToolState(null);
    } else if (path === '/disclaimer') {
      setCurrentPageState('disclaimer');
      setSelectedBlogSlugState(null);
      setActiveToolState(null);
    }
    // 2. Blog routes
    else if (path === '/blogs') {
      setCurrentPageState('blogs');
      setSelectedBlogSlugState(null);
      setActiveToolState(null);
    } else if (path.startsWith('/blogs/')) {
      const slug = path.substring(7); // remove '/blogs/'
      setCurrentPageState('blog-detail');
      setSelectedBlogSlugState(slug);
      setActiveToolState(null);
    }
    // 3. Tool routes
    else if (path.startsWith('/tools/')) {
      const tool = path.substring(7) as 'micr' | 'swift' | 'holidays' | 'emi';
      setCurrentPageState('search');
      setActiveToolState(tool);
    }
    // 4. Search routes
    else if (path === '/search') {
      setCurrentPageState('search');
      setSearchModeState('master');
      setActiveToolState(null);
    } else if (path.startsWith('/search/')) {
      const mode = path.substring(8) as SearchMode;
      setCurrentPageState('search');
      if (['master', 'ifsc', 'location', 'pincode'].includes(mode)) {
        setSearchModeState(mode);
      }
      setActiveToolState(null);
    }
    // 5. Home route fallback
    else {
      setCurrentPageState('home');
      setSelectedBlogSlugState(null);
      setActiveToolState(null);
    }

    // Set search query if present in query parameters
    if (queryQ) {
      setQueryInput(queryQ);
      // Wait for a tick to let state set, then trigger search
      setTimeout(() => {
        const currentMode = path.startsWith('/search/') ? (path.substring(8) as SearchMode) : 'master';
        handleSearch(undefined, queryQ, currentMode);
      }, 50);
    }
  }, [location.pathname, searchParams]);
  const [loading, setLoading] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [result, setResult] = useState<IfscDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<IfscDetails[] | null>(null);

  // Parallel Gemini-powered web search states
  const [onlineResults, setOnlineResults] = useState<IfscDetails[] | null>(null);
  const [onlineSources, setOnlineSources] = useState<{ title: string; uri: string }[]>([]);
  const [onlineLoading, setOnlineLoading] = useState(false);
  const [onlineError, setOnlineError] = useState<string | null>(null);

  // Cascading Dropdown States
  const [selState, setSelState] = useState('');
  const [selDistrict, setSelDistrict] = useState('');
  const [selTaluka, setSelTaluka] = useState('');
  const [selCity, setSelCity] = useState('');
  const [selBank, setSelBank] = useState('');
  const [selBranch, setSelBranch] = useState('');

  const [history, setHistory] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const popularBanks = ['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Bank of Baroda', 'PNB'];
  const popularStates = ['Maharashtra', 'Gujarat', 'Karnataka', 'Delhi', 'Tamil Nadu'];

  function enrichDetails(data: IfscDetails) {
    // Non-mutating: spread to avoid modifying the original object from API/state
    const d = { ...data };
    if(!d.SWIFT) d.SWIFT = "Not Available";
    if(!d.BRANCH_CODE) d.BRANCH_CODE = d.IFSC.slice(-6);
    if(!d.EMAIL) d.EMAIL = "care@"+d.BANKCODE.toLowerCase()+".co.in";
    if(d.ATM === undefined) d.ATM = true;
    if(d.CASH_DEPOSIT === undefined) d.CASH_DEPOSIT = true;
    if(d.LOCKER === undefined) d.LOCKER = false;
    return d;
  }

  // API-driven cascading options
  const [statesList, setStatesList] = useState<string[]>([]);
  const [districtOptions, setDistrictOptions] = useState<string[]>([]);
  const [talukaOptions, setTalukaOptions] = useState<string[]>([]);
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [bankOptions, setBankOptions] = useState<string[]>([]);
  const [branchOptions, setBranchOptions] = useState<{ branchName: string; ifsc: string }[]>([]);

  // 1. Fetch States on mount
  useEffect(() => {
    fetch('/api/states')
      .then(res => res.json())
      .then(data => setStatesList(data))
      .catch(err => console.error("Error loading states:", err));
  }, []);

  // 2. Fetch Districts when selState changes
  useEffect(() => {
    if (!selState) {
      setDistrictOptions([]);
      setSelDistrict('');
      return;
    }
    fetch(`/api/districts?state=${encodeURIComponent(selState)}`)
      .then(res => res.json())
      .then(data => setDistrictOptions(data))
      .catch(err => console.error("Error loading districts:", err));
  }, [selState]);

  // 3. Fetch Talukas when selDistrict changes
  useEffect(() => {
    if (!selDistrict) {
      setTalukaOptions([]);
      setSelTaluka('');
      return;
    }
    fetch(`/api/talukas?state=${encodeURIComponent(selState)}&district=${encodeURIComponent(selDistrict)}`)
      .then(res => res.json())
      .then(data => setTalukaOptions(data))
      .catch(err => console.error("Error loading talukas:", err));
  }, [selDistrict, selState]);

  // 4. Fetch Cities when selDistrict changes (no longer strictly dependent on Taluka!)
  useEffect(() => {
    if (!selDistrict) {
      setCityOptions([]);
      setSelCity('');
      return;
    }
    fetch(`/api/cities?state=${encodeURIComponent(selState)}&district=${encodeURIComponent(selDistrict)}&taluka=${encodeURIComponent(selTaluka)}`)
      .then(res => res.json())
      .then(data => setCityOptions(data))
      .catch(err => console.error("Error loading cities:", err));
  }, [selDistrict, selTaluka, selState]);

  // 5. Fetch Banks when selState changes (can match bank brands even if city/district is empty!)
  useEffect(() => {
    if (!selState) {
      setBankOptions([]);
      setSelBank('');
      return;
    }
    fetch(`/api/banks?state=${encodeURIComponent(selState)}&district=${encodeURIComponent(selDistrict)}&taluka=${encodeURIComponent(selTaluka)}&city=${encodeURIComponent(selCity)}`)
      .then(res => res.json())
      .then(data => setBankOptions(data))
      .catch(err => console.error("Error loading banks:", err));
  }, [selState, selDistrict, selTaluka, selCity]);

  // 6. Fetch Branches when selBank changes
  useEffect(() => {
    if (!selBank) {
      setBranchOptions([]);
      setSelBranch('');
      return;
    }
    fetch(`/api/branches?state=${encodeURIComponent(selState)}&district=${encodeURIComponent(selDistrict)}&taluka=${encodeURIComponent(selTaluka)}&city=${encodeURIComponent(selCity)}&bank=${encodeURIComponent(selBank)}`)
      .then(res => res.json())
      .then(data => setBranchOptions(data))
      .catch(err => console.error("Error loading branches:", err));
  }, [selBank, selState, selDistrict, selTaluka, selCity]);

  const clearFilters = () => {
    setSelState('');
    setSelDistrict('');
    setSelTaluka('');
    setSelCity('');
    setSelBank('');
    setSelBranch('');
    setSearchResults(null);
    setError(null);
  };

  const handleCascadeSearch = () => {
    if (selBranch && selBranch !== 'ALL') {
       handleSearch(undefined, selBranch, 'ifsc');
       return;
    }

    if (selState) {
      setLoading(true);
      setError(null);
      setResult(null);
      setSearchResults([]);

      fetch(`/api/branches?state=${encodeURIComponent(selState)}&district=${encodeURIComponent(selDistrict)}&taluka=${encodeURIComponent(selTaluka)}&city=${encodeURIComponent(selCity)}&bank=${encodeURIComponent(selBank)}`)
        .then(res => res.json())
        .then(data => {
          const resultsFound = data.map((b: any) => enrichDetails({
            BANK: b.BANK || selBank,
            BRANCH: b.BRANCH,
            IFSC: b.IFSC,
            ADDRESS: b.ADDRESS,
            CITY: b.CITY || selCity,
            DISTRICT: b.DISTRICT || selDistrict,
            STATE: b.STATE || selState,
            MICR: b.MICR && b.MICR !== "-" ? b.MICR : "N/A",
            CONTACT: b.CONTACT && b.CONTACT !== "-" ? b.CONTACT : "Not Provided",
            IMPS: b.IMPS !== undefined ? b.IMPS : true,
            NEFT: b.NEFT !== undefined ? b.NEFT : true,
            RTGS: b.RTGS !== undefined ? b.RTGS : true,
            UPI: b.UPI !== undefined ? b.UPI : true,
            SWIFT: b.SWIFT && b.SWIFT !== "-" ? b.SWIFT : "N/A",
            BANKCODE: b.IFSC ? b.IFSC.substring(0, 4) : ""
          }));
          setSearchResults(resultsFound);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error performing cascade search:", err);
          setError("Failed to fetch branches from master database");
          setLoading(false);
        });
    }
  };

  const handleSearch = async (e?: FormEvent, searchQuery?: string, forceMode?: SearchMode) => {
    if (e) e.preventDefault();
    const query = (searchQuery || queryInput).trim().toUpperCase();
    const currentMode = forceMode || searchMode;
    if (!query && currentMode !== 'location') return;

    if (currentMode !== 'location') {
      setQueryInput(query);
    }
    setSearchMode(currentMode);
    setLoading(true);
    setError(null);
    setResult(null);
    setSearchResults(null);

    try {
      if (currentMode === 'master') {
        setOnlineResults(null);
        setOnlineSources([]);
        setOnlineError(null);
        setOnlineLoading(true);

        setHistory(prev => {
          const newHist = prev.filter(item => item !== query);
          return [query, ...newHist].slice(0, 10);
        });

        const localPromise = fetch(`/api/search?q=${encodeURIComponent(query)}&mode=master`)
          .then(async (res) => {
            if (!res.ok) throw new Error('Local search failed');
            return res.json();
          })
          .then((data) => {
            setSearchResults((data || []).map((d: any) => enrichDetails(d)));
          })
          .catch((err) => {
            console.error("Local search err:", err);
            setSearchResults([]);
          });

        const onlinePromise = fetch(`/api/online-search?q=${encodeURIComponent(query)}`)
          .then(async (res) => {
            if (!res.ok) throw new Error('Online search failed');
            return res.json();
          })
          .then((data) => {
            if (data.error) {
              setOnlineError(data.error);
            } else {
              setOnlineResults((data.results || []).map((d: any) => enrichDetails({
                ...d,
                ATM: d.ATM !== undefined ? d.ATM : true,
                isOnlineResult: true
              })));
              setOnlineSources(data.sources || []);
            }
          })
          .catch((err) => {
            console.error("Online search err:", err);
            setOnlineError("Could not execute live web search. Check server logs.");
          })
          .finally(() => {
            setOnlineLoading(false);
          });

        await localPromise;
        setLoading(false);
      } else if (currentMode === 'ifsc') {
        let data: IfscDetails | null = null;
        try {
          const response = await fetch(`https://ifsc.razorpay.com/${query}`);
          if (response.ok) {
            data = await response.json();
          }
        } catch (err) {
          // Ignore external network fail, fallback silently to our memory DB
        }

        if (!data) {
          const res = await fetch(`/api/branch/${query}`);
          if (!res.ok) {
            throw new Error('IFSC code not found in our database');
          }
          data = await res.json();
        }

        data = enrichDetails(data!);
        setResult(data);

        setHistory(prev => {
          const newHist = prev.filter(item => item !== query);
          return [query, ...newHist].slice(0, 10);
        });
      } else {
        const backendMode = currentMode === 'pincode' ? 'pincode' : 'fuzzy';
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&mode=${backendMode}`);
        if (!res.ok) {
          throw new Error('Search request failed');
        }
        const data = await res.json();
        if (data && data.length > 0) {
          setSearchResults(data.map((d: any) => enrichDetails(d)));
        } else {
          setError(`No branches found for query "${query}"`);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during search');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (code: string) => {
    setFavorites(prev => {
      if (prev.includes(code)) {
        return prev.filter(c => c !== code);
      }
      return [...prev, code];
    });
  };

  const copyToClipboard = (text: string, label?: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openMaps = (resultNode = result) => {
    if (resultNode) {
      const query = encodeURIComponent(`${resultNode.BANK} ${resultNode.BRANCH} ${resultNode.CITY} ${resultNode.STATE}`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    }
  };

  useEffect(() => {
    const savedFavs = localStorage.getItem('ifsc-favorites');
    const savedHist = localStorage.getItem('ifsc-history');
    if (savedFavs) setFavorites(JSON.parse(savedFavs));
    if (savedHist) setHistory(JSON.parse(savedHist));
  }, []);

  useEffect(() => {
    localStorage.setItem('ifsc-favorites', JSON.stringify(favorites));
    localStorage.setItem('ifsc-history', JSON.stringify(history));
  }, [favorites, history]);

  // Dynamic SEO Enhancer for Search Engines & Social Graph indexing
  useEffect(() => {
    let title = "IFSC Finder India | Banking Directory, MICR, SWIFT & Branch Codes";
    let desc = "Quickly locate and verify Indian Financial System Codes (IFSC), MICR codes, SWIFT codes, branch addresses, and contact details for banks across India.";

    if (result) {
      title = `${result.BANK} (${result.BRANCH} Branch) IFSC Code: ${result.IFSC} | MICR & Address`;
      desc = `Get detailed IFSC Code ${result.IFSC} for ${result.BANK}, branch ${result.BRANCH}. Locate branch Address: ${result.ADDRESS}, City: ${result.CITY}, District: ${result.DISTRICT}, State: ${result.STATE}. Info verified for UPI, IMPS, RTGS & NEFT.`;
    } else if (searchResults && searchResults.length > 0) {
      title = `Found ${searchResults.length} Bank Branches - IFSC Finder India`;
      const sampleBanks = Array.from(new Set(searchResults.slice(0, 3).map(b => b.BANK))).join(", ");
      desc = `Discovered ${searchResults.length} matching bank branches including ${sampleBanks}. View verified IFSC Codes, MICR Codes, and full physical branch addresses.`;
    }

    // Dynamic Title Update
    document.title = title;

    // Dynamic Meta Description Update/Creation
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', desc);

    // OpenGraph Title & Description Update for Social Preview crawlers
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', desc);
  }, [result, searchResults]);

  const RenderBooleanBadge = ({ label, value, pillTextColorClass }: { label: string, value: boolean | undefined, pillTextColorClass?: string }) => {
    const isAvailable = !!value;
    return (
      <div className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-1.5 shadow-xs transition-colors duration-200 ${
        isAvailable 
          ? 'bg-[#13231B] border-[#2EA043] border-opacity-40 text-[#56D364]' 
          : 'bg-[#211214] border-[#F85149] border-opacity-30 text-[#FF7B72]'
      }`}>
        <span className={`text-[10px] font-bold uppercase tracking-widest ${isAvailable ? 'text-[#3FB950]' : 'text-[#FF7B72]'}`}>
          {label}
        </span>
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider ${
          isAvailable 
            ? 'bg-[#238636] bg-opacity-20 border border-[#2EA043] border-opacity-30' 
            : 'bg-[#F85149] bg-opacity-20 border border-[#F85149] border-opacity-20'
        } ${pillTextColorClass || (isAvailable ? 'text-[#56D364]' : 'text-[#FF7B72]')}`}>
          {isAvailable ? 'YES' : 'NO'}
        </span>
      </div>
    );
  };

  if (currentPage !== 'search') {
    return (
      <div className="flex flex-col min-h-screen w-full mesh-gradient text-[#E2E8F0] font-sans overflow-y-auto">
        <Header 
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onSearchModeChange={setSearchMode}
          favoritesCount={favorites.length}
          onToggleMobileNav={() => setShowMobileNav(!showMobileNav)}
        />
        
        <main className="flex-1">
          {currentPage === 'home' && (
            <LandingPage 
              onPageChange={handlePageChange}
              onSearchModeChange={setSearchMode}
              onPopularBankTrigger={(bankName) => {
                setQueryInput(bankName);
                setSearchMode('master');
                setCurrentPage('search');
                handleSearch(undefined, bankName, 'master');
              }}
            />
          )}
          {(currentPage === 'blogs' || currentPage === 'blog-detail') && (
            <BlogPage 
              selectedSlug={selectedBlogSlug}
              onPageChange={handlePageChange}
            />
          )}
          {(currentPage === 'privacy' || currentPage === 'terms' || currentPage === 'disclaimer') && (
            <LegalPages 
              pageType={currentPage}
              onPageChange={handlePageChange}
            />
          )}
        </main>

        <Footer 
          onPageChange={handlePageChange}
          onSearchModeChange={setSearchMode}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen md:h-screen w-full mesh-gradient text-[#E2E8F0] font-sans overflow-y-auto md:overflow-hidden">
      {/* Header */}
      <Header 
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onSearchModeChange={setSearchMode}
        favoritesCount={favorites.length}
        onToggleMobileNav={() => setShowMobileNav(!showMobileNav)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:flex-row overflow-y-visible md:overflow-hidden">

        {/* Left Sidebar - Navigation */}
        <aside className="w-64 glass-card-strong !rounded-none border-r border-white/[0.06] flex flex-col overflow-hidden hidden md:flex">
          <div className="flex-1 overflow-y-auto py-4">

            <div className="px-5 mb-2">
              <span className="text-[10px] font-bold text-[#00C2FF]/60 uppercase tracking-widest">Search Modes</span>
            </div>
            <div className="mb-6 space-y-0.5">
               <div
                 onClick={() => setSearchMode('master')}
                 className={`px-4 py-2.5 mx-2 flex items-center gap-3 transition-all text-sm font-medium cursor-pointer rounded-xl border
                   ${searchMode === 'master' 
                     ? 'bg-[#0057D9]/15 border-[#0057D9]/30 text-[#00C2FF]' 
                     : 'border-transparent text-[#64748B] hover:bg-white/[0.04] hover:text-[#E2E8F0]'}
                 `}
               >
                 <Globe className={`w-4 h-4 ${searchMode === 'master' ? 'text-[#00C2FF]' : 'text-[#64748B]'}`} /> Master Search (AI)
               </div>
               <div
                 onClick={() => setSearchMode('ifsc')}
                 className={`px-4 py-2.5 mx-2 flex items-center gap-3 transition-all text-sm font-medium cursor-pointer rounded-xl border
                   ${searchMode === 'ifsc' 
                     ? 'bg-[#00E5A0]/10 border-[#00E5A0]/30 text-[#00E5A0]' 
                     : 'border-transparent text-[#64748B] hover:bg-white/[0.04] hover:text-[#E2E8F0]'}
                 `}
               >
                 <Search className={`w-4 h-4 ${searchMode === 'ifsc' ? 'text-[#00E5A0]' : 'text-[#64748B]'}`} /> IFSC Search
               </div>
               <div
                 onClick={() => setSearchMode('location')}
                 className={`px-4 py-2.5 mx-2 flex items-center gap-3 transition-all text-sm font-medium cursor-pointer rounded-xl border
                   ${searchMode === 'location' 
                     ? 'bg-purple-500/10 border-purple-500/30 text-purple-300' 
                     : 'border-transparent text-[#64748B] hover:bg-white/[0.04] hover:text-[#E2E8F0]'}
                 `}
               >
                 <MapPin className={`w-4 h-4 ${searchMode === 'location' ? 'text-purple-300' : 'text-[#64748B]'}`} /> Location Search
               </div>
               <div
                 onClick={() => setSearchMode('pincode')}
                 className={`px-4 py-2.5 mx-2 flex items-center gap-3 transition-all text-sm font-medium cursor-pointer rounded-xl border
                   ${searchMode === 'pincode' 
                     ? 'bg-orange-500/10 border-orange-500/30 text-orange-300' 
                     : 'border-transparent text-[#64748B] hover:bg-white/[0.04] hover:text-[#E2E8F0]'}
                 `}
               >
                 <Map className={`w-4 h-4 ${searchMode === 'pincode' ? 'text-orange-300' : 'text-[#64748B]'}`} /> Pincode Search
               </div>
            </div>

            {/* Financial Tools Section in Left Sidebar */}
            <div className="px-5 flex items-center gap-2 mb-2 mt-4 border-t border-white/[0.05] pt-4">
              <Box className="w-3.5 h-3.5 text-[#00C2FF]" />
              <span className="text-[10px] font-bold text-[#00C2FF]/60 uppercase tracking-widest">Financial Tools</span>
            </div>
            <div className="mb-4 space-y-0.5 px-2">
              <div
                onClick={() => setActiveTool('micr')}
                className="px-3 py-2 flex items-center gap-2.5 rounded-xl hover:bg-white/[0.04] text-[#64748B] hover:text-[#00C2FF] transition-all text-xs font-semibold cursor-pointer"
              >
                <Database className="w-3.5 h-3.5 text-[#00C2FF]/70" /> MICR Locator
              </div>
              <div
                onClick={() => setActiveTool('swift')}
                className="px-3 py-2 flex items-center gap-2.5 rounded-xl hover:bg-white/[0.04] text-[#64748B] hover:text-purple-300 transition-all text-xs font-semibold cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-purple-400/70" /> SWIFT Search
              </div>
              <div
                onClick={() => setActiveTool('holidays')}
                className="px-3 py-2 flex items-center gap-2.5 rounded-xl hover:bg-white/[0.04] text-[#64748B] hover:text-red-300 transition-all text-xs font-semibold cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-red-400/70" /> Bank Holidays
              </div>
              <div
                onClick={() => setActiveTool('emi')}
                className="px-3 py-2 flex items-center gap-2.5 rounded-xl hover:bg-white/[0.04] text-[#64748B] hover:text-[#00E5A0] transition-all text-xs font-semibold cursor-pointer"
              >
                <Calculator className="w-3.5 h-3.5 text-[#00E5A0]/70" /> EMI Calculator
              </div>
            </div>

            {/* Favorites Section */}
            <div className="px-5 flex items-center gap-2 mb-2 mt-2 border-t border-white/[0.05] pt-4">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] font-bold text-amber-400/60 uppercase tracking-widest">Saved Branches</span>
            </div>
            {favorites.length === 0 && (
              <div className="px-5 py-1 text-xs text-[#64748B] italic">No favorites added.</div>
            )}
            {favorites.map(fav => (
              <div
                key={`fav-${fav}`}
                onClick={() => handleSearch(undefined, fav, 'ifsc')}
                className={`px-4 py-2 mx-2 flex items-center justify-between transition-all cursor-pointer text-xs font-mono rounded-xl
                  ${result?.IFSC === fav 
                    ? 'bg-[#0057D9]/15 text-[#00C2FF]' 
                    : 'text-[#64748B] hover:bg-white/[0.04] hover:text-[#E2E8F0]'}
                `}
              >
                <span>{fav}</span>
              </div>
            ))}

            {/* History Section */}
            <div className="px-5 mt-4 flex items-center gap-2 mb-2">
              <Clock className="w-3.5 h-3.5 text-[#00E5A0]/70" />
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Recent Queries</span>
            </div>
            {history.length === 0 && (
              <div className="px-5 py-1 text-xs text-[#64748B] italic">No recent history.</div>
            )}
            {history.map((histItem, idx) => (
              <div
                key={`hist-${idx}`}
                onClick={() => handleSearch(undefined, histItem, 'ifsc')}
                className={`px-4 py-2 mx-2 flex items-center justify-between transition-all cursor-pointer text-xs font-mono rounded-xl
                  ${result?.IFSC === histItem && !favorites.includes(histItem) 
                    ? 'bg-[#0057D9]/15 text-[#00C2FF]' 
                    : 'text-[#64748B] hover:bg-white/[0.04] hover:text-[#E2E8F0]'}
                `}
              >
                <span>{histItem}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* Center Area - Editor/Viewer */}
        <section className="flex-1 flex flex-col min-w-0 bg-[#081120]/60 relative overflow-y-visible md:overflow-hidden">

          {/* Top Address Bar inside Center Area */}
          <div className="border-b border-white/[0.06] bg-[#0F172A]/80 backdrop-blur-xl">
            {/* Tabs */}
            <div className="flex px-4 pt-3 gap-1 md:gap-1.5 text-xs font-bold uppercase tracking-wider overflow-x-auto flex-nowrap scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden mb-[-1px] relative z-10">
              {(['master', 'ifsc', 'location', 'pincode'] as SearchMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSearchMode(mode)}
                  className={`px-4 py-2.5 md:px-6 md:py-3 rounded-t-xl transition-all duration-200 border-t-2 border-x border-b flex items-center gap-1.5 md:gap-2 whitespace-nowrap flex-shrink-0 cursor-pointer select-none outline-none focus:outline-none font-semibold
                    ${searchMode === mode
                      ? 'bg-[#081120]/80 text-white border-x-white/[0.08] border-t-[#00C2FF] border-b-transparent shadow-[0_0_20px_rgba(0,194,255,0.15)]'
                      : 'text-[#64748B] hover:bg-white/[0.04] hover:text-[#94A3B8] border-x-transparent border-t-transparent border-b-white/[0.06]'
                    }`}
                >
                  {mode === 'master' ? <Globe className={`w-3.5 h-3.5 md:w-4 md:h-4 ${searchMode === 'master' ? 'text-[#00C2FF]' : 'text-[#64748B]'}`}/> :
                   mode === 'ifsc' ? <FileText className={`w-3.5 h-3.5 md:w-4 md:h-4 ${searchMode === 'ifsc' ? 'text-[#00E5A0]' : 'text-[#64748B]'}`}/> :
                   mode === 'location' ? <Building className={`w-3.5 h-3.5 md:w-4 md:h-4 ${searchMode === 'location' ? 'text-purple-300' : 'text-[#64748B]'}`}/> :
                   <MapPin className={`w-3.5 h-3.5 md:w-4 md:h-4 ${searchMode === 'pincode' ? 'text-orange-300' : 'text-[#64748B]'}`}/>}
                  
                  <span>
                    {mode === 'master' ? 'Master Search (AI)' : 
                     mode === 'ifsc' ? 'IFSC Search' : 
                     mode === 'location' ? 'Location Search' : 
                     'Pincode Search'}
                  </span>
                </button>
              ))}
              <div className="flex-1 border-b border-white/[0.06] min-w-[12px] h-full self-end"></div>
            </div>

            {/* Input Bar */}
             <div className="p-4 bg-[#081120]/50 backdrop-blur-xl border-b border-white/[0.06]">
               {searchMode === 'location' ? (
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 w-full">
                      <SearchableSelect
                        label="State"
                        value={selState}
                        placeholder="Search/Select State..."
                        allOptionText="All States"
                        options={statesList.map(s => ({ label: s, value: s }))}
                        onChange={val => {
                          setSelState(val);
                          setSelDistrict('');
                          setSelTaluka('');
                          setSelCity('');
                          setSelBank('');
                          setSelBranch('');
                        }}
                      />

                      <SearchableSelect
                        label="District"
                        value={selDistrict}
                        placeholder="Search/Select District..."
                        disabled={!selState}
                        allOptionText={selState ? "All Districts" : undefined}
                        options={districtOptions.map(d => ({ label: d, value: d }))}
                        onChange={val => {
                          setSelDistrict(val);
                          setSelTaluka('');
                          setSelCity('');
                          setSelBank('');
                          setSelBranch('');
                        }}
                      />

                      <SearchableSelect
                        label="Taluka"
                        value={selTaluka}
                        placeholder="Search/Select Taluka..."
                        disabled={!selDistrict}
                        allOptionText={selDistrict ? "All Talukas" : undefined}
                        options={talukaOptions.map(t => ({ label: t, value: t }))}
                        onChange={val => {
                          setSelTaluka(val);
                          setSelCity('');
                          setSelBank('');
                          setSelBranch('');
                        }}
                      />

                      <SearchableSelect
                        label="City / Village"
                        value={selCity}
                        placeholder="Search/Select City..."
                        disabled={!selDistrict}
                        allOptionText={selDistrict ? "All Cities / Villages" : undefined}
                        options={cityOptions.map(c => ({ label: c, value: c }))}
                        onChange={val => {
                          setSelCity(val);
                          setSelBank('');
                          setSelBranch('');
                        }}
                      />

                      <SearchableSelect
                        label="Bank Name"
                        value={selBank}
                        placeholder="Search/Select Bank..."
                        disabled={!selState}
                        allOptionText={selState ? "All Banks" : undefined}
                        options={bankOptions.map(b => ({ label: b, value: b }))}
                        onChange={val => {
                          setSelBank(val);
                          setSelBranch('');
                        }}
                      />

                      <SearchableSelect
                        label="Branch"
                        value={selBranch}
                        placeholder="Search/Select Branch..."
                        disabled={!selBank}
                        allOptionText={selBank ? "All Branches" : undefined}
                        options={branchOptions.map(b => ({ label: b.branchName, value: b.ifsc }))}
                        onChange={val => {
                          setSelBranch(val);
                        }}
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-3 mt-2">
                      <button
                        onClick={clearFilters}
                        type="button"
                        className="btn-secondary w-full sm:w-auto px-4 py-2.5 text-sm flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" /> Clear Filters
                      </button>
                      <button
                        onClick={handleCascadeSearch}
                        disabled={!selState}
                        type="button"
                        className="btn-primary w-full sm:w-auto px-6 py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        <Search className="w-4 h-4"/> Search Location
                      </button>
                    </div>
                  </div>
                ) : (
                 <form onSubmit={handleSearch} className="flex flex-col sm:flex-row flex-1 items-stretch sm:items-center gap-3 w-full max-w-3xl">
                   <div className="flex items-center bg-[#081120]/60 border border-white/[0.08] rounded-xl flex-1 focus-within:border-[#00C2FF] focus-within:ring-1 focus-within:ring-[#00C2FF]/40 transition-all shadow-lg">
                     <Search className="w-5 h-5 text-[#64748B] ml-4 mr-2" />
                     <input
                       type="text"
                       value={queryInput}
                       onChange={e => setQueryInput(e.target.value.toUpperCase())}
                       placeholder={searchMode === 'master' ? "Search entire directory + live web... e.g. 'SBI Bengaluru' or 'HDFC Kurla'" : `Search by ${searchMode.toUpperCase()}... e.g. ${
                         searchMode === 'ifsc' ? 'SBIN0000813' : '414001, 110001, 400028'
                       }`}
                       className="bg-transparent border-none outline-none py-3 text-base text-[#E2E8F0] w-full font-mono placeholder:text-[#64748B] placeholder:font-sans focus:opacity-100"
                     />
                     {queryInput && (
                       <button type="button" onClick={() => setQueryInput('')} className="pr-4 text-[#64748B] hover:text-white transition-colors"><X className="w-4 h-4" /></button>
                     )}
                   </div>
                   <button
                      type="submit"
                      disabled={loading || !queryInput.trim()}
                      className="btn-primary px-8 py-3 text-sm flex items-center justify-center gap-2 w-full sm:w-auto whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                    >
                     <Search className="w-4 h-4" /> Search
                   </button>
                 </form>
               )}
             </div>
          </div>

          {/* Editor Body */}
          <div className="flex-1 p-4 md:p-6 lg:p-8 font-sans text-sm overflow-y-visible md:overflow-y-auto bg-transparent">
                          {!result && !searchResults && !loading && !error && (
                <div className="max-w-4xl mx-auto space-y-10 py-6">
                   <div className="flex flex-col items-center justify-center text-center">
                      <div className="w-20 h-20 rounded-2xl bg-[#0057D9]/10 border border-[#0057D9]/20 flex items-center justify-center mb-5 mx-auto">
                        <Database className="w-10 h-10 text-[#00C2FF]/60" />
                      </div>
                      <h2 className="text-2xl font-bold text-white tracking-tight gradient-text-hero">Master Banking Directory</h2>
                      <p className="max-w-lg text-[#64748B] text-sm mt-2">Use high-powered Master Search to scan our offline archive instantly, backed by real-time parallel web crawler verification.</p>
                   </div>

                   {/* Mobile Favorites & History */}
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 md:hidden">
                     {/* Mobile Favorites */}
                     <div className="glass-card p-4">
                       <div className="flex items-center gap-2 mb-3 border-b border-white/[0.06] pb-2">
                         <Star className="w-4 h-4 text-amber-400" fill="#f59e0b" />
                         <span className="text-xs font-bold text-[#E2E8F0] uppercase tracking-wider">Saved Branches</span>
                       </div>
                       {favorites.length === 0 ? (
                         <p className="text-xs text-[#64748B] italic py-2">No favorites added yet.</p>
                       ) : (
                         <div className="max-h-48 overflow-y-auto divide-y divide-white/[0.05]">
                           {favorites.map(fav => (
                             <button
                               key={`mob-fav-${fav}`}
                               onClick={() => handleSearch(undefined, fav, 'ifsc')}
                               className="w-full text-left py-2.5 font-mono text-sm text-[#00C2FF] hover:text-[#00E5A0] flex justify-between items-center"
                             >
                               <span>{fav}</span>
                               <ChevronRight className="w-3.5 h-3.5 text-[#64748B]" />
                             </button>
                           ))}
                         </div>
                       )}
                     </div>

                     {/* Mobile Recent Queries */}
                     <div className="glass-card p-4">
                       <div className="flex items-center gap-2 mb-3 border-b border-white/[0.06] pb-2">
                         <Clock className="w-4 h-4 text-[#00E5A0]" />
                         <span className="text-xs font-bold text-[#E2E8F0] uppercase tracking-wider">Recent Queries</span>
                       </div>
                       {history.length === 0 ? (
                         <p className="text-xs text-[#64748B] italic py-2">No recent searches.</p>
                       ) : (
                         <div className="max-h-48 overflow-y-auto divide-y divide-white/[0.05]">
                           {history.map((histItem, idx) => (
                             <button
                               key={`mob-hist-${idx}`}
                               onClick={() => handleSearch(undefined, histItem, 'ifsc')}
                               className="w-full text-left py-2.5 font-mono text-sm text-[#64748B] hover:text-[#E2E8F0] flex justify-between items-center"
                             >
                               <span>{histItem}</span>
                               <ChevronRight className="w-3.5 h-3.5 text-[#64748B]" />
                             </button>
                           ))}
                         </div>
                       )}
                     </div>
                   </div>
                </div>
              )}

             {loading && (
               <div className="h-full min-h-[300px] flex flex-col items-center justify-center space-y-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full border-2 border-[#00C2FF]/20 border-t-[#00C2FF] animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Database className="w-5 h-5 text-[#00C2FF]/60" />
                    </div>
                  </div>
                  <p className="text-sm uppercase tracking-widest font-mono font-bold text-[#00C2FF]/70">Querying Directory...</p>
               </div>
             )}

             {error && !loading && (
               <div id="search-error-card" className="glass-card p-6 border-l-4 border-l-red-500 max-w-2xl mx-auto shadow-lg mt-8 flex flex-col items-center text-center space-y-3">
                 <Shield className="w-8 h-8 mb-1 text-red-400" />
                 <h3 className="font-bold text-lg text-red-400 tracking-wide">Search Information / Error</h3>
                 <div className="text-[#E2E8F0] text-sm leading-relaxed">{error}</div>
                 <div className="text-xs text-[#64748B] bg-[#081120]/60 p-3.5 rounded-xl border border-white/[0.06] font-mono mt-2 w-full text-left">
                   <span className="text-amber-400 font-bold">💡 Search Hint:</span> In <strong>IFSC Search</strong> mode, please enter a valid 11-digit IFSC code (e.g., <span className="text-[#00C2FF] font-bold">SBIN0000813</span>). If you want to search by city, district, or bank name, please use our <strong>Master Search (AI)</strong> tab at the top or the cascading filters in the sidebar!
                 </div>
               </div>
             )}

                           {searchResults && !loading && searchMode !== 'master' && (
                <div className="max-w-6xl xl:max-w-7xl mx-auto animate-in fade-in duration-300">
                   <h2 className="text-xl font-bold mb-6 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Building className="w-6 h-6 text-[#00C2FF]"/>
                        <span className="gradient-text">Found {searchResults.length} {searchResults.length === 1 ? 'Branch' : 'Branches'}</span>
                      </div>
                   </h2>

                   {/* Desktop Table View */}
                   <div className="hidden md:block glass-card overflow-hidden shadow-lg">
                     <div className="overflow-x-auto">
                       <table className="w-full text-left text-sm whitespace-nowrap">
                         <thead className="border-b border-white/[0.06] text-[#64748B] font-medium tracking-wide uppercase text-[11px]">
                           <tr>
                             <th className="px-5 py-4">Bank Name</th>
                             <th className="px-5 py-4">Branch</th>
                             <th className="px-5 py-4">IFSC</th>
                             <th className="px-5 py-4">MICR</th>
                             <th className="px-5 py-4">City / Village</th>
                             <th className="px-5 py-4 text-right">Action</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-white/[0.04]">
                           {searchResults.map((res, i) => (
                             <tr key={res.IFSC + i} className="hover:bg-white/[0.03] transition-colors cursor-pointer" onClick={() => handleSearch(undefined, res.IFSC, 'ifsc')}>
                                <td className="px-5 py-4 font-bold text-[#E2E8F0] max-w-xs truncate"><div className="flex items-center gap-2"><Building className="w-4 h-4 text-[#64748B]"/> {res.BANK}</div></td>
                                <td className="px-5 py-4 text-[#94A3B8] max-w-xs truncate">{res.BRANCH}</td>
                                <td className="px-5 py-4"><span className="font-mono text-[#00C2FF] font-bold tracking-wider">{res.IFSC}</span></td>
                                <td className="px-5 py-4 font-mono text-[#64748B]">{res.MICR}</td>
                                <td className="px-5 py-4 text-[#64748B] max-w-xs truncate">{res.CITY}</td>
                                <td className="px-5 py-4 text-[#00C2FF] text-xs font-bold hover:underline cursor-pointer text-right">View Details →</td>
                             </tr>
                           ))}
                         </tbody>
                       </table>
                     </div>
                   </div>

                   {/* Mobile Cards View */}
                   <div className="grid grid-cols-1 gap-4 md:hidden">
                     {searchResults.map((res, i) => (
                       <div 
                         key={res.IFSC + i} 
                         className="glass-card p-5 hover:border-[#00C2FF]/30 active:bg-white/[0.04] transition-all cursor-pointer shadow-sm flex flex-col justify-between"
                         onClick={() => handleSearch(undefined, res.IFSC, 'ifsc')}
                       >
                         <div>
                           <div className="flex items-start justify-between gap-3 mb-2">
                             <div className="flex items-center gap-2">
                               <Building className="w-5 h-5 text-[#00C2FF] flex-shrink-0" />
                               <h3 className="font-bold text-white text-sm leading-snug break-words">{res.BANK}</h3>
                             </div>
                             <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-[#00C2FF]/10 text-[#00C2FF] border border-[#00C2FF]/20 font-mono whitespace-nowrap">{res.IFSC}</span>
                           </div>

                           <div className="space-y-2 text-xs text-[#64748B] mt-4">
                             <div className="flex justify-between items-start gap-4 py-1.5 border-b border-white/[0.05]">
                               <span className="shrink-0 text-left">Branch:</span>
                               <span className="text-[#94A3B8] font-medium text-right break-words">{res.BRANCH}</span>
                             </div>
                             <div className="flex justify-between items-start gap-4 py-1.5 border-b border-white/[0.05]">
                               <span className="shrink-0 text-left">City/Village:</span>
                               <span className="text-[#94A3B8] font-medium text-right break-words">{res.CITY}</span>
                             </div>
                             <div className="flex justify-between items-start gap-4 py-1.5">
                               <span className="shrink-0 text-left">MICR Code:</span>
                               <span className="text-[#94A3B8] font-mono text-right">{res.MICR || 'N/A'}</span>
                             </div>
                           </div>
                         </div>

                         <div className="text-[#00C2FF] text-xs font-bold mt-5 pt-3 border-t border-white/[0.05] flex items-center justify-end gap-1">
                           View Full Details <ChevronRight className="w-3.5 h-3.5"/>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
              )}

              {searchMode === 'master' && (searchResults || onlineResults || onlineLoading) && (
                <div className="max-w-6xl xl:max-w-7xl mx-auto space-y-10 pb-12 animate-in fade-in duration-300">
                  
                  {/* Master Search Header Banner */}
                  <div className="glass-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#00C2FF]/10 text-[#00C2FF] border border-[#00C2FF]/20">PARALLEL RUNTIME</span>
                        <span className="text-xs text-[#64748B] font-mono">Status: Connected</span>
                      </div>
                      <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        <Globe className="w-5 h-5 text-[#00C2FF]" /> Master Search (AI Powered + Offline Database)
                      </h2>
                      <p className="text-xs text-[#64748B] mt-1">
                        Scanning the complete local bank directory instantly and crawling live web sources parallelly.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    
                    {/* LEFT PANEL: Live Web & AI Grounded Finder */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          <Activity className="w-5 h-5 text-[#00E5A0] animate-pulse" />
                          <span>Live Web & AI Verified</span>
                        </h3>
                        {onlineLoading && (
                          <span className="text-[10px] font-bold text-[#00E5A0] flex items-center gap-1.5 font-mono">
                            <span className="w-2 h-2 rounded-full bg-[#00E5A0] animate-ping" />
                            SEARCHING WEB...
                          </span>
                        )}
                        {!onlineLoading && onlineResults && (
                          <span className="text-xs text-[#64748B] font-mono">{onlineResults.length} matches found</span>
                        )}
                      </div>

                      {onlineLoading && (
                        <div className="glass-card p-8 flex flex-col items-center justify-center text-center space-y-4">
                          <div className="w-10 h-10 border-2 border-[#00C2FF] border-t-transparent rounded-full animate-spin"></div>
                          <div>
                            <h4 className="font-bold text-[#E2E8F0] text-sm">Deep Web Verification in Progress</h4>
                            <p className="text-xs text-[#64748B] mt-1 max-w-xs">Scanning real-time search engines to find recent contact lines, or newly opened branches...</p>
                          </div>
                        </div>
                      )}

                      {!onlineLoading && onlineError && (() => {
                        let cleanMessage = onlineError;
                        const jsonStart = onlineError.indexOf('{');
                        if (jsonStart !== -1) {
                          try {
                            const jsonStr = onlineError.substring(jsonStart);
                            const parsed = JSON.parse(jsonStr);
                            if (parsed?.error?.message) {
                              cleanMessage = `${onlineError.substring(0, jsonStart)} ${parsed.error.message}`;
                            } else if (parsed?.message) {
                              cleanMessage = `${onlineError.substring(0, jsonStart)} ${parsed.message}`;
                            }
                          } catch (e) {
                            // Ignored
                          }
                        }
                        return (
                          <div id="online-error-card" className="p-5 bg-[#1C1A14] border border-amber-500/20 border-l-4 border-l-amber-500 rounded-xl space-y-2 shadow-lg">
                            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                              <Shield id="online-error-shield" className="w-4 h-4 text-amber-400" />
                              <span>Live AI Search Information</span>
                            </div>
                            <p className="text-sm text-[#E6EDF3] leading-relaxed font-sans">
                              {cleanMessage}
                            </p>
                          </div>
                        );
                      })()}

                      {!onlineLoading && !onlineError && (!onlineResults || onlineResults.length === 0) && (
                        <div className="glass-card p-8 flex flex-col items-center justify-center text-center text-[#64748B]">
                          <Globe className="w-10 h-10 mb-2 opacity-40" />
                          <h4 className="font-bold text-sm">No Live Web Overrides</h4>
                          <p className="text-xs mt-1">Unable to locate newer matching branches on the live web. Refer to the offline database matches on the right.</p>
                        </div>
                      )}

                      {!onlineLoading && onlineResults && onlineResults.length > 0 && (
                        <div className="space-y-4">
                          {onlineResults.map((res, i) => (
                            <div 
                              key={`online-match-${res.IFSC}-${i}`}
                              onClick={() => {
                                setResult(res);
                              }}
                              className="glass-card p-5 hover:border-[#00E5A0]/30 transition-all cursor-pointer shadow-md relative overflow-hidden group"
                            >
                              <div className="absolute top-0 right-0 py-1 px-3 bg-[#00E5A0]/10 border-l border-b border-[#00E5A0]/30 rounded-bl text-[9px] font-bold tracking-widest text-[#00E5A0] font-mono">
                                LIVE WEB VERIFIED
                              </div>
                              <h4 className="font-bold text-[#E2E8F0] text-sm leading-snug break-words pr-20 group-hover:text-[#00E5A0] transition-colors">{res.BANK}</h4>
                              <p className="text-xs text-[#64748B] font-medium mt-1 uppercase tracking-wide">{res.BRANCH}</p>
                              <p className="text-xs text-[#64748B] mt-3 bg-[#081120]/60 p-2.5 rounded-xl border border-white/[0.06] font-mono break-all line-clamp-2">
                                {res.ADDRESS}
                              </p>
                              
                              <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-white/[0.06] text-xs font-mono">
                                <div>
                                  <span className="text-[#64748B]">IFSC: </span>
                                  <span className="text-[#00C2FF] font-bold font-mono text-sm tracking-wider">{res.IFSC}</span>
                                </div>
                                <span className="text-[#00C2FF] hover:underline font-bold font-sans">View Details →</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Cited Sources section */}
                      {!onlineLoading && onlineSources.length > 0 && (
                        <div className="glass-card p-4 mt-4 space-y-2">
                          <span className="font-bold text-xs text-[#64748B] uppercase tracking-wider block">Web Citations:</span>
                          <div className="flex flex-wrap gap-2 text-xs">
                            {onlineSources.map((src, i) => (
                              <a 
                                key={`src-citation-${i}`}
                                href={src.uri} 
                                target="_blank" 
                                {...{ "res-link": "true" }}
                                rel="noopener noreferrer" 
                                className="px-2.5 py-1 bg-[#081120]/60 border border-white/[0.08] hover:border-[#00C2FF]/40 hover:text-white rounded-lg text-[#00C2FF] no-underline transition-colors flex items-center gap-1 font-mono truncate max-w-[240px]"
                              >
                                🗺️ {src.title || "Search Grounding Link"}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                     {/* RIGHT PANEL: Database Matches */}
                     <div className="space-y-6">
                       <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                         <h3 className="text-lg font-bold text-white flex items-center gap-2">
                           <Database className="w-5 h-5 text-[#00C2FF]" />
                           <span>Local Offline Directory Matches</span>
                         </h3>
                         {searchResults && (
                           <span className="text-xs text-[#64748B] font-mono">{searchResults.length} matches found</span>
                         )}
                       </div>

                       {searchResults && searchResults.length === 0 && (
                         <div className="glass-card p-8 flex flex-col items-center justify-center text-center text-[#64748B]">
                           <Database className="w-10 h-10 mb-2 opacity-40" />
                           <h4 className="font-bold text-sm">No Local Matches</h4>
                           <p className="text-xs mt-1">No matching branches found in the offline Excel directory.</p>
                         </div>
                       )}

                       {searchResults && searchResults.length > 0 && (
                         <div className="space-y-4 max-h-[750px] overflow-y-auto pr-2 custom-scrollbar">
                           {searchResults.map((res, i) => (
                             <div 
                               key={`local-match-${res.IFSC}-${i}`}
                               onClick={() => {
                                 handleSearch(undefined, res.IFSC, 'ifsc');
                               }}
                               className="glass-card p-5 hover:border-[#00C2FF]/30 transition-all cursor-pointer shadow-md group relative overflow-hidden"
                             >
                               <div className="absolute top-0 right-0 py-1 px-3 bg-white/[0.03] border-l border-b border-white/[0.06] rounded-bl text-[8px] font-bold tracking-widest text-[#64748B] font-mono">
                                 OFFLINE CSV ARCHIVE
                               </div>
                               <h4 className="font-bold text-[#E2E8F0] text-sm leading-snug break-words pr-20 group-hover:text-[#00C2FF] transition-colors">{res.BANK}</h4>
                               <p className="text-xs text-[#64748B] font-medium mt-1 uppercase tracking-wide">{res.BRANCH}</p>
                               <p className="text-xs text-[#64748B] mt-3 bg-[#081120]/60 p-2.5 rounded-xl border border-white/[0.06] font-mono break-all line-clamp-2">
                                 {res.ADDRESS}
                               </p>
                               <div className="flex justify-between items-center mt-3 text-xs text-[#64748B] font-mono">
                                 <span>City/Village: <strong className="text-[#94A3B8] font-normal">{res.CITY}</strong></span>
                               </div>
                               
                               <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-white/[0.06] text-xs font-mono">
                                 <div>
                                   <span className="text-[#64748B]">IFSC: </span>
                                   <span className="text-[#00C2FF] font-bold font-mono text-sm tracking-wider">{res.IFSC}</span>
                                 </div>
                                 <span className="text-[#00C2FF] hover:underline font-bold font-sans">View Details →</span>
                               </div>
                             </div>
                           ))}
                         </div>
                       )}
                     </div>

                  </div>
                </div>
              )}

             {result && !loading && (
               <div className="max-w-6xl xl:max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 text-[#64748B] text-sm mb-6 flex-wrap">
                     <span className="font-medium hover:text-[#E2E8F0] cursor-pointer" onClick={() => {setSearchMode('location'); setSelState(result.STATE); setSelDistrict(''); setSelTaluka(''); setSelCity(''); setSelBank(''); setSelBranch('');}}>{result.STATE}</span>
                     <ChevronRight className="w-3 h-3 opacity-50"/>
                     <span className="font-medium hover:text-[#E2E8F0] cursor-pointer" onClick={() => {setSearchMode('location'); setSelState(result.STATE); setSelDistrict(result.DISTRICT); setSelTaluka(''); setSelCity(''); setSelBank(''); setSelBranch('');}}>{result.DISTRICT}</span>
                     <ChevronRight className="w-3 h-3 opacity-50"/>
                     <span className="font-medium hover:text-[#E2E8F0] cursor-pointer" onClick={() => {setSearchMode('location'); setSelState(result.STATE); setSelDistrict(result.DISTRICT); setSelTaluka(result.TALUKA || ''); setSelCity(''); setSelBank(''); setSelBranch('');}}>{result.TALUKA || 'GENERAL'}</span>
                     <ChevronRight className="w-3 h-3 opacity-50"/>
                     <span className="font-medium hover:text-[#E2E8F0] cursor-pointer" onClick={() => {setSearchMode('location'); setSelState(result.STATE); setSelDistrict(result.DISTRICT); setSelTaluka(result.TALUKA || ''); setSelCity(result.CITY); setSelBank(''); setSelBranch('');}}>{result.CITY}</span>
                     <ChevronRight className="w-3 h-3 opacity-50"/>
                     <span className="font-medium hover:text-[#E2E8F0] cursor-pointer" onClick={() => {setSearchMode('location'); setSelState(result.STATE); setSelDistrict(result.DISTRICT); setSelTaluka(result.TALUKA || ''); setSelCity(result.CITY); setSelBank(result.BANK); setSelBranch('');}}>{result.BANK}</span>
                     <ChevronRight className="w-3 h-3 opacity-50"/>
                     <span className="font-medium text-[#E2E8F0]">{result.BRANCH}</span>
                   </div>

                  <div className="glass-card-strong shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-[#0057D9] via-[#00C2FF] to-[#00E5A0]"></div>
                    <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-white/[0.06] bg-white/[0.02]">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-xl bg-[#0057D9]/15 border border-[#0057D9]/20">
                            <Building className="text-[#00C2FF] w-6 h-6 flex-shrink-0" />
                          </div>
                          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight break-words">{result.BANK}</h1>
                        </div>
                        <h2 className="text-base md:text-lg text-[#64748B] font-medium sm:ml-[52px] break-words">{result.BRANCH} Branch</h2>
                      </div>
                      <div className="flex flex-col gap-3 min-w-[200px]">
                         <div
                            onClick={() => copyToClipboard(result.IFSC)}
                            className="glass-card !rounded-xl p-3 text-center hover:border-[#00C2FF]/40 flex items-center justify-between cursor-pointer transition-all group/copy select-none"
                            title="Click to copy IFSC Code"
                         >
                            <span className="text-xs uppercase tracking-widest font-bold text-[#64748B]">{copied ? 'Copied ✓' : 'IFSC Code'}</span>
                            <div className="flex items-center gap-2">
                               <span className="font-mono text-[#00E5A0] font-bold text-lg">{result.IFSC}</span>
                               {copied ? (
                                 <CheckCircle2 className="w-4 h-4 text-[#00E5A0] animate-in zoom-in duration-200" />
                               ) : (
                                 <Copy className="w-4 h-4 text-[#64748B] group-hover/copy:text-[#00C2FF] transition-colors" />
                               )}
                            </div>
                         </div>
                         <div className="flex items-center gap-2">
                            <button onClick={() => toggleFavorite(result.IFSC)} className={`flex-1 py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all ${favorites.includes(result.IFSC) ? 'bg-amber-400/10 border-amber-400/30 text-amber-400' : 'bg-white/[0.04] border-white/[0.08] text-[#94A3B8] hover:bg-white/[0.08] hover:text-white'}`}>
                              <Star className="w-4 h-4" fill={favorites.includes(result.IFSC) ? 'currentColor' : 'none'}/> {favorites.includes(result.IFSC) ? 'Saved' : 'Save'}
                            </button>
                            <button onClick={openMaps} className="flex-1 py-2 rounded-xl font-bold text-sm btn-primary flex items-center justify-center gap-2 transition-all">
                              <MapPin className="w-4 h-4"/> Map
                            </button>
                         </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.05]">
                       {/* Basic Info */}
                       <div className="p-6 space-y-6">
                          <div>
                            <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#64748B] flex items-center gap-2 mb-3 border-b border-white/[0.06] pb-2"><FileText className="w-4 h-4"/> Identification</h3>
                            <div className="space-y-4">
                              <div>
                                <span className="block text-[#64748B] text-xs font-mono mb-1">MICR CODE</span>
                                <span className="font-mono text-[#E2E8F0] tracking-widest">{result.MICR || 'Not Available'}</span>
                              </div>
                              <div>
                                <span className="block text-[#64748B] text-xs font-mono mb-1">SWIFT CODE</span>
                                <span className="font-mono text-[#E2E8F0] tracking-widest">{result.SWIFT || 'Not Available'}</span>
                              </div>
                              <div>
                                <span className="block text-[#64748B] text-xs font-mono mb-1">BRANCH CODE</span>
                                <span className="font-mono text-[#E2E8F0] tracking-widest">{result.BRANCH_CODE || 'Not Available'}</span>
                              </div>
                            </div>
                          </div>
                       </div>

                       {/* Location Info */}
                       <div className="p-6 space-y-6 lg:col-span-1">
                          <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#64748B] flex items-center gap-2 mb-3 border-b border-white/[0.06] pb-2"><Map className="w-4 h-4"/> Full Address</h3>
                          <p className="text-[#94A3B8] font-medium leading-relaxed bg-[#081120]/60 p-4 rounded-xl border border-white/[0.06] shadow-sm">
                            {result.ADDRESS}
                          </p>
                          <div className="space-y-3">
                             <div className="flex items-center justify-between py-1 border-b border-white/[0.05]">
                               <span className="text-[#64748B] text-xs font-bold">STATE</span>
                               <span className="font-semibold text-[#E2E8F0]">{result.STATE}</span>
                             </div>
                             <div className="flex items-center justify-between py-1 border-b border-white/[0.05]">
                               <span className="text-[#64748B] text-xs font-bold">DISTRICT</span>
                               <span className="font-semibold text-[#E2E8F0]">{result.DISTRICT}</span>
                             </div>
                             <div className="flex items-center justify-between py-1 border-b border-white/[0.05]">
                               <span className="text-[#64748B] text-xs font-bold">TALUKA / TAHSIL</span>
                               <span className="font-semibold text-[#E2E8F0]">{result.TALUKA || 'GENERAL'}</span>
                             </div>
                             <div className="flex items-center justify-between py-1 border-b border-white/[0.05]">
                               <span className="text-[#64748B] text-xs font-bold">CITY / VILLAGE</span>
                               <span className="font-semibold text-[#E2E8F0]">{result.CITY}</span>
                             </div>
                          </div>

                          <div className="space-y-3 mt-6">
                            <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#64748B] flex items-center gap-2 mb-3 border-b border-white/[0.06] pb-2"><Phone className="w-4 h-4"/> Contact Details</h3>
                             <div className="flex items-center gap-3">
                               <div className="bg-[#0057D9]/10 border border-[#0057D9]/20 p-2 rounded-xl"><Phone className="w-4 h-4 text-[#00C2FF]"/></div>
                               <span className="font-mono text-[#E2E8F0] font-bold">{result.CONTACT && result.CONTACT.toLowerCase() !== 'not provided' ? result.CONTACT : 'N/A'}</span>
                             </div>
                             <div className="flex items-center gap-3">
                               <div className="bg-[#0057D9]/10 border border-[#0057D9]/20 p-2 rounded-xl"><Mail className="w-4 h-4 text-[#00C2FF]"/></div>
                               <span className="text-[#00C2FF]">{result.EMAIL || 'N/A'}</span>
                             </div>
                          </div>
                       </div>

                       {/* Amenities */}
                       <div className="p-6 bg-white/[0.02]">
                          <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#64748B] flex items-center gap-2 mb-4 border-b border-white/[0.06] pb-2"><Activity className="w-4 h-4"/> Banking Facilities</h3>
                          <div className="grid grid-cols-2 gap-3 mb-6">
                             <RenderBooleanBadge label="NEFT" value={result.NEFT} />
                             <RenderBooleanBadge label="RTGS" value={result.RTGS} />
                             <RenderBooleanBadge label="IMPS" value={result.IMPS} />
                             <RenderBooleanBadge label="UPI" value={result.UPI} />
                          </div>
                          <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#64748B] flex items-center gap-2 mb-4 border-b border-white/[0.06] pb-2"><Shield className="w-4 h-4"/> Branch Amenities</h3>
                          <div className="grid grid-cols-2 gap-3">
                             <RenderBooleanBadge label="ATM Onsite" value={result.ATM} />
                             <RenderBooleanBadge label="Cash Deposit" value={result.CASH_DEPOSIT} />
                             <RenderBooleanBadge label="Lockers" value={result.LOCKER} pillTextColorClass="text-black font-semibold" />
                             <div className="p-3 rounded-lg border flex flex-col items-center justify-center gap-1.5 shadow-xs bg-[#0057D9]/10 border-[#0057D9]/20 text-[#00C2FF]">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#00C2FF]/80">Foreign Ex</span>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider bg-[#00C2FF]/10 border border-[#00C2FF]/20 text-[#00C2FF]">CALL</span>
                              </div>
                          </div>
                       </div>
                    </div>
                  </div>

               </div>
             )}

          </div>

        </section>

        {/* Right Sidebar - Dynamic Tools & Recommendations */}
        <aside className="w-72 border-l border-white/[0.06] glass-card-strong !rounded-none flex flex-col overflow-hidden hidden xl:flex">
          <div className="p-4 border-b border-white/[0.06] bg-white/[0.02] flex items-center justify-between">
             <span className="text-xs font-bold text-[#E2E8F0] tracking-wide">Explore Related</span>
          </div>

          <div className="p-5 flex flex-col gap-6 overflow-y-auto">
            {/* Conditional Branch Info / Popular Searches */}
            {result ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-[10px] text-[#64748B] uppercase tracking-widest font-bold mb-3 flex items-center gap-2"><Building className="w-3.5 h-3.5"/> Nearby Branches</h4>
                  <div className="space-y-3">
                     <div onClick={() => {setQueryInput(result.IFSC); handleSearch(undefined, result.IFSC, 'ifsc')}} className="glass-card p-3 cursor-pointer hover:border-[#00C2FF]/30 transition-all shadow-sm relative overflow-hidden group">
                       <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00C2FF] opacity-0 group-hover:opacity-100 transition-opacity rounded-l-xl"></div>
                       <div className="text-sm font-bold text-[#E2E8F0]">{result.CITY} Main Branch</div>
                       <div className="flex items-center gap-2 mt-1.5">
                         <MapPin className="w-3 h-3 text-[#00C2FF]" />
                         <span className="text-[11px] text-[#64748B] font-mono">1.2 km away</span>
                       </div>
                     </div>
                     <div onClick={() => {setQueryInput(result.IFSC); handleSearch(undefined, result.IFSC, 'ifsc')}} className="glass-card p-3 cursor-pointer hover:border-[#00C2FF]/30 transition-all shadow-sm relative overflow-hidden group">
                       <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00C2FF] opacity-0 group-hover:opacity-100 transition-opacity rounded-l-xl"></div>
                       <div className="text-sm font-bold text-[#E2E8F0]">{result.CITY} East</div>
                       <div className="flex items-center gap-2 mt-1.5">
                         <MapPin className="w-3 h-3 text-[#00C2FF]" />
                         <span className="text-[11px] text-[#64748B] font-mono">3.5 km away</span>
                       </div>
                     </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] text-[#64748B] uppercase tracking-widest font-bold mb-3 mt-6 flex items-center gap-2"><Map className="w-3.5 h-3.5"/> Other Banks Nearby</h4>
                  <div className="flex flex-wrap gap-2">
                     {popularBanks.filter(b => !result.BANK.includes(b)).slice(0,5).map(b => (
                       <span key={`near-${b}`} className="glass-card px-3 py-1.5 rounded-full text-xs font-medium text-[#94A3B8] hover:text-white cursor-pointer transition-colors shadow-sm">
                          {b}
                       </span>
                     ))}
                  </div>
                </div>
              </div>
            ) : (
               <div className="space-y-4">
                  <h4 className="text-[10px] text-[#64748B] uppercase tracking-widest font-bold mb-3 flex items-center gap-2"><Activity className="w-4 h-4"/> Trending Searches</h4>
                  <ul className="space-y-2 font-sans text-sm">
                    <li className="flex items-center justify-between group cursor-pointer glass-card p-3 hover:border-[#00C2FF]/30 transition-all" onClick={() => handleSearch(undefined, 'SBI', 'bank')}>
                      <span className="text-[#94A3B8] group-hover:text-white font-medium">SBI Maharashtra</span>
                      <ChevronRight className="w-4 h-4 text-[#64748B] group-hover:text-[#00C2FF]" />
                    </li>
                    <li className="flex items-center justify-between group cursor-pointer glass-card p-3 hover:border-[#00C2FF]/30 transition-all" onClick={() => {setSearchMode('location'); setSelState('MAHARASHTRA'); setSelDistrict('MUMBAI'); setSelCity(''); setSelBank(''); setSelBranch('');}}>
                      <span className="text-[#94A3B8] group-hover:text-white font-medium">Any Bank in Mumbai</span>
                      <ChevronRight className="w-4 h-4 text-[#64748B] group-hover:text-[#00C2FF]" />
                    </li>
                    <li className="flex items-center justify-between group cursor-pointer glass-card p-3 hover:border-[#00C2FF]/30 transition-all" onClick={() => {setSearchMode('location'); setSelState('KARNATAKA'); setSelDistrict('BENGALURU URBAN'); setSelCity('BENGALURU'); setSelBank('STATE BANK OF INDIA'); setSelBranch('');}}>
                      <span className="text-[#94A3B8] group-hover:text-white font-medium">SBI Bengaluru</span>
                      <ChevronRight className="w-4 h-4 text-[#64748B] group-hover:text-[#00C2FF]" />
                    </li>
                    <li className="flex items-center justify-between group cursor-pointer glass-card p-3 hover:border-[#00C2FF]/30 transition-all" onClick={() => handleSearch(undefined, '414001', 'pincode')}>
                      <span className="text-[#94A3B8] group-hover:text-white font-medium">Pincode 414001</span>
                      <ChevronRight className="w-4 h-4 text-[#64748B] group-hover:text-[#00C2FF]" />
                    </li>
                  </ul>
               </div>
            )}

            {/* Related Tools Module */}
            <div className="space-y-4 mt-6 pt-6 border-t border-white/[0.06]">
               <h4 className="text-[10px] text-[#64748B] uppercase tracking-widest font-bold mb-3 flex items-center gap-2"><Box className="w-4 h-4"/> Financial Tools</h4>
               <div className="grid grid-cols-1 gap-3">
                 <div onClick={() => setActiveTool('micr')} className="flex items-center gap-4 p-3 rounded-xl glass-card hover:border-[#00C2FF]/30 cursor-pointer transition-all group">
                   <div className="bg-[#0057D9]/10 p-2 rounded-xl border border-[#0057D9]/20 text-[#00C2FF] group-hover:bg-[#0057D9]/20 transition-colors"><Database className="w-5 h-5"/></div>
                   <div className="flex-1">
                     <div className="text-sm font-bold text-[#E2E8F0] group-hover:text-white">MICR Locator</div>
                     <div className="text-xs text-[#64748B]">Find check routing codes</div>
                   </div>
                 </div>
                 <div onClick={() => setActiveTool('swift')} className="flex items-center gap-4 p-3 rounded-xl glass-card hover:border-purple-500/30 cursor-pointer transition-all group">
                   <div className="bg-purple-500/10 p-2 rounded-xl border border-purple-500/20 text-purple-300 group-hover:bg-purple-500/20 transition-colors"><Globe className="w-5 h-5"/></div>
                   <div className="flex-1">
                     <div className="text-sm font-bold text-[#E2E8F0] group-hover:text-white">SWIFT Search</div>
                     <div className="text-xs text-[#64748B]">International wire transfers</div>
                   </div>
                 </div>
                 <div onClick={() => setActiveTool('holidays')} className="flex items-center gap-4 p-3 rounded-xl glass-card hover:border-red-500/30 cursor-pointer transition-all group">
                   <div className="bg-red-500/10 p-2 rounded-xl border border-red-500/20 text-red-300 group-hover:bg-red-500/20 transition-colors"><Calendar className="w-5 h-5"/></div>
                   <div className="flex-1">
                     <div className="text-sm font-bold text-[#E2E8F0] group-hover:text-white">Bank Holidays</div>
                     <div className="text-xs text-[#64748B]">Official RBI calendar 2026</div>
                   </div>
                 </div>
                 <div onClick={() => setActiveTool('emi')} className="flex items-center gap-4 p-3 rounded-xl glass-card hover:border-[#00E5A0]/30 cursor-pointer transition-all group">
                   <div className="bg-[#00E5A0]/10 p-2 rounded-xl border border-[#00E5A0]/20 text-[#00E5A0] group-hover:bg-[#00E5A0]/20 transition-colors"><Calculator className="w-5 h-5"/></div>
                   <div className="flex-1">
                     <div className="text-sm font-bold text-[#E2E8F0] group-hover:text-white">EMI Calculator</div>
                     <div className="text-xs text-[#64748B]">Home & Auto loans plan</div>
                   </div>
                 </div>
               </div>
            </div>

          </div>
        </aside>

      </main>

      {/* Mobile Drawer Slide-over */}
      {showMobileNav && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-200" 
            onClick={() => setShowMobileNav(false)}
          />
          {/* Content */}
          <div className="relative flex flex-col w-72 max-w-xs glass-card-strong !rounded-none h-full p-5 overflow-y-auto animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.06]">
              <span className="font-bold text-base text-[#E2E8F0]">Saved & Recents</span>
              <button 
                onClick={() => setShowMobileNav(false)}
                className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-[#64748B] hover:text-[#E2E8F0] text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-6">
              {/* Features */}
              <div>
                <span className="text-[11px] font-bold text-[#8B949E] uppercase tracking-wider block mb-2">Features / Modes</span>
                <div className="space-y-1">
                   <button 
                     onClick={() => { setSearchMode('master'); setShowMobileNav(false); }}
                     className={`w-full py-2.5 px-3 flex items-center gap-3 rounded-md text-left text-sm font-medium ${searchMode === 'master' ? 'bg-[#1F242C] text-[#58A6FF]' : 'text-[#8B949E] hover:bg-[#161B22]'}`}
                   >
                     <Globe className="w-4 h-4" /> Master Search (AI)
                   </button>
                   <button 
                     onClick={() => { setSearchMode('ifsc'); setShowMobileNav(false); }}
                     className={`w-full py-2.5 px-3 flex items-center gap-3 rounded-md text-left text-sm font-medium ${searchMode === 'ifsc' ? 'bg-[#1F242C] text-[#58A6FF]' : 'text-[#8B949E] hover:bg-[#161B22]'}`}
                   >
                     <FileText className="w-4 h-4" /> IFSC Search
                   </button>
                   <button 
                     onClick={() => { setSearchMode('location'); setShowMobileNav(false); }}
                     className={`w-full py-2.5 px-3 flex items-center gap-3 rounded-md text-left text-sm font-medium ${searchMode === 'location' ? 'bg-[#1F242C] text-[#58A6FF]' : 'text-[#8B949E] hover:bg-[#161B22]'}`}
                   >
                     <MapPin className="w-4 h-4" /> Location Search
                   </button>
                   <button 
                     onClick={() => { setSearchMode('pincode'); setShowMobileNav(false); }}
                     className={`w-full py-2.5 px-3 flex items-center gap-3 rounded-md text-left text-sm font-medium ${searchMode === 'pincode' ? 'bg-[#1F242C] text-[#58A6FF]' : 'text-[#8B949E] hover:bg-[#161B22]'}`}
                   >
                     <Map className="w-4 h-4" /> Pincode Search
                   </button>
                </div>
              </div>

              {/* Financial Tools */}
              <div>
                <span className="text-[11px] font-bold text-[#8B949E] uppercase tracking-wider block mb-2 font-semibold">Financial Tools</span>
                <div className="space-y-1">
                   <button 
                     onClick={() => { setActiveTool('micr'); setShowMobileNav(false); }}
                     className="w-full py-2 px-3 flex items-center gap-3 rounded-md text-left text-sm font-medium text-[#8B949E] hover:bg-[#161B22] hover:text-[#58A6FF] transition-colors"
                   >
                     <Database className="w-4 h-4 text-[#A5D6FF]" /> MICR Locator
                   </button>
                   <button 
                     onClick={() => { setActiveTool('swift'); setShowMobileNav(false); }}
                     className="w-full py-2 px-3 flex items-center gap-3 rounded-md text-left text-sm font-medium text-[#8B949E] hover:bg-[#161B22] hover:text-[#BF91FF] transition-colors"
                   >
                     <Globe className="w-4 h-4 text-[#D2A8FF]" /> SWIFT Search
                   </button>
                   <button 
                     onClick={() => { setActiveTool('holidays'); setShowMobileNav(false); }}
                     className="w-full py-2 px-3 flex items-center gap-3 rounded-md text-left text-sm font-medium text-[#8B949E] hover:bg-[#161B22] hover:text-[#FF7B72] transition-colors"
                   >
                     <Calendar className="w-4 h-4 text-[#FF7B72]" /> Bank Holidays
                   </button>
                   <button 
                     onClick={() => { setActiveTool('emi'); setShowMobileNav(false); }}
                     className="w-full py-2 px-3 flex items-center gap-3 rounded-md text-left text-sm font-medium text-[#8B949E] hover:bg-[#161B22] hover:text-[#7EE787] transition-colors"
                   >
                     <Calculator className="w-4 h-4 text-[#7EE787]" /> EMI Calculator
                   </button>
                </div>
              </div>

              {/* Favorites */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-3.5 h-3.5 text-[#E3B341]" fill="#E3B341" />
                  <span className="text-[11px] font-bold text-[#8B949E] uppercase tracking-wider">Saved Branches</span>
                </div>
                {favorites.length === 0 ? (
                  <div className="text-xs text-[#8B949E] italic px-1">No favorites saved yet.</div>
                ) : (
                  <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                    {favorites.map(fav => (
                      <button
                        key={`mob-draw-fav-${fav}`}
                        onClick={() => { handleSearch(undefined, fav, 'ifsc'); setShowMobileNav(false); }}
                        className="w-full text-left py-2 px-3 rounded-md text-sm font-mono text-[#58A6FF] hover:bg-[#161B22] flex justify-between items-center"
                      >
                        <span>{fav}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#8B949E]" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* History */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-3.5 h-3.5 text-[#7EE787]" />
                  <span className="text-[11px] font-bold text-[#8B949E] uppercase tracking-wider">Recent Queries</span>
                </div>
                {history.length === 0 ? (
                  <div className="text-xs text-[#8B949E] italic px-1">No recent search history.</div>
                ) : (
                  <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                    {history.map((histItem, idx) => (
                      <button
                        key={`mob-draw-hist-${idx}`}
                        onClick={() => { handleSearch(undefined, histItem, 'ifsc'); setShowMobileNav(false); }}
                        className="w-full text-left py-2 px-3 rounded-md text-sm font-mono text-[#8B949E] hover:bg-[#161B22] flex justify-between items-center"
                      >
                        <span>{histItem}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#8B949E]" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Financial Tool Modals */}
      {activeTool === 'micr' && (
        <MicrModal 
          onClose={() => setActiveTool(null)} 
          onGoToIfsc={(ifsc) => {
            setSearchMode('ifsc');
            setQueryInput(ifsc);
            handleSearch(undefined, ifsc, 'ifsc');
          }} 
        />
      )}
      {activeTool === 'swift' && (
        <SwiftModal 
          onClose={() => setActiveTool(null)} 
          onGoToIfsc={(ifsc) => {
            setSearchMode('ifsc');
            setQueryInput(ifsc);
            handleSearch(undefined, ifsc, 'ifsc');
          }} 
        />
      )}
      {activeTool === 'holidays' && (
        <HolidaysModal onClose={() => setActiveTool(null)} />
      )}
      {activeTool === 'emi' && (
        <EmiModal onClose={() => setActiveTool(null)} />
      )}

    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<AppContent />} />
      </Routes>
    </BrowserRouter>
  );
}
