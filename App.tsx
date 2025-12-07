import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Upload, 
  Target, 
  ChevronRight, 
  Sparkles, 
  Layout, 
  FileText, 
  Map, 
  ListTodo,
  AlertTriangle,
  CheckCircle2,
  Briefcase,
  TrendingUp,
  User,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { Button } from './components/Button';
import { Card } from './components/Card';
import { CircularProgress } from './components/ProgressBar';
import { analyzeCareer } from './services/geminiService';
import { extractTextFromPDF } from './services/pdfService';
import { CareerPixelResponse, ViewState } from './types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function App() {
  const [view, setView] = useState<ViewState>(ViewState.LANDING);
  const [resumeText, setResumeText] = useState('');
  const [aspirations, setAspirations] = useState('');
  const [loadingStep, setLoadingStep] = useState(0);
  const [data, setData] = useState<CareerPixelResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'PERSONA' | 'ATS' | 'MAP' | 'ROADMAP'>('PERSONA');
  const [isParsingPdf, setIsParsingPdf] = useState(false);

  const handleAnalyze = async () => {
    if (!resumeText.trim()) return;
    
    setView(ViewState.PROCESSING);
    
    // Simulate steps for UI effect while waiting for API
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev < 3 ? prev + 1 : prev));
    }, 1500);

    try {
      const result = await analyzeCareer(resumeText, aspirations);
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

    if (file.type === 'application/pdf') {
      setIsParsingPdf(true);
      try {
        const text = await extractTextFromPDF(file);
        setResumeText(text);
      } catch (error) {
        console.error("PDF Parse Error", error);
        alert("Failed to parse PDF. Please try copying text manually or upload a different file.");
      } finally {
        setIsParsingPdf(false);
      }
    } else {
      // Basic text reading for .txt or .md
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setResumeText(text);
      };
      reader.readAsText(file);
    }
  };

  // --- Views ---

  const renderLanding = () => (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden p-6 text-center">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(20,20,20,1)_0%,rgba(0,0,0,1)_100%)] -z-10" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FFD700] opacity-[0.03] rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00E3FF] opacity-[0.03] rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-[#FFD700] mb-4">
          <Sparkles size={16} />
          <span>AI-Powered Career Intelligence</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
          Reimagining Your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FFCD00]">Career</span> Through <span className="italic font-serif font-light text-[#00E3FF]">AI</span>
        </h1>

        <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Stop guessing. Get a psychological breakdown of your resume, 
          an unfiltered ATS audit, and a hyper-personalized roadmap.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Button onClick={() => setView(ViewState.INPUT)} className="w-full sm:w-auto text-lg px-10 py-4">
            Analyze My Career
            <ChevronRight size={20} />
          </Button>
          <Button variant="outline" className="w-full sm:w-auto text-lg px-10 py-4" onClick={() => window.open('https://ai.google.dev/', '_blank')}>
            Powered by Gemini
          </Button>
        </div>
      </motion.div>
    </div>
  );

  const renderInput = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 max-w-5xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full grid md:grid-cols-2 gap-12"
      >
        <div className="space-y-6">
          <h2 className="text-4xl font-bold">Tell us your story.</h2>
          <p className="text-gray-400">Upload your resume (PDF/TXT) or paste the raw text. Then, tell us where you actually want to go.</p>
          
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-300">Resume Content</label>
            <div className="relative group">
              <textarea 
                value={isParsingPdf ? "Extracting text from PDF..." : resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                disabled={isParsingPdf}
                placeholder="Paste your full resume text here..."
                className={`w-full h-64 bg-[#111] border border-white/10 rounded-xl p-4 focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] transition-all outline-none resize-none font-mono text-sm text-gray-300 ${isParsingPdf ? 'opacity-50 cursor-wait' : ''}`}
              />
              <div className="absolute top-4 right-4">
                <label className={`cursor-pointer p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2 text-xs ${isParsingPdf ? 'pointer-events-none opacity-80' : ''}`}>
                  {isParsingPdf ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                  <span>{isParsingPdf ? 'Parsing...' : 'Upload PDF'}</span>
                  <input 
                    type="file" 
                    accept=".pdf,.txt,.md" 
                    className="hidden" 
                    onChange={handleFileUpload}
                    disabled={isParsingPdf}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 flex flex-col justify-between">
           <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-300">Your Aspirations</label>
            <textarea 
              value={aspirations}
              onChange={(e) => setAspirations(e.target.value)}
              placeholder="I want to pivot into Product Management in Fintech... I love fast-paced environments... I want to earn $150k+..."
              className="w-full h-40 bg-[#111] border border-white/10 rounded-xl p-4 focus:border-[#00E3FF] focus:ring-1 focus:ring-[#00E3FF] transition-all outline-none resize-none text-sm text-gray-300"
            />
          </div>

          <div className="bg-[#111] p-6 rounded-xl border border-white/5">
             <h3 className="text-white font-bold mb-2 flex items-center gap-2">
               <Brain className="text-[#FFD700]" size={18} />
               How it works
             </h3>
             <ul className="text-sm text-gray-500 space-y-2">
               <li>• We extract your psychological profile from your writing style.</li>
               <li>• We match your skills against real-market demands.</li>
               <li>• We build a gap-analysis bridge to your dream role.</li>
             </ul>
          </div>

          <Button 
            onClick={handleAnalyze} 
            disabled={!resumeText.trim() || isParsingPdf}
            className="w-full py-4 text-lg"
          >
            Generate CareerPixel
          </Button>
        </div>
      </motion.div>
    </div>
  );

  const renderProcessing = () => {
    const steps = [
      "Deconstructing resume DNA...",
      "Analyzing psychological markers...",
      "Mapping market opportunities...",
      "Building your strategic roadmap..."
    ];

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
         <motion.div 
           animate={{ rotate: 360 }}
           transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
           className="w-24 h-24 border-t-4 border-[#FFD700] border-r-4 border-[#00E3FF] rounded-full mb-8 filter drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]"
         />
         <h2 className="text-2xl font-bold mb-2">Analyzing...</h2>
         <p className="text-[#00E3FF] font-mono animate-pulse">{steps[loadingStep]}</p>
      </div>
    );
  };

  const renderError = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
      <AlertTriangle className="text-red-500 mb-4" size={48} />
      <h2 className="text-2xl font-bold mb-4">Analysis Failed</h2>
      <p className="text-gray-400 mb-8">{errorMsg}</p>
      <Button onClick={() => setView(ViewState.INPUT)}>Try Again</Button>
    </div>
  );

  const renderDashboard = () => {
    if (!data) return null;

    const tabs = [
      { id: 'PERSONA', icon: User, label: 'Persona' },
      { id: 'ATS', icon: FileText, label: 'ATS Score' },
      { id: 'MAP', icon: Map, label: 'Career Map' },
      { id: 'ROADMAP', icon: ListTodo, label: 'Roadmap' },
    ];

    return (
      <div className="min-h-screen bg-black pb-20">
        {/* Header */}
        <header className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xl">
              <div className="w-8 h-8 bg-gradient-to-br from-[#FFD700] to-orange-500 rounded-lg flex items-center justify-center text-black">CP</div>
              CareerPixel
            </div>
            <div className="flex items-center gap-4">
               <div className="hidden md:block text-sm text-gray-400">{data.parsed_data.name || 'User'}</div>
               <div className="w-8 h-8 rounded-full bg-gray-800 border border-white/10" />
            </div>
          </div>
        </header>

        {/* Navigation */}
        <div className="max-w-7xl mx-auto px-6 py-8">
           <div className="flex overflow-x-auto gap-4 pb-4 border-b border-white/10 mb-8 no-scrollbar">
             {tabs.map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id as any)}
                 className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                   activeTab === tab.id 
                     ? 'bg-white text-black' 
                     : 'bg-[#111] text-gray-400 hover:text-white border border-white/5'
                 }`}
               >
                 <tab.icon size={16} />
                 {tab.label}
               </button>
             ))}
           </div>

           <AnimatePresence mode="wait">
             <motion.div
               key={activeTab}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.2 }}
             >
               {activeTab === 'PERSONA' && (
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-2" accent="gold" title="Identity Snapshot">
                      <h1 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">
                        {data.user_persona.headline}
                      </h1>
                      <div className="prose prose-invert max-w-none text-gray-300">
                        <p className="text-lg leading-relaxed border-l-2 border-[#FFD700] pl-6 italic">
                          "{data.user_persona.psych_profile}"
                        </p>
                      </div>
                    </Card>
                    <Card accent="turquoise" title="Your Archetype">
                      <div className="h-full flex flex-col items-center justify-center text-center p-6">
                        <div className="w-24 h-24 bg-[#00E3FF]/10 rounded-full flex items-center justify-center mb-6">
                          <Brain className="text-[#00E3FF]" size={40} />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">{data.user_persona.archetype}</h2>
                        <p className="text-sm text-gray-400">Based on your decision patterns and writing style.</p>
                      </div>
                    </Card>
                    <Card title="Strengths & Weaknesses (SWOT)" className="lg:col-span-3">
                      <div className="grid md:grid-cols-2 gap-8">
                        <div>
                           <h4 className="text-[#00E3FF] font-bold mb-4 flex items-center gap-2"><TrendingUp size={16}/> Strengths</h4>
                           <ul className="space-y-3">
                             {data.swot_analysis.strengths.map((s, i) => (
                               <li key={i} className="flex items-start gap-3 bg-[#1A1A1A] p-3 rounded-lg text-sm text-gray-300">
                                 <CheckCircle2 size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                                 {s}
                               </li>
                             ))}
                           </ul>
                        </div>
                        <div>
                           <h4 className="text-[#FFD700] font-bold mb-4 flex items-center gap-2"><ShieldAlert size={16}/> Weaknesses</h4>
                           <ul className="space-y-3">
                             {data.swot_analysis.weaknesses.map((s, i) => (
                               <li key={i} className="flex items-start gap-3 bg-[#1A1A1A] p-3 rounded-lg text-sm text-gray-300">
                                 <AlertTriangle size={16} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                                 {s}
                               </li>
                             ))}
                           </ul>
                        </div>
                      </div>
                    </Card>
                 </div>
               )}

               {activeTab === 'ATS' && (
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   <Card className="flex flex-col items-center justify-center text-center py-12">
                      <CircularProgress percentage={data.ats_audit.score} color={data.ats_audit.score > 70 ? '#00E3FF' : '#FFD700'} />
                      <h3 className="text-2xl font-bold mt-6">{data.ats_audit.verdict}</h3>
                      <p className="text-gray-400 text-sm mt-2">ATS Readiness Score</p>
                   </Card>
                   
                   <Card title="Critical Fixes" className="lg:col-span-2" accent="gold">
                     <div className="space-y-4">
                       {data.ats_audit.critical_fixes.map((fix, i) => (
                         <div key={i} className="flex gap-4 p-4 bg-[#1A1A1A] rounded-xl border-l-2 border-red-500">
                           <div className="font-bold text-red-500">0{i+1}</div>
                           <p className="text-gray-300 text-sm">{fix}</p>
                         </div>
                       ))}
                     </div>
                   </Card>

                   <Card title="Missing Keywords" className="lg:col-span-3">
                     <div className="flex flex-wrap gap-3">
                       {data.ats_audit.keyword_gaps.map((kw, i) => (
                         <span key={i} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm hover:border-[#FFD700] transition-colors cursor-default">
                           {kw}
                         </span>
                       ))}
                     </div>
                   </Card>
                 </div>
               )}

               {activeTab === 'MAP' && (
                 <div className="space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <Card title="Best Fit Role" accent="turquoise">
                        <div className="flex items-end gap-4 mb-4">
                          <h2 className="text-3xl font-bold text-white">{data.career_map.best_fit_role}</h2>
                          <span className="text-2xl font-bold text-[#00E3FF]">{data.career_map.match_percentage}% Match</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">{data.career_map.why_it_fits}</p>
                     </Card>
                     <Card title="Market Value">
                        <div className="h-40 flex items-center justify-center">
                          <div className="text-center">
                            <p className="text-sm text-gray-500 mb-2">Estimated Salary Range</p>
                            <h3 className="text-4xl font-bold text-[#FFD700]">{data.career_map.salary_range}</h3>
                          </div>
                        </div>
                     </Card>
                   </div>
                   
                   <Card title="Target Companies">
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {data.career_map.top_companies.map((co, i) => (
                          <div key={i} className="p-4 bg-[#1A1A1A] rounded-lg text-center font-bold text-gray-300 border border-white/5 hover:border-white/20 transition-all">
                            {co}
                          </div>
                        ))}
                     </div>
                   </Card>

                   <div className="grid md:grid-cols-3 gap-8">
                     <Card title="Skill Gaps" className="md:col-span-1">
                        <ul className="space-y-2">
                          {data.career_map.gap_analysis.skill_gaps.map((g, i) => (
                            <li key={i} className="text-sm text-gray-400 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"/> {g}
                            </li>
                          ))}
                        </ul>
                     </Card>
                     <Card title="Experience Gaps" className="md:col-span-1">
                        <ul className="space-y-2">
                          {data.career_map.gap_analysis.experience_gaps.map((g, i) => (
                            <li key={i} className="text-sm text-gray-400 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"/> {g}
                            </li>
                          ))}
                        </ul>
                     </Card>
                     <Card title="Project Gaps" className="md:col-span-1">
                        <ul className="space-y-2">
                          {data.career_map.gap_analysis.project_gaps.map((g, i) => (
                            <li key={i} className="text-sm text-gray-400 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"/> {g}
                            </li>
                          ))}
                        </ul>
                     </Card>
                   </div>
                 </div>
               )}

               {activeTab === 'ROADMAP' && (
                 <div className="space-y-12">
                   {data.prep_roadmap.map((week, idx) => (
                     <div key={idx} className="relative">
                       <div className="absolute left-0 top-0 bottom-0 w-px bg-white/10 ml-4 hidden md:block"></div>
                       <div className="md:pl-12">
                          <div className="flex items-center gap-4 mb-6">
                            <div className="w-8 h-8 rounded-full bg-[#FFD700] text-black font-bold flex items-center justify-center shrink-0 z-10">
                              {idx + 1}
                            </div>
                            <h3 className="text-2xl font-bold">{week.theme}</h3>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-6">
                            <Card title="Daily Protocol" className="bg-[#0A0A0A]">
                              <ul className="space-y-4">
                                {week.daily_tasks.map((task, tIdx) => (
                                  <li key={tIdx} className="flex gap-3 text-sm text-gray-300">
                                    <input type="checkbox" className="mt-1 rounded border-gray-600 bg-transparent text-[#FFD700] focus:ring-[#FFD700]" />
                                    <span>{task}</span>
                                  </li>
                                ))}
                              </ul>
                            </Card>
                            <div className="space-y-6">
                              <Card title="Resources" accent="turquoise">
                                <ul className="space-y-2">
                                  {week.resources.map((res, rIdx) => (
                                    <li key={rIdx} className="text-sm text-[#00E3FF] underline decoration-white/20 underline-offset-4 cursor-pointer hover:decoration-[#00E3FF]">
                                      {res}
                                    </li>
                                  ))}
                                </ul>
                              </Card>
                              <Card title="Deliverables">
                                <ul className="space-y-2">
                                  {week.deliverables.map((del, dIdx) => (
                                    <li key={dIdx} className="text-sm text-white font-medium flex items-center gap-2">
                                      <Target size={14} className="text-[#FFD700]" />
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
               )}
             </motion.div>
           </AnimatePresence>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-black text-white min-h-screen font-sans selection:bg-[#FFD700] selection:text-black">
      {view === ViewState.LANDING && renderLanding()}
      {view === ViewState.INPUT && renderInput()}
      {view === ViewState.PROCESSING && renderProcessing()}
      {view === ViewState.ERROR && renderError()}
      {view === ViewState.DASHBOARD && renderDashboard()}
    </div>
  );
}

export default App;