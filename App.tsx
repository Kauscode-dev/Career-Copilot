import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Upload, 
  Target, 
  ChevronRight, 
  Sparkles, 
  FileText, 
  Map, 
  ListTodo,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  User,
  ShieldAlert,
  Loader2,
  ExternalLink,
  Zap,
  Search,
  MessageSquare,
  X,
  Send,
  Briefcase,
  MapPin,
  Building2,
  Globe,
  Fingerprint
} from 'lucide-react';
import { Button } from './components/Button';
import { Card } from './components/Card';
import { CircularProgress } from './components/ProgressBar';
import { 
  analyzeCareer, 
  quickPolishAspirations, 
  getMarketInsights, 
  createChatSession,
  generateCustomRoadmap
} from './services/geminiService';
import { extractTextFromPDF } from './services/pdfService';
import { CareerPixelResponse, ViewState, ChatMessage, ImageSize, UserPreferences, BestFitRole } from './types';

function App() {
  const [view, setView] = useState<ViewState>(ViewState.LANDING);
  const [resumeText, setResumeText] = useState('');
  const [aspirations, setAspirations] = useState('');
  const [loadingStep, setLoadingStep] = useState(0);
  const [data, setData] = useState<CareerPixelResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'PERSONA' | 'ATS' | 'MAP' | 'ROADMAP'>('PERSONA');
  const [isParsingPdf, setIsParsingPdf] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  
  // User Preferences
  const [preferences, setPreferences] = useState<UserPreferences>({
    targetRole: '',
    targetIndustry: '',
    targetCompanyType: '',
    targetLocation: ''
  });

  // Feature States
  const [isPolishing, setIsPolishing] = useState(false);
  const [marketInsights, setMarketInsights] = useState<string | null>(null);
  const [isLoadingMarket, setIsLoadingMarket] = useState(false);
  
  // Roadmap States
  const [roadmapDuration, setRoadmapDuration] = useState(4); // weeks
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [customRoadmap, setCustomRoadmap] = useState<any[] | null>(null);
  
  // Chat States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatSession, setChatSession] = useState<any>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Constants for Dropdowns
  const JOB_FUNCTIONS = ["Product Management", "Engineering", "Data Science", "Sales/GTM", "Marketing", "Design", "Operations", "Finance", "HR", "Strategy", "Customer Success", "Legal", "General Management"];
  const INDUSTRIES = ["Fintech", "Edtech", "Healthtech", "E-commerce", "SaaS", "AI/ML", "Consumer Social", "Logistics", "Real Estate", "Cyber Security", "Media/Entertainment"];
  const COMPANY_TYPES = ["Early-stage Startup", "Growth-stage Startup", "Unicorn", "MNC", "Enterprise", "FAANG", "Consulting Firm", "Investment Bank"];
  const LOCATIONS = ["Bangalore", "Gurgaon", "Mumbai", "Hyderabad", "Pune", "Delhi NCR", "Chennai", "Noida", "Remote (India)", "Remote (Global)"];

  const ARCHETYPE_TRAITS: Record<string, string[]> = {
    "The Builder": ["Autonomous", "Execution-Oriented", "Zero-to-One Mindset"],
    "The Strategist": ["Systems Thinking", "Long-Term Vision", "Pattern Recognition"],
    "The Creator": ["Innovative", "Storytelling", "Originality"],
    "The Operator": ["Efficiency", "Process-Driven", "Reliability"],
    "The Analyst": ["Data-Driven", "Logical", "Precision"],
    "The Communicator": ["Empathetic", "Persuasive", "Articulate"],
    "The Visionary": ["Future-Focused", "Risk-Taking", "Inspirational"],
    "Explorer": ["Curious", "Adaptable", "Multidisciplinary"]
  };

  // Initialize Chat Session on Load
  useEffect(() => {
    try {
      if (process.env.API_KEY) {
        setChatSession(createChatSession());
      }
    } catch (e) {
      console.error("Chat init failed", e);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isChatOpen]);

  const handleAnalyze = async () => {
    if (!resumeText.trim()) return;
    
    setView(ViewState.PROCESSING);
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev < 3 ? prev + 1 : prev));
    }, 1500);

    try {
      const result = await analyzeCareer(resumeText, aspirations, preferences);
      setData(result);
      clearInterval(interval);
      setView(ViewState.DASHBOARD);
    } catch (err: any) {
      clearInterval(interval);
      setErrorMsg(err.message || "Failed to analyze resume. Check API Key.");
      setView(ViewState.ERROR);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadedFileName(file.name);

    if (file.type === 'application/pdf') {
      setIsParsingPdf(true);
      try {
        const text = await extractTextFromPDF(file);
        setResumeText(text);
      } catch (error) {
        console.error("PDF Parse Error", error);
        alert("Failed to parse PDF. Please try copying text manually.");
      } finally {
        setIsParsingPdf(false);
      }
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setResumeText(text);
      };
      reader.readAsText(file);
    }
  };

  // --- Feature Handlers ---

  const handlePolish = async () => {
    if (!aspirations.trim()) return;
    setIsPolishing(true);
    try {
      const polished = await quickPolishAspirations(aspirations);
      setAspirations(polished);
    } catch (e) {
      console.error(e);
    } finally {
      setIsPolishing(false);
    }
  };

  const handleMarketInsights = async () => {
    if (!data?.career_map?.best_fit_roles?.[0]?.role || !data?.parsed_data?.location) return;
    setIsLoadingMarket(true);
    try {
      const insights = await getMarketInsights(data.career_map.best_fit_roles[0].role, data.parsed_data.location);
      setMarketInsights(insights);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingMarket(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    if (!data) return;
    setIsGeneratingRoadmap(true);
    try {
      const roadmap = await generateCustomRoadmap(
        data.user_persona.psych_profile,
        data.career_map.best_fit_roles?.[0]?.role || "General",
        roadmapDuration
      );
      setCustomRoadmap(roadmap);
    } catch (e) {
      console.error(e);
      alert("Roadmap generation failed.");
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !chatSession) return;
    
    const userMsg: ChatMessage = { role: 'user', text: chatInput, timestamp: Date.now() };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const result = await chatSession.sendMessage({ message: userMsg.text });
      const modelMsg: ChatMessage = { role: 'model', text: result.text || "I couldn't generate a response.", timestamp: Date.now() };
      setChatMessages(prev => [...prev, modelMsg]);
    } catch (e) {
      console.error("Chat Error", e);
      setChatMessages(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting right now.", timestamp: Date.now() }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // --- Background ---
  
  const SpaceBackground = () => (
    <div className="space-particles">
       {Array.from({ length: 50 }).map((_, i) => (
         <div 
           key={i} 
           className="star" 
           style={{
             left: `${Math.random() * 100}%`,
             top: `${Math.random() * 100}%`,
             animationDuration: `${Math.random() * 3 + 2}s`,
             animationDelay: `${Math.random() * 5}s`
           }} 
         />
       ))}
    </div>
  );

  // --- Views ---

  const renderLanding = () => (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden p-6 bg-halftone">
      <SpaceBackground />

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-7xl mx-auto text-center relative z-10 space-y-12"
      >
        {/* Badge */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass-panel border border-white/20 text-sm font-medium tracking-wide backdrop-blur-xl"
        >
          <Sparkles size={16} className="text-[#FFD700]" />
          <span className="text-gray-200">AI-Powered Career Intelligence v2.5</span>
        </motion.div>
        
        {/* Main Heading */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.9] relative"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/60 drop-shadow-2xl">
            Career
          </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#00E3FF] to-[#FFD700] animate-gradient">
            Pixel
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700] via-[#00E3FF] to-[#FFD700] blur-[100px] opacity-20 -z-10"></div>
        </motion.h1>
        
        {/* Subheading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="space-y-4"
        >
          <p className="text-2xl md:text-4xl font-light text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Stop applying to hundreds of jobs.
          </p>
          <p className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00E3FF] to-[#FFD700]">
            Start landing the right one.
          </p>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-light"
        >
          Your AI career agent that finds roles you'll actually thrive in, 
          then helps you execute <span className="text-[#00E3FF] font-medium">personalized outreach</span> that gets responses.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8"
        >
          <Button 
            onClick={() => setView(ViewState.INPUT)} 
            className="w-full sm:w-auto text-lg px-12 py-6 shadow-[0_0_50px_-10px_rgba(255,215,0,0.6)] hover:shadow-[0_0_80px_-10px_rgba(255,215,0,0.8)] group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-3">
              Get Started
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700] to-[#FFA500] opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </Button>
          
          <button className="w-full sm:w-auto px-12 py-6 rounded-full text-lg font-bold glass-panel border border-white/30 hover:border-[#00E3FF] text-white hover:bg-white/10 transition-all flex items-center justify-center gap-3 group">
            <Sparkles size={20} className="text-[#00E3FF]" />
            See How It Works
            <ExternalLink size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </motion.div>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-4 pt-12"
        >
          {[
            { icon: Brain, text: "AI Psychoanalysis", color: "#FFD700" },
            { icon: Target, text: "Smart Job Matching", color: "#00E3FF" },
            { icon: Zap, text: "Outreach Automation", color: "#FFD700" },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 px-6 py-3 glass-panel rounded-full border border-white/10 hover:border-white/30 transition-all cursor-default group"
            >
              <feature.icon size={18} style={{ color: feature.color }} className="group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-300">{feature.text}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Floating Glass Cards - Problem Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="max-w-7xl mx-auto mt-32 relative z-10"
      >
        <h2 className="text-4xl md:text-5xl font-black text-center mb-16 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
          Job searching is <span className="text-[#FFD700]">broken</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: "🎯",
              title: "Spray and pray doesn't work",
              description: "You apply to 200 jobs with the same resume. 195 never respond. You waste weeks on roles you'd hate anyway.",
              accent: "#FFD700"
            },
            {
              icon: "🤖",
              title: "Algorithms ignore what matters",
              description: "Job boards match keywords, not culture fit, growth potential, or what actually energizes you.",
              accent: "#00E3FF"
            },
            {
              icon: "📧",
              title: "Generic outreach gets ghosted",
              description: "Cold emails that could've been written by anyone go straight to trash. You need differentiation, not templates.",
              accent: "#FFD700"
            }
          ].map((problem, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 + idx * 0.1, duration: 0.6 }}
              className="glass-panel p-8 rounded-3xl border border-white/10 hover:border-white/30 transition-all group hover:scale-105 hover:shadow-2xl relative overflow-hidden"
              style={{
                boxShadow: `0 0 40px -10px ${problem.accent}20`
              }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-20 rounded-full transition-opacity group-hover:opacity-40" 
                   style={{ background: problem.accent }}></div>
              
              <div className="text-5xl mb-6 filter drop-shadow-lg">{problem.icon}</div>
              <h3 className="text-xl font-bold text-white mb-4">{problem.title}</h3>
              <p className="text-gray-400 leading-relaxed">{problem.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Final CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 1 }}
        className="max-w-5xl mx-auto mt-32 mb-20 relative z-10"
      >
        <div className="glass-panel p-12 md:p-16 rounded-3xl border border-white/20 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/10 via-transparent to-[#00E3FF]/10"></div>
          
          <h2 className="text-4xl md:text-6xl font-black mb-6 text-white relative z-10">
            Ready to change how you <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#00E3FF]">find work?</span>
          </h2>
          
          <p className="text-xl text-gray-300 mb-10 relative z-10">
            Join thousands who've already transformed their career search with AI
          </p>
          
          <Button 
            onClick={() => setView(ViewState.INPUT)}
            variant="primary"
            className="text-xl px-16 py-7 shadow-[0_0_60px_-10px_rgba(255,215,0,0.7)] relative z-10"
          >
            Get Early Access
            <ChevronRight size={24} />
          </Button>
        </div>
      </motion.div>
    </div>
  );

  const renderInput = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 max-w-6xl mx-auto relative bg-halftone">
      <SpaceBackground />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full grid md:grid-cols-2 gap-10"
      >
        <div className="space-y-6">
          <h2 className="text-5xl font-black tracking-tight text-white">Let's decode <br/> your DNA.</h2>
          <p className="text-xl text-gray-200 font-light">
            Upload your resume and tell us your wildest ambitions. 
            We'll handle the psychology.
          </p>
          
          <div className="glass-panel p-8 rounded-2xl border-2 border-dashed border-white/30 hover:border-[#FFD700] transition-colors relative group bg-black/60">
              <input 
                type="file" 
                accept=".pdf,.txt,.md" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                onChange={handleFileUpload}
                disabled={isParsingPdf}
              />
              <div className="flex flex-col items-center justify-center h-48 text-center space-y-4">
                 {isParsingPdf ? (
                    <>
                      <Loader2 className="animate-spin text-[#FFD700]" size={48} />
                      <p className="text-gray-300">Extracting intelligence...</p>
                    </>
                 ) : uploadedFileName ? (
                    <>
                      <FileText className="text-[#00E3FF]" size={48} />
                      <div>
                         <p className="text-white font-bold">{uploadedFileName}</p>
                         <p className="text-green-400 text-sm mt-1">Upload Successful</p>
                      </div>
                    </>
                 ) : (
                    <>
                      <Upload className="text-gray-400 group-hover:text-white transition-colors" size={48} />
                      <div>
                        <p className="text-white font-medium">Drag & Drop PDF or Click to Upload</p>
                        <p className="text-gray-400 text-sm mt-1">Supported: PDF, TXT (Max 5MB)</p>
                      </div>
                    </>
                 )}
              </div>
          </div>
        </div>

        <div className="space-y-6 flex flex-col justify-between">
           <div className="glass-panel p-6 rounded-2xl h-full flex flex-col space-y-6 bg-black/60 border border-white/20">
             
             {/* Ambitions Text */}
             <div>
               <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-[#00E3FF] uppercase tracking-wider">Your Ambitions</label>
                  <button 
                    onClick={handlePolish}
                    disabled={!aspirations.trim() || isPolishing}
                    className="text-xs flex items-center gap-1 text-[#FFD700] hover:text-white transition-colors disabled:opacity-50"
                  >
                    {isPolishing ? <Loader2 className="animate-spin" size={12}/> : <Zap size={12}/>}
                    Polish
                  </button>
               </div>
               <textarea 
                  value={aspirations}
                  onChange={(e) => setAspirations(e.target.value)}
                  placeholder="Tell us where you want to go..."
                  className="w-full h-24 bg-black/50 rounded-lg p-3 outline-none resize-none text-white placeholder-gray-400 focus:bg-black/70 border border-white/20 focus:border-[#FFD700] transition-colors"
                />
             </div>

             {/* Dropdowns */}
             <div className="grid grid-cols-2 gap-4">
               {[
                 { label: "Target Role", value: preferences.targetRole, key: "targetRole", options: JOB_FUNCTIONS },
                 { label: "Industry", value: preferences.targetIndustry, key: "targetIndustry", options: INDUSTRIES },
                 { label: "Company Type", value: preferences.targetCompanyType, key: "targetCompanyType", options: COMPANY_TYPES },
                 { label: "Location", value: preferences.targetLocation, key: "targetLocation", options: LOCATIONS }
               ].map((field, idx) => (
                 <div key={idx}>
                    <label className="text-xs text-gray-300 mb-1 block font-bold">{field.label}</label>
                    <select 
                      className="w-full bg-black/50 rounded-lg p-2 text-sm text-white border border-white/20 outline-none focus:border-[#00E3FF] transition-colors"
                      value={field.value}
                      onChange={(e) => setPreferences({...preferences, [field.key]: e.target.value})}
                    >
                      <option value="">Optional</option>
                      {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                 </div>
               ))}
             </div>
          </div>

          <Button 
            onClick={handleAnalyze} 
            disabled={!resumeText.trim() || isParsingPdf}
            className="w-full py-5 text-xl shadow-[0_0_30px_rgba(255,215,0,0.3)]"
          >
            Start Analysis
            <Zap size={20} className="fill-black" />
          </Button>
        </div>
      </motion.div>
    </div>
  );

  const renderProcessing = () => {
    const steps = [
      "Deconstructing resume syntax...",
      "Extracting psychological markers...",
      "Calculating ATS probabilities...",
      "Synthesizing career roadmap..."
    ];

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative bg-halftone">
         <SpaceBackground />
         <div className="relative">
            <div className="absolute inset-0 bg-[#FFD700] blur-[40px] opacity-20 rounded-full animate-pulse"></div>
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="w-32 h-32 border-4 border-transparent border-t-[#FFD700] border-l-[#00E3FF] rounded-full relative z-10"
            />
         </div>
         <h2 className="text-3xl font-black mt-10 mb-4 tracking-tight">Processing Profile</h2>
         <p className="text-[#00E3FF] font-mono text-sm tracking-widest uppercase">{steps[loadingStep]}</p>
      </div>
    );
  };

  const renderError = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto relative bg-halftone">
      <SpaceBackground />
      <div className="glass-panel p-8 rounded-3xl border border-red-500/30">
        <AlertTriangle className="text-red-500 mb-6 mx-auto" size={48} />
        <h2 className="text-3xl font-bold mb-4">Analysis Interrupted</h2>
        <p className="text-gray-400 mb-8 leading-relaxed">{errorMsg}</p>
        <Button onClick={() => setView(ViewState.INPUT)} variant="outline">Try Again</Button>
      </div>
    </div>
  );

  const ChatWidget = () => (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
       <AnimatePresence>
         {isChatOpen && (
           <motion.div
             initial={{ opacity: 0, y: 20, scale: 0.9 }}
             animate={{ opacity: 1, y: 0, scale: 1 }}
             exit={{ opacity: 0, y: 20, scale: 0.9 }}
             className="pointer-events-auto bg-black border border-white/20 shadow-2xl rounded-2xl w-80 md:w-96 h-[500px] mb-4 overflow-hidden flex flex-col"
           >
             <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                   <span className="font-bold text-sm">AI Career Coach</span>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="text-gray-400 hover:text-white"><X size={18}/></button>
             </div>
             
             <div className="flex-grow p-4 overflow-y-auto custom-scrollbar space-y-4 bg-black/50">
                {chatMessages.length === 0 && (
                  <div className="text-center text-gray-500 text-sm mt-10">
                    <p>Ask me anything about your career path, salary negotiation, or interview tips.</p>
                  </div>
                )}
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-[#00E3FF] text-black rounded-tr-none' : 'bg-white/10 text-gray-200 rounded-tl-none'}`}>
                        {msg.text}
                     </div>
                  </div>
                ))}
                {isChatLoading && (
                   <div className="flex justify-start">
                     <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                     </div>
                   </div>
                )}
                <div ref={chatEndRef} />
             </div>

             <div className="p-4 border-t border-white/10 bg-black">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                  className="flex gap-2"
                >
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-grow bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-[#00E3FF]"
                  />
                  <button type="submit" disabled={!chatInput.trim() || isChatLoading} className="p-2 bg-[#00E3FF] rounded-full text-black hover:bg-[#33EAFF] disabled:opacity-50">
                     <Send size={18} />
                  </button>
                </form>
             </div>
           </motion.div>
         )}
       </AnimatePresence>

       <button 
         onClick={() => setIsChatOpen(!isChatOpen)}
         className="pointer-events-auto w-14 h-14 rounded-full bg-[#00E3FF] hover:bg-[#33EAFF] text-black shadow-[0_0_20px_rgba(0,227,255,0.5)] flex items-center justify-center transition-all transform hover:scale-105"
       >
         {isChatOpen ? <X size={24} /> : <MessageSquare size={24} />}
       </button>
    </div>
  );

  const renderDashboard = () => {
    if (!data) return null;

    const tabs = [
      { id: 'PERSONA', icon: User, label: 'Persona' },
      { id: 'ATS', icon: FileText, label: 'ATS Audit' },
      { id: 'MAP', icon: Map, label: 'Career Map' },
      { id: 'ROADMAP', icon: ListTodo, label: 'Roadmap' },
    ];

    const currentRoadmap = customRoadmap || data?.prep_roadmap;
    const archetype = data?.user_persona?.archetype || 'Explorer';
    const traits = ARCHETYPE_TRAITS[archetype] || ARCHETYPE_TRAITS['Explorer'];

    return (
      <div className="min-h-screen pb-20 relative bg-halftone">
        <SpaceBackground />
        
        {/* Header */}
        <header className="sticky top-0 z-40 glass-panel border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3 font-bold text-xl tracking-tight cursor-pointer" onClick={() => setView(ViewState.LANDING)}>
              <div className="w-10 h-10 bg-gradient-to-tr from-[#FFD700] to-orange-400 rounded-xl flex items-center justify-center text-black shadow-lg shadow-orange-500/20">CP</div>
              <span className="hidden md:block">CareerPixel</span>
            </div>
            <div className="flex items-center gap-6">
               <div className="hidden md:flex flex-col items-end">
                 <span className="text-sm font-bold text-white">{data?.parsed_data?.name || 'Anonymous User'}</span>
                 <span className="text-xs text-gray-400 uppercase tracking-wider">{archetype}</span>
               </div>
               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-black border border-white/20 flex items-center justify-center">
                  <User size={18} className="text-gray-400"/>
               </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <div className="max-w-7xl mx-auto px-6 py-10">
           <div className="flex justify-center md:justify-start mb-12">
             <div className="glass-panel p-1.5 rounded-full inline-flex gap-1 overflow-x-auto max-w-full">
               {tabs.map(tab => (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id as any)}
                   className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                     activeTab === tab.id 
                       ? 'bg-white text-black shadow-lg' 
                       : 'text-gray-400 hover:text-white hover:bg-white/5'
                   }`}
                 >
                   <tab.icon size={16} strokeWidth={2.5} />
                   {tab.label}
                 </button>
               ))}
             </div>
           </div>

           <AnimatePresence mode="wait">
             <motion.div
               key={activeTab}
               initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
               animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
               exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
               transition={{ duration: 0.4, ease: "circOut" }}
             >
               {activeTab === 'PERSONA' && (
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Identity Snapshot - Minimalist */}
                    <Card className="lg:col-span-8" accent="none" title="Identity Snapshot">
                      <div className="glass-panel p-10 rounded-2xl bg-black/40 border border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#FFD700]"></div>
                        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-white leading-tight">
                           {data?.user_persona?.headline}
                        </h1>
                        <p className="text-lg leading-relaxed text-gray-300 font-light opacity-90">
                          {data?.user_persona?.psych_profile}
                        </p>
                      </div>
                    </Card>

                    {/* Archetype Traits Card - Minimalist */}
                    <div className="lg:col-span-4 space-y-8">
                      <Card className="h-full flex flex-col justify-center text-center relative overflow-hidden bg-black/40" accent="white">
                          <div className="absolute inset-0 bg-gradient-to-b from-[#00E3FF]/5 to-transparent pointer-events-none"></div>
                          <Fingerprint size={48} className="mx-auto text-[#00E3FF] mb-6 opacity-80" />
                          <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-2">{archetype}</h2>
                          <div className="w-16 h-1 bg-[#00E3FF] mx-auto rounded-full mb-8"></div>
                          <div className="space-y-4">
                            {traits.map((trait, i) => (
                              <div key={i} className="py-3 px-4 glass-panel rounded-lg text-sm font-bold text-gray-300 border border-white/5">
                                {trait}
                              </div>
                            ))}
                          </div>
                      </Card>
                    </div>

                    {/* Full SWOT - Split into 4 distinct cards */}
                    <div className="lg:col-span-12 grid md:grid-cols-4 gap-6">
                      <Card className="h-full border-comic border-green-500/30" accent="none">
                        <h4 className="text-green-400 font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                          <CheckCircle2 size={18}/> Strengths
                        </h4>
                        <ul className="space-y-3">
                          {data?.swot_analysis?.strengths?.map((s, i) => (
                            <li key={i} className="text-sm text-gray-300 leading-snug pb-2 border-b border-white/5 last:border-0">{s}</li>
                          ))}
                        </ul>
                      </Card>

                      <Card className="h-full border-comic border-yellow-500/30" accent="none">
                        <h4 className="text-[#FFD700] font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                          <AlertTriangle size={18}/> Weaknesses
                        </h4>
                        <ul className="space-y-3">
                          {data?.swot_analysis?.weaknesses?.map((s, i) => (
                            <li key={i} className="text-sm text-gray-300 leading-snug pb-2 border-b border-white/5 last:border-0">{s}</li>
                          ))}
                        </ul>
                      </Card>

                      <Card className="h-full border-comic border-blue-500/30" accent="none">
                        <h4 className="text-[#00E3FF] font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                          <Target size={18}/> Opportunities
                        </h4>
                        <ul className="space-y-3">
                          {data?.swot_analysis?.opportunities?.map((s, i) => (
                            <li key={i} className="text-sm text-gray-300 leading-snug pb-2 border-b border-white/5 last:border-0">{s}</li>
                          ))}
                        </ul>
                      </Card>

                      <Card className="h-full border-comic border-red-500/30" accent="none">
                        <h4 className="text-red-400 font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                          <ShieldAlert size={18}/> Threats
                        </h4>
                        <ul className="space-y-3">
                          {data?.swot_analysis?.threats?.map((s, i) => (
                            <li key={i} className="text-sm text-gray-300 leading-snug pb-2 border-b border-white/5 last:border-0">{s}</li>
                          ))}
                        </ul>
                      </Card>
                    </div>
                 </div>
               )}

               {activeTab === 'ATS' && (
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                   {/* Score Card */}
                   <div className="lg:col-span-4 space-y-8">
                      <Card className="flex flex-col items-center justify-center text-center py-12 relative overflow-hidden bg-black/40">
                          <div className="absolute inset-0 bg-gradient-to-b from-[#00E3FF]/5 to-transparent pointer-events-none"></div>
                          <CircularProgress 
                            percentage={data?.ats_audit?.score || 0} 
                            color={(data?.ats_audit?.score || 0) > 70 ? '#00E3FF' : '#FFD700'} 
                            size={160}
                            strokeWidth={12}
                            className="mx-auto"
                          />
                          <h3 className="text-3xl font-black mt-8 text-white">{data?.ats_audit?.verdict || 'N/A'}</h3>
                          <p className="text-gray-400 text-sm mt-2 uppercase tracking-widest">Resume Health Score</p>
                      </Card>
                      
                      {/* Breakdown */}
                      <Card title="Scoring Breakdown">
                        <div className="space-y-4">
                          {data?.ats_audit?.score_breakdown?.map((item, i) => (
                            <div key={i} className="group">
                              <div className="flex justify-between text-sm mb-1 font-bold text-gray-300">
                                <span>{item.category}</span>
                                <span className={item.score > 70 ? 'text-[#00E3FF]' : 'text-[#FFD700]'}>{item.score}/100</span>
                              </div>
                              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${item.score > 70 ? 'bg-[#00E3FF]' : 'bg-[#FFD700]'} transition-all duration-1000`} 
                                  style={{ width: `${item.score}%` }}
                                />
                              </div>
                              <p className="text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">{item.feedback}</p>
                            </div>
                          )) || <p className="text-gray-500 text-sm">No detailed breakdown available.</p>}
                        </div>
                      </Card>
                   </div>
                   
                   {/* Critical Fixes */}
                   <div className="lg:col-span-8 space-y-8">
                     <Card title="Critical Fixes (Line-by-Line)" accent="gold">
                       <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                         {data?.ats_audit?.critical_fixes?.map((item, i) => (
                           <div key={i} className="flex flex-col md:flex-row gap-4 p-5 bg-[#1A1A1A]/80 backdrop-blur-sm rounded-xl border border-white/5 hover:border-[#FFD700]/30 transition-all">
                             <div className="md:w-32 shrink-0">
                               <span className="text-xs font-bold text-[#FFD700] uppercase tracking-wider bg-[#FFD700]/10 px-2 py-1 rounded">
                                 {item.section}
                               </span>
                             </div>
                             <div className="flex gap-3">
                               <AlertTriangle className="text-red-400 shrink-0 mt-1" size={16} />
                               <p className="text-gray-300 text-sm leading-relaxed">{item.fix}</p>
                             </div>
                           </div>
                         ))}
                       </div>
                     </Card>

                     <Card title="Missing Keywords" accent="turquoise">
                       <div className="flex flex-wrap gap-3">
                         {data?.ats_audit?.keyword_gaps?.map((kw, i) => (
                           <span key={i} className="px-4 py-2 bg-[#00E3FF]/10 border border-[#00E3FF]/30 text-[#00E3FF] rounded-full text-sm font-medium hover:bg-[#00E3FF] hover:text-black transition-all cursor-default">
                             {kw}
                           </span>
                         ))}
                       </div>
                     </Card>
                   </div>
                 </div>
               )}

               {activeTab === 'MAP' && (
                 <div className="space-y-8">
                   {/* Best Fit Roles */}
                   <div className="space-y-6">
                     <h2 className="text-3xl font-black text-white pl-2 border-l-4 border-[#00E3FF]">Best Fit Job Roles</h2>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {data?.career_map?.best_fit_roles?.map((role, i) => (
                          <div key={i} className="card-pop glass-panel p-6 rounded-2xl border border-white/10 hover:border-[#00E3FF]/50 transition-all cursor-pointer group h-full flex flex-col justify-between">
                             <div>
                               <div className="flex justify-between items-start mb-4">
                                 <Briefcase size={24} className="text-[#00E3FF]" />
                                 <span className="text-2xl font-bold text-[#FFD700]">{role.match_percentage}%</span>
                               </div>
                               <h3 className="text-xl font-bold text-white mb-2">{role.role}</h3>
                               <p className="text-xs text-gray-400 mb-4">{role.salary_range}</p>
                               <p className="text-sm text-gray-300 leading-relaxed mb-4">{role.why_it_fits}</p>
                             </div>
                             <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                               <div className="h-full bg-[#00E3FF]" style={{ width: `${role.match_percentage}%` }}></div>
                             </div>
                          </div>
                        ))}
                     </div>
                   </div>

                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Market Data (Search Grounding) */}
                        <Card className="relative overflow-hidden h-full" title="Live Market Intelligence" accent="gold">
                           <div className="absolute right-0 top-0 p-32 bg-[#FFD700] blur-[80px] opacity-10 rounded-full pointer-events-none"></div>
                           {!marketInsights ? (
                             <div className="text-center py-6 h-48 flex flex-col items-center justify-center">
                               <p className="text-gray-400 text-sm mb-4">Fetch real-time market data based on your best fit roles.</p>
                               <Button onClick={handleMarketInsights} disabled={isLoadingMarket} variant="primary" className="mx-auto text-sm py-2 px-6">
                                 {isLoadingMarket ? 'Searching Google...' : 'Fetch Live Data'}
                               </Button>
                             </div>
                           ) : (
                             <div className="prose prose-invert text-sm max-h-60 overflow-y-auto custom-scrollbar">
                                <p className="whitespace-pre-wrap font-sans text-gray-200 leading-relaxed">{marketInsights}</p>
                             </div>
                           )}
                        </Card>

                        <Card title="Target Companies" className="h-full">
                          <div className="flex flex-wrap gap-3">
                              {data?.career_map?.top_companies?.map((co, i) => (
                                <a 
                                  key={i} 
                                  href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(co)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-5 py-3 glass-panel rounded-xl font-bold text-gray-300 hover:bg-[#0077b5] hover:text-white transition-all cursor-pointer flex items-center gap-2 group border border-white/5"
                                >
                                  {co}
                                  <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity"/>
                                </a>
                              ))}
                          </div>
                        </Card>
                   </div>

                   {/* Gap Analysis */}
                   <div className="space-y-6">
                     <h2 className="text-3xl font-black text-white pl-2 border-l-4 border-[#FFD700]">The Bridge</h2>
                     <div className="grid md:grid-cols-3 gap-8">
                       <motion.div 
                         whileHover={{ y: -5 }}
                         className="glass-panel p-6 rounded-2xl border-t-4 border-t-red-500/80 bg-gradient-to-b from-white/5 to-transparent"
                       >
                          <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2"><Brain size={18}/> Skill Gaps</h3>
                          <ul className="space-y-4">
                            {data?.career_map?.gap_analysis?.skill_gaps?.map((g, i) => (
                              <li key={i} className="text-sm text-gray-300 flex items-start gap-3">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 shrink-0"/> 
                                <span className="leading-snug">{g}</span>
                              </li>
                            ))}
                          </ul>
                       </motion.div>
                       
                       <motion.div 
                         whileHover={{ y: -5 }}
                         className="glass-panel p-6 rounded-2xl border-t-4 border-t-yellow-500/80 bg-gradient-to-b from-white/5 to-transparent"
                       >
                          <h3 className="text-lg font-bold text-yellow-400 mb-4 flex items-center gap-2"><Briefcase size={18}/> Experience Gaps</h3>
                          <ul className="space-y-4">
                            {data?.career_map?.gap_analysis?.experience_gaps?.map((g, i) => (
                              <li key={i} className="text-sm text-gray-300 flex items-start gap-3">
                                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 shrink-0"/> 
                                <span className="leading-snug">{g}</span>
                              </li>
                            ))}
                          </ul>
                       </motion.div>

                       <motion.div 
                         whileHover={{ y: -5 }}
                         className="glass-panel p-6 rounded-2xl border-t-4 border-t-blue-500/80 bg-gradient-to-b from-white/5 to-transparent"
                       >
                          <h3 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2"><Building2 size={18}/> Project Gaps</h3>
                          <ul className="space-y-4">
                            {data?.career_map?.gap_analysis?.project_gaps?.map((g, i) => (
                              <li key={i} className="text-sm text-gray-300 flex items-start gap-3">
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 shrink-0"/> 
                                <span className="leading-snug">{g}</span>
                              </li>
                            ))}
                          </ul>
                       </motion.div>
                     </div>
                   </div>
                 </div>
               )}

               {activeTab === 'ROADMAP' && (
                 <div className="space-y-12">
                   {/* Custom Roadmap Generator */}
                   <div className="flex flex-col md:flex-row justify-between items-center gap-4 glass-panel p-6 rounded-2xl border-comic border-white/20">
                      <div className="text-left">
                        <h3 className="text-xl font-bold text-white mb-1">Custom Action Plan</h3>
                        <p className="text-gray-400 text-sm">Select duration for a personalized week-by-week strategy.</p>
                      </div>
                      <div className="flex gap-4 items-center">
                        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
                           <span className="text-sm text-gray-300">Duration:</span>
                           <select 
                             value={roadmapDuration}
                             onChange={(e) => setRoadmapDuration(Number(e.target.value))}
                             className="bg-transparent text-[#FFD700] font-bold focus:outline-none cursor-pointer"
                           >
                             {[1, 2, 3, 4, 5, 6, 7, 8].map(w => (
                               <option key={w} value={w} className="bg-black text-white">{w} Weeks</option>
                             ))}
                           </select>
                        </div>
                        <Button onClick={handleGenerateRoadmap} disabled={isGeneratingRoadmap} variant="primary" className="py-2 px-6">
                          {isGeneratingRoadmap ? <Loader2 className="animate-spin" size={18}/> : 'Generate Plan'}
                        </Button>
                      </div>
                   </div>

                   {/* Roadmap Timeline */}
                   <div className="space-y-12">
                     {currentRoadmap?.map((week, idx) => (
                       <div key={idx} className="relative group">
                         <div className="absolute left-[19px] top-12 bottom-[-48px] w-0.5 bg-gradient-to-b from-[#FFD700] to-transparent hidden md:block group-last:hidden"></div>
                         
                         <div className="md:pl-16 relative">
                            {/* Week Badge */}
                            <div className="hidden md:flex absolute left-0 top-0 w-10 h-10 rounded-full bg-[#FFD700] text-black font-black items-center justify-center z-10 shadow-[0_0_20px_rgba(255,215,0,0.5)]">
                              {idx + 1}
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
                              <h3 className="text-3xl font-bold text-white"><span className="md:hidden text-[#FFD700] mr-2">#{idx+1}</span>{week.theme}</h3>
                              <div className="h-px bg-white/10 flex-grow hidden md:block"></div>
                            </div>
                            
                            <div className="grid lg:grid-cols-2 gap-8">
                              <Card title="Daily Protocol" className="h-full bg-white/5 border-comic border-white/10">
                                <ul className="space-y-5">
                                  {week.daily_tasks.map((task: string, tIdx: number) => (
                                    <li key={tIdx} className="flex gap-4 text-sm text-gray-300 group/item hover:text-white transition-colors">
                                      <div className="mt-0.5 w-5 h-5 rounded border border-gray-600 flex items-center justify-center group-hover/item:border-[#FFD700] transition-colors cursor-pointer">
                                        <div className="w-3 h-3 bg-[#FFD700] rounded-sm opacity-0 group-active/item:opacity-100 transition-opacity"></div>
                                      </div>
                                      <span className="leading-relaxed">{task}</span>
                                    </li>
                                  ))}
                                </ul>
                              </Card>
                              
                              <div className="space-y-8">
                                <Card title="Curated Resources" accent="turquoise" className="border-comic border-[#00E3FF]/20">
                                  <ul className="space-y-3">
                                    {week.resources.map((res: string, rIdx: number) => (
                                      <li key={rIdx}>
                                        <a 
                                          href={`https://www.google.com/search?q=${encodeURIComponent(res)}`} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-[#00E3FF]/10 border border-transparent hover:border-[#00E3FF]/30 transition-all group/link"
                                        >
                                          <Search size={16} className="text-[#00E3FF]" />
                                          <span className="text-sm font-medium text-gray-200 group-hover/link:text-white flex-grow">{res}</span>
                                          <ExternalLink size={14} className="opacity-0 group-hover/link:opacity-100 text-[#00E3FF] transition-opacity" />
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                </Card>
                                
                                <Card title="Key Deliverables" accent="none" className="bg-gradient-to-br from-white/5 to-transparent border-white/10">
                                  <ul className="space-y-3">
                                    {week.deliverables.map((del: string, dIdx: number) => (
                                      <li key={dIdx} className="text-sm text-white font-medium flex items-center gap-3">
                                        <div className="p-1.5 rounded-full bg-[#FFD700]/20">
                                           <Target size={14} className="text-[#FFD700]" />
                                        </div>
                                        {del}
                                      </li>
                                    ))}
                                  </ul>
                                </Card>
                              </div>
                            </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
             </motion.div>
           </AnimatePresence>
        </div>
        <ChatWidget />
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-[#FFD700] selection:text-black">
      {view === ViewState.LANDING && renderLanding()}
      {view === ViewState.INPUT && renderInput()}
      {view === ViewState.PROCESSING && renderProcessing()}
      {view === ViewState.ERROR && renderError()}
      {view === ViewState.DASHBOARD && renderDashboard()}
    </div>
  );
}

export default App;