import React, { useState } from 'react';
import { Job } from '../types';

interface JobsBoardProps {
  onApply: (job: Job) => void;
}

export const JobsBoard: React.FC<JobsBoardProps> = ({ onApply }) => {
  const [filter, setFilter] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugLog, setDebugLog] = useState<string[]>([]);

  const fetchJobs = async () => {
    setLoading(true);
    setError('');
    setDebugLog([]);
    setJobs([]);

    // Direct DOU URL as requested
    const targetUrl = "https://jobs.dou.ua/vacancies/?category=Project%20Manager&exp=5plus";
    
    // Switch to AllOrigins proxy to avoid 403 Forbidden from direct CORS proxies
    // AllOrigins wraps content in JSON which often bypasses basic WAF blocks
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;

    try {
        setDebugLog(prev => [...prev, `Target: ${targetUrl}`]);
        setDebugLog(prev => [...prev, "Fetching via AllOrigins proxy..."]);

        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
            throw new Error(`Proxy HTTP Error: ${response.status}`);
        }

        const data = await response.json();

        // Check the status code reported by AllOrigins for the target site
        if (data.status?.http_code && data.status.http_code >= 400) {
             throw new Error(`Target site returned ${data.status.http_code} Forbidden/Error`);
        }

        const htmlText = data.contents;
        
        if (!htmlText) {
             throw new Error("Received empty content from proxy.");
        }

        setDebugLog(prev => [...prev, `Received ${htmlText.length} bytes. Parsing DOM...`]);

        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');
        
        // DOU Structure: list of li.l-vacancy
        const vacancyItems = doc.querySelectorAll('.l-vacancy');
        
        if (vacancyItems.length === 0) {
             // Fallback check: sometimes structure is different or blocked
             if (htmlText.includes("reCAPTCHA") || htmlText.includes("security check")) {
                 throw new Error("Access blocked by DOU security (CAPTCHA/WAF).");
             }
             setDebugLog(prev => [...prev, "No vacancy elements found. HTML structure might have changed."]);
        }

        const parsedJobs: Job[] = [];

        vacancyItems.forEach((el, index) => {
             // Title & Link
             const titleLink = el.querySelector('.title .vt') as HTMLAnchorElement;
             if (!titleLink) return;

             const title = titleLink.textContent?.trim() || 'Untitled Role';
             let link = titleLink.getAttribute('href') || '';
             if (link && !link.startsWith('http')) {
                 link = `https://jobs.dou.ua${link}`;
             }

             // Company
             const companyEl = el.querySelector('.company');
             // Company often has text like " — CompanyName" inside specific structure, but textContent usually works
             // Sometimes company name is in an anchor tag inside .company
             let company = companyEl?.textContent?.trim() || 'Unknown Company';
             // Clean up "—" prefix if present (DOU often formats it "Job Title — Company") in some views, or just inside the div
             company = company.replace(/^—\s*/, '');

             // Description
             const descEl = el.querySelector('.sh-info');
             const description = descEl?.textContent?.trim() || '';

             // Location
             const citiesEl = el.querySelector('.cities');
             const location = citiesEl?.textContent?.trim() || 'Ukraine';

             // Salary
             const salaryEl = el.querySelector('.salary');
             const salary = salaryEl?.textContent?.trim() || 'Open';

             // Determine type
             let type = 'Office';
             const lowerLoc = location.toLowerCase();
             const lowerDesc = description.toLowerCase();
             if (lowerLoc.includes('remote') || lowerLoc.includes('віддалено') || lowerDesc.includes('remote')) {
                 type = 'Remote';
             } else if (lowerLoc.includes('hybrid') || lowerDesc.includes('hybrid')) {
                 type = 'Hybrid';
             }

             parsedJobs.push({
                 id: link || `job-${index}`,
                 title,
                 company,
                 location,
                 salary,
                 type,
                 description,
                 tags: [], // Hard to extract cleanly from list view
                 link,
                 pubDate: new Date() // No easy way to parse relative dates like "2 hours ago" without library
             });
        });

        setDebugLog(prev => [...prev, `Parsed ${parsedJobs.length} jobs.`]);

        if (parsedJobs.length > 0) {
            setJobs(parsedJobs);
        } else {
            setError("No jobs found. The scraper might need updating or the category is empty.");
        }

    } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to fetch jobs");
        setDebugLog(prev => [...prev, `Error: ${err.message}`]);
    } finally {
        setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(filter.toLowerCase()) || 
    job.company.toLowerCase().includes(filter.toLowerCase())
  );

  const getStickyColor = (index: number) => {
      const colors = ['bg-[#fef9c3]', 'bg-[#dbeafe]', 'bg-[#fee2e2]', 'bg-[#dcfce7]', 'bg-[#f3e8ff]']; 
      return colors[index % colors.length];
  }
  
  const getRotation = (index: number) => {
      const rots = ['rotate-1', '-rotate-2', 'rotate-2', '-rotate-1', 'rotate-0'];
      return rots[index % rots.length];
  }

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in pb-20">
      {/* Header Section */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-ink pb-6">
        <div>
          <h2 className="font-serif text-5xl text-ink mb-2 italic">Ukraine PM <br/><span className="font-hand not-italic text-4xl text-gray-600">Sticky Board</span></h2>
          <p className="text-sm font-hand text-pencil mt-2">DOU Scraper • Project Management</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-end w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative w-full md:w-64">
                <input 
                    type="text" 
                    placeholder="Filter notes..." 
                    className="w-full pl-0 pr-8 py-2 bg-transparent border-b-2 border-gray-400 focus:border-ink outline-none text-xl font-hand text-ink transition-colors placeholder-gray-400"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
                <svg className="w-5 h-5 text-ink absolute right-0 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>

            {/* FETCH BUTTON */}
            <button 
                onClick={fetchJobs}
                disabled={loading}
                className={`
                    group relative px-6 py-2 font-serif font-bold text-lg tracking-widest uppercase transition-all duration-200
                    border-4 border-ink text-ink hover:bg-ink hover:text-white disabled:opacity-50 disabled:cursor-not-allowed
                    shadow-[4px_4px_0px_0px_rgba(26,26,26,0.3)] hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,0.3)] hover:translate-x-[2px] hover:translate-y-[2px]
                    active:shadow-none active:translate-x-[4px] active:translate-y-[4px]
                `}
            >
                {loading ? (
                    <span className="flex items-center gap-2">
                         <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                         </svg>
                         Scraping DOU...
                    </span>
                ) : (
                    "SCRAPE DOU JOBS"
                )}
            </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
          
          {/* Debug/Loading Info */}
          {loading && (
             <div className="flex flex-col items-center justify-center py-10">
                 <div className="w-full max-w-md text-xs font-mono bg-gray-50 p-2 border border-gray-200 text-gray-500 rounded shadow-sm">
                    {debugLog.map((log, i) => <div key={i}>{log}</div>)}
                 </div>
             </div>
          )}

          {/* Error State */}
          {error && (
             <div className="flex flex-col items-center justify-center py-10">
                <div className="text-center bg-red-50 border-2 border-red-100 p-6 rounded-lg max-w-lg transform rotate-1 shadow-sketch">
                    <p className="font-hand text-2xl text-red-500 mb-2 font-bold">Connection Failed</p>
                    <p className="font-sans text-gray-600 mb-4">{error}</p>
                    <div className="text-xs font-mono text-left bg-white p-2 border border-gray-200 max-h-32 overflow-y-auto mb-4">
                        {debugLog.map((log, i) => <div key={i}>&gt; {log}</div>)}
                    </div>
                    <button onClick={fetchJobs} className="underline text-red-500 font-bold hover:text-red-700">Try Again</button>
                </div>
             </div>
          )}

          {/* Data State */}
          {!loading && jobs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 p-4">
              {filteredJobs.map((job, idx) => (
                <div 
                    key={job.id} 
                    className={`group p-6 transition-transform duration-300 relative flex flex-col justify-between h-[340px] shadow-lg hover:z-20 hover:scale-105 hover:shadow-2xl ${getStickyColor(idx)} ${getRotation(idx)}`}
                >
                  {/* Tape Effect */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-8 bg-white/40 rotate-1 backdrop-blur-sm shadow-sm border border-white/40"></div>

                  <div className="font-hand text-ink flex-1 overflow-hidden mt-2">
                    <div className="flex justify-between items-start mb-2 opacity-60 border-b border-black/5 pb-1">
                        <span className="text-sm font-bold uppercase tracking-wider">{job.type}</span>
                        <span className="text-sm">{job.salary !== 'Open' ? job.salary : ''}</span>
                    </div>
                    
                    <h3 className="text-2xl font-bold leading-none mb-1 line-clamp-2 mt-2">
                       <a href={job.link} target="_blank" rel="noreferrer" className="hover:underline decoration-2 underline-offset-2">{job.title}</a>
                    </h3>
                    <p className="text-lg font-bold text-gray-600 mb-4">{job.company}</p>
                    
                    <p className="text-lg leading-snug line-clamp-4 text-gray-800 opacity-90">
                        {job.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t-2 border-dashed border-black/10 flex items-center justify-between font-hand">
                     <span className="text-base text-gray-600 truncate max-w-[50%]">{job.location}</span>
                     <button 
                      onClick={() => onApply(job)}
                      className="px-5 py-1 border-2 border-ink rounded-full bg-white hover:bg-ink hover:text-white transition-colors text-lg font-bold shadow-sm"
                     >
                       Details
                     </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Empty State (Initial) */}
          {!loading && !error && jobs.length === 0 && (
             <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                 <div className="w-32 h-32 border-4 border-dashed border-gray-300 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                 </div>
                 <h3 className="font-hand text-3xl text-gray-400 mb-2">Ready to scrape.</h3>
                 <p className="font-sans text-gray-400">Hit "Scrape DOU Jobs" to load from DOU.ua</p>
             </div>
          )}
      </div>
    </div>
  );
};