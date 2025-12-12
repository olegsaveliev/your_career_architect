import React, { useState } from 'react';

export const SavedJobs: React.FC = () => {
  const [filter, setFilter] = useState('');

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
          <h2 className="text-5xl mb-2">
            <span className="font-serif italic text-ink">Saved</span>{' '}
            <span className="font-hand font-bold text-purple-900">Jobs</span>
          </h2>
          <p className="text-sm font-hand text-pencil mt-2">Your saved job applications</p>
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
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
          {/* Empty State */}
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
             <div className="w-32 h-32 border-4 border-dashed border-gray-300 rounded-full flex items-center justify-center mb-6">
                <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
             </div>
             <h3 className="font-hand text-3xl text-gray-400 mb-2">No saved jobs yet.</h3>
             <p className="font-sans text-gray-400">Save jobs from the Job Board to see them here</p>
          </div>
      </div>
    </div>
  );
};


