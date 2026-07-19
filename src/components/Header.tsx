import React, { useRef, useState } from 'react';
import { 
  FolderPlus, 
  Download, 
  Upload, 
  RefreshCw, 
  ChevronDown, 
  Plus, 
  Compass, 
  LogOut,
  Palette,
  Sliders,
  Calendar,
  Layers,
  Sparkles,
  Award,
  Edit3,
  Trash2,
  CheckSquare,
  LayoutGrid
} from 'lucide-react';
import { Program, AppTheme, AppMode, Challenge, AppTab, TodoItem } from '../types';
import { downloadBackup, parseBackupFile, DecryptedBackup } from '../utils/localStorage';

interface HeaderProps {
  programs: Program[];
  challenges: Challenge[];
  todos: TodoItem[];
  activeProgramId: string;
  username: string;
  activeTheme: AppTheme;
  activeMode: AppMode;
  activeTab: AppTab;
  onSelectProgram: (id: string) => void;
  onAddProgram: (title: string, description: string) => void;
  onUpdateProgramTitleDesc?: (id: string, title: string, description: string) => void;
  onDeleteProgram?: (id: string) => void;
  onRestoreBackup: (backup: DecryptedBackup) => void;
  onResetToDefaults: () => void;
  onThemeChange: (theme: AppTheme) => void;
  onModeChange: (mode: AppMode) => void;
  onTabChange: (tab: AppTab) => void;
  onLogout: () => void;
}

const THEME_OPTIONS: { value: AppTheme; label: string; colorClass: string }[] = [
  { value: 'cyber-gradient', label: 'سایبر گرادینت', colorClass: 'from-indigo-600 to-purple-600' },
  { value: 'forest-zen', label: 'جنگل آرامش', colorClass: 'from-emerald-600 to-teal-700' },
  { value: 'sunset-glow', label: 'غروب درخشان', colorClass: 'from-rose-600 to-amber-500' },
  { value: 'royal-classic', label: 'آبی سلطنتی', colorClass: 'from-blue-700 to-indigo-800' },
  { value: 'midnight-deep', label: 'نصف‌شب تاریک', colorClass: 'from-slate-900 to-black' },
  { value: 'light-emerald', label: 'زمرد روشن (سفید/سبز)', colorClass: 'from-emerald-400 to-emerald-600' },
  { value: 'light-royal', label: 'آبی کلاسیک روشن', colorClass: 'from-blue-400 to-indigo-600' },
  { value: 'light-warm', label: 'شکلاتی و گرم روشن', colorClass: 'from-amber-400 to-orange-500' },
];

