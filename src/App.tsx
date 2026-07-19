import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  HelpCircle, 
  Compass, 
  Plus, 
  Info, 
  BookOpen, 
  Activity, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  GitCommit,
  Award,
  Flame,
  Layers
} from 'lucide-react';
import { Program, RoadmapPath, RoadmapNode, Challenge, AppTheme, AppMode, AppTab, TodoItem } from './types';
import { loadPrograms, savePrograms, loadChallenges, saveChallenges, loadTodos, saveTodos, DecryptedBackup } from './utils/localStorage';
import { INITIAL_PROGRAMS } from './data/initialData';
import Header from './components/Header';
import Flowchart from './components/Flowchart';
import ChallengesTracker from './components/ChallengesTracker';
import Login from './components/Login';
import MindMap from './components/MindMap';
import DailyTodos from './components/DailyTodos';
import ProgramsOverview from './components/ProgramsOverview';

const THEME_CLASSES: Record<AppTheme, string> = {
  'cyber-gradient': 'from-indigo-950 via-slate-900 to-purple-950',
  'forest-zen': 'from-emerald-950 via-zinc-900 to-teal-950',
  'sunset-glow': 'from-slate-950 via-purple-950 to-orange-950/40',
  'royal-classic': 'from-blue-950 via-slate-900 to-indigo-950',
  'midnight-deep': 'from-black via-neutral-950 to-zinc-900',
  'light-emerald': 'from-[#fcfdfc] via-[#f1fcf5] to-[#e8f7ee]',
  'light-royal': 'from-[#f9fbfe] via-[#f0f4f9] to-[#e6ecf5]',
  'light-warm': 'from-[#fffdfa] via-[#fdf7f0] to-[#f8eee0]',
};

