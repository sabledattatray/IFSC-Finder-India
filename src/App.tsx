import { useState, FormEvent, useEffect, useRef } from 'react';
import { Search, Clock, Star, Copy, FileText, CheckCircle2, ChevronRight, Share2, MapPin, Building, Globe, Activity, Map, Navigation, Database, Phone, Mail, Box, Shield, Calendar, Calculator, Bookmark, RotateCcw, ChevronDown, Check, X } from 'lucide-react';

// Custom Portal Components
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import BlogPage from './components/BlogPage';
import LegalPages from './components/LegalPages';

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
    <div ref={containerRef} className="flex flex-col gap-1 w-full relative">
      <div className="flex justify-between items-center px-1">
        <label className="text-[11px] font-bold text-[#8B949E] uppercase tracking-wider">{label}</label>
        {value && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
              setSearchQuery('');
            }}
            type="button"
            className="text-[10px] text-[#FF7B72] hover:text-[#FFa198] font-medium transition-colors cursor-pointer focus:outline-none"
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
            className="w-full bg-[#010409] border border-[#30363D] rounded-md pl-3 pr-10 py-2 focus:border-[#58A6FF] text-sm text-[#C9D1D9] focus:outline-none focus:ring-1 focus:ring-[#58A6FF] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-text"
          />
          <div className="absolute right-2.5 flex items-center gap-1.5">
            {value && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onChange('');
                  setSearchQuery('');
                }}
                type="button"
                className="text-[#8B949E] hover:text-[#C9D1D9] p-0.5 focus:outline-none cursor-pointer"
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
              className="text-[#8B949E] hover:text-[#C9D1D9] focus:outline-none cursor-pointer"
            >
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {isOpen && !disabled && (
          <div className="absolute left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-[#161B22] border border-[#30363D] rounded-md shadow-xl z-20 py-1">
            {allOptionText && (
              <button
                onClick={() => {
                  onChange('ALL');
                  setSearchQuery(allOptionText);
                  setIsOpen(false);
                }}
                type="button"
                className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between cursor-pointer focus:outline-none
                  ${value === 'ALL' ? 'bg-[#1F242C] text-[#58A6FF] font-medium' : 'text-[#C9D1D9] hover:bg-[#21262D]'}`}
              >
                <span>{allOptionText}</span>
                {value === 'ALL' && <Check className="w-4 h-4" />}
              </button>
            )}
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-xs text-[#8B949E] italic">
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
                  className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between cursor-pointer focus:outline-none
                    ${value === opt.value ? 'bg-[#1F242C] text-[#58A6FF] font-medium' : 'text-[#C9D1D9] hover:bg-[#21262D]'}`}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#0D1117] border border-[#30363D] rounded-xl flex flex-col h-[85vh] max-h-[750px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#30363D] bg-[#161B22]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0D1117] border border-[#30363D] text-[#58A6FF] rounded-md">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">MICR Locator</h3>
              <p className="text-xs text-[#8B949E]">Find, search and verify banking check routing codes (Magnetic Ink Character Recognition)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-[#30363D] text-[#8B949E] hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:grid md:grid-cols-3 md:gap-6 flex flex-col gap-6">
          {/* Left search pane - col-span-2 */}
          <div className="md:col-span-2 flex flex-col gap-4 overflow-hidden">
            <div className="relative shrink-0">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-[#8B949E]" />
              <input 
                type="text"
                placeholder="Enter 9-digit MICR code (e.g. 400002002) or partial number..."
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#161B22] border border-[#30363D] rounded-lg text-white placeholder-[#8B949E] focus:outline-none focus:border-[#58A6FF] text-sm"
              />
            </div>

            {loading ? (
              <div className="flex-grow flex flex-col items-center justify-center py-12 text-[#8B949E] gap-2">
                <div className="w-6 h-6 border-2 border-t-transparent border-[#58A6FF] rounded-full animate-spin"></div>
                <span className="text-xs font-medium">Scanning index records...</span>
              </div>
            ) : error ? (
              <div className="p-4 bg-[#FF7B72]/10 border border-[#FF7B72]/30 text-[#FF7B72] rounded-lg text-sm shrink-0">{error}</div>
            ) : results.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center text-center py-12">
                <span className="text-sm text-[#8B949E] italic">No branches matching your MICR query found.</span>
              </div>
            ) : (
              <div className="flex-grow space-y-3 overflow-y-auto pr-2">
                <div className="text-[11px] font-bold text-[#8B949E] uppercase tracking-wider mb-2 shrink-0">Showing {results.length} Bank Branches</div>
                {results.map((b, i) => (
                  <div key={i} className="p-4 bg-[#161B22] border border-[#30363D] hover:border-[#8B949E] rounded-lg transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-[#58A6FF] uppercase tracking-wider">{b.BANK}</div>
                      <div className="text-sm font-semibold text-white">{b.BRANCH}</div>
                      <div className="text-xs text-[#8B949E] max-w-md">{b.ADDRESS}</div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {b.IMPS && <span className="bg-[#000] border border-[#30363D] text-[#7EE787] text-[9px] px-1.5 py-0.5 rounded font-mono">IMPS</span>}
                        {b.NEFT && <span className="bg-[#000] border border-[#30363D] text-[#58A6FF] text-[9px] px-1.5 py-0.5 rounded font-mono">NEFT</span>}
                        {b.RTGS && <span className="bg-[#000] border border-[#30363D] text-[#D2A8FF] text-[9px] px-1.5 py-0.5 rounded font-mono">RTGS</span>}
                        {b.UPI && <span className="bg-[#000] border border-[#30363D] text-[#FF7B72] text-[9px] px-1.5 py-0.5 rounded font-mono">UPI</span>}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2.5 shrink-0 sm:border-l sm:border-[#30363D] sm:pl-4">
                      <div>
                        <div className="text-[10px] text-[#8B949E] font-semibold text-right uppercase">MICR CODE</div>
                        <div className="font-mono text-sm text-[#FF7B72] font-semibold flex items-center gap-1.5 bg-[#0D1117] px-2.5 py-1 rounded border border-[#30363D]">
                          <span>{b.MICR}</span>
                          <button onClick={() => copyText(b.MICR)} className="p-0.5 hover:text-white text-[#8B949E] transition-colors cursor-pointer">
                            {copiedCode === b.MICR ? <Check className="w-3.5 h-3.5 text-[#58A6FF]" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <button 
                          onClick={() => { onGoToIfsc(b.IFSC); }}
                          className="text-[11px] text-[#58A6FF] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                        >
                          View IFSC: {b.IFSC} <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right info pane - educational */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-5 flex flex-col justify-between gap-4 overflow-y-auto">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-white border-b border-[#30363D] pb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#58A6FF]" />
                What is an MICR Code?
              </h4>
              <p className="text-xs text-[#8B949E] leading-relaxed">
                MICR stands for <strong>Magnetic Ink Character Recognition</strong>. It is a 9-digit character recognition technology used mainly by the banking industry to ease the processing and clearing of cheques.
              </p>

              <div>
                <h5 className="text-[11px] font-bold text-[#E6EDF3] mb-2 font-mono">Structure of 9-Digit Code:</h5>
                <ul className="space-y-2">
                  <li className="text-xs bg-[#0D1117] p-2.5 border border-[#30363D] rounded-md">
                    <span className="font-bold text-[#58A6FF] block font-mono">Digits 1, 2, 3</span>
                    <span className="text-[#8B949E] text-[11px]">Represent the <strong>City Code</strong> matching the PIN code of the city. (e.g. 400 for Mumbai)</span>
                  </li>
                  <li className="text-xs bg-[#0D1117] p-2.5 border border-[#30363D] rounded-md">
                    <span className="font-bold text-[#D2A8FF] block font-mono">Digits 4, 5, 6</span>
                    <span className="text-[#8B949E] text-[11px]">Represent the <strong>Bank Code</strong> unique to that bank institution. (e.g. 002 for SBI)</span>
                  </li>
                  <li className="text-xs bg-[#0D1117] p-2.5 border border-[#30363D] rounded-md">
                    <span className="font-bold text-[#FF7B72] block font-mono">Digits 7, 8, 9</span>
                    <span className="text-[#8B949E] text-[11px]">Represent the particular bank's <strong>Branch Code</strong>. (e.g. 001 for main branch)</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-[10px] text-[#8B949E] bg-[#0D1117] p-2.5 rounded border border-[#30363D] italic">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#0D1117] border border-[#30363D] rounded-xl flex flex-col h-[85vh] max-h-[750px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#30363D] bg-[#161B22]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0D1117] border border-[#30363D] text-[#D2A8FF] rounded-md">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">SWIFT / BIC Search</h3>
              <p className="text-xs text-[#8B949E]">Search international wire transfer routing codes for cross-border banking</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-[#30363D] text-[#8B949E] hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:grid md:grid-cols-3 md:gap-6 flex flex-col gap-6">
          {/* Left search pane - col-span-2 */}
          <div className="md:col-span-2 flex flex-col gap-4 overflow-hidden">
            <div className="relative shrink-0">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-[#8B949E]" />
              <input 
                type="text"
                placeholder="Enter SWIFT/BIC code (e.g. SBININ) or bank name..."
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#161B22] border border-[#30363D] rounded-lg text-white placeholder-[#8B949E] focus:outline-none focus:border-[#58A6FF] text-sm"
              />
            </div>

            {loading ? (
              <div className="flex-grow flex flex-col items-center justify-center py-12 text-[#8B949E] gap-2">
                <div className="w-6 h-6 border-2 border-t-transparent border-[#BF91FF] rounded-full animate-spin"></div>
                <span className="text-xs font-medium">Scanning Forex SWIFT records...</span>
              </div>
            ) : error ? (
              <div className="p-4 bg-[#FF7B72]/10 border border-[#FF7B72]/30 text-[#FF7B72] rounded-lg text-sm shrink-0">{error}</div>
            ) : results.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center text-center py-12">
                <span className="text-sm text-[#8B949E] italic">No branches matching your SWIFT query found.</span>
              </div>
            ) : (
              <div className="flex-grow space-y-3 overflow-y-auto pr-2">
                <div className="text-[11px] font-bold text-[#8B949E] uppercase tracking-wider mb-2 shrink-0">Showing {results.length} SWIFT-Enabled Branches</div>
                {results.map((b, i) => (
                  <div key={i} className="p-4 bg-[#161B22] border border-[#30363D] hover:border-[#8B949E] rounded-lg transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-[#D2A8FF] uppercase tracking-wider">{b.BANK}</div>
                      <div className="text-sm font-semibold text-white">{b.BRANCH}</div>
                      <div className="text-xs text-[#8B949E] max-w-md">{b.ADDRESS}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="bg-[#0D1117] border border-[#30363D] text-[#8B949E] text-[10px] px-2 py-0.5 rounded font-mono font-semibold">City: {b.CITY}</span>
                        <span className="bg-[#0D1117] border border-[#30363D] text-[#8B949E] text-[10px] px-2 py-0.5 rounded font-mono font-semibold">State: {b.STATE}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2.5 shrink-0 sm:border-l sm:border-[#30363D] sm:pl-4">
                      <div>
                        <div className="text-[10px] text-[#8B949E] font-semibold text-right uppercase">SWIFT / BIC</div>
                        <div className="font-mono text-base text-[#D2A8FF] font-bold flex items-center gap-1.5 bg-[#0D1117] px-2.5 py-1 rounded border border-[#30363D]">
                          <span>{b.SWIFT}</span>
                          <button onClick={() => copyText(b.SWIFT)} className="p-0.5 hover:text-white text-[#8B949E] transition-colors cursor-pointer">
                            {copiedCode === b.SWIFT ? <Check className="w-3.5 h-3.5 text-[#58A6FF]" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <button 
                          onClick={() => { onGoToIfsc(b.IFSC); }}
                          className="text-[11px] text-[#58A6FF] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                        >
                          Check IFSC: {b.IFSC} <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right info pane - educational */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-5 flex flex-col justify-between gap-4 overflow-y-auto">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-white border-b border-[#30363D] pb-2 flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#D2A8FF]" />
                SWIFT Code Info
              </h4>
              <p className="text-xs text-[#8B949E] leading-relaxed">
                SWIFT stands for <strong>Society for Worldwide Interbank Financial Telecommunication</strong> (also called BIC - Bank Identifier Code).
              </p>

              <div>
                <h5 className="text-[11px] font-bold text-[#8B949E] uppercase tracking-wider mb-2">Wire Checklist:</h5>
                <div className="space-y-2 text-xs text-[#C9D1D9]">
                  <p className="text-[11px] text-[#8B949E]">To receive money from overseas, you always need:</p>
                  <div className="p-2.5 bg-[#0D1117] border border-[#30363D] rounded space-y-1.5 font-sans">
                    <div className="flex justify-between border-b border-[#1F242C] pb-1"><span className="text-xs text-[#8B949E]">1. Bank Name</span><span className="font-semibold text-white text-right text-[11px]">e.g. State Bank of India</span></div>
                    <div className="flex justify-between border-b border-[#1F242C] pb-1"><span className="text-xs text-[#8B949E]">2. SWIFT Code</span><span className="font-mono text-[#D2A8FF] font-semibold text-right">8 or 11 Character Code</span></div>
                    <div className="flex justify-between border-b border-[#1F242C] pb-1"><span className="text-xs text-[#8B949E]">3. IFSC Code</span><span className="font-mono text-[#58A6FF] text-[11px] font-semibold text-right">Local branch IFSC</span></div>
                    <div className="flex justify-between border-b border-[#1F242C] pb-1"><span className="text-xs text-[#8B949E]">4. Account No</span><span className="font-semibold text-white text-right">Your savings/current account</span></div>
                    <div className="flex justify-between"><span className="text-xs text-[#8B949E]">5. Beneficiary</span><span className="font-semibold text-white text-right text-[11px]">Match exact banking name</span></div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#0D1117] border border-[#30363D] rounded text-xs text-[#8B949E]">
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
    const today = new Date('2026-06-17'); // June 17, 2026
    const target = new Date(targetDateStr);
    const diff = target.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const nextHoliday = holidayList
    .filter(h => getDaysCountLeft(h.date) >= 0)
    .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#0D1117] border border-[#30363D] rounded-xl flex flex-col h-[85vh] max-h-[750px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#30363D] bg-[#161B22]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0D1117] border border-[#30363D] text-[#FF7B72] rounded-md">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Bank Holidays Calendar — 2026</h3>
              <p className="text-xs text-[#8B949E]">Official RBI recognized bank closures for national & state-wise holidays in India</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-[#30363D] text-[#8B949E] hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Info Panel */}
        <div className="px-6 py-3 bg-[#1F242C] border-b border-[#30363D] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#58A6FF] animate-pulse"></span>
            <span className="text-xs font-semibold text-[#C9D1D9]">Current Date: June 17, 2026 (Wednesday)</span>
          </div>
          {nextHoliday && (
            <div className="text-xs text-[#8B949E]">
              Next up: <strong className="text-white">{nextHoliday.name}</strong> on <span className="text-[#FF7B72] font-mono">{nextHoliday.date}</span> (~{getDaysCountLeft(nextHoliday.date)} days away)
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-grow overflow-hidden flex flex-col md:flex-row">
          {/* Main List */}
          <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3 shrink-0">
              <div className="flex flex-col gap-1 w-44">
                <label className="text-[10px] font-bold text-[#8B949E] uppercase tracking-wider">Select State / Region</label>
                <div className="relative">
                  <select 
                    value={selectedState} 
                    onChange={e => setSelectedState(e.target.value)}
                    className="w-full bg-[#161B22] border border-[#30363D] rounded-md px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#58A6FF] appearance-none cursor-pointer"
                  >
                    {states.map(s => <option key={s} value={s}>{s === 'National' ? 'National / All States' : s}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-[#8B949E] pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col gap-1 w-32">
                <label className="text-[10px] font-bold text-[#8B949E] uppercase tracking-wider">Month</label>
                <div className="relative">
                  <select 
                    value={selectedMonth} 
                    onChange={e => setSelectedMonth(e.target.value)}
                    className="w-full bg-[#161B22] border border-[#30363D] rounded-md px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#58A6FF] appearance-none cursor-pointer"
                  >
                    {months.map(m => <option key={m} value={m}>{m === 'All' ? 'All Months' : m}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-[#8B949E] pointer-events-none" />
                </div>
              </div>
            </div>

            {/* List */}
            <div className="space-y-3 overflow-y-auto pr-2 flex-grow">
              {filteredHolidays.length === 0 ? (
                <div className="text-center py-12 text-sm text-[#8B949E] italic">
                  No holidays match your filter criteria in 2026.
                </div>
              ) : (
                filteredHolidays.map((h, i) => {
                  const isPastStr = getDaysCountLeft(h.date) < 0;
                  return (
                    <div 
                      key={i} 
                      className={`p-3.5 border rounded-lg transition-colors flex items-center justify-between gap-4
                        ${isPastStr ? 'bg-[#161B22]/50 border-dashed border-[#21262D]' : 'bg-[#161B22] border-[#30363D] hover:border-[#8B949E]'}`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono uppercase tracking-wider
                            ${h.type === 'National Holiday' ? 'bg-[#FF7B72]/10 text-[#FF7B72] border border-[#FF7B72]/20' : 'bg-[#58A6FF]/10 text-[#58A6FF] border border-[#58A6FF]/20'}`}>
                            {h.type}
                          </span>
                          {isPastStr && <span className="text-[9px] font-semibold text-[#8B949E] bg-[#21262D] px-1.5 py-0.2 rounded uppercase">Completed</span>}
                        </div>
                        <h4 className="text-sm font-bold text-white leading-snug">{h.name}</h4>
                        <p className="text-xs text-[#8B949E] leading-normal">{h.desc}</p>
                        <p className="text-[10px] text-[#A5D6FF] font-medium">Applicable: <span className="text-[#C9D1D9]">{h.state}</span></p>
                      </div>

                      <div className="text-center shrink-0 bg-[#0D1117] px-4 py-2 border border-[#30363D] rounded-lg min-w-[100px]">
                        <div className="text-[10px] font-mono font-bold text-[#8B949E] uppercase leading-none">{getMonthAbbr(h.date)} 2026</div>
                        <div className="text-lg font-bold text-white font-mono leading-none my-1">{h.date.split('-')[2]}</div>
                        <div className="text-[9px] font-semibold text-[#8B949E] leading-none">{h.day}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Rules/Info sidebar */}
          <div className="w-full md:w-80 bg-[#161B22] border-t md:border-t-0 md:border-l border-[#30363D] p-6 space-y-4 text-xs overflow-y-auto">
            <h4 className="text-sm font-semibold text-white border-b border-[#30363D] pb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#FF7B72]" />
              RBI Weekend Closure Rules
            </h4>
            <div className="space-y-4 leading-relaxed text-[#8B949E]">
              <p>Under official RBI directives, commercial banks in India follow strict weekend closed schedules:</p>
              
              <div className="space-y-2.5 text-white">
                <div className="p-2.5 bg-[#0D1117] border border-[#30363D] rounded flex gap-2.5 items-center">
                  <CheckCircle2 className="w-4 h-4 text-[#7EE787] shrink-0" />
                  <div>
                    <span className="font-bold text-xs">Sundays:</span>
                    <span className="text-xs text-[#8B949E] block">All Sundays are strict bank holidays across India.</span>
                  </div>
                </div>
                
                <div className="p-2.5 bg-[#0D1117] border border-[#30363D] rounded flex gap-2.5 items-center">
                  <CheckCircle2 className="w-4 h-4 text-[#58A6FF] shrink-0" />
                  <div>
                    <span className="font-bold text-xs">2nd & 4th Saturdays:</span>
                    <span className="text-xs text-[#8B949E] block">Complete closure / official banking shut downs.</span>
                  </div>
                </div>

                <div className="p-2.5 bg-[#0D1117] border border-[#30363D] rounded flex gap-2.5 items-center">
                  <X className="w-4 h-4 text-[#FF7B72] shrink-0" />
                  <div>
                    <span className="font-bold text-xs">1st, 3rd, 5th Saturdays:</span>
                    <span className="text-xs text-[#8B949E] block">Full normal working days for all branches.</span>
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <h5 className="font-semibold text-white mb-1">Electronic Money status:</h5>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#0D1117] border border-[#30363D] rounded-xl flex flex-col h-[85vh] max-h-[750px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#30363D] bg-[#161B22]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0D1117] border border-[#30363D] text-[#7EE787] rounded-md">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">EMI Calculator</h3>
              <p className="text-xs text-[#8B949E]">Calculate monthly EMIs, total interest payouts, and schedule your Home, Personal, or Car loans</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-[#30363D] text-[#8B949E] hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto p-6 md:grid md:grid-cols-2 md:gap-8 flex flex-col gap-6">
          {/* Left panel - Inputs */}
          <div className="space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Loan Amount */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#E6EDF3] uppercase tracking-wider">Loan Amount</span>
                  <span className="font-mono text-sm text-[#7EE787] font-bold">{formatINR(loanAmount)}</span>
                </div>
                <input 
                  type="range"
                  min="100000"
                  max="30000000"
                  step="50000"
                  value={loanAmount}
                  onChange={e => setLoanAmount(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-[#21262D] rounded-lg appearance-none cursor-pointer accent-[#7EE787]"
                />
                <div className="flex justify-between text-[10px] text-[#8B949E]">
                  <span>₹1 Lakh</span>
                  <span>₹1.5 Crore</span>
                  <span>₹3 Crore</span>
                </div>
              </div>

              {/* Interest Rate */}
              <div className="space-y-1.5 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#E6EDF3] uppercase tracking-wider">Interest Rate (p.a.)</span>
                  <span className="font-mono text-sm text-[#FF7B72] font-bold">{interestRate}%</span>
                </div>
                <input 
                  type="range"
                  min="5"
                  max="15"
                  step="0.1"
                  value={interestRate}
                  onChange={e => setInterestRate(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-[#21262D] rounded-lg appearance-none cursor-pointer accent-[#FF7B72]"
                />
                <div className="flex justify-between text-[10px] text-[#8B949E]">
                  <span>5%</span>
                  <span>10%</span>
                  <span>15%</span>
                </div>
              </div>

              {/* Tenure */}
              <div className="space-y-1.5 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#E6EDF3] uppercase tracking-wider">Tenure (Years)</span>
                  <span className="font-mono text-sm text-[#58A6FF] font-bold">{tenureYears} Years ({tenureYears*12} Months)</span>
                </div>
                <input 
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={tenureYears}
                  onChange={e => setTenureYears(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-[#21262D] rounded-lg appearance-none cursor-pointer accent-[#58A6FF]"
                />
                <div className="flex justify-between text-[10px] text-[#8B949E]">
                  <span>1 Yr</span>
                  <span>15 Yrs</span>
                  <span>30 Years</span>
                </div>
              </div>
            </div>

            {/* Amortization Breakdown Table */}
            <div className="space-y-2 mt-4">
              <span className="text-[11px] font-bold text-[#8B949E] uppercase tracking-wider block">Yearly Payment Schedule</span>
              <div className="border border-[#30363D] rounded-lg overflow-hidden">
                <div className="grid grid-cols-4 bg-[#161B22] p-2 text-[10px] font-bold text-[#8B949E] uppercase border-b border-[#30363D]">
                  <span>Yr</span>
                  <span className="text-right">Principal</span>
                  <span className="text-right">Interest</span>
                  <span className="text-right">Balance</span>
                </div>
                <div className="max-h-48 overflow-y-auto divide-y divide-[#30363D] pr-1">
                  {schedule.map((item) => (
                    <div key={item.year} className="grid grid-cols-4 p-2 text-xs text-[#C9D1D9] hover:bg-[#161B22] transition-colors font-mono">
                      <span className="font-sans text-[#8B949E] font-bold">Y{item.year}</span>
                      <span className="text-right text-[#7EE787]">{formatINR(item.principalPaid)}</span>
                      <span className="text-right text-[#FF7B72]">{formatINR(item.interestPaid)}</span>
                      <span className="text-right text-white">{formatINR(item.balance)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Outputs & Custom SVG Pizza Diagram */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-5 flex flex-col justify-between gap-4">
            <div className="grid grid-cols-2 gap-3 shrink-0">
              <div className="p-3 bg-[#0D1117] border border-[#30363D] rounded-lg text-center col-span-2">
                <span className="text-[10px] font-bold text-[#8B949E] uppercase tracking-wider block">Estimated Monthly EMI</span>
                <div className="text-2xl font-black text-[#7EE787] mt-1 font-mono">{formatINR(emi)}</div>
              </div>
              
              <div className="p-3 bg-[#0D1117] border border-[#30363D] rounded-lg">
                <span className="text-[9px] font-bold text-[#8B949E] uppercase tracking-wider block">Total Principal</span>
                <span className="text-xs font-bold text-[#7EE787] block mt-0.5">{formatINR(loanAmount)}</span>
                <span className="text-[10px] text-[#8B949E] font-medium block">({ratioPrincipal.toFixed(1)}% ratio)</span>
              </div>

              <div className="p-3 bg-[#0D1117] border border-[#30363D] rounded-lg">
                <span className="text-[9px] font-bold text-[#8B949E] uppercase tracking-wider block">Total Interest Cost</span>
                <span className="text-xs font-bold text-[#FF7B72] block mt-0.5">{formatINR(totalInterest)}</span>
                <span className="text-[10px] text-[#8B949E] font-medium block">({ratioInterest.toFixed(1)}% ratio)</span>
              </div>
            </div>

            {/* Donut Chart with clean SVG */}
            <div className="flex flex-col items-center justify-center p-3 relative bg-[#0D1117] rounded-lg border border-[#30363D] my-1 flex-grow">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    className="text-[#7EE787] stroke-current"
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
                  <span className="text-[9px] font-bold text-[#8B949E] uppercase block">Total Payout</span>
                  <span className="text-[10px] font-bold text-[#C9D1D9] font-mono leading-none">{formatINR(totalPayment)}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-3.5 text-xs w-full justify-center">
                <span className="flex items-center gap-1.5 text-[#C9D1D9]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#7EE787]"></span> Principal portion
                </span>
                <span className="flex items-center gap-1.5 text-[#C9D1D9]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF7B72]"></span> Interest portion
                </span>
              </div>
            </div>

            <div className="text-[10px] text-[#8B949E] leading-relaxed italic bg-[#0D1117] p-2.5 rounded border border-[#30363D] shrink-0">
              * Note: Higher loan tenures drastically increase total interest payouts. Prioritize a higher monthly EMI to minimize interest loading!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'search' | 'blogs' | 'blog-detail' | 'privacy' | 'terms' | 'disclaimer'>('home');
  const [selectedBlogSlug, setSelectedBlogSlug] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<'micr' | 'swift' | 'holidays' | 'emi' | null>(null);

  const handlePageChange = (page: 'home' | 'search' | 'blogs' | 'blog-detail' | 'privacy' | 'terms' | 'disclaimer', slug?: string) => {
    setCurrentPage(page);
    if (slug) {
      setSelectedBlogSlug(slug);
    } else {
      setSelectedBlogSlug(null);
    }
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  };

  const [queryInput, setQueryInput] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('master');
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
    if(!data.SWIFT) data.SWIFT = "Not Available";
    if(!data.BRANCH_CODE) data.BRANCH_CODE = data.IFSC.slice(-6);
    if(!data.EMAIL) data.EMAIL = "care@"+data.BANKCODE.toLowerCase()+".co.in";
    if(data.ATM === undefined) data.ATM = true;
    if(data.CASH_DEPOSIT === undefined) data.CASH_DEPOSIT = true;
    if(data.LOCKER === undefined) data.LOCKER = false;
    return data;
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
      <div className="flex flex-col min-h-screen w-full bg-[#0D1117] text-[#C9D1D9] font-sans border-t-[3px] border-[#58A6FF] overflow-y-auto">
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
    <div className="flex flex-col min-h-screen md:h-screen w-full bg-[#0D1117] text-[#C9D1D9] font-sans border-t-[3px] border-[#58A6FF] overflow-y-auto md:overflow-hidden">
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
        <aside className="w-64 bg-[#0D1117] border-r border-[#30363D] flex flex-col overflow-hidden hidden md:flex">
          <div className="flex-1 overflow-y-auto py-4">

            <div className="px-5 mb-2">
              <span className="text-[11px] font-bold text-[#8B949E] uppercase tracking-wider">Features</span>
            </div>
            <div className="mb-6 space-y-0.5">
               <div
                 onClick={() => setSearchMode('master')}
                 className={`px-5 py-2.5 flex items-center gap-3 transition-colors text-sm font-medium cursor-pointer border-l-2
                   ${searchMode === 'master' ? 'bg-[#1F242C] border-l-[#58A6FF] text-[#58A6FF]' : 'border-l-transparent text-[#8B949E] hover:bg-[#161B22] hover:text-[#C9D1D9]'}
                 `}
               >
                 <Globe className="w-4 h-4 text-[#58A6FF]" /> Master Search (AI)
               </div>
               <div
                 onClick={() => setSearchMode('ifsc')}
                 className={`px-5 py-2.5 flex items-center gap-3 transition-colors text-sm font-medium cursor-pointer border-l-2
                   ${searchMode === 'ifsc' ? 'bg-[#1F242C] border-l-[#58A6FF] text-[#58A6FF]' : 'border-l-transparent text-[#8B949E] hover:bg-[#161B22] hover:text-[#C9D1D9]'}
                 `}
               >
                 <Search className="w-4 h-4" /> IFSC Search
               </div>
               <div
                 onClick={() => setSearchMode('location')}
                 className={`px-5 py-2.5 flex items-center gap-3 transition-colors text-sm font-medium cursor-pointer border-l-2
                   ${searchMode === 'location' ? 'bg-[#1F242C] border-l-[#58A6FF] text-[#58A6FF]' : 'border-l-transparent text-[#8B949E] hover:bg-[#161B22] hover:text-[#C9D1D9]'}
                 `}
               >
                 <MapPin className="w-4 h-4" /> Location Search
               </div>
               <div
                 onClick={() => setSearchMode('pincode')}
                 className={`px-5 py-2.5 flex items-center gap-3 transition-colors text-sm font-medium cursor-pointer border-l-2
                   ${searchMode === 'pincode' ? 'bg-[#1F242C] border-l-[#58A6FF] text-[#58A6FF]' : 'border-l-transparent text-[#8B949E] hover:bg-[#161B22] hover:text-[#C9D1D9]'}
                 `}
               >
                 <Map className="w-4 h-4" /> Pincode Search
               </div>
            </div>

            {/* Financial Tools Section in Left Sidebar */}
            <div className="px-5 flex items-center gap-2 opacity-70 mb-2 mt-4 border-t border-[#30363D] pt-4">
              <Box className="w-3.5 h-3.5 text-[#58A6FF]" />
              <span className="text-[11px] font-bold text-[#8B949E] uppercase tracking-wider">Financial Tools</span>
            </div>
            <div className="mb-4 space-y-0.5 px-2">
              <div
                onClick={() => setActiveTool('micr')}
                className="px-3 py-2 flex items-center gap-2.5 rounded-md hover:bg-[#161B22] text-[#8B949E] hover:text-[#A5D6FF] transition-all text-xs font-semibold cursor-pointer"
              >
                <Database className="w-3.5 h-3.5 text-[#A5D6FF]" /> MICR Locator
              </div>
              <div
                onClick={() => setActiveTool('swift')}
                className="px-3 py-2 flex items-center gap-2.5 rounded-md hover:bg-[#161B22] text-[#8B949E] hover:text-[#BF91FF] transition-all text-xs font-semibold cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-[#BF91FF]" /> SWIFT Search
              </div>
              <div
                onClick={() => setActiveTool('holidays')}
                className="px-3 py-2 flex items-center gap-2.5 rounded-md hover:bg-[#161B22] text-[#8B949E] hover:text-[#FF7B72] transition-all text-xs font-semibold cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-[#FF7B72]" /> Bank Holidays
              </div>
              <div
                onClick={() => setActiveTool('emi')}
                className="px-3 py-2 flex items-center gap-2.5 rounded-md hover:bg-[#161B22] text-[#8B949E] hover:text-[#7EE787] transition-all text-xs font-semibold cursor-pointer"
              >
                <Calculator className="w-3.5 h-3.5 text-[#7EE787]" /> EMI Calculator
              </div>
            </div>

            {/* Favorites Section */}
            <div className="px-5 flex items-center gap-2 opacity-70 mb-2 mt-2">
              <Star className="w-3.5 h-3.5 text-[#E3B341]" />
              <span className="text-[11px] font-bold text-[#8B949E] uppercase tracking-wider">Saved Branches</span>
            </div>
            {favorites.length === 0 && (
              <div className="px-5 py-1 text-xs text-[#8B949E] italic">No favorites added.</div>
            )}
            {favorites.map(fav => (
              <div
                key={`fav-${fav}`}
                onClick={() => handleSearch(undefined, fav, 'ifsc')}
                className={`px-5 py-2 flex items-center justify-between transition-colors cursor-pointer text-sm font-mono
                  ${result?.IFSC === fav ? 'bg-[#1F242C] border-l-2 border-[#58A6FF] text-[#58A6FF]' : 'hover:bg-[#161B22] hover:text-[#C9D1D9] text-[#8B949E]'}
                `}
              >
                <span>{fav}</span>
              </div>
            ))}

            {/* History Section */}
            <div className="px-5 mt-6 flex items-center gap-2 opacity-70 mb-2">
              <Clock className="w-3.5 h-3.5 text-[#7EE787]" />
              <span className="text-[11px] font-bold text-[#8B949E] uppercase tracking-wider">Recent Queries</span>
            </div>
            {history.length === 0 && (
              <div className="px-5 py-1 text-xs text-[#8B949E] italic">No recent history.</div>
            )}
            {history.map((histItem, idx) => (
              <div
                key={`hist-${idx}`}
                onClick={() => handleSearch(undefined, histItem, 'ifsc')}
                className={`px-5 py-2 flex items-center justify-between transition-colors cursor-pointer text-sm font-mono
                  ${result?.IFSC === histItem && !favorites.includes(histItem) ? 'bg-[#1F242C] border-l-2 border-[#58A6FF] text-[#58A6FF]' : 'hover:bg-[#161B22] hover:text-[#C9D1D9] text-[#8B949E]'}
                `}
              >
                <span>{histItem}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* Center Area - Editor/Viewer */}
        <section className="flex-1 flex flex-col min-w-0 bg-[#0D1117] relative overflow-y-visible md:overflow-hidden">

          {/* Top Address Bar inside Center Area */}
          <div className="border-b border-[#30363D] bg-[#161B22]">
            {/* Tabs */}
            <div className="flex px-4 pt-3 gap-1 md:gap-1.5 text-xs font-bold uppercase tracking-wider overflow-x-auto flex-nowrap scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden mb-[-1px] relative z-10">
              {(['master', 'ifsc', 'location', 'pincode'] as SearchMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSearchMode(mode)}
                  className={`px-4 py-2.5 md:px-6 md:py-3 rounded-t-lg transition-all duration-150 border-t-[3px] border-x border-b flex items-center gap-1.5 md:gap-2 whitespace-nowrap flex-shrink-0 cursor-pointer select-none outline-none focus:outline-none
                    ${searchMode === mode
                      ? 'bg-[#0D1117] text-[#C9D1D9] border-x-[#30363D] border-t-[#58A6FF] border-b-transparent'
                      : 'text-[#8B949E] hover:bg-[#21262D] hover:text-[#C9D1D9] border-x-transparent border-t-transparent border-b-[#30363D]'
                    }`}
                >
                  {mode === 'master' ? <Globe className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#58A6FF]"/> :
                   mode === 'ifsc' ? <FileText className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#7EE787]"/> :
                   mode === 'location' ? <Building className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#D2A8FF]"/> :
                   <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#FF7B72]"/>}
                  
                  <span>
                    {mode === 'master' ? 'Master Search (AI)' : 
                     mode === 'ifsc' ? 'IFSC Search' : 
                     mode === 'location' ? 'Location Search' : 
                     'Pincode Search'}
                  </span>
                </button>
              ))}
              <div className="flex-1 border-b border-[#30363D] min-w-[12px] h-full self-end"></div>
            </div>

            {/* Input Bar */}
             <div className="p-4 bg-[#0D1117] border-b border-[#30363D]">
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
                        className="w-full sm:w-auto px-4 py-2.5 rounded-md text-sm font-semibold border border-[#30363D] bg-[#21262D] text-[#C9D1D9] hover:bg-[#30363D] transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none"
                      >
                        <RotateCcw className="w-4 h-4 text-[#8B949E]" /> Clear Filters
                      </button>
                      <button
                        onClick={handleCascadeSearch}
                        disabled={!selState}
                        type="button"
                        className="w-full sm:w-auto bg-[#238636] text-white px-6 py-2.5 rounded-md text-sm font-semibold hover:bg-[#2EA043] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm cursor-pointer focus:outline-none"
                      >
                        <Search className="w-4 h-4"/> Search Location
                      </button>
                    </div>
                  </div>
                ) : (
                 <form onSubmit={handleSearch} className="flex flex-col sm:flex-row flex-1 items-stretch sm:items-center gap-3 w-full max-w-3xl">
                   <div className="flex items-center bg-[#010409] border border-[#30363D] rounded flex-1 focus-within:border-[#58A6FF] focus-within:ring-1 focus-within:ring-[#58A6FF] transition-all shadow-sm">
                     <Search className="w-5 h-5 text-[#8B949E] ml-4 mr-2" />
                     <input
                       type="text"
                       value={queryInput}
                       onChange={e => setQueryInput(e.target.value.toUpperCase())}
                       placeholder={searchMode === 'master' ? "Search entire directory + live web... e.g. 'SBI Bengaluru' or 'HDFC Kurla'" : `Search by ${searchMode.toUpperCase()}... e.g. ${
                         searchMode === 'ifsc' ? 'SBIN0000813' : '414001, 110001, 400028'
                       }`}
                       className="bg-transparent border-none outline-none py-3 text-base text-[#C9D1D9] w-full font-mono placeholder:text-[#8B949E] placeholder:font-sans focus:opacity-100"
                     />
                     {queryInput && (
                       <button type="button" onClick={() => setQueryInput('')} className="pr-4 text-[#8B949E] hover:text-[#E6EDF3]"><div className="bg-[#21262D] rounded-full p-1"><CheckCircle2 className="w-3 h-3 text-transparent invisible"/></div></button>
                     )}
                   </div>
                   <button
                      type="submit"
                      disabled={loading || !queryInput.trim()}
                      className="bg-[#238636] text-white px-8 py-3 rounded text-sm font-semibold hover:bg-[#2EA043] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm w-full sm:w-auto whitespace-nowrap"
                    >
                     Search
                   </button>
                 </form>
               )}
             </div>
          </div>

          {/* Editor Body */}
          <div className="flex-1 p-4 md:p-6 lg:p-8 font-sans text-sm overflow-y-visible md:overflow-y-auto bg-black">
                          {!result && !searchResults && !loading && !error && (
                <div className="max-w-4xl mx-auto space-y-10 py-6">
                   <div className="flex flex-col items-center justify-center text-center opacity-70">
                      <Database className="w-16 h-16 text-[#30363D] mb-4" />
                      <h2 className="text-xl font-bold text-white tracking-tight">Master Banking Directory Search</h2>
                      <p className="max-w-lg text-[#8B949E] text-sm mt-2">Use high-powered Master Search to search our offline archive instantly, backed by real-time parallel web crawler verification.</p>
                   </div>

                   {/* Mobile Favorites & History */}
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 md:hidden">
                     {/* Mobile Favorites */}
                     <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4">
                       <div className="flex items-center gap-2 mb-3 border-b border-[#30363D] pb-2">
                         <Star className="w-4 h-4 text-[#E3B341]" fill="#E3B341" />
                         <span className="text-xs font-bold text-[#E6EDF3] uppercase tracking-wider">Saved Branches</span>
                       </div>
                       {favorites.length === 0 ? (
                         <p className="text-xs text-[#8B949E] italic py-2">No favorites added yet.</p>
                       ) : (
                         <div className="max-h-48 overflow-y-auto divide-y divide-[#30363D] divide-opacity-50">
                           {favorites.map(fav => (
                             <button
                               key={`mob-fav-${fav}`}
                               onClick={() => handleSearch(undefined, fav, 'ifsc')}
                               className="w-full text-left py-2.5 font-mono text-sm text-[#58A6FF] hover:text-[#7EE787] flex justify-between items-center"
                             >
                               <span>{fav}</span>
                               <ChevronRight className="w-3.5 h-3.5 text-[#8B949E]" />
                             </button>
                           ))}
                         </div>
                       )}
                     </div>

                     {/* Mobile Recent Queries */}
                     <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4">
                       <div className="flex items-center gap-2 mb-3 border-b border-[#30363D] pb-2">
                         <Clock className="w-4 h-4 text-[#7EE787]" />
                         <span className="text-xs font-bold text-[#E6EDF3] uppercase tracking-wider">Recent Queries</span>
                       </div>
                       {history.length === 0 ? (
                         <p className="text-xs text-[#8B949E] italic py-2">No recent searches.</p>
                       ) : (
                         <div className="max-h-48 overflow-y-auto divide-y divide-[#30363D] divide-opacity-50">
                           {history.map((histItem, idx) => (
                             <button
                               key={`mob-hist-${idx}`}
                               onClick={() => handleSearch(undefined, histItem, 'ifsc')}
                               className="w-full text-left py-2.5 font-mono text-sm text-[#8B949E] hover:text-[#C9D1D9] flex justify-between items-center"
                             >
                               <span>{histItem}</span>
                               <ChevronRight className="w-3.5 h-3.5 text-[#30363D]" />
                             </button>
                           ))}
                         </div>
                       )}
                     </div>
                   </div>
                </div>
              )}

             {loading && (
               <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-[#58A6FF] space-y-4">
                  <div className="animate-spin"><Clock className="w-10 h-10"/></div>
                  <p className="text-sm uppercase tracking-widest font-mono font-bold">Querying Directory...</p>
               </div>
             )}

             {error && !loading && (
               <div id="search-error-card" className="p-6 bg-[#211B1B] border border-red-500/20 border-l-4 border-l-red-500 rounded-xl max-w-2xl mx-auto shadow-lg mt-8 flex flex-col items-center text-center space-y-3">
                 <Shield className="w-8 h-8 mb-1 text-red-400" />
                 <h3 className="font-bold text-lg text-red-400 tracking-wide">Search Information / Error</h3>
                 <div className="text-[#E6EDF3] text-sm leading-relaxed">{error}</div>
                 <div className="text-xs text-[#8B949E] bg-[#161111] p-3.5 rounded border border-red-500/10 font-mono mt-2 w-full text-left">
                   <span className="text-amber-400 font-bold">💡 Search Hint:</span> In <strong>IFSC Search</strong> mode, please enter a valid 11-digit IFSC code (e.g., <span className="text-[#58A6FF] font-bold">SBIN0000813</span>). If you want to search by city, district, or bank name, please use our <strong>Master Search (AI)</strong> tab at the top or the cascading filters in the sidebar!
                 </div>
               </div>
             )}

                           {searchResults && !loading && searchMode !== 'master' && (
                <div className="max-w-6xl xl:max-w-7xl mx-auto animate-in fade-in duration-300">
                   <h2 className="text-xl font-bold mb-6 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Building className="w-6 h-6 text-[#58A6FF]"/>
                        <span>Found {searchResults.length} {searchResults.length === 1 ? 'Branch' : 'Branches'}</span>
                      </div>
                   </h2>

                   {/* Desktop Table View */}
                   <div className="hidden md:block bg-[#0D1117] border border-[#30363D] rounded-xl overflow-hidden shadow-lg">
                     <div className="overflow-x-auto">
                       <table className="w-full text-left text-sm whitespace-nowrap">
                         <thead className="bg-[#161B22] border-b border-[#30363D] text-[#8B949E] font-medium tracking-wide uppercase text-[11px]">
                           <tr>
                             <th className="px-5 py-4">Bank Name</th>
                             <th className="px-5 py-4">Branch</th>
                             <th className="px-5 py-4">IFSC</th>
                             <th className="px-5 py-4">MICR</th>
                             <th className="px-5 py-4">City / Village</th>
                             <th className="px-5 py-4 text-right">Action</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-[#30363D]">
                           {searchResults.map((res, i) => (
                             <tr key={res.IFSC + i} className="hover:bg-[#1F242C] transition-colors cursor-pointer" onClick={() => handleSearch(undefined, res.IFSC, 'ifsc')}>
                                <td className="px-5 py-4 font-bold text-[#E6EDF3] max-w-xs truncate"><div className="flex items-center gap-2"><Building className="w-4 h-4 text-[#8B949E]"/> {res.BANK}</div></td>
                                <td className="px-5 py-4 text-[#C9D1D9] max-w-xs truncate">{res.BRANCH}</td>
                                <td className="px-5 py-4"><span className="font-mono text-[#58A6FF] font-bold tracking-wider">{res.IFSC}</span></td>
                                <td className="px-5 py-4 font-mono text-[#8B949E]">{res.MICR}</td>
                                <td className="px-5 py-4 text-[#8B949E] max-w-xs truncate">{res.CITY}</td>
                                <td className="px-5 py-4 text-[#58A6FF] text-xs font-bold hover:underline cursor-pointer text-right">View Details →</td>
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
                         className="bg-[#161B22] border border-[#30363D] p-5 rounded-xl hover:border-[#58A6FF] active:bg-[#1F242C] transition-all cursor-pointer shadow-sm flex flex-col justify-between"
                         onClick={() => handleSearch(undefined, res.IFSC, 'ifsc')}
                       >
                         <div>
                           <div className="flex items-start justify-between gap-3 mb-2">
                             <div className="flex items-center gap-2">
                               <Building className="w-5 h-5 text-[#58A6FF] flex-shrink-0" />
                               <h3 className="font-bold text-white text-sm leading-snug break-words">{res.BANK}</h3>
                             </div>
                             <span className="text-[10px] font-bold px-2 py-1 rounded bg-[#21262D] text-[#7EE787] border border-[#30363D] font-mono whitespace-nowrap">{res.IFSC}</span>
                           </div>

                           <div className="space-y-2 text-xs text-[#8B949E] mt-4">
                             <div className="flex justify-between items-start gap-4 py-1.5 border-b border-[#30363D] border-opacity-30">
                               <span className="shrink-0 text-left">Branch:</span>
                               <span className="text-[#C9D1D9] font-medium text-right break-words">{res.BRANCH}</span>
                             </div>
                             <div className="flex justify-between items-start gap-4 py-1.5 border-b border-[#30363D] border-opacity-30">
                               <span className="shrink-0 text-left">City/Village:</span>
                               <span className="text-[#C9D1D9] font-medium text-right break-words">{res.CITY}</span>
                             </div>
                             <div className="flex justify-between items-start gap-4 py-1.5">
                               <span className="shrink-0 text-left">MICR Code:</span>
                               <span className="text-[#C9D1D9] font-mono text-right">{res.MICR || 'N/A'}</span>
                             </div>
                           </div>
                         </div>

                         <div className="text-[#58A6FF] text-xs font-bold mt-5 pt-3 border-t border-[#30363D] border-opacity-40 flex items-center justify-end gap-1">
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
                  <div className="p-6 bg-gradient-to-r from-[#161B22] to-[#0D1117] border border-[#30363D] rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500 bg-opacity-20 text-[#58A6FF] border border-blue-500 border-opacity-30">PARALLEL RUNTIME</span>
                        <span className="text-xs text-[#8B949E] font-mono">Status: Connected</span>
                      </div>
                      <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        <Globe className="w-5 h-5 text-[#58A6FF]" /> Master Search (AI Powered + Offline Database)
                      </h2>
                      <p className="text-xs text-[#8B949E] mt-1">
                        Scanning the complete local bank directory instantly and crawling live web sources parallelly.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    
                    {/* LEFT PANEL: Live Web & AI Grounded Finder */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-[#30363D] pb-3">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          <Activity className="w-5 h-5 text-[#7EE787] animate-pulse" />
                          <span>Live Web & AI Verified</span>
                        </h3>
                        {onlineLoading && (
                          <span className="text-[10px] font-bold text-[#7EE787] flex items-center gap-1.5 font-mono">
                            <span className="w-2 h-2 rounded-full bg-[#7EE787] animate-ping" />
                            SEARCHING WEB...
                          </span>
                        )}
                        {!onlineLoading && onlineResults && (
                          <span className="text-xs text-[#8B949E] font-mono">{onlineResults.length} matches found</span>
                        )}
                      </div>

                      {onlineLoading && (
                        <div className="p-8 bg-[#161B22] border border-[#30363D] border-dashed rounded-xl flex flex-col items-center justify-center text-center space-y-4">
                          <div className="w-10 h-10 border-2 border-[#58A6FF] border-t-transparent rounded-full animate-spin"></div>
                          <div>
                            <h4 className="font-bold text-[#E6EDF3] text-sm">Deep Web Verification in Progress</h4>
                            <p className="text-xs text-[#8B949E] mt-1 max-w-xs">Scanning real-time search engines to find recent contact lines, or newly opened branches...</p>
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
                        <div className="p-8 bg-[#161B22] border border-[#30363D] rounded-xl flex flex-col items-center justify-center text-center text-[#8B949E]">
                          <Globe className="w-10 h-10 mb-2 opacity-40 text-[#8B949E]" />
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
                              className="p-5 bg-[#161B22] border border-[#30363D] rounded-xl hover:border-[#7EE787] transition-all cursor-pointer shadow-md relative overflow-hidden group"
                            >
                              <div className="absolute top-0 right-0 py-1 px-3 bg-[#2EA043] bg-opacity-20 border-l border-b border-[#2EA043] rounded-bl text-[9px] font-bold tracking-widest text-[#7EE787] font-mono">
                                LIVE WEB VERIFIED
                              </div>
                              <h4 className="font-bold text-[#E6EDF3] text-sm leading-snug break-words pr-20 group-hover:text-[#7EE787] transition-colors">{res.BANK}</h4>
                              <p className="text-xs text-[#8B949E] font-medium mt-1 uppercase tracking-wide">{res.BRANCH}</p>
                              <p className="text-xs text-[#8B949E] mt-3 bg-[#0D1117] p-2.5 rounded border border-[#30363D] font-mono break-all line-clamp-2">
                                {res.ADDRESS}
                              </p>
                              
                              <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-[#30363D] border-opacity-50 text-xs font-mono">
                                <div>
                                  <span className="text-[#8B949E]">IFSC: </span>
                                  <span className="text-[#58A6FF] font-bold font-mono text-sm tracking-wider">{res.IFSC}</span>
                                </div>
                                <span className="text-[#58A6FF] hover:underline font-bold font-sans">View Details →</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Cited Sources section */}
                      {!onlineLoading && onlineSources.length > 0 && (
                        <div className="p-4 bg-[#0D1117] border border-[#30363D] rounded-xl mt-4 space-y-2">
                          <span className="font-bold text-xs text-[#8B949E] uppercase tracking-wider block">Web Citations:</span>
                          <div className="flex flex-wrap gap-2 text-xs">
                            {onlineSources.map((src, i) => (
                              <a 
                                key={`src-citation-${i}`}
                                href={src.uri} 
                                target="_blank" 
                                {...{ "res-link": "true" }}
                                rel="noopener noreferrer" 
                                className="px-2.5 py-1 bg-[#161B22] border border-[#30363D] hover:border-[#58A6FF] hover:text-white rounded text-[#58A6FF] no-underline transition-colors flex items-center gap-1 font-mono truncate max-w-[240px]"
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
                      <div className="flex items-center justify-between border-b border-[#30363D] pb-3">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          <Database className="w-5 h-5 text-[#58A6FF]" />
                          <span>Local Offline Directory Matches</span>
                        </h3>
                        {searchResults && (
                          <span className="text-xs text-[#8B949E] font-mono">{searchResults.length} matches found</span>
                        )}
                      </div>

                      {searchResults && searchResults.length === 0 && (
                        <div className="p-8 bg-[#161B22] border border-[#30363D] rounded-xl flex flex-col items-center justify-center text-center text-[#8B949E]">
                          <Database className="w-10 h-10 mb-2 opacity-40 text-[#8B949E]" />
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
                              className="p-5 bg-[#161B22] border border-[#30363D] rounded-xl hover:border-[#58A6FF] transition-all cursor-pointer shadow-md group relative overflow-hidden"
                            >
                              <div className="absolute top-0 right-0 py-1 px-3 bg-[#1f242c] border-l border-b border-[#30363D] rounded-bl text-[8px] font-bold tracking-widest text-[#8B949E] font-mono">
                                OFFLINE CSV ARCHIVE
                              </div>
                              <h4 className="font-bold text-[#E6EDF3] text-sm leading-snug break-words pr-20 group-hover:text-[#58A6FF] transition-colors">{res.BANK}</h4>
                              <p className="text-xs text-[#8B949E] font-medium mt-1 uppercase tracking-wide">{res.BRANCH}</p>
                              <p className="text-xs text-[#8B949E] mt-3 bg-[#0D1117] p-2.5 rounded border border-[#30363D] font-mono break-all line-clamp-2">
                                {res.ADDRESS}
                              </p>
                              <div className="flex justify-between items-center mt-3 text-xs text-[#8B949E] font-mono">
                                <span>City/Village: <strong className="text-[#C9D1D9] font-normal">{res.CITY}</strong></span>
                                <span>Pincode: <strong className="text-[#C9D1D9] font-mono font-normal">{res.PINCODE || 'N/A'}</strong></span>
                              </div>
                              
                              <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-[#30363D] border-opacity-50 text-xs font-mono">
                                <div>
                                  <span className="text-[#8B949E]">IFSC: </span>
                                  <span className="text-[#58A6FF] font-bold font-mono text-sm tracking-wider">{res.IFSC}</span>
                                </div>
                                <span className="text-[#58A6FF] hover:underline font-bold font-sans">View Details →</span>
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
                  <div className="flex items-center gap-2 text-[#8B949E] text-sm mb-6 flex-wrap">
                     <span className="font-medium hover:text-[#C9D1D9] cursor-pointer" onClick={() => {setSearchMode('location'); setSelState(result.STATE); setSelDistrict(''); setSelTaluka(''); setSelCity(''); setSelBank(''); setSelBranch('');}}>{result.STATE}</span>
                     <ChevronRight className="w-3 h-3 opacity-50"/>
                     <span className="font-medium hover:text-[#C9D1D9] cursor-pointer" onClick={() => {setSearchMode('location'); setSelState(result.STATE); setSelDistrict(result.DISTRICT); setSelTaluka(''); setSelCity(''); setSelBank(''); setSelBranch('');}}>{result.DISTRICT}</span>
                     <ChevronRight className="w-3 h-3 opacity-50"/>
                     <span className="font-medium hover:text-[#C9D1D9] cursor-pointer" onClick={() => {setSearchMode('location'); setSelState(result.STATE); setSelDistrict(result.DISTRICT); setSelTaluka(result.TALUKA || ''); setSelCity(''); setSelBank(''); setSelBranch('');}}>{result.TALUKA || 'GENERAL'}</span>
                     <ChevronRight className="w-3 h-3 opacity-50"/>
                     <span className="font-medium hover:text-[#C9D1D9] cursor-pointer" onClick={() => {setSearchMode('location'); setSelState(result.STATE); setSelDistrict(result.DISTRICT); setSelTaluka(result.TALUKA || ''); setSelCity(result.CITY); setSelBank(''); setSelBranch('');}}>{result.CITY}</span>
                     <ChevronRight className="w-3 h-3 opacity-50"/>
                     <span className="font-medium hover:text-[#C9D1D9] cursor-pointer" onClick={() => {setSearchMode('location'); setSelState(result.STATE); setSelDistrict(result.DISTRICT); setSelTaluka(result.TALUKA || ''); setSelCity(result.CITY); setSelBank(result.BANK); setSelBranch('');}}>{result.BANK}</span>
                     <ChevronRight className="w-3 h-3 opacity-50"/>
                     <span className="font-medium text-[#E6EDF3]">{result.BRANCH}</span>
                   </div>

                  <div className="border border-[#30363D] bg-[#0D1117] rounded-xl shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-[#58A6FF] to-[#2EA043]"></div>
                    <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-[#30363D] bg-[#161B22]">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Building className="text-[#58A6FF] w-7 h-7 flex-shrink-0" />
                          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight break-words">{result.BANK}</h1>
                        </div>
                        <h2 className="text-base md:text-lg text-[#8B949E] font-medium sm:ml-10 break-words">{result.BRANCH} Branch</h2>
                      </div>
                      <div className="flex flex-col gap-3 min-w-[200px]">
                         <div
                            onClick={() => copyToClipboard(result.IFSC)}
                            className="bg-[#21262D] hover:bg-[#30363D] rounded-lg p-3 text-center border border-[#30363D] hover:border-[#58A6FF] flex items-center justify-between cursor-pointer transition-all group/copy select-none"
                            title="Click to copy IFSC Code"
                         >
                            <span className="text-xs uppercase tracking-widest font-bold text-[#8B949E]">{copied ? 'Copied' : 'IFSC Code'}</span>
                            <div className="flex items-center gap-2">
                               <span className="font-mono text-[#7EE787] font-bold text-lg">{result.IFSC}</span>
                               {copied ? (
                                 <CheckCircle2 className="w-4 h-4 text-[#7EE787] animate-in zoom-in duration-200" />
                               ) : (
                                 <Copy className="w-4 h-4 text-[#8B949E] group-hover/copy:text-[#58A6FF] transition-colors" />
                               )}
                            </div>
                         </div>
                         <div className="flex items-center gap-2">
                            <button onClick={() => toggleFavorite(result.IFSC)} className={`flex-1 py-2 rounded-md font-bold text-sm flex items-center justify-center gap-2 border transition-colors ${favorites.includes(result.IFSC) ? 'bg-[#E3B341] bg-opacity-10 border-[#E3B341] text-[#E3B341]' : 'bg-[#010409] border-[#30363D] text-[#C9D1D9] hover:bg-[#1F242C]'}`}>
                              <Star className="w-4 h-4" fill={favorites.includes(result.IFSC) ? 'currentColor' : 'none'}/> {favorites.includes(result.IFSC) ? 'Saved' : 'Save'}
                            </button>
                            <button onClick={openMaps} className="flex-1 py-2 rounded-md font-bold text-sm bg-[#58A6FF] hover:bg-[#79b9ff] text-white border border-transparent shadow flex items-center justify-center gap-2 transition-colors">
                              <MapPin className="w-4 h-4"/> Map
                            </button>
                         </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#30363D]">
                       {/* Basic Info */}
                       <div className="p-6 space-y-6">
                          <div>
                            <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#8B949E] flex items-center gap-2 mb-3 border-b border-[#30363D] pb-2"><FileText className="w-4 h-4"/> Identification</h3>
                            <div className="space-y-4">
                              <div>
                                <span className="block text-[#8B949E] text-xs font-mono mb-1">MICR CODE</span>
                                <span className="font-mono text-[#E6EDF3] tracking-widest">{result.MICR || 'Not Available'}</span>
                              </div>
                              <div>
                                <span className="block text-[#8B949E] text-xs font-mono mb-1">SWIFT CODE</span>
                                <span className="font-mono text-[#E6EDF3] tracking-widest">{result.SWIFT || 'Not Available'}</span>
                              </div>
                              <div>
                                <span className="block text-[#8B949E] text-xs font-mono mb-1">BRANCH CODE</span>
                                <span className="font-mono text-[#E6EDF3] tracking-widest">{result.BRANCH_CODE || 'Not Available'}</span>
                              </div>
                            </div>
                          </div>
                       </div>

                       {/* Location Info */}
                       <div className="p-6 space-y-6 lg:col-span-1">
                          <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#8B949E] flex items-center gap-2 mb-3 border-b border-[#30363D] pb-2"><Map className="w-4 h-4"/> Full Address</h3>
                          <p className="text-[#C9D1D9] font-medium leading-relaxed bg-[#161B22] p-4 rounded-lg border border-[#30363D] shadow-sm">
                            {result.ADDRESS}
                          </p>
                          <div className="space-y-3">
                             <div className="flex items-center justify-between py-1 border-b border-[#30363D] border-opacity-50">
                               <span className="text-[#8B949E] text-xs font-bold">STATE</span>
                               <span className="font-semibold text-[#E6EDF3]">{result.STATE}</span>
                             </div>
                             <div className="flex items-center justify-between py-1 border-b border-[#30363D] border-opacity-50">
                               <span className="text-[#8B949E] text-xs font-bold">DISTRICT</span>
                               <span className="font-semibold text-[#E6EDF3]">{result.DISTRICT}</span>
                             </div>
                             <div className="flex items-center justify-between py-1 border-b border-[#30363D] border-opacity-50">
                               <span className="text-[#8B949E] text-xs font-bold">TALUKA / TAHSIL</span>
                               <span className="font-semibold text-[#E6EDF3]">{result.TALUKA || 'GENERAL'}</span>
                             </div>
                             <div className="flex items-center justify-between py-1 border-b border-[#30363D] border-opacity-50">
                               <span className="text-[#8B949E] text-xs font-bold">CITY / VILLAGE</span>
                               <span className="font-semibold text-[#E6EDF3]">{result.CITY}</span>
                             </div>
                          </div>

                          <div className="space-y-3 mt-6">
                            <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#8B949E] flex items-center gap-2 mb-3 border-b border-[#30363D] pb-2"><Phone className="w-4 h-4"/> Contact Details</h3>
                             <div className="flex items-center gap-3">
                               <div className="bg-[#21262D] p-2 rounded-md"><Phone className="w-4 h-4 text-[#8B949E]"/></div>
                               <span className="font-mono text-[#E6EDF3] font-bold">{result.CONTACT && result.CONTACT.toLowerCase() !== 'not provided' ? result.CONTACT : 'N/A'}</span>
                             </div>
                             <div className="flex items-center gap-3">
                               <div className="bg-[#21262D] p-2 rounded-md"><Mail className="w-4 h-4 text-[#8B949E]"/></div>
                               <span className="text-[#58A6FF]">{result.EMAIL || 'N/A'}</span>
                             </div>
                          </div>
                       </div>

                       {/* Amenities */}
                       <div className="p-6 bg-[#161B22]">
                          <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#8B949E] flex items-center gap-2 mb-4 border-b border-[#30363D] pb-2"><Activity className="w-4 h-4"/> Banking Facilities</h3>
                          <div className="grid grid-cols-2 gap-3 mb-6">
                             <RenderBooleanBadge label="NEFT" value={result.NEFT} />
                             <RenderBooleanBadge label="RTGS" value={result.RTGS} />
                             <RenderBooleanBadge label="IMPS" value={result.IMPS} />
                             <RenderBooleanBadge label="UPI" value={result.UPI} />
                          </div>
                          <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#8B949E] flex items-center gap-2 mb-4 border-b border-[#30363D] pb-2"><Shield className="w-4 h-4"/> Branch Amenities</h3>
                          <div className="grid grid-cols-2 gap-3">
                             <RenderBooleanBadge label="ATM Onsite" value={result.ATM} />
                             <RenderBooleanBadge label="Cash Deposit" value={result.CASH_DEPOSIT} />
                             <RenderBooleanBadge label="Lockers" value={result.LOCKER} pillTextColorClass="text-black font-semibold" />
                             <div className="p-3 rounded-lg border flex flex-col items-center justify-center gap-1.5 shadow-xs transition-colors duration-200 bg-[#0C1B2A] border-[#58A6FF] border-opacity-40 text-[#58A6FF]">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#58A6FF] opacity-90">Foreign Ex</span>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider bg-[#58A6FF] bg-opacity-20 border border-[#58A6FF] border-opacity-30 text-black font-semibold">CALL</span>
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
        <aside className="w-72 border-l border-[#30363D] bg-[#0D1117] flex flex-col overflow-hidden hidden xl:flex">
          <div className="p-4 border-b border-[#30363D] bg-[#161B22] flex items-center justify-between">
             <span className="text-xs font-bold text-[#E6EDF3] tracking-wide">Explore Related</span>
          </div>

          <div className="p-5 flex flex-col gap-6 overflow-y-auto">
            {/* Conditional Branch Info / Popular Searches */}
            {result ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-[11px] text-[#8B949E] uppercase tracking-wider font-bold mb-3 flex items-center gap-2"><Building className="w-3.5 h-3.5"/> Nearby Branches</h4>
                  <div className="space-y-3">
                     <div onClick={() => {setQueryInput(result.IFSC); handleSearch(undefined, result.IFSC, 'ifsc')}} className="bg-[#161B22] border border-[#30363D] p-3 rounded-lg cursor-pointer hover:border-[#58A6FF] transition-colors shadow-sm relative overflow-hidden group">
                       <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#58A6FF] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                       <div className="text-sm font-bold text-[#E6EDF3]">{result.CITY} Main Branch</div>
                       <div className="flex items-center gap-2 mt-1.5">
                         <MapPin className="w-3 h-3 text-[#58A6FF]" />
                         <span className="text-[11px] text-[#8B949E] font-mono">1.2 km away</span>
                       </div>
                     </div>
                     <div onClick={() => {setQueryInput(result.IFSC); handleSearch(undefined, result.IFSC, 'ifsc')}} className="bg-[#161B22] border border-[#30363D] p-3 rounded-lg cursor-pointer hover:border-[#58A6FF] transition-colors shadow-sm relative overflow-hidden group">
                       <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#58A6FF] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                       <div className="text-sm font-bold text-[#E6EDF3]">{result.CITY} East</div>
                       <div className="flex items-center gap-2 mt-1.5">
                         <MapPin className="w-3 h-3 text-[#58A6FF]" />
                         <span className="text-[11px] text-[#8B949E] font-mono">3.5 km away</span>
                       </div>
                     </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[11px] text-[#8B949E] uppercase tracking-wider font-bold mb-3 mt-6 flex items-center gap-2"><Map className="w-3.5 h-3.5"/> Other Banks Nearby</h4>
                  <div className="flex flex-wrap gap-2">
                     {popularBanks.filter(b => !result.BANK.includes(b)).slice(0,5).map(b => (
                       <span key={`near-${b}`} className="bg-[#1F242C] border border-[#30363D] px-3 py-1.5 rounded-full text-xs font-medium text-[#C9D1D9] hover:bg-[#30363D] hover:text-white cursor-pointer transition-colors shadow-sm">
                          {b}
                       </span>
                     ))}
                  </div>
                </div>
              </div>
            ) : (
               <div className="space-y-4">
                  <h4 className="text-[11px] text-[#8B949E] uppercase tracking-wider font-bold mb-3 flex items-center gap-2"><Activity className="w-4 h-4"/> Trending Searches</h4>
                  <ul className="space-y-2 font-sans text-sm">
                    <li className="flex items-center justify-between group cursor-pointer bg-[#161B22] border border-[#30363D] p-3 rounded-lg hover:border-[#58A6FF] transition-colors" onClick={() => handleSearch(undefined, 'SBI', 'bank')}>
                      <span className="text-[#C9D1D9] group-hover:text-white font-medium">SBI Maharashtra</span>
                      <ChevronRight className="w-4 h-4 text-[#8B949E] group-hover:text-[#58A6FF]" />
                    </li>
                    <li className="flex items-center justify-between group cursor-pointer bg-[#161B22] border border-[#30363D] p-3 rounded-lg hover:border-[#58A6FF] transition-colors" onClick={() => {setSearchMode('location'); setSelState('MAHARASHTRA'); setSelDistrict('MUMBAI'); setSelCity(''); setSelBank(''); setSelBranch('');}}>
                      <span className="text-[#C9D1D9] group-hover:text-white font-medium">Any Bank in Mumbai</span>
                      <ChevronRight className="w-4 h-4 text-[#8B949E] group-hover:text-[#58A6FF]" />
                    </li>
                    <li className="flex items-center justify-between group cursor-pointer bg-[#161B22] border border-[#30363D] p-3 rounded-lg hover:border-[#58A6FF] transition-colors" onClick={() => {setSearchMode('location'); setSelState('KARNATAKA'); setSelDistrict('BENGALURU URBAN'); setSelCity('BENGALURU'); setSelBank('STATE BANK OF INDIA'); setSelBranch('');}}>
                      <span className="text-[#C9D1D9] group-hover:text-white font-medium">SBI Bengaluru</span>
                      <ChevronRight className="w-4 h-4 text-[#8B949E] group-hover:text-[#58A6FF]" />
                    </li>
                    <li className="flex items-center justify-between group cursor-pointer bg-[#161B22] border border-[#30363D] p-3 rounded-lg hover:border-[#58A6FF] transition-colors" onClick={() => handleSearch(undefined, '414001', 'pincode')}>
                      <span className="text-[#C9D1D9] group-hover:text-white font-medium">Pincode 414001</span>
                      <ChevronRight className="w-4 h-4 text-[#8B949E] group-hover:text-[#58A6FF]" />
                    </li>
                  </ul>
               </div>
            )}

            {/* Related Tools Module */}
            <div className="space-y-4 mt-6 pt-6 border-t border-[#30363D]">
               <h4 className="text-[11px] text-[#8B949E] uppercase tracking-wider font-bold mb-3 flex items-center gap-2"><Box className="w-4 h-4"/> Financial Tools</h4>
               <div className="grid grid-cols-1 gap-3">
                 <div onClick={() => setActiveTool('micr')} className="flex items-center gap-4 p-3 rounded-lg bg-[#161B22] border border-[#30363D] hover:border-[#8B949E] cursor-pointer transition-colors group">
                   <div className="bg-[#0D1117] p-2 rounded-md border border-[#30363D] text-[#A5D6FF] group-hover:text-[#58A6FF] group-hover:border-[#58A6FF] transition-colors"><Database className="w-5 h-5"/></div>
                   <div className="flex-1">
                     <div className="text-sm font-bold text-[#E6EDF3] group-hover:text-white">MICR Locator</div>
                     <div className="text-xs text-[#8B949E]">Find check routing codes</div>
                   </div>
                 </div>
                 <div onClick={() => setActiveTool('swift')} className="flex items-center gap-4 p-3 rounded-lg bg-[#161B22] border border-[#30363D] hover:border-[#8B949E] cursor-pointer transition-colors group">
                   <div className="bg-[#0D1117] p-2 rounded-md border border-[#30363D] text-[#D2A8FF] group-hover:text-[#a371f7] group-hover:border-[#a371f7] transition-colors"><Globe className="w-5 h-5"/></div>
                   <div className="flex-1">
                     <div className="text-sm font-bold text-[#E6EDF3] group-hover:text-white">SWIFT Search</div>
                     <div className="text-xs text-[#8B949E]">International wire transfers</div>
                   </div>
                 </div>
                 <div onClick={() => setActiveTool('holidays')} className="flex items-center gap-4 p-3 rounded-lg bg-[#161B22] border border-[#30363D] hover:border-[#8B949E] cursor-pointer transition-colors group">
                   <div className="bg-[#0D1117] p-2 rounded-md border border-[#30363D] text-[#FF7B72] group-hover:text-[#fa4549] group-hover:border-[#fa4549] transition-colors"><Calendar className="w-5 h-5"/></div>
                   <div className="flex-1">
                     <div className="text-sm font-bold text-[#E6EDF3] group-hover:text-white">Bank Holidays</div>
                     <div className="text-xs text-[#8B949E]">Official RBI calendar 2026</div>
                   </div>
                 </div>
                 <div onClick={() => setActiveTool('emi')} className="flex items-center gap-4 p-3 rounded-lg bg-[#161B22] border border-[#30363D] hover:border-[#8B949E] cursor-pointer transition-colors group">
                   <div className="bg-[#0D1117] p-2 rounded-md border border-[#30363D] text-[#7EE787] group-hover:text-[#46c959] group-hover:border-[#46c959] transition-colors"><Calculator className="w-5 h-5"/></div>
                   <div className="flex-1">
                     <div className="text-sm font-bold text-[#E6EDF3] group-hover:text-white">EMI Calculator</div>
                     <div className="text-xs text-[#8B949E]">Home & Auto loans plan</div>
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
            className="fixed inset-0 bg-black bg-opacity-70 transition-opacity duration-200" 
            onClick={() => setShowMobileNav(false)}
          />
          {/* Content */}
          <div className="relative flex flex-col w-72 max-w-xs bg-[#0D1117] border-r border-[#30363D] h-full p-5 overflow-y-auto animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#30363D]">
              <span className="font-bold text-base text-[#E6EDF3]">Saved & Recents</span>
              <button 
                onClick={() => setShowMobileNav(false)}
                className="w-8 h-8 rounded-full bg-[#21262D] border border-[#30363D] flex items-center justify-center text-[#8B949E] hover:text-[#C9D1D9] text-lg font-bold"
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
