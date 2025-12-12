import React, { useState } from 'react';
import { ResumeData } from '../types';

interface ResumeBuilderProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
}

export const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ resumeData, setResumeData }) => {
  const [activePanel, setActivePanel] = useState<'edit' | 'preview'>('edit');

  const handleChange = (field: keyof ResumeData, value: string) => {
    setResumeData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden bg-paper/50 backdrop-blur-sm">
      {/* Editor Panel - "The Sketchbook" */}
      <div className="w-full md:w-1/2 p-8 overflow-y-auto border-r-2 border-dashed border-gray-300 transition-all duration-500">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-hand text-3xl font-bold text-ink flex items-center gap-2">
            <span className="text-2xl">✏️</span> Draft Details
          </h2>
          <div className="flex space-x-2">
            <button 
              onClick={() => setActivePanel('edit')}
              className={`px-4 py-1 text-sm font-hand font-bold border-2 transition-all ${activePanel === 'edit' ? 'bg-ink text-white border-ink shadow-sketch' : 'border-gray-300 text-gray-500 hover:border-ink'}`}
            >
              Write
            </button>
            <button 
              onClick={() => setActivePanel('preview')}
              className={`px-4 py-1 text-sm font-hand font-bold border-2 transition-all ${activePanel === 'preview' ? 'bg-ink text-white border-ink shadow-sketch' : 'border-gray-300 text-gray-500 hover:border-ink'}`}
            >
              View
            </button>
          </div>
        </div>

        <div className="space-y-8 font-hand text-lg">
          <div className="relative group">
            <label className="block text-sm font-sans text-gray-400 mb-1 uppercase tracking-wider">Full Name</label>
            <input 
              className="w-full bg-transparent border-b-2 border-gray-300 py-2 text-2xl text-ink focus:border-ink outline-none transition-colors placeholder-gray-300"
              placeholder="Your Name"
              value={resumeData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
            />
            <div className="absolute bottom-0 left-0 h-0.5 bg-ink w-0 group-focus-within:w-full transition-all duration-300"></div>
          </div>
          
          <div className="relative group">
            <label className="block text-sm font-sans text-gray-400 mb-1 uppercase tracking-wider">Title</label>
            <input 
              className="w-full bg-transparent border-b-2 border-gray-300 py-2 text-xl text-ink focus:border-ink outline-none transition-colors"
              placeholder="e.g. Architect"
              value={resumeData.title}
              onChange={(e) => handleChange('title', e.target.value)}
            />
             <div className="absolute bottom-0 left-0 h-0.5 bg-ink w-0 group-focus-within:w-full transition-all duration-300"></div>
          </div>

          <div className="relative group">
            <label className="block text-sm font-sans text-gray-400 mb-1 uppercase tracking-wider">Skills</label>
            <input 
              className="w-full bg-transparent border-b-2 border-gray-300 py-2 text-ink focus:border-ink outline-none transition-colors"
              placeholder="List your tools..."
              value={resumeData.skills}
              onChange={(e) => handleChange('skills', e.target.value)}
            />
             <div className="absolute bottom-0 left-0 h-0.5 bg-ink w-0 group-focus-within:w-full transition-all duration-300"></div>
          </div>

          <div>
            <label className="block text-sm font-sans text-gray-400 mb-1 uppercase tracking-wider">Summary</label>
            <div className="relative">
              {/* Ruled paper background effect */}
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'repeating-linear-gradient(transparent, transparent 31px, #e5e7eb 32px)' }}></div>
              <textarea 
                className="w-full bg-transparent py-1 leading-8 text-ink focus:outline-none min-h-[160px] resize-none -mt-1"
                style={{ lineHeight: '32px' }}
                value={resumeData.summary}
                onChange={(e) => handleChange('summary', e.target.value)}
              />
            </div>
          </div>
          
          <div className="pt-8 border-t-2 border-dashed border-gray-300">
             <label className="block text-sm font-sans text-gray-400 mb-6 uppercase tracking-wider">Experience</label>
             {resumeData.experience.map((exp, idx) => (
               <div key={exp.id} className="mb-8 pl-4 border-l-4 border-gray-200 hover:border-ink transition-colors group">
                 <input 
                    className="w-full bg-transparent text-xl font-bold text-ink mb-2 outline-none border-b border-transparent focus:border-gray-300"
                    value={exp.title}
                    onChange={(e) => {
                      const newExp = [...resumeData.experience];
                      newExp[idx].title = e.target.value;
                      setResumeData({...resumeData, experience: newExp});
                    }}
                 />
                 <textarea 
                    className="w-full bg-transparent text-gray-600 outline-none resize-none h-24 leading-relaxed font-sans text-sm"
                    value={exp.content}
                    onChange={(e) => {
                      const newExp = [...resumeData.experience];
                      newExp[idx].content = e.target.value;
                      setResumeData({...resumeData, experience: newExp});
                    }}
                 />
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Preview Panel - "The Final Print" */}
      <div className="w-full md:w-1/2 bg-white relative transition-all duration-500 flex flex-col shadow-[-10px_0_20px_-5px_rgba(0,0,0,0.1)]">
        
        {/* Paper texture overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>

        {activePanel === 'preview' && (
          <div className="p-16 h-full overflow-y-auto relative z-10 bg-white" id="resume-preview">
            {/* Minimalist Architect Style Resume */}
            <div className="border-b-2 border-black pb-8 mb-12 flex justify-between items-end">
              <div>
                <h1 className="font-serif text-6xl text-ink tracking-tight mb-2">{resumeData.fullName}</h1>
                <p className="text-xl font-sans text-gray-500 uppercase tracking-[0.2em]">{resumeData.title}</p>
              </div>
              <div className="w-16 h-16 border-2 border-black rounded-full flex items-center justify-center overflow-hidden">
                 {resumeData.profilePicture ? (
                     <img src={resumeData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                 ) : (
                     <span className="font-serif italic text-2xl">AK</span>
                 )}
              </div>
            </div>

            <div className="grid grid-cols-12 gap-12">
               <div className="col-span-4 border-r border-gray-100 pr-8">
                  <div className="mb-10">
                    <h4 className="font-serif text-xl border-b border-black mb-4 pb-2 italic">Skills & Tools</h4>
                    <div className="flex flex-col gap-2">
                      {resumeData.skills.split(',').map((skill, i) => (
                        <span key={i} className="text-sm font-sans text-gray-600">• {skill.trim()}</span>
                      ))}
                    </div>
                  </div>
               </div>

               <div className="col-span-8">
                  <div className="mb-12">
                    <h4 className="font-serif text-xl border-b border-black mb-4 pb-2 italic">Professional Profile</h4>
                    <p className="text-base leading-loose text-gray-800 font-serif">
                      {resumeData.summary}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-serif text-xl border-b border-black mb-8 pb-2 italic">Experience</h4>
                    {resumeData.experience.map(exp => (
                      <div key={exp.id} className="mb-8 relative pl-6 border-l border-gray-300">
                         <div className="absolute -left-1.5 top-1.5 w-3 h-3 bg-white border border-gray-400 rounded-full"></div>
                        <h5 className="font-bold text-ink text-lg mb-2 font-sans">{exp.title}</h5>
                        <p className="text-sm text-gray-600 leading-relaxed font-sans">
                          {exp.content}
                        </p>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        )}

        {activePanel === 'edit' && (
          <div className="h-full flex flex-col items-center justify-center text-gray-300 text-center p-16">
            <svg className="w-24 h-24 mb-6 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <p className="font-hand text-2xl mb-2">Edit your resume on the left</p>
            <p className="font-sans text-sm text-gray-400">Click "View" to see the preview</p>
          </div>
        )}
      </div>
    </div>
  );
};
