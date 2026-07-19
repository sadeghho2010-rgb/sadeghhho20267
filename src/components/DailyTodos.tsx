import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  Calendar, 
  Sparkles, 
  Activity, 
  ChevronDown, 
  ChevronUp, 
  PlusCircle, 
  SlidersHorizontal,
  LayoutGrid,
  List,
  Flame,
  GitCommit,
  CheckSquare,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TodoItem, TodoSubTask } from '../types';

const getLocalDateString = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface DailyTodosProps {
  todos: TodoItem[];
  onUpdateTodos: (updatedList: TodoItem[]) => void;
  isLight?: boolean;
}

export default function DailyTodos({
  todos,
  onUpdateTodos,
  isLight = false
}: DailyTodosProps) {
  // View mode states: 'compact' | 'simple' | 'advanced'
  const [todoViewMode, setTodoViewMode] = useState<'compact' | 'simple' | 'advanced'>('simple');
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
  
  // Date selection state for viewing history
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Create state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [expandedTodoId, setExpandedTodoId] = useState<string | null>(null);

  // Subtask quick creation states
  const [subTaskInput, setSubTaskInput] = useState<Record<string, string>>({});

  // Custom inline delete confirmation state to bypass blocked native confirms in iframe
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Day navigation handlers
  const handlePrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  const handleJumpToToday = () => {
    setSelectedDate(new Date());
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setSelectedDate(new Date(e.target.value));
    }
  };

  // Add a new main To-Do
  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    // Combine selected date with current local time
    const now = new Date();
    const targetDate = new Date(selectedDate);
    targetDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());

    const newTodo: TodoItem = {
      id: `todo-${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim() || undefined,
      completed: false,
      subTasks: [],
      createdAt: targetDate.toISOString()
    };

    onUpdateTodos([newTodo, ...todos]);
    setNewTitle('');
    setNewDesc('');
    setExpandedTodoId(newTodo.id); // Expand new todo automatically to add sub-tasks
  };

  // Toggle main To-Do completion
  const handleToggleTodo = (id: string) => {
    const updated = todos.map(todo => {
      if (todo.id === id) {
        const nextCompleted = !todo.completed;
        // Optionally mark all sub-tasks as completed when parent is completed
        const updatedSubTasks = todo.subTasks.map(sub => ({
          ...sub,
          completed: nextCompleted
        }));
        return {
          ...todo,
          completed: nextCompleted,
          subTasks: updatedSubTasks
        };
      }
      return todo;
    });
    onUpdateTodos(updated);
  };

  // Delete main To-Do
  const handleDeleteTodo = (id: string) => {
    onUpdateTodos(todos.filter(todo => todo.id !== id));
    setConfirmDeleteId(null);
  };

  // Add a sub-task
  const handleAddSubTask = (todoId: string, e: React.FormEvent) => {
    e.preventDefault();
    const subTitle = subTaskInput[todoId]?.trim();
    if (!subTitle) return;

    const updated = todos.map(todo => {
      if (todo.id === todoId) {
        const newSub: TodoSubTask = {
          id: `sub-${Date.now()}-${Math.random()}`,
          title: subTitle,
          completed: false
        };
        return {
          ...todo,
          subTasks: [...todo.subTasks, newSub]
        };
      }
      return todo;
    });

    onUpdateTodos(updated);
    setSubTaskInput({ ...subTaskInput, [todoId]: '' });
  };

  // Toggle sub-task
  const handleToggleSubTask = (todoId: string, subId: string) => {
    const updated = todos.map(todo => {
      if (todo.id === todoId) {
        const updatedSubs = todo.subTasks.map(sub => 
          sub.id === subId ? { ...sub, completed: !sub.completed } : sub
        );
        // Automatically mark main task as completed if all subs are completed
        const allCompleted = updatedSubs.length > 0 && updatedSubs.every(s => s.completed);
        return {
          ...todo,
          subTasks: updatedSubs,
          completed: allCompleted ? true : todo.completed
        };
      }
      return todo;
    });
    onUpdateTodos(updated);
  };

  // Delete sub-task
  const handleDeleteSubTask = (todoId: string, subId: string) => {
    const updated = todos.map(todo => {
      if (todo.id === todoId) {
        return {
          ...todo,
          subTasks: todo.subTasks.filter(s => s.id !== subId)
        };
      }
      return todo;
    });
    onUpdateTodos(updated);
  };

  // Filter and statistics relative to the SELECTED DATE
  const selectedDateStr = getLocalDateString(selectedDate);

  const filteredTodosByDate = todos.filter(todo => {
    try {
      const todoDate = new Date(todo.createdAt);
      return getLocalDateString(todoDate) === selectedDateStr;
    } catch (err) {
      return false;
    }
  });

  // Calculate statistics
  const totalCount = filteredTodosByDate.length;
  const completedCount = filteredTodosByDate.filter(t => t.completed).length;
  const pendingCount = totalCount - completedCount;
  const totalSubTasks = filteredTodosByDate.reduce((acc, t) => acc + t.subTasks.length, 0);
  const completedSubTasks = filteredTodosByDate.reduce((acc, t) => acc + t.subTasks.filter(s => s.completed).length, 0);

  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filtered To-Dos list
  const filteredTodos = filteredTodosByDate.filter(todo => {
    if (filter === 'completed') return todo.completed;
    if (filter === 'pending') return !todo.completed;
    return true;
  });

  return (
    <div id="daily-todos-section" className="space-y-6 text-right" dir="rtl">
      
      {/* 1. Header Information & Progress bar */}
      <div className={`p-6 border rounded-3xl transition-all duration-300 shadow-md ${
        isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-850 text-slate-100'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                isLight ? 'text-emerald-700 bg-emerald-50 border-emerald-100' : 'text-emerald-400 bg-emerald-950/40 border-emerald-900/30'
              }`}>
                بخش پیش‌فرض ورود
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isLight ? 'text-slate-600 bg-slate-100' : 'text-slate-400 bg-slate-800'
              }`}>
                امروز: {new Date().toLocaleDateString('fa-IR', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <h2 className={`text-xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>لیست کارهای روزانه و تاریخچه</h2>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              کارهایی که خارج از برنامه‌های کلان بلندمدت قرار دارند را مدیریت کنید. می‌توانید با استفاده از تاریخچه زیر، کارهای روزهای گذشته را مرور یا ویرایش کنید.
            </p>
          </div>

          {/* Productivity Stats Badge */}
          <div className="flex gap-4 shrink-0">
            <div className={`p-4 rounded-2xl border text-center min-w-[100px] ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/50 border-slate-800'
            }`}>
              <p className={`text-[10px] font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>پایبندی روز انتخابی</p>
              <p className="text-xl font-black text-emerald-500 mt-1">{completionPercentage}%</p>
            </div>
            <div className={`p-4 rounded-2xl border text-center min-w-[100px] ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/50 border-slate-800'
            }`}>
              <p className={`text-[10px] font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>کارها</p>
              <p className={`text-xl font-black ${isLight ? 'text-slate-900' : 'text-white'} mt-1`}>{completedCount}/{totalCount}</p>
            </div>
          </div>
        </div>

        {/* Completion Gauge Slider */}
        {totalCount > 0 && (
          <div className="mt-5 pt-3 border-t border-slate-800/20">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400 font-bold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
                <span>میزان پیشروی کارهای روز انتخابی</span>
              </span>
              <span className="text-emerald-500 font-black">{completionPercentage}%</span>
            </div>
            <div className={`w-full h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-slate-950'}`}>
              <motion.div 
                className="h-full bg-gradient-to-l from-emerald-500 to-teal-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}

        {/* Beautiful Interactive Date Navigator & History selector */}
        <div className="mt-6 pt-5 border-t border-slate-800/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className={`p-2.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
              <Calendar className="w-4 h-4 text-emerald-500" />
            </span>
            <div>
              <p className={`text-[10px] font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>لیست کارهای روز:</p>
              <p className={`text-xs font-black ${isLight ? 'text-slate-850' : 'text-emerald-400'} mt-0.5`}>
                {selectedDate.toLocaleDateString('fa-IR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                {getLocalDateString(selectedDate) === getLocalDateString(new Date()) && " (امروز)"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Previous Day */}
            <button
              type="button"
              onClick={handlePrevDay}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border flex items-center gap-1.5 ${
                isLight 
                  ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700' 
                  : 'bg-slate-850 hover:bg-slate-800 border-slate-800 text-slate-300'
              }`}
              title="روز قبل"
            >
              <span>روز قبل</span>
              <span className="font-mono text-emerald-500">→</span>
            </button>

            {/* Jump to Today */}
            {getLocalDateString(selectedDate) !== getLocalDateString(new Date()) && (
              <button
                type="button"
                onClick={handleJumpToToday}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition-all shadow-md cursor-pointer"
              >
                بازگشت به امروز
              </button>
            )}

            {/* Next Day */}
            <button
              type="button"
              onClick={handleNextDay}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border flex items-center gap-1.5 ${
                isLight 
                  ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700' 
                  : 'bg-slate-850 hover:bg-slate-800 border-slate-800 text-slate-300'
              }`}
              title="روز بعد"
            >
              <span className="font-mono text-emerald-500">←</span>
              <span>روز بعد</span>
            </button>

            {/* Gregorian Date Picker input */}
            <div className="relative">
              <input
                type="date"
                value={getLocalDateString(selectedDate)}
                onChange={handleDateChange}
                className={`px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border focus:outline-none focus:border-emerald-500 ${
                  isLight 
                    ? 'bg-slate-50 border-slate-200 text-slate-700' 
                    : 'bg-slate-850 border-slate-800 text-slate-300'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Controls Toolbar & Toggle View Mode */}
      <div className={`p-4 border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm ${
        isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-850'
      }`}>
        {/* Filters Tab */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-emerald-600 text-white shadow'
                : `${isLight ? 'text-slate-650 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800'}`
            }`}
          >
            همه کارها ({totalCount})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'pending'
                ? 'bg-emerald-600/20 text-emerald-500 font-black border border-emerald-500/20 shadow'
                : `${isLight ? 'text-slate-650 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800'}`
            }`}
          >
            در حال اقدام ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'completed'
                ? 'bg-emerald-600 text-white shadow'
                : `${isLight ? 'text-slate-650 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800'}`
            }`}
          >
            کامل شده ({completedCount})
          </button>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold ${isLight ? 'text-slate-500' : 'text-slate-450'}`}>طراحی نما:</span>
          <div className={`flex items-center p-0.5 ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'} border rounded-xl`}>
            <button
              onClick={() => setTodoViewMode('compact')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                todoViewMode === 'compact'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="نمای جمع و جور"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTodoViewMode('simple')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                todoViewMode === 'simple'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="نمای ساده کلاسیک"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTodoViewMode('advanced')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                todoViewMode === 'advanced'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="نمای پیشرفته و متراکم"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Core Grid Split / Addition Form & List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Form Column - Takes 4 cols in desktop */}
        <div className="lg:col-span-4">
          <form 
            onSubmit={handleAddTodo} 
            className={`border p-5 rounded-3xl space-y-4 shadow-sm sticky top-36 ${
              isLight ? 'bg-white border-slate-200 text-slate-805 shadow-md' : 'bg-slate-900 border-slate-850'
            }`}
          >
            <div className="flex items-center gap-2 border-b border-slate-800/20 pb-2">
              <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
              <h3 className={`text-xs font-black ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>افزودن کار روزانه جدید</h3>
            </div>

            <div className="space-y-1">
              <label className={`text-[10px] font-bold block ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>عنوان کار *</label>
              <input
                type="text"
                placeholder="مثال: ورزش صبحگاهی، پیگیری گارانتی..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className={`w-full px-3.5 py-2.5 border rounded-xl text-xs focus:outline-none focus:border-emerald-500 transition-colors ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-805' : 'bg-slate-950 border-slate-750 text-white'
                }`}
                required
              />
            </div>

            <div className="space-y-1">
              <label className={`text-[10px] font-bold block ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>توضیحات تکمیلی (اختیاری)</label>
              <textarea
                placeholder="یادداشت‌های مرتبط، آدرس‌ها یا مراحل..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={3}
                className={`w-full px-3.5 py-2.5 border rounded-xl text-xs focus:outline-none focus:border-emerald-500 transition-colors resize-none ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-805' : 'bg-slate-950 border-slate-750 text-white'
                }`}
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>ثبت کار جدید</span>
            </button>
          </form>
        </div>

        {/* List Column - Takes 8 cols in desktop */}
        <div className="lg:col-span-8 space-y-4">
          
          {filteredTodos.length === 0 ? (
            <div className={`text-center py-24 border border-dashed rounded-3xl space-y-4 ${
              isLight ? 'bg-slate-50/50 border-slate-200/80' : 'bg-slate-900/10 border-slate-850'
            }`}>
              <CheckSquare className="w-12 h-12 text-slate-500 mx-auto animate-pulse" />
              <div className="space-y-1">
                <h4 className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-slate-350'}`}>هیچ کار فعالی در این بخش نیست</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">می‌توانید کارهای شخصی روزانه که مربوط به اهداف بزرگ نیستند را اینجا ذخیره کنید.</p>
              </div>
            </div>
          ) : (
            <div className={todoViewMode === 'compact' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-4'}>
              <AnimatePresence mode="popLayout">
                {filteredTodos.map((todo) => {
                  const isExpanded = expandedTodoId === todo.id;
                  const totalSub = todo.subTasks.length;
                  const doneSub = todo.subTasks.filter(s => s.completed).length;
                  const pct = totalSub > 0 ? Math.round((doneSub / totalSub) * 100) : 0;

                  return (
                    <motion.div
                      key={todo.id}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={`border rounded-2xl overflow-hidden transition-all duration-300 relative ${
                        todo.completed 
                          ? (isLight ? 'bg-emerald-50/20 border-emerald-200' : 'bg-emerald-950/5 border-emerald-900/30 opacity-75') 
                          : (isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-850')
                      }`}
                    >
                      {/* Top border decor for advanced mode */}
                      {todoViewMode === 'advanced' && (
                        <div className={`h-1.5 w-full bg-gradient-to-r ${todo.completed ? 'from-emerald-500 to-emerald-600' : 'from-indigo-500 to-teal-500'}`} />
                      )}

                      {/* Main Card Header bar */}
                      <div className="p-4 flex items-start justify-between gap-4 relative z-10">
                        <div className="flex items-start gap-3">
                          
                          {/* Check Button */}
                          <button
                            onClick={() => handleToggleTodo(todo.id)}
                            className="mt-0.5 text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer shrink-0"
                          >
                            {todo.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/10" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-500 hover:scale-110 transition-transform" />
                            )}
                          </button>

                          {/* Content */}
                          <div className="space-y-1">
                            <h4 className={`text-xs font-bold transition-all ${
                              todo.completed 
                                ? 'line-through text-slate-500' 
                                : (isLight ? 'text-slate-900' : 'text-white')
                            }`}>
                              {todo.title}
                            </h4>
                            
                            {todo.description && todoViewMode !== 'compact' && (
                              <p className={`text-[10px] leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                                {todo.description}
                              </p>
                            )}

                            {/* Completion details badge */}
                            {totalSub > 0 && (
                              <div className="flex items-center gap-1.5 pt-1">
                                <div className="w-20 h-1 rounded-full bg-slate-800 overflow-hidden">
                                  <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-[9px] font-black text-emerald-500">{doneSub}/{totalSub} زیرمجموعه ({pct}%)</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          
                          {/* Subtask Toggle Expand button */}
                          {todoViewMode !== 'compact' && (
                            <button
                              onClick={() => setExpandedTodoId(isExpanded ? null : todo.id)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-slate-800 text-slate-400'
                              }`}
                              title="مدیریت زیرمجموعه‌ها"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          )}

                          {/* Delete actions (Inline bypass confirmation) */}
                          {confirmDeleteId === todo.id ? (
                            <div className="flex items-center gap-1 bg-red-950/20 border border-red-900/30 p-1 rounded-lg">
                              <span className="text-[8px] font-bold text-rose-400 px-1">حذف؟</span>
                              <button
                                type="button"
                                onClick={() => handleDeleteTodo(todo.id)}
                                className="px-1.5 py-0.5 bg-rose-600 text-white rounded text-[9px] font-bold hover:bg-rose-500 cursor-pointer"
                              >
                                بله
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded text-[9px] font-bold hover:bg-slate-700 cursor-pointer"
                              >
                                خیر
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(todo.id)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                isLight ? 'text-slate-400 hover:text-rose-600 hover:bg-slate-100' : 'text-slate-500 hover:text-rose-400 hover:bg-slate-850'
                              }`}
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expandable Sub-Tasks Section */}
                      {isExpanded && todoViewMode !== 'compact' && (
                        <div className={`px-4 pb-4 pt-2 border-t text-xs ${
                          isLight ? 'bg-slate-50/50 border-slate-100' : 'bg-slate-950/20 border-slate-800/50'
                        }`}>
                          <p className={`text-[10px] font-black mb-2 flex items-center gap-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                            <GitCommit className="w-3 h-3 text-emerald-500" />
                            <span>مراحل جزئی کار (زیرمجموعه‌ها):</span>
                          </p>

                          {/* Sub tasks list */}
                          {todo.subTasks.length > 0 && (
                            <div className="space-y-1.5 mb-3">
                              {todo.subTasks.map((sub) => (
                                <div 
                                  key={sub.id} 
                                  className="flex items-center justify-between gap-4 p-2 bg-slate-950/40 rounded-xl border border-slate-850/50"
                                >
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleToggleSubTask(todo.id, sub.id)}
                                      className="text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer shrink-0"
                                    >
                                      {sub.completed ? (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                      ) : (
                                        <Circle className="w-4 h-4 text-slate-500" />
                                      )}
                                    </button>
                                    <span className={`text-[11px] font-medium ${sub.completed ? 'line-through text-slate-500' : (isLight ? 'text-slate-800' : 'text-slate-200')}`}>
                                      {sub.title}
                                    </span>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSubTask(todo.id, sub.id)}
                                    className="text-slate-500 hover:text-rose-400 transition-colors cursor-pointer p-0.5"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Quick sub-task form */}
                          <form 
                            onSubmit={(e) => handleAddSubTask(todo.id, e)} 
                            className="flex items-center gap-1.5"
                          >
                            <input
                              type="text"
                              placeholder="عنوان گام جزئی جدید..."
                              value={subTaskInput[todo.id] || ''}
                              onChange={(e) => setSubTaskInput({ ...subTaskInput, [todo.id]: e.target.value })}
                              className={`flex-1 px-3 py-1.5 border rounded-lg text-[10px] focus:outline-none focus:border-emerald-500 transition-colors ${
                                isLight ? 'bg-white border-slate-200 text-slate-805' : 'bg-slate-900 border-slate-750 text-white'
                              }`}
                            />
                            <button
                              type="submit"
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                            >
                              <PlusCircle className="w-3.5 h-3.5" />
                              <span>ثبت</span>
                            </button>
                          </form>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