export default function App() {
  // Auth State
  const [currentUser, setCurrentUser] = useState<{ username: string; role: 'admin' | 'user' } | null>(null);

  // App Settings
  const [theme, setTheme] = useState<AppTheme>('cyber-gradient');
  const [mode, setMode] = useState<AppMode>('advanced');
  const [activeTab, setActiveTab] = useState<AppTab>('daily-todos');

  // Isolated Data State
  const [programs, setPrograms] = useState<Program[]>([]);
  const [activeProgramId, setActiveProgramId] = useState<string>('');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [todos, setTodos] = useState<TodoItem[]>([]);

  // 1. Initial login restoration check from session
  useEffect(() => {
    const savedUser = sessionStorage.getItem('roadmap_planner_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
      } catch {
        // Clear corrupt state
        sessionStorage.removeItem('roadmap_planner_user');
      }
    }

    const savedTheme = localStorage.getItem('roadmap_planner_theme') as AppTheme;
    if (savedTheme) {
      setTheme(savedTheme);
    }

    const savedMode = localStorage.getItem('roadmap_planner_mode') as AppMode;
    if (savedMode) {
      setMode(savedMode);
    }
  }, []);

  // 2. Load user-specific data upon successful login
  useEffect(() => {
    if (currentUser) {
      const userPrograms = loadPrograms(currentUser.username);
      setPrograms(userPrograms);
      if (userPrograms.length > 0) {
        setActiveProgramId(userPrograms[0].id);
      } else {
        setActiveProgramId('');
      }

      const userChallenges = loadChallenges(currentUser.username);
      setChallenges(userChallenges);

      const userTodos = loadTodos(currentUser.username);
      setTodos(userTodos);
    } else {
      setPrograms([]);
      setActiveProgramId('');
      setChallenges([]);
      setTodos([]);
    }
  }, [currentUser]);

  // Handle Login Success
  const handleLoginSuccess = (username: string, role: 'admin' | 'user') => {
    const user = { username, role };
    sessionStorage.setItem('roadmap_planner_user', JSON.stringify(user));
    setCurrentUser(user);
  };

  // Handle Logout
  const handleLogout = () => {
    sessionStorage.removeItem('roadmap_planner_user');
    setCurrentUser(null);
    setActiveTab('daily-todos');
  };

  // Sync Programs on Edit
  const handleUpdateProgramsList = (updatedList: Program[]) => {
    if (!currentUser) return;
    setPrograms(updatedList);
    savePrograms(updatedList, currentUser.username);
  };

  // Sync Challenges on Edit
  const handleUpdateChallengesList = (updatedList: Challenge[]) => {
    if (!currentUser) return;
    setChallenges(updatedList);
    saveChallenges(updatedList, currentUser.username);
  };

  // Sync Todos on Edit
  const handleUpdateTodosList = (updatedList: TodoItem[]) => {
    if (!currentUser) return;
    setTodos(updatedList);
    saveTodos(updatedList, currentUser.username);
  };

  const handleAddProgram = (title: string, description: string) => {
    const newProg: Program = {
      id: `prog-${Date.now()}`,
      title,
      description,
      paths: [],
      createdAt: new Date().toISOString()
    };
    const updated = [...programs, newProg];
    handleUpdateProgramsList(updated);
    setActiveProgramId(newProg.id);
  };

  const handleUpdateProgram = (updatedProgram: Program) => {
    const updated = programs.map(p => p.id === updatedProgram.id ? updatedProgram : p);
    handleUpdateProgramsList(updated);
  };

  const handleUpdateProgramTitleDesc = (id: string, title: string, description: string) => {
    const updated = programs.map(p => p.id === id ? { ...p, title, description } : p);
    handleUpdateProgramsList(updated);
  };

  const handleDeleteProgram = (id: string) => {
    const updated = programs.filter(p => p.id !== id);
    handleUpdateProgramsList(updated);
    if (updated.length > 0) {
      setActiveProgramId(updated[0].id);
    } else {
      const fallbackProg: Program = {
        id: `prog-${Date.now()}`,
        title: 'برنامه جامع جدید',
        description: 'برنامه پیش‌فرض شما برای شروع سریع',
        paths: [],
        createdAt: new Date().toISOString()
      };
      handleUpdateProgramsList([fallbackProg]);
      setActiveProgramId(fallbackProg.id);
    }
  };

  const handleRestoreBackup = (backup: DecryptedBackup) => {
    if (backup.programs && backup.programs.length > 0) {
      handleUpdateProgramsList(backup.programs);
      setActiveProgramId(backup.programs[0].id);
    }
    if (backup.challenges) {
      handleUpdateChallengesList(backup.challenges);
    }
    if (backup.todos) {
      handleUpdateTodosList(backup.todos);
    }
  };

  const handleResetToDefaults = () => {
    handleUpdateProgramsList(INITIAL_PROGRAMS);
    if (INITIAL_PROGRAMS.length > 0) {
      setActiveProgramId(INITIAL_PROGRAMS[0].id);
    }
    
    // Reset to default challenges too
    if (currentUser) {
      const defaultChallenges = [
        {
          id: 'chal-1',
          title: 'چالش ۳۰ روزه یادگیری و کدنویسی مستمر',
          durationDays: 30,
          completedDays: [1, 2, 3, 4, 5, 8, 9, 10, 11, 12, 15, 16],
          createdAt: new Date().toISOString()
        },
        {
          id: 'chal-2',
          title: 'عادت سحرخیزی (بیداری قبل از ۷ صبح)',
          durationDays: 15,
          completedDays: [1, 2, 3, 5, 6, 7, 10],
          createdAt: new Date().toISOString()
        }
      ];
      handleUpdateChallengesList(defaultChallenges);
    }
  };

  const handleThemeChange = (newTheme: AppTheme) => {
    setTheme(newTheme);
    localStorage.setItem('roadmap_planner_theme', newTheme);
  };

  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode);
    localStorage.setItem('roadmap_planner_mode', newMode);
  };

  // If not logged in, show Login Screen
  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const activeProgram = programs.find(p => p.id === activeProgramId) || programs[0];

  // Calculate statistics for active program
  const getStats = () => {
    if (!activeProgram) return { pathsCount: 0, totalNodes: 0, completedNodes: 0, pendingNodes: 0 };
    
    let totalNodes = 0;
    let completedNodes = 0;
    let pendingNodes = 0;

    activeProgram.paths.forEach(p => {
      p.nodes.forEach(n => {
        totalNodes++;
        if (n.status === 'COMPLETED') completedNodes++;
        else pendingNodes++;
      });
    });

    return {
      pathsCount: activeProgram.paths.length,
      totalNodes,
      completedNodes,
      pendingNodes
    };
  };

  const stats = getStats();

  const isLight = theme.startsWith('light-');

  return (
    <div 
      className={`min-h-screen bg-gradient-to-br ${THEME_CLASSES[theme]} ${isLight ? 'text-slate-800' : 'text-slate-100'} font-sans antialiased selection:bg-emerald-500 selection:text-white pb-24 transition-all duration-300`} 
      dir="rtl"
    >
      
      {/* Background radial overlays */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-teal-500/5 blur-[150px]" />
      </div>

      {/* Header Container */}
      <Header 
        programs={programs}
        challenges={challenges}
        todos={todos}
        activeProgramId={activeProgramId}
        username={currentUser.username}
        activeTheme={theme}
        activeMode={mode}
        activeTab={activeTab}
        onSelectProgram={setActiveProgramId}
        onAddProgram={handleAddProgram}
        onUpdateProgramTitleDesc={handleUpdateProgramTitleDesc}
        onDeleteProgram={handleDeleteProgram}
        onRestoreBackup={handleRestoreBackup}
        onResetToDefaults={handleResetToDefaults}
        onThemeChange={handleThemeChange}
        onModeChange={handleModeChange}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />

      {/* Main Content Stage */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Render Tab based on state */}
        {activeTab === 'programs-overview' ? (
          <ProgramsOverview
            programs={programs}
            activeTheme={theme}
            onSelectProgram={setActiveProgramId}
            onTabChange={setActiveTab}
          />
        ) : activeTab === 'daily-todos' ? (
          <DailyTodos todos={todos} onUpdateTodos={handleUpdateTodosList} isLight={isLight} />
        ) : activeTab === 'roadmap' ? (
          <>
            {/* Welcome Intro Message Banner */}
            <div className={`p-5 ${isLight ? 'bg-white border-slate-200 text-slate-800 shadow-md' : 'bg-slate-900/60 border-slate-850 text-slate-100'} border rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300`}>
              <div className="flex items-start gap-3">
                <div className={`p-2.5 ${isLight ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-indigo-950/80 text-indigo-400 border-indigo-900/40'} rounded-2xl border shrink-0`}>
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>به راهنمای جامع سیر برنامه‌ریزی بلندمدت خوش آمدید!</h3>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-0.5 leading-relaxed`}>
                    این سامانه به شما کمک می‌کند برنامه‌های کلان زندگی را به سیرها (شاخه‌ها)، گام‌های اصلی و زیرمجموعه‌های جزئی تقسیم و پیشرفت آن‌ها را رصد کنید.
                  </p>
                </div>
              </div>
              <div className={`flex items-center gap-2 ${isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-950/60 border-slate-800 text-slate-300'} py-1.5 px-3 rounded-xl border text-[10px] font-semibold shrink-0`}>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>داده‌های حساب {currentUser.username} ذخیره شد</span>
              </div>
            </div>

            {/* Quick Stats bar & Core Flowchart / Mind Map based on Mode */}
            {mode === 'diagram' ? (
              <MindMap 
                programs={programs}
                activeProgramId={activeProgramId}
                onUpdateProgram={handleUpdateProgram}
                onAddProgram={handleAddProgram}
                isLight={isLight}
              />
            ) : (
              <>
                {/* Quick Stats bar */}
                {activeProgram && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className={`${isLight ? 'bg-white border-slate-200 text-slate-800 shadow-sm' : 'bg-slate-900/70 border-slate-850'} border p-4 rounded-2xl flex items-center justify-between transition-all duration-300`}>
                      <div>
                        <p className={`text-[10px] ${isLight ? 'text-slate-500 font-bold' : 'text-slate-400 font-bold'}`}>تعداد سیرها (شاخه‌ها)</p>
                        <p className={`text-lg font-black ${isLight ? 'text-slate-900' : 'text-white'} mt-1`}>{stats.pathsCount}</p>
                      </div>
                      <div className={`p-2 ${isLight ? 'bg-slate-100 text-emerald-600 border-slate-200' : 'bg-slate-950 text-indigo-400 border-slate-800'} rounded-xl border`}>
                        <GitBranch className="w-5 h-5" />
                      </div>
                    </div>

                    <div className={`${isLight ? 'bg-white border-slate-200 text-slate-800 shadow-sm' : 'bg-slate-900/70 border-slate-850'} border p-4 rounded-2xl flex items-center justify-between transition-all duration-300`}>
                      <div>
                        <p className={`text-[10px] ${isLight ? 'text-slate-500 font-bold' : 'text-slate-400 font-bold'}`}>کل گام‌های برنامه‌ریزی</p>
                        <p className={`text-lg font-black ${isLight ? 'text-slate-900' : 'text-white'} mt-1`}>{stats.totalNodes}</p>
                      </div>
                      <div className={`p-2 ${isLight ? 'bg-slate-100 text-sky-600 border-slate-200' : 'bg-slate-950 text-sky-400 border-slate-800'} rounded-xl border`}>
                        <GitCommit className="w-5 h-5" />
                      </div>
                    </div>

                    <div className={`${isLight ? 'bg-white border-slate-200 text-slate-800 shadow-sm' : 'bg-slate-900/70 border-slate-850'} border p-4 rounded-2xl flex items-center justify-between transition-all duration-300`}>
                      <div>
                        <p className={`text-[10px] ${isLight ? 'text-slate-500 font-bold' : 'text-slate-400 font-bold'}`}>گام‌های تکمیل‌شده</p>
                        <p className="text-lg font-black text-emerald-600 mt-1">{stats.completedNodes}</p>
                      </div>
                      <div className={`p-2 ${isLight ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-950 text-emerald-400 border-slate-800'} rounded-xl border`}>
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    </div>

                    <div className={`${isLight ? 'bg-white border-slate-200 text-slate-800 shadow-sm' : 'bg-slate-900/70 border-slate-850'} border p-4 rounded-2xl flex items-center justify-between transition-all duration-300`}>
                      <div>
                        <p className={`text-[10px] ${isLight ? 'text-slate-500 font-bold' : 'text-slate-400 font-bold'}`}>در حال اقدام یا تعلیق</p>
                        <p className="text-lg font-black text-amber-600 mt-1">{stats.pendingNodes}</p>
                      </div>
                      <div className={`p-2 ${isLight ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-950 text-amber-400 border-slate-800'} rounded-xl border`}>
                        <Activity className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Core Flowchart */}
                {activeProgram ? (
                  <Flowchart 
                    program={activeProgram}
                    mode={mode}
                    onUpdateProgram={handleUpdateProgram}
                    isLight={isLight}
                  />
                ) : (
                  <div className="text-center py-20 bg-slate-900/40 border border-slate-850 rounded-3xl space-y-4">
                    <Compass className="w-10 h-10 text-slate-650 mx-auto animate-spin-slow" />
                    <p className="text-xs text-slate-400">یک برنامه جامع جدید بسازید تا فلوچارت آن آماده شود.</p>
                    <button
                      onClick={() => handleAddProgram('برنامه توسعه جدید', 'برنامه‌ریزی برای سیر رشد و توسعه فردی')}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold"
                    >
                      ایجاد یک برنامه پیش‌فرض
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <ChallengesTracker 
            challenges={challenges}
            onUpdateChallenges={handleUpdateChallengesList}
            isLight={isLight}
          />
        )}

        {/* Technical Guide Info Panel */}
        <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-3xl space-y-4">
          <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-400" />
            راهنمای کاربری و ویژگی‌های فنی سامانه:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[11px] text-slate-400 leading-relaxed">
            <div className="space-y-1">
              <h5 className="font-bold text-slate-300">الگوریتم سلسله‌مراتبی:</h5>
              <p>هر برنامه بزرگ شامل چندین **سیر مستقل** است. هر سیر گام‌های متوالی دارد که به هم متصل‌اند و هر گام اصلی می‌تواند چندین **زیرمجموعه (فرعی)** مستقل داشته باشد.</p>
            </div>
            <div className="space-y-1">
              <h5 className="font-bold text-slate-300">سیستم نوین عادتی (چالش‌ها):</h5>
              <p>شما می‌توانید عادت‌های ۱۵ روزه، ۳۰ روزه یا دلخواه تعریف کنید. با زدن تیک روزها در تقویم هر چالش، درصد پایبندی شما ارتقا یافته و آمار کل برای شما تحلیل می‌شود.</p>
            </div>
            <div className="space-y-1">
              <h5 className="font-bold text-slate-300">تفکیک کامل کاربران (لوکال):</h5>
              <p>برنامه‌ها، پوسته‌ها و عادت‌های شما بر اساس حساب ورودی کاملاً از هم منفک شده‌اند. داده‌های کاربر Mo با داده‌های Sadeghho همپوشانی ندارند.</p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
