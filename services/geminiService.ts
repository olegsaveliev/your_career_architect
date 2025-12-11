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