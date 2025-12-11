import React, { useState, useEffect } from 'react';
import { Job } from '../types';

interface JobsBoardProps {
  onApply: (job: Job) => void;
}

export const JobsBoard: React.FC<JobsBoardProps> = ({ onApply }) => {
  const [filter, setFilter] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const feedUrl = 'https://jobs.dou.ua/vacancies/feeds/?category=Project%20Manager';
        
        // List of proxies to try in order
        const proxyUrls = [
          `https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`,
          `https://corsproxy.io/?${encodeURIComponent(feedUrl)}`,
          `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(feedUrl)}`
        ];

        let response: Response | null = null;
        let fetchError: any = null;

        // Try proxies sequentially until one works
        for (const url of proxyUrls) {
          try {
            const res = await fetch(url);
            if (res.ok) {
              response = res;
              break;
            }
          } catch (e) {
            console.warn(`Proxy failed: ${url}`, e);
            fetchError = e;
          }
        }

        if (!response) {
          throw fetchError || new Error('All proxies failed to fetch the jobs feed.');
        }
        
        const text = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'text/xml');
        const items = Array.from(xml.querySelectorAll('item'));

        if (items.length === 0) {
            // Check if parsing failed
            const parseError = xml.querySelector('parsererror');
            if (parseError) {
                throw new Error('Failed to parse XML feed');
            }
        }

        const parsedJobs: Job[] = items.map((item, index) => {
          const titleRaw = item.querySelector('title')?.textContent || 'Untitled';
          const link = item.querySelector('link')?.textContent || '';
          const descriptionRaw = item.querySelector('description')?.textContent || '';
          const pubDateRaw = item.querySelector('pubDate')?.textContent || '';
          
          // DOU titles are typically "Role at Company" or "Role в Company"
          // We try to split to get company name
          let title = titleRaw;
          let company = 'Unknown Company';
          
          const separatorRegex = / (?:at|@|в|у|in) /i;
          const match = titleRaw.split(separatorRegex);
          if (match.length > 1) {
            title = match[0];
            company = match[match.length - 1]; // Take the last part as company
          }

          // Clean up HTML from description
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = descriptionRaw;
          const plainDescription = tempDiv.textContent || '';
          const shortDesc = plainDescription.length > 150 ? plainDescription.substring(0, 150) + '...' : plainDescription;

          // Extract tags from categories
          const categories = Array.from(item.querySelectorAll('category'))
            .map(c => c.textContent || '')
            .filter(tag => tag && tag !== 'Project Manager'); // Remove redundant tag if possible

          // Try to infer location/type from title or description
          let type = 'Office';
          const lowerText = (titleRaw + plainDescription).toLowerCase();
          if (lowerText.includes('remote') || lowerText.includes('віддалено')) type = 'Remote';
          else if (lowerText.includes('hybrid')) type = 'Hybrid';

          let location = 'Ukraine';
          if (lowerText.includes('kyiv') || lowerText.includes('київ')) location = 'Kyiv';
          else if (lowerText.includes('lviv') || lowerText.includes('львів')) location = 'Lviv';
          else if (lowerText.includes('kharkiv') || lowerText.includes('харків')) location = 'Kharkiv';
          else if (type === 'Remote') location = 'Remote';

          return {
            id: link || `dou-${index}`,
            title: title.trim(),
            company: company.trim(),
            location: location,
            salary: 'See details', // kept for type compatibility but not used in display
            type: type,
            tags: categories.length > 0 ? categories : ['IT', 'Project Manager'],
            description: shortDesc,
            link: link,
            pubDate: new Date(pubDateRaw)
          };
        });

        // Sort by date descending
        parsedJobs.sort((a, b) => {
          const dateA = a.pubDate ? a.pubDate.getTime() : 0;
          const dateB = b.pubDate ? b.pubDate.getTime() : 0;
          return dateB - dateA;
        });

        setJobs(parsedJobs);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Could not load vacancies. Please try again later.');
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(filter.toLowerCase()) || 
    job.company.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in pb-20">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-ink pb-6">
        <div>
          <h2 className="font-serif text-5xl text-ink mb-2 italic">Ukraine PM <br/><span className="font-hand not-italic text-4xl text-gray-600">Opportunities</span></h2>
          <p className="text-sm font-hand text-pencil mt-2">Source: jobs.dou.ua • Project Manager</p>
        </div>
        <div className="relative w-full md:w-80">
           <input 
            type="text" 
            placeholder="Search roles..." 
            className="w-full pl-0 pr-4 py-2 bg-transparent border-b-2 border-gray-400 focus:border-ink outline-none text-2xl font-hand text-ink transition-colors placeholder-gray-400"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
           />
           <svg className="w-6 h-6 text-ink absolute right-0 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-ink rounded-full animate-spin mb-4"></div>
          <p className="font-hand text-xl text-gray-500">Sketching out the job board...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-20">
          <p className="font-hand text-xl text-red-500 mb-2">{error}</p>
          <button onClick={() => window.location.reload()} className="underline text-ink font-bold">Try Refreshing</button>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredJobs.map((job) => (
            <div key={job.id} className="group bg-white border-2 border-ink p-6 hover:shadow-sketch-hover transition-all duration-300 relative flex flex-col justify-between h-full shadow-sketch transform hover:-translate-y-1">
              {/* Tape effect */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-yellow-100/50 opacity-60 rotate-1 border border-white shadow-sm backdrop-blur-sm z-10"></div>
              
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="inline-block px-3 py-1 border border-ink font-hand font-bold text-xs uppercase tracking-wider bg-gray-50">
                    {job.type}
                  </span>
                  <span className="font-serif italic text-lg font-bold text-gray-600">
                    {job.pubDate ? job.pubDate.toLocaleDateString() : 'Recently'}
                  </span>
                </div>

                <h3 className="font-serif text-3xl text-ink leading-tight mb-2 group-hover:underline decoration-2 underline-offset-4 line-clamp-2">
                  <a href={job.link} target="_blank" rel="noopener noreferrer">{job.title}</a>
                </h3>
                
                <div className="flex items-center space-x-2 mb-6 border-b border-dashed border-gray-300 pb-4">
                  <span className="font-bold text-sm tracking-wide uppercase font-sans truncate max-w-[50%]">{job.company}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500 text-sm font-hand text-lg">{job.location}</span>
                </div>

                <p className="text-gray-600 font-sans font-light leading-relaxed mb-6 text-sm">
                  {job.description}
                </p>
              </div>

              <div className="flex items-end justify-between mt-auto">
                <div className="flex flex-wrap gap-2 max-w-[60%]">
                  {job.tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="text-xs text-gray-500 font-hand border-b border-gray-300 truncate">#{tag}</span>
                  ))}
                </div>
                <button 
                  onClick={() => onApply(job)}
                  className="px-6 py-2 bg-ink text-white font-hand font-bold text-lg border-2 border-ink hover:bg-white hover:text-ink transition-colors shadow-sm whitespace-nowrap"
                >
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};