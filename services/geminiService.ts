import { GoogleGenAI, Schema, Type } from "@google/genai";
import { CareerPixelResponse, WeekPlan } from "../types";

const careerPixelSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    user_persona: {
      type: Type.OBJECT,
      properties: {
        headline: { type: Type.STRING },
        psych_profile: { type: Type.STRING },
        archetype: { type: Type.STRING }
      },
      required: ["headline", "psych_profile", "archetype"]
    },
    parsed_data: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        email: { type: Type.STRING },
        location: { type: Type.STRING },
        education: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              institution: { type: Type.STRING },
              degree: { type: Type.STRING },
              start_date: { type: Type.STRING },
              end_date: { type: Type.STRING },
              gpa_or_grade: { type: Type.STRING }
            }
          }
        },
        experience: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              company: { type: Type.STRING },
              role: { type: Type.STRING },
              start_date: { type: Type.STRING },
              end_date: { type: Type.STRING },
              responsibilities: { type: Type.ARRAY, items: { type: Type.STRING } },
              achievements: { type: Type.ARRAY, items: { type: Type.STRING } },
              impact_metrics: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        },
        projects: { type: Type.ARRAY, items: { type: Type.STRING } },
        skills: { type: Type.ARRAY, items: { type: Type.STRING } },
        certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
        extras: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["name"]
    },
    ats_audit: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.NUMBER },
        verdict: { type: Type.STRING },
        score_breakdown: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING, description: "e.g. Impact, Keywords, Format" },
              score: { type: Type.NUMBER },
              feedback: { type: Type.STRING }
            }
          }
        },
        critical_fixes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              section: { type: Type.STRING },
              fix: { type: Type.STRING }
            }
          }
        },
        formatting_tips: { type: Type.ARRAY, items: { type: Type.STRING } },
        keyword_gaps: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["score", "verdict"]
    },
    swot_analysis: {
      type: Type.OBJECT,
      properties: {
        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
        opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
        threats: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["strengths", "weaknesses", "opportunities", "threats"]
    },
    career_map: {
      type: Type.OBJECT,
      properties: {
        best_fit_role: { type: Type.STRING },
        match_percentage: { type: Type.NUMBER },
        salary_range: { type: Type.STRING },
        why_it_fits: { type: Type.STRING },
        top_companies: { type: Type.ARRAY, items: { type: Type.STRING } },
        gap_analysis: {
          type: Type.OBJECT,
          properties: {
            skill_gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
            experience_gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
            project_gaps: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      },
      required: ["best_fit_role", "match_percentage", "salary_range", "why_it_fits", "top_companies", "gap_analysis"]
    },
    prep_roadmap: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          week: { type: Type.STRING },
          theme: { type: Type.STRING },
          daily_tasks: { type: Type.ARRAY, items: { type: Type.STRING } },
          resources: { type: Type.ARRAY, items: { type: Type.STRING } },
          deliverables: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  },
  required: ["user_persona", "parsed_data", "ats_audit", "swot_analysis", "career_map", "prep_roadmap"]
};

const SYSTEM_INSTRUCTION = `
YOUR PRIMARY MISSION
Transform cold resume text + warm user aspirations into a hyper-personalized career blueprint.
Style: Liquid, Premium, Raw, Honest, Gen-Z.

1. PSYCHOANALYSIS (Deep, Raw, Emotional)
   - Do NOT just summarize skills. Look into their soul.
   - What drives them? What are they afraid of?
   - How do they make decisions? (Data vs Gut)
   - The psych_profile string must be a substantial paragraph that feels like a therapy session for their career. It should be brutally honest yet empowering.

2. ATS AUDIT (Surgical Precision)
   - Score out of 100.
   - Provide a score_breakdown (e.g., "Impact Metrics", "Keyword Density", "Formatting", "Action Verbs") with individual scores (0-100) and specific feedback.
   - For critical_fixes, you MUST provide specific line-by-line feedback. 
     Example: { section: "Experience - Uber", fix: "Change 'Helped with marketing' to 'Spearheaded go-to-market strategy resulting in 20% growth'." }

3. SWOT ANALYSIS
   - Strengths: What makes them dangerous (in a good way)?
   - Weaknesses: What will get them rejected? Be harsh but constructive.
   - Opportunities: What specific niche or role can they dominate?
   - Threats: AI, market saturation, skill obsolescence.

4. ROADMAP (Actionable)
   - Resources must be specific titles of books, courses, or tools that can be searched.

5. GAP ANALYSIS & TARGETS
   - Top Companies: Suggest 6-8 specific companies.
   - Skill/Experience/Project Bridge: Be hyper-specific. Don't say "Learn Python". Say "Build a RAG pipeline using LangChain to demonstrate AI engineering skills missing from your background."

6. AVATAR PROMPT
   - In the analysis, infer a "Fictional Character" style prompt for their persona (e.g. "A cyberpunk architect looking at a hologram city").

Be direct. Be insightful. Be cool.
`;

const getApiKey = () => {
  const key = process.env.API_KEY;
  if (!key) throw new Error("API Key is missing.");
  return key;
};

// Main Analysis (gemini-2.5-flash)
export const analyzeCareer = async (resumeText: string, aspirations: string): Promise<CareerPixelResponse> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const prompt = `RESUME TEXT:\n${resumeText}\n\nUSER ASPIRATIONS:\n${aspirations}\n\nAnalyze this. Give me the raw truth.`;

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
  }
  throw new Error("Empty response from Gemini");
};

