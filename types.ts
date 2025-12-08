export interface Education {
  institution: string;
  degree: string;
  start_date: string;
  end_date: string;
  gpa_or_grade: string;
}

export interface Experience {
  company: string;
  role: string;
  start_date: string;
  end_date: string;
  responsibilities: string[];
  achievements: string[];
  impact_metrics: string[];
}

export interface ParsedData {
  name: string;
  email: string;
  location: string;
  education: Education[];
  experience: Experience[];
  projects: string[];
  skills: string[];
  certifications: string[];
  extras: string[];
}

export interface UserPersona {
  headline: string;
  psych_profile: string;
  archetype: "The Builder" | "The Strategist" | "The Creator" | "The Operator" | "The Analyst" | "The Communicator" | "The Visionary";
}

export interface AtsAudit {
  score: number;
  verdict: string;
  score_breakdown: { category: string; score: number; feedback: string }[];
  critical_fixes: { section: string; fix: string }[];
  formatting_tips: string[];
  keyword_gaps: string[];
}

export interface SwotAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface GapAnalysis {
  skill_gaps: string[];
  experience_gaps: string[];
  project_gaps: string[];
}

export interface BestFitRole {
  role: string;
  match_percentage: number;
  salary_range: string;
  why_it_fits: string;
}

export interface CareerMap {
  best_fit_roles: BestFitRole[]; // Changed from single role to array
  top_companies: string[];
  gap_analysis: GapAnalysis;
}

export interface WeekPlan {
  week: string;
  theme: string;
  daily_tasks: string[];
  resources: string[];
  deliverables: string[];
}

export interface CareerPixelResponse {
  user_persona: UserPersona;
  parsed_data: ParsedData;
  ats_audit: AtsAudit;
  swot_analysis: SwotAnalysis;
  career_map: CareerMap;
  prep_roadmap: WeekPlan[];
}

export enum ViewState {
  LANDING = 'LANDING',
  INPUT = 'INPUT',
  PROCESSING = 'PROCESSING',
  DASHBOARD = 'DASHBOARD',
  ERROR = 'ERROR'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export type ImageSize = '1K' | '2K' | '4K';

export interface UserPreferences {
  targetRole: string;
  targetIndustry: string;
  targetCompanyType: string;
  targetLocation: string;
}