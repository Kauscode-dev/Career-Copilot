import { GoogleGenAI, Schema } from "@google/genai";
import { CareerPixelResponse } from "../types";

// Note: In a real production app, ensure strict type safety for the schema.
// Here we define the response schema for Gemini to ensure JSON output.

const careerPixelSchema: Schema = {
  type: "OBJECT",
  properties: {
    user_persona: {
      type: "OBJECT",
      properties: {
        headline: { type: "STRING" },
        psych_profile: { type: "STRING" },
        archetype: { type: "STRING" }
      },
      required: ["headline", "psych_profile", "archetype"]
    },
    parsed_data: {
      type: "OBJECT",
      properties: {
        name: { type: "STRING" },
        email: { type: "STRING" },
        location: { type: "STRING" },
        education: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              institution: { type: "STRING" },
              degree: { type: "STRING" },
              start_date: { type: "STRING" },
              end_date: { type: "STRING" },
              gpa_or_grade: { type: "STRING" }
            }
          }
        },
        experience: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              company: { type: "STRING" },
              role: { type: "STRING" },
              start_date: { type: "STRING" },
              end_date: { type: "STRING" },
              responsibilities: { type: "ARRAY", items: { type: "STRING" } },
              achievements: { type: "ARRAY", items: { type: "STRING" } },
              impact_metrics: { type: "ARRAY", items: { type: "STRING" } }
            }
          }
        },
        projects: { type: "ARRAY", items: { type: "STRING" } },
        skills: { type: "ARRAY", items: { type: "STRING" } },
        certifications: { type: "ARRAY", items: { type: "STRING" } },
        extras: { type: "ARRAY", items: { type: "STRING" } }
      }
    },
    ats_audit: {
      type: "OBJECT",
      properties: {
        score: { type: "NUMBER" },
        verdict: { type: "STRING" },
        critical_fixes: { type: "ARRAY", items: { type: "STRING" } },
        formatting_tips: { type: "ARRAY", items: { type: "STRING" } },
        keyword_gaps: { type: "ARRAY", items: { type: "STRING" } }
      },
      required: ["score", "verdict"]
    },
    swot_analysis: {
      type: "OBJECT",
      properties: {
        strengths: { type: "ARRAY", items: { type: "STRING" } },
        weaknesses: { type: "ARRAY", items: { type: "STRING" } },
        opportunities: { type: "ARRAY", items: { type: "STRING" } },
        threats: { type: "ARRAY", items: { type: "STRING" } }
      }
    },
    career_map: {
      type: "OBJECT",
      properties: {
        best_fit_role: { type: "STRING" },
        match_percentage: { type: "NUMBER" },
        salary_range: { type: "STRING" },
        why_it_fits: { type: "STRING" },
        top_companies: { type: "ARRAY", items: { type: "STRING" } },
        gap_analysis: {
          type: "OBJECT",
          properties: {
            skill_gaps: { type: "ARRAY", items: { type: "STRING" } },
            experience_gaps: { type: "ARRAY", items: { type: "STRING" } },
            project_gaps: { type: "ARRAY", items: { type: "STRING" } }
          }
        }
      }
    },
    prep_roadmap: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          week: { type: "STRING" },
          theme: { type: "STRING" },
          daily_tasks: { type: "ARRAY", items: { type: "STRING" } },
          resources: { type: "ARRAY", items: { type: "STRING" } },
          deliverables: { type: "ARRAY", items: { type: "STRING" } }
        }
      }
    }
  }
};

const SYSTEM_INSTRUCTION = `
YOUR PRIMARY MISSION
Transform cold resume text + warm user aspirations into a hyper-personalized career blueprint that feels emotionally intelligent, analytically rigorous, and immediately actionable.

YOUR TONE & STYLE
Direct + Energetic: Clean sentences, high clarity.
Human + Insightful: Reveal patterns about who they are as a person.
Kind but Unfiltered: Encourage, but do not sugarcoat weaknesses.
Zero Corporate Buzzwords: Never use vague nonsense like "synergy," "leveraging cross-functional alignment," etc.
Explain WHY: Every insight must be justified based on resume or aspirations.

YOUR ANALYTICAL RESPONSIBILITIES
1. Parse & Extract: Pull meaningful info (Contact, Edu, Exp, Skills, etc).
2. Psychoanalysis: Identify hidden patterns, work style, cognitive strengths, and drivers.
3. ATS Audit: Score the resume (0-100), identify keyword gaps, and formatting issues.
4. SWOT: Strengths, Weaknesses, Opportunities, Threats.
5. Career Map: Identify best fit role, match %, salary, and gap analysis.
6. Preparation Roadmap: A 2-week tactical plan with daily tasks and deliverables.
`;

export const analyzeCareer = async (resumeText: string, aspirations: string): Promise<CareerPixelResponse> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API Key is missing. Please configure process.env.API_KEY.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    RESUME TEXT:
    ${resumeText}

    USER ASPIRATIONS:
    ${aspirations}

    Please analyze the above resume and aspirations to generate a CareerPixel profile.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: careerPixelSchema,
        temperature: 0.7
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as CareerPixelResponse;
    } else {
      throw new Error("Empty response from Gemini");
    }
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw error;
  }
};
