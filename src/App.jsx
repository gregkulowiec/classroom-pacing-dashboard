import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Trash2, 
  GripVertical, 
  Clock, 
  ExternalLink, 
  Share2, 
  CheckCircle2, 
  Circle, 
  X, 
  Sparkles,
  Lock,
  Unlock,
  Check,
  Eye,
  EyeOff,
  Edit2,
  Save,
  Sun,
  Moon,
  KeyRound
} from 'lucide-react';

export default function App() {
  const [role, setRole] = useState('student');
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isChangePinModalOpen, setIsChangePinModalOpen] = useState(false);
  
  // Custom PIN Management
  const [teacherPin, setTeacherPin] = useState(() => {
    return localStorage.getItem('pacing_teacher_pin') || '1234';
  });
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');
  const [pinChangeSuccess, setPinChangeSuccess] = useState(false);

  // Theme & Accent Color State
  const [theme, setTheme] = useState('dark');
  const [accent, setAccent] = useState('blue');

  const accentOptions = [
    { id: 'blue', name: 'Royal Blue', class: 'blue', hex: '#2563eb' },
    { id: 'emerald', name: 'Emerald', class: 'emerald', hex: '#059669' },
    { id: 'amber', name: 'Amber', class: 'amber', hex: '#d97706' },
    { id: 'cyan', name: 'Ocean Cyan', class: 'cyan', hex: '#0891b2' },
    { id: 'rose', name: 'Rose', class: 'rose', hex: '#e11d48' },
  ];

  // Display Options State
  const [showCountdownTimer, setShowCountdownTimer] = useState(false);

  // Lesson Configuration State (UPDATED DEFAULT TITLE)
  const [periodTitle, setPeriodTitle] = useState('Classroom Activity & Time Map');
  const [totalPeriodMinutes, setTotalPeriodMinutes] = useState(50);
  
  // Blocks Array (UPDATED WITH 3 PLACEHOLDER BLOCKS)
  const [blocks, setBlocks] = useState([
    {
      id: '1',
      title: 'Activity 1: Entry Task / Warm-Up',
      durationMinutes: 10,
      description: 'Click the pencil icon on the right to edit this title, duration, instructions, or add a link for your students.',
      resourceLink: ''
    },
    {
      id: '2',
      title: 'Activity 2: Main Guided Lesson',
      durationMinutes: 25,
      description: 'Add specific student instructions or learning targets here. You can reorder activities by dragging them.',
      resourceLink: ''
    },
    {
      id: '3',
      title: 'Activity 3: Independent Practice & Debrief',
      durationMinutes: 15,
      description: 'Set your total period goal in the top header. Click "Start Active Block" when you are ready to begin pacing.',
      resourceLink: ''
    }
  ]);

  // Active Execution State
  const [activeBlockIndex, setActiveBlockIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(10 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Modals / Editing States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBlockId, setEditingBlockId] = useState(null);
  
  // Form States
  const [formTitle, setFormTitle] = useState('');
  const [formMinutes, setFormMinutes] = useState(10);
  const [formDesc, setFormDesc] = useState('');
  const [formLink, setFormLink] = useState('');

  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const isTeacherAuth = sessionStorage.getItem('pacing_teacher_auth');
    if (isTeacherAuth === 'true') {
      setRole('teacher');
    }
  }, []);

  // Timer Effect
  useEffect(() => {
    let interval = null;
    if (isRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && isRunning) {
      setIsRunning(false);
      if (activeBlockIndex < blocks.length - 1) {
        const nextIdx = activeBlockIndex + 1;
        setActiveBlockIndex(nextIdx);
        setSecondsRemaining(blocks[nextIdx].durationMinutes * 60);
        setIsRunning(true);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsRemaining, activeBlockIndex, blocks]);

  const currentBlock = blocks[activeBlockIndex] || blocks[0];
  const currentTotalSeconds = currentBlock ? currentBlock.durationMinutes * 60 : 1;
  const progressRatio = currentBlock ? 1 - secondsRemaining / currentTotalSeconds : 0;

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (enteredPin === teacherPin) {
      setRole('teacher');
      sessionStorage.setItem('pacing_teacher_auth', 'true');
      setIsPinModalOpen(false);
      setEnteredPin('');
      setPinError(false);
    } else {
      setPinError(true);
      setEnteredPin('');
    }
  };

  const handleSaveNewPin = (e) => {
    e.preventDefault();
    if (newPinInput.length === 4) {
      setTeacherPin(newPinInput);
      localStorage.setItem('pacing_teacher_pin', newPinInput);
      setPinChangeSuccess(true);
      setTimeout(() => {
        setPinChangeSuccess(false);
        setIsChangePinModalOpen(false);
        setNewPinInput('');
      }, 1200);
    }
  };

  const handleLogoutTeacher = () => {
    setRole('student');
    sessionStorage.removeItem('pacing_teacher_auth');
  };

  const handleDragStart = (e, index) => {
    if (role !== 'teacher') return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (role !== 'teacher' || draggedIndex === null || draggedIndex === index) return;
    
    const updated = [...blocks];
    const draggedItem = updated[draggedIndex];
    updated.splice(draggedIndex, 1);
    updated.splice(index, 0, draggedItem);
    
    setDraggedIndex(index);
    setBlocks(updated);

    if (activeBlockIndex === draggedIndex) {
      setActiveBlockIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleAddBlock = (e) => {
    e.preventDefault();
    if (!formTitle) return;

    const newBlock = {
      id: String(Date.now()),
      title: formTitle,
      durationMinutes: Number(formMinutes) || 5,
      description: formDesc,
      resourceLink: formLink
    };

    setBlocks([...blocks, newBlock]);
    resetForm();
    setIsAddModalOpen(false);
  };

  const startEditBlock = (block, e) => {
    e.stopPropagation();
    setEditingBlockId(block.id);
    setFormTitle(block.title);
    setFormMinutes(block.durationMinutes);
    setFormDesc(block.description);
    setFormLink(block.resourceLink);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const updated = blocks.map((b) => {
      if (b.id === editingBlockId) {
        return {
          ...b,
          title: formTitle,
          durationMinutes: Number(formMinutes) || 1,
          description: formDesc,
          resourceLink: formLink
        };
      }
      return b;
    });

    setBlocks(updated);
    setEditingBlockId(null);
    resetForm();

    if (blocks[activeBlockIndex]?.id === editingBlockId) {
      setSecondsRemaining(Number(formMinutes) * 60);
      setIsRunning(false);
    }
  };

  const resetForm = () => {
    setFormTitle('');
    setFormMinutes(10);
    setFormDesc('');
    setFormLink('');
  };

  const handleDeleteBlock = (id, idx) => {
    const updated = blocks.filter((b) => b.id !== id);
    setBlocks(updated);
    if (activeBlockIndex >= updated.length) {
      setActiveBlockIndex(Math.max(0, updated.length - 1));
      if (updated.length > 0) {
        setSecondsRemaining(updated[Math.max(0, updated.length - 1)].durationMinutes * 60);
      }
    }
  };

  const selectBlock = (idx) => {
    if (role !== 'teacher') return;
    setActiveBlockIndex(idx);
    setSecondsRemaining(blocks[idx].durationMinutes * 60);
    setIsRunning(false);
  };

  const copyStudentLink = () => {
    const studentUrl = window.location.origin + window.location.pathname;
    navigator.clipboard.writeText(studentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Dynamic Theme Colors
  const isDark = theme === 'dark';
  const getAccentBg = () => {
    switch (accent) {
      case 'emerald': return 'bg-emerald-600';
      case 'amber': return 'bg-amber-600';
      case 'cyan': return 'bg-cyan-600';
      case 'rose': return 'bg-rose-600';
      default: return 'bg-blue-600';
    }
  };

  const getAccentText = () => {
    switch (accent) {
      case 'emerald': return 'text-emerald-500';
      case 'amber': return 'text-amber-500';
      case 'cyan': return 'text-cyan-500';
      case 'rose': return 'text-rose-500';
      default: return 'text-blue-500';
    }
  };

  const getAccentFillBg = () => {
    switch (accent) {
      case 'emerald': return 'bg-emerald-500/20';
      case 'amber': return 'bg-amber-500/20';
      case 'cyan': return 'bg-cyan-500/20';
      case 'rose': return 'bg-rose-500/20';
      default: return 'bg-blue-500/20';
    }
  };

  const getAccentBorder = () => {
    switch (accent) {
      case 'emerald': return 'border-emerald-500';
      case 'amber': return 'border-amber-500';
      case 'cyan': return 'border-cyan-500';
      case 'rose': return 'border-rose-500';
      default: return 'border-blue-500';
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between font-sans transition-colors duration-300 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* HEADER BAR */}
      <header className={`border-b sticky top-0 z-30 px-6 py-4 flex items-center justify-between backdrop-blur ${
        isDark ? 'border-slate-800/80 bg-slate-900/80' : 'border-slate-200 bg-white/80'
      }`}>
        <div className="flex items-center space-x-4">
          <div className={`p-2.5 rounded-2xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'} ${getAccentText()}`}>
            <Sparkles className="w-6 h-6" />
          </div>

          <div className="flex items-center space-x-6">
            <div>
              {role === 'teacher' ? (
                <input
                  type="text"
                  value={periodTitle}
                  onChange={(e) => setPeriodTitle(e.target.value)}
                  className={`bg-transparent text-2xl font-black focus:outline-none focus:border-b-2 ${getAccentBorder()} transition`}
                />
              ) : (
                <h1 className="text-2xl font-black">{periodTitle}</h1>
              )}
            </div>

            {/* PROMINENT PERIOD GOAL INPUT */}
            <div className={`flex items-center space-x-2 pl-4 border-l ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Period Goal:
              </span>
              {role === 'teacher' ? (
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={totalPeriodMinutes}
                    onChange={(e) => setTotalPeriodMinutes(Number(e.target.value))}
                    className={`w-20 text-center font-mono font-black text-2xl rounded-xl border py-0.5 px-1 focus:outline-none ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    } ${getAccentBorder()}`}
                  />
                  <span className="font-bold text-sm">min</span>
                </div>
              ) : (
                <span className="font-mono font-black text-2xl">{totalPeriodMinutes} min</span>
              )}
            </div>
          </div>
        </div>

        {/* Global Action Controls */}
        <div className="flex items-center space-x-3">
          
          {/* Accent Color Selection */}
          <div className={`flex items-center space-x-1.5 p-1.5 rounded-2xl border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            {accentOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setAccent(opt.id)}
                style={{ backgroundColor: opt.hex }}
                className={`w-5 h-5 rounded-full transition-transform ${
                  accent === opt.id ? 'scale-125 ring-2 ring-offset-2 ring-slate-400' : 'hover:scale-110 opacity-80'
                }`}
                title={opt.name}
              />
            ))}
          </div>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`p-2.5 rounded-2xl border transition ${
              isDark ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
            title="Toggle Light / Dark Mode"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setShowCountdownTimer(!showCountdownTimer)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-2xl border text-xs font-semibold transition ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            {showCountdownTimer ? <EyeOff className={`w-4 h-4 ${getAccentText()}`} /> : <Eye className="w-4 h-4 text-slate-400" />}
            <span>{showCountdownTimer ? 'Hide Countdown' : 'Show Countdown'}</span>
          </button>

          {role === 'teacher' ? (
            <>
              <button
                onClick={() => setIsChangePinModalOpen(true)}
                className={`p-2.5 rounded-2xl border transition ${
                  isDark ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
                title="Change Teacher PIN"
              >
                <KeyRound className="w-4 h-4" />
              </button>

              <button
                onClick={copyStudentLink}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-2xl border text-xs font-semibold transition ${
                  isDark ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-slate-200 border-slate-300 text-slate-800 hover:bg-slate-300'
                }`}
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4 text-slate-400" />}
                <span>{copiedLink ? 'Link Copied!' : 'Share Student Link'}</span>
              </button>

              <button
                onClick={handleLogoutTeacher}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-2xl border text-xs font-semibold transition ${
                  isDark ? 'bg-slate-900 border-slate-800 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                }`}
              >
                <Unlock className="w-4 h-4 text-emerald-500" />
                <span>Teacher Mode Unlocked</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsPinModalOpen(true)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-2xl border text-xs font-semibold transition ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Teacher Login</span>
            </button>
          )}
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        
        {/* Top Controls Bar */}
        <div className="flex items-center justify-between">
          <h2 className={`text-sm font-semibold uppercase tracking-wider flex items-center space-x-2 ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}>
            <Clock className={`w-4 h-4 ${getAccentText()}`} />
            <span>Classroom Agenda & Pacing ({blocks.length} Activities)</span>
          </h2>

          <div className="flex items-center space-x-3">
            {role === 'teacher' && (
              <>
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                    isRunning
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : `${getAccentBg()} text-white hover:opacity-90`
                  }`}
                >
                  {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>{isRunning ? 'Pause Timer' : 'Start Active Block'}</span>
                </button>

                <button
                  onClick={() => {
                    setIsRunning(false);
                    setSecondsRemaining(currentBlock ? currentBlock.durationMinutes * 60 : 0);
                  }}
                  className={`p-2 rounded-xl border transition ${
                    isDark ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                  title="Reset Timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    resetForm();
                    setIsAddModalOpen(true);
                  }}
                  className={`flex items-center space-x-1.5 text-xs font-semibold ${getAccentBg()} text-white px-3.5 py-2 rounded-xl transition shadow-lg`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Block</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* FULL WIDTH BLOCK LIST */}
        <div className="space-y-4">
          {blocks.map((block, idx) => {
            const isActive = idx === activeBlockIndex;
            const isPast = idx < activeBlockIndex;
            const isEditing = editingBlockId === block.id;

            if (isEditing) {
              return (
                <form
                  key={block.id}
                  onSubmit={handleSaveEdit}
                  className={`border-2 rounded-3xl p-6 shadow-2xl space-y-4 ${getAccentBorder()} ${
                    isDark ? 'bg-slate-900' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className={`text-sm font-bold uppercase tracking-wider ${getAccentText()}`}>
                      Edit Activity Block #{idx + 1}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setEditingBlockId(null)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold uppercase mb-1">
                        Activity Title
                      </label>
                      <input
                        type="text"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none ${
                          isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase mb-1">
                        Duration (Mins)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={formMinutes}
                        onChange={(e) => setFormMinutes(e.target.value)}
                        className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none ${
                          isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase mb-1">
                      Description / Instructions
                    </label>
                    <textarea
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                      rows={2}
                      className={`w-full border rounded-xl px-4 py-2 text-sm focus:outline-none resize-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase mb-1">
                      Resource Link (Optional)
                    </label>
                    <input
                      type="url"
                      value={formLink}
                      onChange={(e) => setFormLink(e.target.value)}
                      className={`w-full border rounded-xl px-4 py-2 text-sm focus:outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingBlockId(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={`flex items-center space-x-1.5 px-5 py-2 ${getAccentBg()} text-white rounded-xl text-xs font-semibold transition`}
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              );
            }

            return (
              <div
                key={block.id}
                draggable={role === 'teacher'}
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                onClick={() => role === 'teacher' && selectBlock(idx)}
                className={`relative overflow-hidden rounded-3xl border transition-all duration-500 ${
                  role === 'teacher' ? 'cursor-pointer' : ''
                } ${
                  isActive
                    ? isDark ? `bg-slate-900 ${getAccentBorder()} shadow-2xl` : `bg-white ${getAccentBorder()} shadow-2xl ring-2 ring-slate-200`
                    : isPast
                    ? isDark ? 'bg-slate-900/30 border-slate-800/50 opacity-40' : 'bg-slate-100/50 border-slate-200 opacity-50'
                    : isDark ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                {/* INLINE COLOR SLIDING PROGRESS FILL */}
                {isActive && (
                  <div
                    className={`absolute top-0 left-0 bottom-0 ${getAccentFillBg()} transition-all duration-1000 ease-linear pointer-events-none`}
                    style={{ width: `${progressRatio * 100}%` }}
                  />
                )}

                <div className="relative p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 z-10">
                  <div className="flex items-start space-x-4 flex-1">
                    {role === 'teacher' && (
                      <div className="cursor-grab text-slate-400 transition pt-1">
                        <GripVertical className="w-5 h-5" />
                      </div>
                    )}

                    <div className="pt-1">
                      {isPast ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      ) : isActive ? (
                        <div className="relative flex items-center justify-center">
                          <span className={`animate-ping absolute inline-flex h-4 w-4 rounded-full opacity-75 ${getAccentBg()}`}></span>
                          <Circle className={`w-6 h-6 ${getAccentText()}`} />
                        </div>
                      ) : (
                        <Circle className="w-6 h-6 text-slate-400" />
                      )}
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className={`font-black tracking-tight transition-all duration-300 ${
                          isActive ? 'text-2xl' : 'text-xl'
                        }`}>
                          {block.title}
                        </h3>

                        {isActive && (
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${getAccentFillBg()} ${getAccentText()}`}>
                            Active
                          </span>
                        )}
                      </div>

                      {block.description && (
                        <p className={`text-sm leading-relaxed max-w-3xl ${
                          isDark ? 'text-slate-300' : 'text-slate-600'
                        }`}>
                          {block.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 flex-shrink-0 self-end md:self-center">
                    <div className="text-right font-mono">
                      {isActive && showCountdownTimer ? (
                        <div>
                          <div className={`text-3xl font-black tracking-tight ${getAccentText()}`}>
                            {formatTime(secondsRemaining)}
                          </div>
                          <div className="text-[10px] text-slate-400 uppercase tracking-widest font-sans">
                            Remaining
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className={`text-2xl font-black ${isActive ? getAccentText() : ''}`}>
                            {block.durationMinutes} min
                          </div>
                          <div className="text-[10px] text-slate-400 uppercase tracking-widest font-sans">
                            Allocated
                          </div>
                        </div>
                      )}
                    </div>

                    {block.resourceLink && (
                      <a
                        href={block.resourceLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className={`p-3 rounded-2xl border transition ${
                          isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-800'
                        }`}
                        title="Open Resource Link"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    )}

                    {role === 'teacher' && (
                      <div className={`flex items-center space-x-1 pl-2 border-l ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                        <button
                          onClick={(e) => startEditBlock(block, e)}
                          className="p-2 text-slate-400 hover:text-slate-600 transition"
                          title="Edit Block"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBlock(block.id, idx);
                          }}
                          className="p-2 text-slate-400 hover:text-rose-500 transition"
                          title="Delete Block"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* TEACHER PIN LOGIN MODAL */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`border rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-5 relative text-center ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <button
              onClick={() => {
                setIsPinModalOpen(false);
                setPinError(false);
              }}
              className="absolute top-4 right-4 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <div className={`mx-auto w-12 h-12 rounded-2xl border flex items-center justify-center ${getAccentFillBg()} ${getAccentText()} ${getAccentBorder()}`}>
              <Lock className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold">Teacher Authentication</h3>
              <p className="text-xs text-slate-400 mt-1">Enter your 4-digit PIN to unlock edit controls.</p>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <input
                type="password"
                maxLength={4}
                placeholder="PIN"
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                className={`w-full border rounded-2xl px-4 py-3 text-center text-2xl font-mono tracking-widest focus:outline-none ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
                autoFocus
              />

              {pinError && (
                <p className="text-xs text-rose-500 font-semibold">Incorrect PIN. Try again.</p>
              )}

              <button
                type="submit"
                className={`w-full py-3 ${getAccentBg()} text-white rounded-2xl text-xs font-semibold transition`}
              >
                Unlock Teacher Mode
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CHANGE PIN MODAL */}
      {isChangePinModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`border rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-5 relative text-center ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <button
              onClick={() => setIsChangePinModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <div className={`mx-auto w-12 h-12 rounded-2xl border flex items-center justify-center ${getAccentFillBg()} ${getAccentText()} ${getAccentBorder()}`}>
              <KeyRound className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold">Set Custom Teacher PIN</h3>
              <p className="text-xs text-slate-400 mt-1">Choose a new 4-digit PIN for your browser.</p>
            </div>

            <form onSubmit={handleSaveNewPin} className="space-y-4">
              <input
                type="text"
                maxLength={4}
                placeholder="New 4-Digit PIN"
                value={newPinInput}
                onChange={(e) => setNewPinInput(e.target.value.replace(/[^0-9]/g, ''))}
                className={`w-full border rounded-2xl px-4 py-3 text-center text-2xl font-mono tracking-widest focus:outline-none ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
                autoFocus
              />

              {pinChangeSuccess && (
                <p className="text-xs text-emerald-500 font-semibold">PIN Updated Successfully!</p>
              )}

              <button
                type="submit"
                disabled={newPinInput.length !== 4}
                className={`w-full py-3 ${getAccentBg()} text-white rounded-2xl text-xs font-semibold transition disabled:opacity-50`}
              >
                Save New PIN
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADD BLOCK MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`border rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 relative ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Add Pacing Element</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBlock} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase mb-1.5">
                  Activity Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Small Group Inquiry"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className={`w-full border rounded-2xl px-4 py-2.5 text-sm focus:outline-none ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase mb-1.5">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={formMinutes}
                  onChange={(e) => setFormMinutes(e.target.value)}
                  className={`w-full border rounded-2xl px-4 py-2.5 text-sm focus:outline-none ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase mb-1.5">
                  Description / Instructions
                </label>
                <textarea
                  placeholder="Instructions for students during this segment..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  rows={3}
                  className={`w-full border rounded-2xl px-4 py-2.5 text-sm focus:outline-none resize-none ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase mb-1.5">
                  Resource Link (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formLink}
                  onChange={(e) => setFormLink(e.target.value)}
                  className={`w-full border rounded-2xl px-4 py-2.5 text-sm focus:outline-none ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 ${getAccentBg()} text-white rounded-2xl text-xs font-semibold transition`}
                >
                  Add Element
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
