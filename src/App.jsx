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
  Key,
  Palette
} from 'lucide-react';

const ACCENT_COLORS = {
  blue: {
    name: 'Royal Blue',
    bg: 'bg-blue-600',
    hoverBg: 'hover:bg-blue-500',
    text: 'text-blue-500 dark:text-blue-400',
    border: 'border-blue-500',
    ring: 'ring-blue-500/30',
    progressBg: 'bg-blue-600/20',
    badgeBg: 'bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-500/30',
    shadow: 'shadow-blue-600/20'
  },
  emerald: {
    name: 'Emerald Green',
    bg: 'bg-emerald-600',
    hoverBg: 'hover:bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500',
    ring: 'ring-emerald-500/30',
    progressBg: 'bg-emerald-600/20',
    badgeBg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    shadow: 'shadow-emerald-600/20'
  },
  amber: {
    name: 'Warm Amber',
    bg: 'bg-amber-500',
    hoverBg: 'hover:bg-amber-400',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500',
    ring: 'ring-amber-500/30',
    progressBg: 'bg-amber-500/20',
    badgeBg: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    shadow: 'shadow-amber-500/20'
  },
  cyan: {
    name: 'Ocean Cyan',
    bg: 'bg-cyan-600',
    hoverBg: 'hover:bg-cyan-500',
    text: 'text-cyan-600 dark:text-cyan-400',
    border: 'border-cyan-500',
    ring: 'ring-cyan-500/30',
    progressBg: 'bg-cyan-600/20',
    badgeBg: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
    shadow: 'shadow-cyan-600/20'
  },
  rose: {
    name: 'Vibrant Rose',
    bg: 'bg-rose-600',
    hoverBg: 'hover:bg-rose-500',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500',
    ring: 'ring-rose-500/30',
    progressBg: 'bg-rose-600/20',
    badgeBg: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
    shadow: 'shadow-rose-600/20'
  }
};

