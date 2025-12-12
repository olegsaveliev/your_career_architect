import { GoogleGenAI } from "@google/genai";
import { ResumeData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateCoverLetter = async (resume: ResumeData, jobDescription: string): Promise<string> => {
  try {
    const prompt = `
      You are an expert career consultant for the IT industry. 
      Write a professional, compelling, and concise cover letter for the following candidate applying to a specific job.
      
      CANDIDATE PROFILE:
      Name: ${resume.fullName}
      Current Title: ${resume.title}
      Skills: ${resume.skills}
      Summary: ${resume.summary}
      Experience Highlights: ${resume.experience.map(e => e.title + ": " + e.content).join('; ')}

      JOB DESCRIPTION:
      ${jobDescription}

      TONE:
      Professional, confident, yet humble. High-end aesthetic similar to an architect or senior engineer.
      
      OUTPUT:
      Plain text, formatted with paragraphs. Do not include placeholders like [Your Name] or [Date], use the provided name and today's date.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 1024 } // Allow some reasoning for better matching
      }
    });

    return response.text || "Could not generate cover letter. Please try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating content. Please check your API key and try again.";
  }
};

export const improveResumeSummary = async (currentSummary: string, targetRole: string): Promise<string> => {
  try {
    const prompt = `
      Rewrite the following professional summary to be more impactful, using action verbs and quantifiable achievements where possible. 
      Target Role: ${targetRole}
      
      Current Summary:
      "${currentSummary}"
      
      Keep it under 60 words. Sophisticated tone.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });

    return response.text || currentSummary;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return currentSummary;
  }
};

export interface ResumeSuggestions {
  improvedSummary?: string;
  improvedExperience?: Array<{ id: string; title: string; content: string }>;
  improvedSkills?: string;
  reviewText: string;
}

export const reviewResume = async (resume: ResumeData): Promise<ResumeSuggestions> => {
  try {
    const prompt = `
      You are an expert career consultant and resume reviewer for the IT industry. 
      Review the following resume and provide constructive feedback and improvement suggestions.
      
      RESUME CONTENT:
      Name: ${resume.fullName}
      Title: ${resume.title}
      Skills: ${resume.skills}
      Summary: ${resume.summary}
      Experience:
      ${resume.experience.map(e => `- ${e.title}: ${e.content}`).join('\n')}
      
      Please provide:
      1. Overall assessment of the resume
      2. Strengths and what works well
      3. Areas for improvement
      4. Specific suggestions for:
         - Summary/Professional Profile
         - Experience descriptions
         - Skills presentation
         - Overall structure and flow
      5. Actionable recommendations
      
      Format your response in a clear, professional manner with sections and bullet points where appropriate.
      Be constructive and specific in your feedback.
      
      IMPORTANT: At the end of your response, provide a JSON object with improved versions:
      {
        "improvedSummary": "Improved professional summary text (if changes needed, otherwise use current)",
        "improvedExperience": [{"id": "exp-id", "title": "Improved title", "content": "Improved content"}, ...],
        "improvedSkills": "Improved skills list (if changes needed)"
      }
      
      Only include fields that need improvement. Use the exact same IDs for experience entries.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 1024 }
      }
    });

    const text = response.text || "Could not generate review. Please try again.";
    
    // Try to extract JSON from the end of the response
    const jsonMatch = text.match(/\{[\s\S]*"improvedSummary"[\s\S]*\}/);
    let suggestions: Partial<ResumeSuggestions> = {};
    
    if (jsonMatch) {
      try {
        suggestions = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.warn("Could not parse suggestions JSON", e);
      }
    }
    
    return {
      reviewText: text,
      improvedSummary: suggestions.improvedSummary,
      improvedExperience: suggestions.improvedExperience,
      improvedSkills: suggestions.improvedSkills
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      reviewText: "Error generating review. Please check your API key and try again."
    };
  }
};

export const generateResumeStyling = async (resume: ResumeData): Promise<{ backgroundColor: string; textColor: string; accentColor: string; fontStyle: string }> => {
  try {
    const prompt = `
      You are a professional resume designer specializing in elegant, professional CV styling. Generate a smooth, light, professional color scheme for a resume.
      
      RESUME CONTENT:
      Name: ${resume.fullName}
      Title: ${resume.title}
      Skills: ${resume.skills}
      Summary: ${resume.summary}
      
      REQUIREMENTS:
      - Background must be a smooth, light, professional color (e.g., #f8f9fa, #fafbfc, #f5f7fa, #f0f4f8, #fefefe, #f9fafb, #f7f8fa)
      - Text color should be dark but not harsh (e.g., #1a1a1a, #2d3748, #1e293b, #334155)
      - Accent color should be professional and complement the background (e.g., #4a5568, #64748b, #475569, #334155, #2c5282)
      - Keep all colors professional, smooth, and light - avoid bright or saturated colors
      - The overall aesthetic should be clean, modern, and executive-level professional
      
      Generate a JSON object with the following structure:
      {
        "backgroundColor": "CSS color value - must be a smooth light professional color",
        "textColor": "CSS color value - dark professional text color",
        "accentColor": "CSS color value - professional accent/border color",
        "fontStyle": "professional font style (e.g., 'modern minimalist', 'classic professional', 'executive clean')"
      }
      
      Return ONLY valid JSON, no additional text or markdown. Ensure the backgroundColor is always a light, smooth professional color.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });

    const text = response.text || '{}';
    // Clean up the response to extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const styling = JSON.parse(jsonMatch[0]);
      // Validate and ensure background is light professional color
      const bgColor = styling.backgroundColor || '#f8f9fa';
      const textColor = styling.textColor || '#1e293b';
      const accentColor = styling.accentColor || '#475569';
      
      return {
        backgroundColor: bgColor,
        textColor: textColor,
        accentColor: accentColor,
        fontStyle: styling.fontStyle || 'modern minimalist'
      };
    }
    
    // Fallback - light professional colors
    return {
      backgroundColor: '#f8f9fa',
      textColor: '#1e293b',
      accentColor: '#475569',
      fontStyle: 'modern minimalist'
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      backgroundColor: '#f8f9fa',
      textColor: '#1e293b',
      accentColor: '#475569',
      fontStyle: 'modern minimalist'
    };
  }
};