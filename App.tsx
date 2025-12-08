import React, { useState, useEffect } from 'react';
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
  BarChart2,
  Search
} from 'lucide-react';
import { Button } from './components/Button';
import { Card } from './components/Card';
import { CircularProgress } from './components/ProgressBar';
import { analyzeCareer } from './services/geminiService';
import { extractTextFromPDF } from './services/pdfService';
import { CareerPixelResponse, ViewState } from './types';

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
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setResumeText(text);
      };
      reader.readAsText(file);
    }
  };

  const LiquidBackground = () => (
    <>
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 bg-black">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#00E3FF] rounded-full mix-blend-screen opacity-20 blur-[120px] animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#FFD700] rounded-full mix-blend-screen opacity-10 blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute top-[40%] left-[40%] w-[40%] h-[40%] bg-purple-600 rounded-full mix-blend-screen opacity-10 blur-[120px] animate-blob animation-delay-4000" />
      </div>
    </>
  );

  // --- Views ---

  const renderLanding = () => (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden p-6 text-center">
      <LiquidBackground />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-5xl mx-auto space-y-10 relative z-10"
      >
        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full glass-panel border border-white/20 text-sm font-medium tracking-wide mb-4">
          <Sparkles size={14} className="text-[#FFD700]" />
          <span className="text-gray-200">AI-Powered Career Intelligence v2.5</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[1] text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 drop-shadow-2xl">
          Career<span className="text-[#FFD700]">Pixel</span>
        </h1>
        
        <p className="text-2xl md:text-3xl font-light text-gray-400 max-w-3xl mx-auto leading-relaxed">
          The <span className="text-[#00E3FF]">raw truth</span> about your resume.
          <br />
          The <span className="text-[#FFD700]">psychological map</span> to your dream job.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
          <Button onClick={() => setView(ViewState.INPUT)} className="w-full sm:w-auto text-lg px-12 py-5 shadow-[0_0_40px_-10px_rgba(255,215,0,0.5)]">
            Analyze My Profile
            <ChevronRight size={20} />
          </Button>
          <Button variant="glass" className="w-full sm:w-auto text-lg px-12 py-5" onClick={() => window.open('https://ai.google.dev/', '_blank')}>
            Powered by Gemini
          </Button>
        </div>
      </motion.div>
    </div>
  );

  const renderInput = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 max-w-6xl mx-auto relative">
      <LiquidBackground />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full grid md:grid-cols-2 gap-10"
      >
        <div className="space-y-6">
          <h2 className="text-5xl font-black tracking-tight text-white">Let's decode <br/> your DNA.</h2>
          <p className="text-xl text-gray-400 font-light">
            Upload your resume and tell us your wildest ambitions. 
            We'll handle the psychology.
          </p>
          
          <div className="glass-panel p-1 rounded-2xl">
            <div className="relative group">
              <textarea 
                value={isParsingPdf ? "Scanning document structure..." : resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                disabled={isParsingPdf}
                placeholder="Paste resume text or upload PDF..."
                className={`w-full h-80 bg-black/20 rounded-xl p-6 transition-all outline-none resize-none font-mono text-sm text-gray-300 placeholder-gray-600 focus:bg-black/40 ${isParsingPdf ? 'opacity-50' : ''}`}
              />
              <div className="absolute bottom-6 right-6">
                <label className={`cursor-pointer px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg hover:bg-white/20 transition-all flex items-center gap-2 text-xs font-medium border border-white/10 ${isParsingPdf ? 'pointer-events-none opacity-80' : ''}`}>
                  {isParsingPdf ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                  <span>{isParsingPdf ? 'Processing...' : 'Upload PDF'}</span>
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
           <div className="glass-panel p-1 rounded-2xl h-full flex flex-col">
             <div className="p-6 pb-2">
                <label className="block text-sm font-bold text-[#00E3FF] mb-2 uppercase tracking-wider">Your Ambitions</label>
             </div>
            <textarea 
              value={aspirations}
              onChange={(e) => setAspirations(e.target.value)}
              placeholder="Be specific. 'I want to lead product at a Series B Fintech' or 'I want to switch from Sales to Engineering'..."
              className="w-full flex-grow bg-transparent p-6 pt-0 outline-none resize-none text-lg text-gray-200 placeholder-gray-600 leading-relaxed"
            />
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
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative">
         <LiquidBackground />
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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto relative">
      <LiquidBackground />
      <div className="glass-panel p-8 rounded-3xl border border-red-500/30">
        <AlertTriangle className="text-red-500 mb-6 mx-auto" size={48} />
        <h2 className="text-3xl font-bold mb-4">Analysis Interrupted</h2>
        <p className="text-gray-400 mb-8 leading-relaxed">{errorMsg}</p>
        <Button onClick={() => setView(ViewState.INPUT)} variant="outline">Try Again</Button>
      </div>
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

    return (
      <div className="min-h-screen pb-20 relative">
        <LiquidBackground />
        
        {/* Header */}
        <header className="sticky top-0 z-50 glass-panel border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3 font-bold text-xl tracking-tight cursor-pointer" onClick={() => setView(ViewState.LANDING)}>
              <div className="w-10 h-10 bg-gradient-to-tr from-[#FFD700] to-orange-400 rounded-xl flex items-center justify-center text-black shadow-lg shadow-orange-500/20">CP</div>
              <span className="hidden md:block">CareerPixel</span>
            </div>
            <div className="flex items-center gap-6">
               <div className="hidden md:flex flex-col items-end">
                 <span className="text-sm font-bold text-white">{data?.parsed_data?.name || 'Anonymous User'}</span>
                 <span className="text-xs text-gray-400 uppercase tracking-wider">{data?.user_persona?.archetype || 'Explorer'}</span>
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
                    {/* Hero Identity */}
                    <Card className="lg:col-span-8" accent="gold" title="Identity Snapshot">
                      <h1 className="text-3xl md:text-5xl font-black mb-8 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                        {data?.user_persona?.headline || 'Your Career Identity'}
                      </h1>
                      <div className="glass-panel p-8 rounded-2xl bg-black/20 border border-white/5">
                        <p className="text-lg md:text-xl leading-relaxed text-gray-200 font-light italic">
                          "{data?.user_persona?.psych_profile || 'Analyzing personality...'}"
                        </p>
                      </div>
                    </Card>

                    {/* Archetype */}
                    <Card className="lg:col-span-4" accent="turquoise">
                      <div className="h-full flex flex-col items-center justify-center text-center p-4">
                        <div className="relative mb-6">
                           <div className="absolute inset-0 bg-[#00E3FF] blur-xl opacity-30 animate-pulse"></div>
                           <Brain className="text-[#00E3FF] relative z-10" size={64} />
                        </div>
                        <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-wide">{data?.user_persona?.archetype || 'Explorer'}</h2>
                        <div className="h-1 w-12 bg-[#00E3FF] rounded-full my-4"></div>
                        <p className="text-sm text-gray-400">Your decision-making patterns and writing style suggest this is your dominant professional DNA.</p>
                      </div>
                    </Card>

                    {/* Full SWOT */}
                    <div className="lg:col-span-12 grid md:grid-cols-2 gap-8">
                      <Card title="Internal Factors" className="h-full">
                        <div className="space-y-8">
                          <div>
                            <h4 className="text-[#00E3FF] font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                              <TrendingUp size={16}/> Strengths
                            </h4>
                            <div className="space-y-3">
                              {data?.swot_analysis?.strengths?.map((s, i) => (
                                <div key={i} className="flex gap-3 text-gray-300 bg-white/5 p-3 rounded-lg border border-white/5">
                                  <CheckCircle2 size={18} className="text-[#00E3FF] shrink-0 mt-0.5" />
                                  <span className="text-sm">{s}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-[#FFD700] font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                              <ShieldAlert size={16}/> Weaknesses
                            </h4>
                            <div className="space-y-3">
                              {data?.swot_analysis?.weaknesses?.map((s, i) => (
                                <div key={i} className="flex gap-3 text-gray-300 bg-white/5 p-3 rounded-lg border border-white/5">
                                  <AlertTriangle size={18} className="text-[#FFD700] shrink-0 mt-0.5" />
                                  <span className="text-sm">{s}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Card>

                      <Card title="External Factors" className="h-full" accent="none">
                        <div className="space-y-8">
                          <div>
                            <h4 className="text-green-400 font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                              <Target size={16}/> Opportunities
                            </h4>
                            <div className="space-y-3">
                              {data?.swot_analysis?.opportunities?.map((s, i) => (
                                <div key={i} className="flex gap-3 text-gray-300 bg-white/5 p-3 rounded-lg border border-white/5 hover:border-green-500/30 transition-colors">
                                  <Sparkles size={18} className="text-green-400 shrink-0 mt-0.5" />
                                  <span className="text-sm">{s}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-red-400 font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                              <Zap size={16}/> Threats
                            </h4>
                            <div className="space-y-3">
                              {data?.swot_analysis?.threats?.map((s, i) => (
                                <div key={i} className="flex gap-3 text-gray-300 bg-white/5 p-3 rounded-lg border border-white/5 hover:border-red-500/30 transition-colors">
                                  <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
                                  <span className="text-sm">{s}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                 </div>
               )}

               {activeTab === 'ATS' && (
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                   {/* Score Card */}
                   <div className="lg:col-span-4 space-y-8">
                      <Card className="flex flex-col items-center justify-center text-center py-12 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-b from-[#00E3FF]/10 to-transparent pointer-events-none"></div>
                          <CircularProgress 
                            percentage={data?.ats_audit?.score || 0} 
                            color={(data?.ats_audit?.score || 0) > 70 ? '#00E3FF' : '#FFD700'} 
                            size={160}
                            strokeWidth={12}
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
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <Card title="The Verdict" accent="turquoise">
                        <div className="flex flex-col justify-between h-full">
                          <div>
                             <h2 className="text-4xl font-black text-white mb-2">{data?.career_map?.best_fit_role}</h2>
                             <div className="flex items-center gap-3 mb-6">
                                <span className="text-3xl font-bold text-[#00E3FF]">{data?.career_map?.match_percentage}% Match</span>
                                <div className="h-px bg-white/20 flex-grow"></div>
                             </div>
                             <p className="text-gray-300 text-lg leading-relaxed">{data?.career_map?.why_it_fits}</p>
                          </div>
                        </div>
                     </Card>
                     
                     <div className="space-y-8">
                        <Card className="relative overflow-hidden">
                           <div className="absolute right-0 top-0 p-32 bg-[#FFD700] blur-[80px] opacity-10 rounded-full pointer-events-none"></div>
                           <p className="text-sm text-gray-500 mb-2 uppercase tracking-widest font-bold">Projected Market Value</p>
                           <h3 className="text-5xl font-black text-white">{data?.career_map?.salary_range}</h3>
                        </Card>

                        <Card title="Target Companies">
                          <div className="flex flex-wrap gap-3">
                              {data?.career_map?.top_companies?.map((co, i) => (
                                <div key={i} className="px-5 py-3 glass-panel rounded-xl font-bold text-gray-300 hover:bg-white hover:text-black transition-all cursor-pointer">
                                  {co}
                                </div>
                              ))}
                          </div>
                        </Card>
                     </div>
                   </div>

                   <div className="grid md:grid-cols-3 gap-8">
                     <Card title="Skill Bridge" className="md:col-span-1 border-t-4 border-t-red-500/50">
                        <ul className="space-y-3">
                          {data?.career_map?.gap_analysis?.skill_gaps?.map((g, i) => (
                            <li key={i} className="text-sm text-gray-300 flex items-start gap-3">
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2"/> {g}
                            </li>
                          ))}
                        </ul>
                     </Card>
                     <Card title="Experience Bridge" className="md:col-span-1 border-t-4 border-t-yellow-500/50">
                        <ul className="space-y-3">
                          {data?.career_map?.gap_analysis?.experience_gaps?.map((g, i) => (
                            <li key={i} className="text-sm text-gray-300 flex items-start gap-3">
                              <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2"/> {g}
                            </li>
                          ))}
                        </ul>
                     </Card>
                     <Card title="Project Bridge" className="md:col-span-1 border-t-4 border-t-blue-500/50">
                        <ul className="space-y-3">
                          {data?.career_map?.gap_analysis?.project_gaps?.map((g, i) => (
                            <li key={i} className="text-sm text-gray-300 flex items-start gap-3">
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"/> {g}
                            </li>
                          ))}
                        </ul>
                     </Card>
                   </div>
                 </div>
               )}

               {activeTab === 'ROADMAP' && (
                 <div className="space-y-12">
                   {data?.prep_roadmap?.map((week, idx) => (
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
                            <Card title="Daily Protocol" className="h-full bg-white/5">
                              <ul className="space-y-5">
                                {week.daily_tasks.map((task, tIdx) => (
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
                              <Card title="Curated Resources" accent="turquoise">
                                <ul className="space-y-3">
                                  {week.resources.map((res, rIdx) => (
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
                                  {week.deliverables.map((del, dIdx) => (
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
               )}
             </motion.div>
           </AnimatePresence>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-black text-white min-h-screen font-sans selection:bg-[#FFD700] selection:text-black overflow-x-hidden">
      {view === ViewState.LANDING && renderLanding()}
      {view === ViewState.INPUT && renderInput()}
      {view === ViewState.PROCESSING && renderProcessing()}
      {view === ViewState.ERROR && renderError()}
      {view === ViewState.DASHBOARD && renderDashboard()}
    </div>
  );
}

export default App;