export default function App() {
  const [role, setRole] = useState('student');
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isChangePinModalOpen, setIsChangePinModalOpen] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Local Storage State Management
  const [teacherPin, setTeacherPin] = useState(() => localStorage.getItem('pacing_teacher_pin') || '1234');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('pacing_theme');
    return saved ? saved === 'dark' : true;
  });
  const [accentKey, setAccentKey] = useState(() => localStorage.getItem('pacing_accent') || 'blue');
  const [showCountdownTimer, setShowCountdownTimer] = useState(false);

  // Lesson Configuration State
  const [periodTitle, setPeriodTitle] = useState('Math 3 - Problem Solving Lab');
  const [totalPeriodMinutes, setTotalPeriodMinutes] = useState(50);

  // Blocks Array State
  const [blocks, setBlocks] = useState([
    {
      id: '1',
      title: 'Warm-Up & Daily Problem',
      durationMinutes: 8,
      description: 'Review yesterday\'s exit ticket problem on whiteboard. Focus on boundary conditions.',
      resourceLink: 'https://desmos.com'
    },
    {
      id: '2',
      title: 'Group Strategy & Brainstorming',
      durationMinutes: 15,
      description: 'Break into assigned trios. Draft 2 distinct approaches before calculating.',
      resourceLink: 'https://mercersburg.edu'
    },
    {
      id: '3',
      title: 'Independent Execution',
      durationMinutes: 20,
      description: 'Complete problem set #4-#7. Raise hand for hint tokens if stuck on step 2.',
      resourceLink: ''
    },
    {
      id: '4',
      title: 'Synthesis & Exit Reflection',
      durationMinutes: 7,
      description: 'Submit your solution sheet and complete the quick digital reflection poll.',
      resourceLink: 'https://forms.google.com'
    }
  ]);

  // Timer & Drag States
  const [activeBlockIndex, setActiveBlockIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(8 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Modals & Forms
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBlockId, setEditingBlockId] = useState(null);
  
  const [formTitle, setFormTitle] = useState('');
  const [formMinutes, setFormMinutes] = useState(10);
  const [formDesc, setFormDesc] = useState('');
  const [formLink, setFormLink] = useState('');

  const [copiedLink, setCopiedLink] = useState(false);

  const accent = ACCENT_COLORS[accentKey] || ACCENT_COLORS.blue;

  useEffect(() => {
    localStorage.setItem('pacing_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('pacing_accent', accentKey);
  }, [accentKey]);

  useEffect(() => {
    localStorage.setItem('pacing_teacher_pin', teacherPin);
  }, [teacherPin]);

  useEffect(() => {
    const isTeacherAuth = sessionStorage.getItem('pacing_teacher_auth');
    if (isTeacherAuth === 'true') {
      setRole('teacher');
    }
  }, []);

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
      setPinError('');
    } else {
      setPinError('Incorrect PIN code. Please try again.');
      setEnteredPin('');
    }
  };

  const handleUpdatePin = (e) => {
    e.preventDefault();
    if (newPinInput.length !== 4 || !/^\d+$/.test(newPinInput)) {
      setPinError('PIN must be exactly 4 digits.');
      return;
    }
    if (newPinInput !== confirmPinInput) {
      setPinError('PIN entries do not match.');
      return;
    }

    setTeacherPin(newPinInput);
    setIsChangePinModalOpen(false);
    setNewPinInput('');
    setConfirmPinInput('');
    setPinError('');
    alert('Teacher PIN successfully updated!');
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

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans selection:bg-slate-500/30 ${
      darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-800'
    }`}>
      
      {/* HEADER BAR */}
      <header className={`border-b sticky top-0 z-30 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur ${
        darkMode ? 'bg-slate-900/80 border-slate-800/80' : 'bg-white/80 border-slate-200'
      }`}>
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 w-full sm:w-auto text-center sm:text-left">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl border ${accent.badgeBg}`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              {role === 'teacher' ? (
                <input
                  type="text"
                  value={periodTitle}
                  onChange={(e) => setPeriodTitle(e.target.value)}
                  className={`bg-transparent text-xl font-bold focus:outline-none border-b border-dashed border-slate-400/50 hover:border-slate-400 transition ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}
                  placeholder="Period Title"
                />
              ) : (
                <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{periodTitle}</h1>
              )}
            </div>
          </div>

          {/* PROMINENT PERIOD GOAL DISPLAY */}
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-2xl border ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <Clock className={`w-5 h-5 ${accent.text}`} />
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
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
                  className={`w-16 text-center text-xl font-extrabold rounded-lg font-mono focus:outline-none focus:ring-2 ${accent.ring} ${
                    darkMode ? 'bg-slate-950 text-white border-slate-700' : 'bg-white text-slate-900 border-slate-300'
                  }`}
                />
                <span className="text-sm font-bold text-slate-400">min</span>
              </div>
            ) : (
              <span className={`text-xl font-extrabold font-mono ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {totalPeriodMinutes} <span className="text-sm font-normal text-slate-400">min</span>
              </span>
            )}
          </div>
        </div>

        {/* CONTROLS & TOGGLES */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {/* Theme Toggle Button */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2.5 rounded-xl border transition ${
              darkMode ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Accent Color Picker Selector */}
          <div className={`flex items-center space-x-1 p-1 rounded-xl border ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <Palette className="w-3.5 h-3.5 mx-1 text-slate-400" />
            {Object.keys(ACCENT_COLORS).map((key) => (
              <button
                key={key}
                onClick={() => setAccentKey(key)}
                className={`w-5 h-5 rounded-full transition transform hover:scale-110 ${ACCENT_COLORS[key].bg} ${
                  accentKey === key ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'opacity-70'
                }`}
                title={ACCENT_COLORS[key].name}
              />
            ))}
          </div>

          {/* Countdown Toggle */}
          <button
            onClick={() => setShowCountdownTimer(!showCountdownTimer)}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition ${
              darkMode ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {showCountdownTimer ? <EyeOff className={`w-4 h-4 ${accent.text}`} /> : <Eye className="w-4 h-4 text-slate-400" />}
            <span className="hidden sm:inline">{showCountdownTimer ? 'Hide Timer' : 'Show Timer'}</span>
          </button>

          {/* Teacher Mode & Share Options */}
          {role === 'teacher' ? (
            <>
              <button
                onClick={copyStudentLink}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4 text-slate-400" />}
                <span className="hidden sm:inline">{copiedLink ? 'Copied!' : 'Share Link'}</span>
              </button>

              <button
                onClick={() => setIsChangePinModalOpen(true)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition ${
                  darkMode ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
                title="Change Teacher PIN"
              >
                <Key className="w-4 h-4 text-amber-500" />
                <span className="hidden lg:inline">Change PIN</span>
              </button>

              <button
                onClick={handleLogoutTeacher}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition ${accent.badgeBg}`}
              >
                <Unlock className="w-4 h-4 text-emerald-500" />
                <span>Teacher Unlocked</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsPinModalOpen(true)}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition ${
                darkMode ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Teacher Login</span>
            </button>
          )}
        </div>
      </header>

      {}
      <main className="max-w-7xl w-full mx-auto p-6 space-y-6">
        
        {/* TOP CONTROLS & TIMERS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
            <Clock className={`w-4 h-4 ${accent.text}`} />
            <span>Classroom Agenda & Pacing ({blocks.length} Activities)</span>
          </h2>

          <div className="flex items-center space-x-3">
            {role === 'teacher' && (
              <>
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg ${
                    isRunning
                      ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                      : `${accent.bg} ${accent.hoverBg} text-white ${accent.shadow}`
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
                    darkMode ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
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
                  className={`flex items-center space-x-1.5 text-xs font-semibold ${accent.bg} ${accent.hoverBg} text-white px-3.5 py-2 rounded-xl transition shadow-lg ${accent.shadow}`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Block</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* FULL WIDTH PACING BLOCKS LIST */}
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
                  className={`border-2 rounded-3xl p-6 shadow-2xl space-y-4 ${accent.border} ${
                    darkMode ? 'bg-slate-900' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className={`text-sm font-bold uppercase tracking-wider ${accent.text}`}>
                      Edit Activity Block #{idx + 1}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setEditingBlockId(null)}
                      className="text-slate-400 hover:text-slate-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                        Activity Title
                      </label>
                      <input
                        type="text"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className={`w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none border ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                        Duration (Mins)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={formMinutes}
                        onChange={(e) => setFormMinutes(e.target.value)}
                        className={`w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none border ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                      Description / Instructions
                    </label>
                    <textarea
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                      rows={2}
                      className={`w-full rounded-xl px-4 py-2 text-sm focus:outline-none border resize-none ${
                        darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                      Resource Link (Optional)
                    </label>
                    <input
                      type="url"
                      value={formLink}
                      onChange={(e) => setFormLink(e.target.value)}
                      className={`w-full rounded-xl px-4 py-2 text-sm focus:outline-none border ${
                        darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingBlockId(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={`flex items-center space-x-1.5 px-5 py-2 ${accent.bg} ${accent.hoverBg} text-white rounded-xl text-xs font-semibold transition`}
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
                    ? `${accent.border} shadow-xl ring-2 ${accent.ring} ${darkMode ? 'bg-slate-900' : 'bg-white'}`
                    : isPast
                    ? `${darkMode ? 'bg-slate-900/30 border-slate-800/50' : 'bg-slate-100/50 border-slate-200'} opacity-50`
                    : `${darkMode ? 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'}`
                }`}
              >
                {/* SLIDING COLOR PROGRESS BAR (No Purple) */}
                {isActive && (
                  <div
                    className={`absolute top-0 left-0 bottom-0 ${accent.progressBg} transition-all duration-1000 ease-linear pointer-events-none`}
                    style={{ width: `${progressRatio * 100}%` }}
                  />
                )}

                <div className="relative p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 z-10">
                  <div className="flex items-start space-x-4 flex-1">
                    {role === 'teacher' && (
                      <div className="cursor-grab text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition pt-1">
                        <GripVertical className="w-5 h-5" />
                      </div>
                    )}

                    <div className="pt-1">
                      {isPast ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      ) : isActive ? (
                        <div className="relative flex items-center justify-center">
                          <span className={`animate-ping absolute inline-flex h-4 w-4 rounded-full ${accent.bg} opacity-75`}></span>
                          <Circle className={`w-6 h-6 ${accent.text}`} />
                        </div>
                      ) : (
                        <Circle className="w-6 h-6 text-slate-400" />
                      )}
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className={`font-black tracking-tight transition-all duration-300 ${
                          isActive ? `text-2xl ${darkMode ? 'text-white' : 'text-slate-900'}` : `text-xl ${darkMode ? 'text-slate-200' : 'text-slate-800'}`
                        }`}>
                          {block.title}
                        </h3>

                        {isActive && (
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${accent.badgeBg}`}>
                            Active
                          </span>
                        )}
                      </div>

                      {block.description && (
                        <p className={`text-sm leading-relaxed max-w-3xl ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                          {block.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 flex-shrink-0 self-end md:self-center">
                    <div className="text-right font-mono">
                      {isActive && showCountdownTimer ? (
                        <div>
                          <div className={`text-3xl font-black tracking-tight ${accent.text}`}>
                            {formatTime(secondsRemaining)}
                          </div>
                          <div className="text-[10px] text-slate-400 uppercase tracking-widest font-sans">
                            Remaining
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className={`text-2xl font-black ${isActive ? accent.text : (darkMode ? 'text-slate-300' : 'text-slate-700')}`}>
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
                          darkMode ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                        }`}
                        title="Open Resource Link"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    )}

                    {role === 'teacher' && (
                      <div className={`flex items-center space-x-1 pl-2 border-l ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                        <button
                          onClick={(e) => startEditBlock(block, e)}
                          className={`p-2 transition ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
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

      {}
      {/* LOGIN MODAL */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-5 relative text-center border ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <button
              onClick={() => {
                setIsPinModalOpen(false);
                setPinError('');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className={`mx-auto w-12 h-12 rounded-2xl flex items-center justify-center border ${accent.badgeBg}`}>
              <Lock className="w-6 h-6" />
            </div>

            <div>
              <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Teacher Login</h3>
              <p className="text-xs text-slate-400 mt-1">Enter your custom 4-digit PIN to access controls.</p>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <input
                type="password"
                maxLength={4}
                placeholder="PIN"
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                className={`w-full border rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-widest focus:outline-none transition ${
                  darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
                autoFocus
              />

              {pinError && (
                <p className="text-xs text-rose-500 font-semibold">{pinError}</p>
              )}

              <button
                type="submit"
                className={`w-full py-3 ${accent.bg} ${accent.hoverBg} text-white rounded-xl text-xs font-semibold transition shadow-lg ${accent.shadow}`}
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
          <div className={`rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-5 relative text-center border ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <button
              onClick={() => {
                setIsChangePinModalOpen(false);
                setPinError('');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mx-auto w-12 h-12 rounded-2xl flex items-center justify-center border bg-amber-500/15 text-amber-500 border-amber-500/30">
              <Key className="w-6 h-6" />
            </div>

            <div>
              <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Set Custom Teacher PIN</h3>
              <p className="text-xs text-slate-400 mt-1">This PIN will be saved in your browser storage.</p>
            </div>

            <form onSubmit={handleUpdatePin} className="space-y-3">
              <input
                type="password"
                maxLength={4}
                placeholder="New 4-Digit PIN"
                value={newPinInput}
                onChange={(e) => setNewPinInput(e.target.value)}
                className={`w-full border rounded-xl px-4 py-2.5 text-center text-xl font-mono tracking-widest focus:outline-none transition ${
                  darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
                required
              />

              <input
                type="password"
                maxLength={4}
                placeholder="Confirm New PIN"
                value={confirmPinInput}
                onChange={(e) => setConfirmPinInput(e.target.value)}
                className={`w-full border rounded-xl px-4 py-2.5 text-center text-xl font-mono tracking-widest focus:outline-none transition ${
                  darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
                required
              />

              {pinError && (
                <p className="text-xs text-rose-500 font-semibold">{pinError}</p>
              )}

              <button
                type="submit"
                className={`w-full py-3 ${accent.bg} ${accent.hoverBg} text-white rounded-xl text-xs font-semibold transition shadow-lg ${accent.shadow}`}
              >
                Save Custom PIN
              </button>
            </form>
          </div>
        </div>
      )}

      {}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 relative border ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Add Pacing Element</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBlock} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                  Activity Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Small Group Inquiry"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={formMinutes}
                  onChange={(e) => setFormMinutes(e.target.value)}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                  Description / Instructions
                </label>
                <textarea
                  placeholder="Instructions for students during this segment..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  rows={3}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition resize-none ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                  Resource Link (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formLink}
                  onChange={(e) => setFormLink(e.target.value)}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 ${accent.bg} ${accent.hoverBg} text-white rounded-xl text-xs font-semibold transition shadow-lg ${accent.shadow}`}
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