export default function Header({
  programs,
  challenges,
  todos,
  activeProgramId,
  username,
  activeTheme,
  activeMode,
  activeTab,
  onSelectProgram,
  onAddProgram,
  onUpdateProgramTitleDesc,
  onDeleteProgram,
  onRestoreBackup,
  onResetToDefaults,
  onThemeChange,
  onModeChange,
  onTabChange,
  onLogout
}: HeaderProps) {
  const [showProgramDropdown, setShowProgramDropdown] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [showAddProgramModal, setShowAddProgramModal] = useState(false);
  const [newProgramTitle, setNewProgramTitle] = useState('');
  const [newProgramDesc, setNewProgramDesc] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Program Editing States
  const [showEditProgramModal, setShowEditProgramModal] = useState(false);
  const [editProgramTitle, setEditProgramTitle] = useState('');
  const [editProgramDesc, setEditProgramDesc] = useState('');
  const [showDeleteProgramConfirm, setShowDeleteProgramConfirm] = useState(false);
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [programToDeleteId, setProgramToDeleteId] = useState<string | null>(null);

  const activeProgram = programs.find(p => p.id === activeProgramId) || programs[0];

  const handleOpenEditProgram = (progId?: string) => {
    const targetProg = progId ? (programs.find(p => p.id === progId) || activeProgram) : activeProgram;
    if (targetProg) {
      setEditingProgramId(targetProg.id);
      setEditProgramTitle(targetProg.title);
      setEditProgramDesc(targetProg.description || '');
      setShowEditProgramModal(true);
    }
  };

  const handleEditProgramSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProgramTitle.trim()) return;
    const targetId = editingProgramId || activeProgram?.id;
    if (onUpdateProgramTitleDesc && targetId) {
      onUpdateProgramTitleDesc(targetId, editProgramTitle.trim(), editProgramDesc.trim());
    }
    setShowEditProgramModal(false);
  };

  const handleDeleteActiveProgram = (progId?: string) => {
    const targetProg = progId ? (programs.find(p => p.id === progId) || activeProgram) : activeProgram;
    if (!targetProg) return;
    setProgramToDeleteId(targetProg.id);
    setShowDeleteProgramConfirm(true);
  };

  const isLight = activeTheme.startsWith('light-');

  const handleAddProgramSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgramTitle.trim()) {
      setErrorMsg('لطفا عنوان برنامه جامع را وارد کنید.');
      return;
    }
    onAddProgram(newProgramTitle, newProgramDesc);
    setNewProgramTitle('');
    setNewProgramDesc('');
    setErrorMsg('');
    setShowAddProgramModal(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseBackupFile(file);
      onRestoreBackup(parsed);
      alert('داده‌ها (برنامه‌ها و چالش‌ها) با موفقیت از فایل پشتیبان بارگذاری شدند.');
    } catch (err: any) {
      alert(err.message || 'خطا در بارگذاری فایل پشتیبان.');
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <header id="app-header" className={`sticky top-0 z-40 w-full ${isLight ? 'bg-white/95 text-slate-800 border-slate-200' : 'bg-slate-900/95 text-slate-100 border-slate-800'} border-b shadow-xl backdrop-blur-md transition-all duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top bar: Branding & User Info */}
        <div className={`flex flex-col md:flex-row md:items-center md:justify-between py-3.5 border-b ${isLight ? 'border-slate-100' : 'border-slate-800/80'} gap-4`}>
          
          {/* Logo & Dropdown */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-xl text-white shadow-lg shadow-emerald-950/20">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">مسیر من (برنامه‌ریز جامع بلندمدت)</h1>
              <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>سیستم فلوچارت سلسله‌مراتبی و ردیاب عادت‌ها</p>
            </div>

            <div className={`hidden sm:block w-[1px] h-6 ${isLight ? 'bg-slate-200' : 'bg-slate-800'} mx-1`}></div>

            {/* Dropdown switch & Edit/Delete actions */}
            <div className="flex items-center gap-1.5">
              <div className="relative">
                <button
                  id="program-selector-btn"
                  onClick={() => setShowProgramDropdown(!showProgramDropdown)}
                  className={`flex items-center justify-between gap-1.5 px-3 py-1.5 ${
                    isLight 
                      ? 'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 border-slate-200' 
                      : 'bg-slate-800 hover:bg-slate-750 active:bg-slate-700 text-slate-100 border-slate-700'
                  } rounded-lg text-xs font-semibold border transition-all cursor-pointer`}
                >
                  <span className="max-w-[130px] truncate">
                    {activeProgram ? activeProgram.title : 'انتخاب برنامه...'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showProgramDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showProgramDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowProgramDropdown(false)} />
                    <div className={`absolute right-0 mt-1.5 w-72 ${isLight ? 'bg-white border-slate-200 shadow-2xl text-slate-800' : 'bg-slate-800 border-slate-700 text-slate-100 shadow-2xl'} border rounded-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150`}>
                      <div className={`p-2 border-b ${isLight ? 'border-slate-100 bg-slate-50' : 'border-slate-700 bg-slate-800/50'}`}>
                        <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} px-2 py-0.5`}>لیست برنامه‌های جامع شما</p>
                      </div>
                      <div className="max-h-60 overflow-y-auto py-1 text-right">
                        {programs.map((prog) => (
                          <div 
                            key={prog.id}
                            className={`flex items-center justify-between px-4 py-1.5 transition-colors group ${
                              prog.id === activeProgramId
                                ? 'bg-emerald-600/10 text-emerald-600 font-bold'
                                : `${isLight ? 'hover:bg-slate-50 text-slate-700' : 'hover:bg-slate-750 text-slate-300'}`
                            }`}
                          >
                            <button
                              onClick={() => {
                                onSelectProgram(prog.id);
                                setShowProgramDropdown(false);
                              }}
                              className="flex-1 text-right text-xs flex flex-col gap-0.5 overflow-hidden cursor-pointer"
                            >
                              <span className="truncate block w-full">{prog.title}</span>
                              {prog.description && (
                                <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-500'} line-clamp-1 font-normal`}>
                                  {prog.description}
                                </span>
                              )}
                            </button>
                            
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEditProgram(prog.id);
                                }}
                                className={`p-1 rounded hover:bg-emerald-600/10 text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer`}
                                title="ویرایش عنوان و توضیحات"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              
                              {programs.length > 1 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteActiveProgram(prog.id);
                                  }}
                                  className={`p-1 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer`}
                                  title="حذف کامل برنامه"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className={`p-2 border-t ${isLight ? 'border-slate-100 bg-slate-50' : 'border-slate-700 bg-slate-800/80'}`}>
                        <button
                          onClick={() => {
                            setShowAddProgramModal(true);
                            setShowProgramDropdown(false);
                          }}
                          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          <FolderPlus className="w-3.5 h-3.5" />
                          ساخت برنامه جامع جدید
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {activeProgram && (
                <>
                  <button
                    onClick={() => handleOpenEditProgram()}
                    className={`p-2 ${isLight ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-200' : 'bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-400 border-emerald-900/30'} rounded-lg text-xs font-bold border transition-all cursor-pointer`}
                    title="ویرایش عنوان و توضیحات این برنامه"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteActiveProgram()}
                    className={`p-2 ${isLight ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200' : 'bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 border-rose-900/30'} rounded-lg text-xs font-bold border transition-all cursor-pointer`}
                    title="حذف کامل این برنامه"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* User profile & controls */}
          <div className="flex flex-wrap items-center gap-3 self-end md:self-center">
            
            {/* User Badge */}
            <div className={`flex items-center gap-2 px-3 py-1.5 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'} border rounded-xl text-xs`}>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className={`${isLight ? 'text-slate-500' : 'text-slate-400'}`}>کاربر:</span>
              <span className={`font-bold ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>{username === 'sadeghho' ? 'sadeghho (مدیر)' : 'mo (کاربر)'}</span>
            </div>

            {/* Logout */}
            <button
              onClick={onLogout}
              className={`flex items-center gap-1 px-2.5 py-1.5 ${
                isLight 
                  ? 'bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-500 border-slate-200' 
                  : 'bg-slate-800 hover:bg-red-950/30 text-slate-400 hover:text-red-400 border-slate-750'
              } rounded-xl text-xs font-semibold border transition-colors cursor-pointer`}
              title="خروج از حساب"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج</span>
            </button>
          </div>

        </div>

        {/* Lower bar: Navigation tabs & Toolbar Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-3 gap-3">
          
          {/* Navigation Tabs (لیست کارهای روزانه vs سیر برنامه‌ها vs عادت‌ها) */}
          <div className={`flex flex-wrap items-center p-1 ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-850'} border rounded-xl w-fit gap-1`}>
            <button
              onClick={() => onTabChange('daily-todos')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'daily-todos'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/20'
                  : `${isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-200'}`
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>لیست کارهای روزانه</span>
            </button>
            <button
              onClick={() => onTabChange('roadmap')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'roadmap'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/20'
                  : `${isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-200'}`
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>سیر برنامه‌ها</span>
            </button>
            <button
              onClick={() => onTabChange('challenges')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'challenges'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/20'
                  : `${isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-200'}`
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>چالش‌ها و عادت‌ها</span>
            </button>
            <button
              onClick={() => onTabChange('programs-overview')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'programs-overview'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/20'
                  : `${isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-200'}`
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>نمای کلی برنامه‌ها</span>
            </button>
          </div>

          {/* Simple/Advanced Toggle & Theme selector & Import/Export buttons */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Mode Switcher */}
            <div className={`flex items-center gap-1 p-0.5 ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-800 border-slate-700'} border rounded-lg text-[10px] font-bold`}>
              <button
                type="button"
                onClick={() => onModeChange('simple')}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  activeMode === 'simple' 
                    ? 'bg-emerald-600 text-white shadow' 
                    : `${isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-200'}`
                }`}
              >
                حالت ساده
              </button>
              <button
                type="button"
                onClick={() => onModeChange('advanced')}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  activeMode === 'advanced' 
                    ? 'bg-emerald-600 text-white shadow' 
                    : `${isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-200'}`
                }`}
              >
                حالت پیشرفته
              </button>
              <button
                type="button"
                onClick={() => onModeChange('diagram')}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  activeMode === 'diagram' 
                    ? 'bg-emerald-600 text-white shadow' 
                    : `${isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-200'}`
                }`}
              >
                نمودار ذهنی (XMind)
              </button>
            </div>

            {/* Theme switcher */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowThemeDropdown(!showThemeDropdown);
                  setShowProgramDropdown(false);
                }}
                className={`flex items-center gap-1 px-2.5 py-1.5 ${
                  isLight 
                    ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200' 
                    : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
                } border rounded-lg text-xs font-semibold transition-colors cursor-pointer`}
                title="تغییر پوسته بصری"
              >
                <Palette className="w-3.5 h-3.5 text-emerald-500" />
                <span>پوسته‌ها</span>
              </button>

              {showThemeDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowThemeDropdown(false)} />
                  <div className={`absolute left-0 mt-1.5 w-44 ${isLight ? 'bg-white border-slate-200 shadow-2xl text-slate-800' : 'bg-slate-800 border-slate-700 text-slate-100 shadow-2xl'} border rounded-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150`}>
                    <div className={`p-2 border-b ${isLight ? 'border-slate-100 bg-slate-50' : 'border-slate-750 bg-slate-850'}`}>
                      <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>پوسته مناسب را انتخاب کنید</span>
                    </div>
                    <div className="py-1">
                      {THEME_OPTIONS.map((t) => (
                        <button
                          key={t.value}
                          onClick={() => {
                            onThemeChange(t.value);
                            setShowThemeDropdown(false);
                          }}
                          className={`w-full text-right px-3 py-2 text-xs transition-colors flex items-center justify-between ${
                            activeTheme === t.value 
                              ? 'bg-emerald-600/10 text-emerald-600 font-bold' 
                              : `${isLight ? 'text-slate-700 hover:bg-slate-50' : 'text-slate-300 hover:bg-slate-750'}`
                          }`}
                        >
                          <span>{t.label}</span>
                          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${t.colorClass}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Backup hidden input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />

            {/* Backup Action Bar */}
            <button
              onClick={() => downloadBackup(programs, challenges, todos, username)}
              className={`flex items-center gap-1 px-2.5 py-1.5 ${
                isLight 
                  ? 'bg-slate-50 hover:bg-slate-100 text-slate-750 border-slate-200' 
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
              } border rounded-lg text-xs font-semibold transition-colors cursor-pointer`}
              title="پشتیبان‌گیری کامل از داده‌ها"
            >
              <Download className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden sm:inline">دانلود فایل پشتیبان</span>
              <span className="inline sm:hidden">پشتیبان</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className={`flex items-center gap-1 px-2.5 py-1.5 ${
                isLight 
                  ? 'bg-slate-50 hover:bg-slate-100 text-slate-750 border-slate-200' 
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
              } border rounded-lg text-xs font-semibold transition-colors cursor-pointer`}
              title="بازیابی فایل پشتیبان"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">بازیابی فایل</span>
              <span className="inline sm:hidden">بازیابی</span>
            </button>

            <button
              onClick={() => setShowResetConfirm(true)}
              className={`p-1.5 ${
                isLight 
                  ? 'bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border-slate-200 hover:border-rose-300/50' 
                  : 'bg-slate-800 hover:bg-red-950/20 text-slate-400 hover:text-amber-400 border-slate-700 hover:border-amber-900/30'
              } border rounded-lg transition-colors cursor-pointer`}
              title="بازنشانی به داده‌های پیش‌فرض"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

          </div>

        </div>

      </div>

      {/* Add Program Modal */}
      {showAddProgramModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddProgramModal(false)} />
          
          <div className={`relative ${isLight ? 'bg-white text-slate-800 border-slate-200 shadow-2xl' : 'bg-slate-800 text-slate-100 border-slate-700 shadow-2xl'} rounded-2xl w-full max-w-md p-6 border z-50 overflow-hidden animate-in zoom-in-95 duration-200 text-right`} dir="rtl">
            <h3 className={`text-lg font-bold ${isLight ? 'text-slate-800' : 'text-white'} mb-1.5 flex items-center gap-2`}>
              <FolderPlus className="w-5 h-5 text-emerald-500" />
              ایجاد برنامه جامع جدید
            </h3>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'} mb-4`}>
              برنامه‌ای بزرگ و طولانی‌مدت (مثل "توسعه فردی ۱۴۰۵") ایجاد کنید که بتوانید شاخه‌ها و مراحل را به آن اضافه کنید.
            </p>

            <form onSubmit={handleAddProgramSubmit} className="space-y-4">
              <div>
                <label className={`block text-xs font-medium ${isLight ? 'text-slate-600' : 'text-slate-300'} mb-1`}>عنوان برنامه *</label>
                <input
                  type="text"
                  placeholder="مثال: یادگیری زبان آلمانی، راه‌اندازی شرکت"
                  value={newProgramTitle}
                  onChange={(e) => setNewProgramTitle(e.target.value)}
                  className={`w-full px-3 py-2 ${isLight ? 'bg-slate-50 border-slate-200 text-slate-800 focus:border-emerald-500' : 'bg-slate-900 border-slate-750 text-white focus:border-indigo-500'} rounded-lg text-sm focus:outline-none transition-colors`}
                  required
                />
              </div>

              <div>
                <label className={`block text-xs font-medium ${isLight ? 'text-slate-600' : 'text-slate-300'} mb-1`}>توضیحات کوتاه (اختیاری)</label>
                <textarea
                  placeholder="توضیح دهید این برنامه بزرگ قرار است چه حوزه‌ای از زندگی یا کار شما را توسعه دهد..."
                  value={newProgramDesc}
                  onChange={(e) => setNewProgramDesc(e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 ${isLight ? 'bg-slate-50 border-slate-200 text-slate-800 focus:border-emerald-500' : 'bg-slate-900 border-slate-750 text-white focus:border-indigo-500'} rounded-lg text-sm focus:outline-none transition-colors resize-none`}
                />
              </div>

              {errorMsg && (
                <div className="text-red-400 text-xs py-1 px-2 bg-red-950/20 rounded border border-red-900/30">
                  {errorMsg}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProgramModal(false)}
                  className={`px-4 py-2 ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-700 hover:bg-slate-650 text-slate-200'} rounded-lg text-xs font-semibold transition-colors cursor-pointer`}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  ایجاد برنامه جامع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Program Modal */}
      {showEditProgramModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowEditProgramModal(false)} />
          
          <div className={`relative ${isLight ? 'bg-white text-slate-800 border-slate-200 shadow-2xl' : 'bg-slate-800 text-slate-100 border-slate-700 shadow-2xl'} rounded-2xl w-full max-w-md p-6 border z-50 overflow-hidden animate-in zoom-in-95 duration-200 text-right`} dir="rtl">
            <h3 className={`text-lg font-bold ${isLight ? 'text-slate-800' : 'text-white'} mb-1.5 flex items-center gap-2`}>
              <Edit3 className="w-5 h-5 text-emerald-500" />
              ویرایش جزئیات برنامه جامع
            </h3>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'} mb-4`}>
              تغییر عنوان یا توضیحات مربوط به برنامه جامع انتخابی.
            </p>

            <form onSubmit={handleEditProgramSubmit} className="space-y-4">
              <div>
                <label className={`block text-xs font-medium ${isLight ? 'text-slate-600' : 'text-slate-300'} mb-1`}>عنوان جدید برنامه *</label>
                <input
                  type="text"
                  value={editProgramTitle}
                  onChange={(e) => setEditProgramTitle(e.target.value)}
                  className={`w-full px-3 py-2 ${isLight ? 'bg-slate-50 border-slate-200 text-slate-800 focus:border-emerald-500' : 'bg-slate-900 border-slate-750 text-white focus:border-indigo-500'} rounded-lg text-sm focus:outline-none transition-colors`}
                  required
                />
              </div>

              <div>
                <label className={`block text-xs font-medium ${isLight ? 'text-slate-600' : 'text-slate-300'} mb-1`}>توضیحات جدید</label>
                <textarea
                  value={editProgramDesc}
                  onChange={(e) => setEditProgramDesc(e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 ${isLight ? 'bg-slate-50 border-slate-200 text-slate-800 focus:border-emerald-500' : 'bg-slate-900 border-slate-750 text-white focus:border-indigo-500'} rounded-lg text-sm focus:outline-none transition-colors resize-none`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditProgramModal(false)}
                  className={`px-4 py-2 ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-700 hover:bg-slate-650 text-slate-200'} rounded-lg text-xs font-semibold transition-colors cursor-pointer`}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  ذخیره تغییرات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Program Confirmation Modal */}
      {showDeleteProgramConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="fixed inset-0" onClick={() => setShowDeleteProgramConfirm(false)} />
          
          <div className={`relative border rounded-2xl w-full max-w-md p-6 shadow-2xl z-50 text-right ${
            isLight ? 'bg-white border-slate-200 text-slate-805' : 'bg-slate-900 border-slate-800 text-slate-100'
          }`} dir="rtl">
            <h3 className="text-sm font-black text-rose-500 mb-3 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              <span>تایید حذف برنامه جامع</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              آیا مطمئن هستید که می‌خواهید برنامه جامع <strong className="text-emerald-550 dark:text-emerald-400">«{programs.find(p => p.id === programToDeleteId)?.title || activeProgram?.title}»</strong> را همراه با تمام سیرها، گام‌ها و زیرمجموعه‌های داخل آن برای همیشه حذف کنید؟ این اقدام غیرقابل بازگشت است.
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  const targetDeleteId = programToDeleteId || activeProgram?.id;
                  if (onDeleteProgram && targetDeleteId) {
                    onDeleteProgram(targetDeleteId);
                  }
                  setShowDeleteProgramConfirm(false);
                  setProgramToDeleteId(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                بله، برای همیشه حذف شود
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteProgramConfirm(false)}
                className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 border' : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
                }`}
              >
                لغو / انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="fixed inset-0" onClick={() => setShowResetConfirm(false)} />
          
          <div className={`relative border rounded-2xl w-full max-w-md p-6 shadow-2xl z-50 text-right ${
            isLight ? 'bg-white border-slate-200 text-slate-805' : 'bg-slate-900 border-slate-800 text-slate-100'
          }`} dir="rtl">
            <h3 className="text-sm font-black text-rose-500 mb-3 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>بازنشانی کل داده‌ها به پیش‌فرض</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              آیا مطمئن هستید که می‌خواهید تمام برنامه‌ها، سیرها، گام‌ها، عادت‌ها و کارهای روزانه این حساب کاربری را حذف کرده و به داده‌های اولیه نمونه برگردانید؟ این اقدام کلیه تلاش‌های شما را پاک خواهد کرد و غیرقابل بازگشت است.
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  onResetToDefaults();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                بله، بازنشانی شود
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 border' : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
                }`}
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