// Fast Polish (gemini-2.5-flash)
export const quickPolishAspirations = async (text: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Rewrite this career aspiration to be punchy, ambitious, and executive-ready. Max 2 sentences. Text: "${text}"`
  });
  return response.text || text;
};

// Search Grounding (gemini-2.5-flash with googleSearch)
export const getMarketInsights = async (role: string, location: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Find real-time market data for the role of ${role} in ${location}. 
    Provide:
    1. Average Salary Range (include sources).
    2. Top 3 Companies hiring now.
    3. Key emerging skills required in 2025.
    
    Keep it concise.`,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });
  
  // Return the text directly (Search Grounding outputs text)
  return response.text || "Could not retrieve market data.";
};

// Deep Thinking Strategy (gemini-3-pro-preview with thinking)
export const generateDeepStrategy = async (profile: string, goal: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `User Profile Summary: ${profile}. Goal: ${goal}.
    Generate a deep, strategic 5-year master plan. 
    Focus on non-obvious moves, high-leverage networking, and specific milestones.
    Think deeply about market trends and psychological blockers.`,
    config: {
      thinkingConfig: { thinkingBudget: 32768 } // Max budget for pro
    }
  });
  return response.text || "Strategy generation failed.";
};

// Image Generation (gemini-3-pro-image-preview)
export const generateCareerAvatar = async (prompt: string, size: '1K' | '2K' | '4K'): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: `A futuristic, professional, and inspiring digital art avatar representing this persona: ${prompt}. High quality, cinematic lighting.` }]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: size
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated.");
};

// Chatbot (gemini-3-pro-preview)
export const createChatSession = () => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: "You are a world-class, Gen-Z career coach. You are honest, strategic, and empowering. You use emojis occasionally but remain professional. Help the user with their career questions."
    }
  });
};

// Custom Roadmap Generation
export const generateCustomRoadmap = async (psychProfile: string, role: string, durationWeeks: number): Promise<WeekPlan[]> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const prompt = `
    User Psych Profile: ${psychProfile}
    Target Role: ${role}
    Duration: ${durationWeeks} weeks.

    Generate a customized, week-by-week preparation roadmap.
    For each week, define a Theme, Daily Tasks (specific actions), Resources (books, courses, urls), and Deliverables (tangible outcomes).
  `;

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        week: { type: Type.STRING },
        theme: { type: Type.STRING },
        daily_tasks: { type: Type.ARRAY, items: { type: Type.STRING } },
        resources: { type: Type.ARRAY, items: { type: Type.STRING } },
        deliverables: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["week", "theme", "daily_tasks", "resources", "deliverables"]
    }
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });

  if (response.text) {
    return JSON.parse(response.text) as WeekPlan[];
  }
  return [];
};