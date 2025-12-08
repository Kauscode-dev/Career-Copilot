import { GoogleGenAI, Schema } from "@google/genai";
import { CareerPixelResponse } from "../types";

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
      },
      required: ["name"]
    },
    ats_audit: {
      type: "OBJECT",
      properties: {
        score: { type: "NUMBER" },
        verdict: { type: "STRING" },
        score_breakdown: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              category: { type: "STRING", description: "e.g. Impact, Keywords, Format" },
              score: { type: "NUMBER" },
              feedback: { type: "STRING" }
            }
          }
        },
        critical_fixes: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              section: { type: "STRING" },
              fix: { type: "STRING" }
            }
          }
        },
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
      },
      required: ["strengths", "weaknesses", "opportunities", "threats"]
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
      },
      required: ["best_fit_role", "match_percentage", "salary_range", "why_it_fits", "top_companies", "gap_analysis"]
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

Be direct. Be insightful. Be cool.
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

    Analyze this. Give me the raw truth.
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