import React, { useState } from 'react';
import { ResumeData } from '../types';
import { generateCoverLetter } from '../services/geminiService';

interface CoverLetterProps {
  resumeData: ResumeData;
}

export const CoverLetter: React.FC<CoverLetterProps> = ({ resumeData }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [jobDescInput, setJobDescInput] = useState('');
  const [coverLetterOutput, setCoverLetterOutput] = useState('');

  const handleGenerate = async () => {
    if (!jobDescInput.trim()) return;
    
    setIsGenerating(true);
    setCoverLetterOutput('');
    
    try {
      const result = await generateCoverLetter(resumeData, jobDescInput);
      setCoverLetterOutput(result);
    } catch (error) {
      setCoverLetterOutput('Error generating cover letter. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in pb-20">
      {/* Header Section */}
      <div className="mb-12 border-b-2 border-ink pb-6 flex items-end justify-between">
        <div>
          <h2 className="font-serif text-5xl text-ink mb-2 italic">
            Cover <span className="font-hand not-italic text-purple-900">Letter</span>
          </h2>
          <p className="text-sm font-hand text-pencil mt-2">Powered by Gemini 3 Pro</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - Input */}
        <div className="space-y-6">
          <div className="bg-white border-2 border-ink shadow-sketch p-6 relative">
            <div className="absolute -top-3 left-6 bg-purple-100 px-3 border border-purple-200 text-purple-900 text-xs font-bold uppercase tracking-wider">
              Job Description
            </div>
            <textarea 
              className="w-full h-64 p-4 bg-transparent border-2 border-gray-200 focus:border-purple-900 outline-none transition-colors resize-none font-hand text-lg leading-relaxed"
              placeholder="Paste the job description here..."
              value={jobDescInput}
              onChange={(e) => setJobDescInput(e.target.value)}
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !jobDescInput.trim()}
            className="w-full py-4 bg-purple-900 text-white font-hand text-xl font-bold hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sketch active:shadow-none active:translate-x-[3px] active:translate-y-[3px] border-2 border-purple-900 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Generating...</span>
              </>
            ) : (
              <span>Generate Cover Letter</span>
            )}
          </button>

          {/* Resume Preview Card */}
          <div className="bg-white border-2 border-gray-200 shadow-sm p-6">
            <h3 className="font-serif text-xl italic text-ink mb-4 border-b border-gray-200 pb-2">
              Using Resume Data
            </h3>
            <div className="space-y-2 text-sm font-sans text-gray-600">
              <p><span className="font-bold text-ink">Name:</span> {resumeData.fullName}</p>
              <p><span className="font-bold text-ink">Title:</span> {resumeData.title}</p>
              <p><span className="font-bold text-ink">Skills:</span> {resumeData.skills}</p>
            </div>
          </div>
        </div>

        {/* Right Panel - Output */}
        <div className="bg-white border-2 border-ink shadow-sketch p-8 relative min-h-[500px]">
          <div className="absolute -top-3 left-6 bg-paper px-3 border border-gray-300 text-ink text-xs font-bold uppercase tracking-wider">
            Generated Cover Letter
          </div>
          
          {coverLetterOutput ? (
            <div className="prose prose-sm max-w-none text-ink font-serif whitespace-pre-wrap leading-7 text-base mt-4">
              {coverLetterOutput}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-300 text-center min-h-[400px]">
              <svg className="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <p className="font-hand text-xl">Your cover letter will appear here</p>
              <p className="font-sans text-sm text-gray-400 mt-2">Paste a job description and click Generate</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

