import { GoogleGenAI, Schema, Type } from "@google/genai";
import { CareerPixelResponse, WeekPlan, UserPreferences } from "../types";

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
        best_fit_roles: { 
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              role: { type: Type.STRING },
              match_percentage: { type: Type.NUMBER },
              salary_range: { type: Type.STRING },
              why_it_fits: { type: Type.STRING }
            }
          }
        },
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
      required: ["best_fit_roles", "top_companies", "gap_analysis"]
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

1. PSYCHOANALYSIS (Minimalist, Punchy, Humanized)
   - Do NOT list facts from the resume.
   - Do NOT use long paragraphs. Use short, punchy sentences.
   - Write a raw, emotional, and conversational psychoanalysis of their professional self. 
   - Talk to them directly (e.g., "You thrive in chaos but secretly crave structure.").
   - Reveal their hidden drivers, fears, and decision-making styles.

2. ATS AUDIT (Surgical Precision)
   - Score out of 100.
   - Provide granular critical fixes line-by-line.

3. SWOT ANALYSIS
   - Strengths: What makes them dangerous (in a good way)?
   - Weaknesses: What will get them rejected? Be harsh but constructive.
   - Opportunities: What specific niche or role can they dominate?
   - Threats: AI, market saturation, skill obsolescence.

4. CAREER MAP & BEST FIT ROLES
   - Identify EXACTLY 3 "Best Fit Roles" based on their profile and aspirations.
   - For each role, calculate a match percentage and estimate salary range (in INR if location is India/relevant, otherwise USD).
   - Top Companies: Suggest 6-8 specific companies.

5. GAP ANALYSIS
   - Skill/Experience/Project Bridge: Be hyper-specific. Reference specific resume details.

6. AVATAR PROMPT
   - Infer a prompt for a "Photorealistic 3D Render" of a fictional character (from movies, shows, games) that embodies their professional spirit. 
   - Specify gender based on resume context or name.
   - Example: "Tony Stark working on a holographic interface, photorealistic, cinematic lighting, 8k."

Be direct. Be insightful. Be cool.
`;

const getApiKey = () => {
  const key = process.env.API_KEY;
  if (!key) throw new Error("API Key is missing.");
  return key;
};

// Retry helper for 503 Overloaded errors
const callWithRetry = async <T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    const isOverloaded = error?.status === 503 || error?.code === 503 || error?.message?.includes('overloaded');
    if (retries > 0 && isOverloaded) {
      console.warn(`Model overloaded. Retrying in ${delay}ms... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return callWithRetry(fn, retries - 1, delay * 2); // Exponential backoff
    }
    throw error;
  }
};

// Main Analysis (gemini-2.5-flash)
export const analyzeCareer = async (resumeText: string, aspirations: string, preferences: UserPreferences): Promise<CareerPixelResponse> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  
  const prefString = `
    Target Role Functions: ${preferences.targetRole}
    Target Industries: ${preferences.targetIndustry}
    Target Company Types: ${preferences.targetCompanyType}
    Target Locations: ${preferences.targetLocation}
  `;
  
  const prompt = `RESUME TEXT:\n${resumeText}\n\nUSER ASPIRATIONS:\n${aspirations}\n\nUSER PREFERENCES:\n${prefString}\n\nAnalyze this. Give me the raw truth.`;

  return callWithRetry(async () => {
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
  });
};

// Fast Polish (gemini-2.5-flash)
export const quickPolishAspirations = async (text: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Rewrite this career aspiration to be punchy, ambitious, and executive-ready. Max 2 sentences. Text: "${text}"`
    });
    return response.text || text;
  });
};

// Search Grounding (gemini-2.5-flash with googleSearch)
export const getMarketInsights = async (role: string, location: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Find real-time market data for the role of ${role} in ${location}. 
      Provide a concise summary with:
      - Current Salary Trends
      - Top Hiring Companies (Real-time)
      - Hot Skills in Demand
      
      Format as a clean, readable paragraph or bullet points. Do not use Markdown headers.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    
    return response.text || "Could not retrieve market data.";
  });
};

// Deep Thinking Strategy (gemini-3-pro-preview with thinking)
export const generateDeepStrategy = async (profile: string, goal: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `User Profile Summary: ${profile}. Goal: ${goal}.
      Generate a deep, strategic 5-year master plan. 
      Focus on non-obvious moves, high-leverage networking, and specific milestones.
      Think deeply about market trends and psychological blockers.`,
      config: {
        thinkingConfig: { thinkingBudget: 16384 } // Reduced slightly to avoid frequent overloads while keeping high reasoning
      }
    });
    return response.text || "Strategy generation failed.";
  });
};

// Image Generation (gemini-3-pro-image-preview)
export const generateCareerAvatar = async (prompt: string, size: '1K' | '2K' | '4K'): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  // Enforce photorealistic 3D render style
  const enhancedPrompt = `${prompt}. Photorealistic 3D render, Unreal Engine 5 style, volumetric lighting, 8k resolution, highly detailed, cinematic composition.`;
  
  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: enhancedPrompt }]
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
  });
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

  return callWithRetry(async () => {
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
  });
};