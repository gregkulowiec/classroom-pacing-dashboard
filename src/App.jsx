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
  Save
} from 'lucide-react';

const TEACHER_PIN = "1234";

export default function App() {
  const [role, setRole] = useState('student'); // 'teacher' | 'student'
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);
  
  // Display Options State
  const [showCountdownTimer, setShowCountdownTimer] = useState(false);

  // Lesson Configuration State
  const [periodTitle, setPeriodTitle] = useState('Math 3 - Problem Solving Lab');
  const [totalPeriodMinutes, setTotalPeriodMinutes] = useState(50);
  
  // Blocks Array
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

  // Active Execution State
  const [activeBlockIndex, setActiveBlockIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(8 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Modals / Editing States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBlockId, setEditingBlockId] = useState(null);
  
  // Form States for Add/Edit
  const [formTitle, setFormTitle] = useState('');
  const [formMinutes, setFormMinutes] = useState(10);
  const [formDesc, setFormDesc] = useState('');
  const [formLink, setFormLink] = useState('');

  const [copiedLink, setCopiedLink] = useState(false);

  // Check saved session auth on load
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

  const allocatedMinutes = blocks.reduce((acc, b) => acc + Number(b.durationMinutes), 0);
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
    if (enteredPin === TEACHER_PIN) {
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

  const handleLogoutTeacher = () => {
    setRole('student');
    sessionStorage.removeItem('pacing_teacher_auth');
  };

  // Drag and Drop Logic
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

    // Reset current timer if editing the active block
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-indigo-500/30">
      
      {/* HEADER BAR */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            {role === 'teacher' ? (
              <input
                type="text"
                value={periodTitle}
                onChange={(e) => setPeriodTitle(e.target.value)}
                className="bg-transparent text-xl font-bold text-white focus:outline-none focus:border-b focus:border-indigo-500 transition"
              />
            ) : (
              <h1 className="text-xl font-bold text-white">{periodTitle}</h1>
            )}
            <div className="flex items-center space-x-3 text-xs text-slate-400 mt-0.5">
              <span>Allocated: <strong className="text-slate-200">{allocatedMinutes} mins</strong></span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <span>Period Goal:</span>
                {role === 'teacher' ? (
                  <input
                    type="number"
                    value={totalPeriodMinutes}
                    onChange={(e) => setTotalPeriodMinutes(Number(e.target.value))}
                    className="w-12 bg-slate-800 border border-slate-700 rounded px-1 text-center text-slate-200"
                  />
                ) : (
                  <strong className="text-slate-200">{totalPeriodMinutes} mins</strong>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Global Action Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCountdownTimer(!showCountdownTimer)}
            className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 transition"
          >
            {showCountdownTimer ? <EyeOff className="w-4 h-4 text-indigo-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
            <span>{showCountdownTimer ? 'Hide Countdown' : 'Show Countdown'}</span>
          </button>

          {role === 'teacher' ? (
            <>
              <button
                onClick={copyStudentLink}
                className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-slate-400" />}
                <span>{copiedLink ? 'Link Copied!' : 'Share Student Link'}</span>
              </button>

              <button
                onClick={handleLogoutTeacher}
                className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition"
              >
                <Unlock className="w-4 h-4 text-emerald-400" />
                <span>Teacher Mode Unlocked</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsPinModalOpen(true)}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold transition"
            >
              <Lock className="w-4 h-4" />
              <span>Teacher Login</span>
            </button>
          )}
        </div>
      </header>

      {/* MAIN CONTENT AREA - FULL WIDTH DISPLAY */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        
        {/* Top Controls Bar */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-indigo-400" />
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
                      : 'bg-indigo-600 text-white hover:bg-indigo-500'
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
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    resetForm();
                    setIsAddModalOpen(true);
                  }}
                  className="flex items-center space-x-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl transition shadow-lg shadow-indigo-600/20"
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
                  className="bg-slate-900 border-2 border-indigo-500 rounded-3xl p-6 shadow-2xl space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">
                      Edit Activity Block #{idx + 1}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setEditingBlockId(null)}
                      className="text-slate-400 hover:text-white"
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
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
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
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
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
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
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
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingBlockId(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center space-x-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
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
                    ? 'bg-slate-900 border-indigo-500 shadow-2xl shadow-indigo-500/10 ring-2 ring-indigo-500/20'
                    : isPast
                    ? 'bg-slate-900/30 border-slate-800/50 opacity-50'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* INLINE COLOR SLIDING PROGRESS FILL (Active Block) */}
                {isActive && (
                  <div
                    className="absolute top-0 left-0 bottom-0 bg-indigo-600/20 transition-all duration-1000 ease-linear pointer-events-none"
                    style={{ width: `${progressRatio * 100}%` }}
                  />
                )}

                <div className="relative p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 z-10">
                  
                  {/* Left Column: Drag, Status, Title, Description */}
                  <div className="flex items-start space-x-4 flex-1">
                    {role === 'teacher' && (
                      <div className="cursor-grab text-slate-600 hover:text-slate-400 transition pt-1">
                        <GripVertical className="w-5 h-5" />
                      </div>
                    )}

                    <div className="pt-1">
                      {isPast ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      ) : isActive ? (
                        <div className="relative flex items-center justify-center">
                          <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-indigo-400 opacity-75"></span>
                          <Circle className="w-6 h-6 text-indigo-400 fill-indigo-400/20" />
                        </div>
                      ) : (
                        <Circle className="w-6 h-6 text-slate-600" />
                      )}
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className={`font-black tracking-tight transition-all duration-300 ${
                          isActive ? 'text-2xl text-white' : 'text-xl text-slate-200'
                        }`}>
                          {block.title}
                        </h3>

                        {isActive && (
                          <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Active
                          </span>
                        )}
                      </div>

                      {block.description && (
                        <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
                          {block.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Timer, Link, Teacher Actions */}
                  <div className="flex items-center space-x-6 flex-shrink-0 self-end md:self-center">
                    
                    {/* Optional Numerical Countdown vs Static Minutes */}
                    <div className="text-right font-mono">
                      {isActive && showCountdownTimer ? (
                        <div>
                          <div className="text-3xl font-black text-indigo-400 tracking-tight">
                            {formatTime(secondsRemaining)}
                          </div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-widest font-sans">
                            Remaining
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className={`text-2xl font-black ${isActive ? 'text-indigo-400' : 'text-slate-300'}`}>
                            {block.durationMinutes} min
                          </div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-widest font-sans">
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
                        className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-slate-700 transition"
                        title="Open Resource Link"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    )}

                    {role === 'teacher' && (
                      <div className="flex items-center space-x-1 pl-2 border-l border-slate-800">
                        <button
                          onClick={(e) => startEditBlock(block, e)}
                          className="p-2 text-slate-400 hover:text-indigo-400 transition"
                          title="Edit Block"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBlock(block.id, idx);
                          }}
                          className="p-2 text-slate-600 hover:text-rose-400 transition"
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
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-5 relative text-center">
            <button
              onClick={() => {
                setIsPinModalOpen(false);
                setPinError(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Lock className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Teacher Authentication</h3>
              <p className="text-xs text-slate-400 mt-1">Enter your 4-digit PIN to unlock edit controls.</p>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <input
                type="password"
                maxLength={4}
                placeholder="PIN"
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-widest text-white focus:outline-none focus:border-indigo-500 transition"
                autoFocus
              />

              {pinError && (
                <p className="text-xs text-rose-400 font-semibold">Incorrect PIN. Try again.</p>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition shadow-lg shadow-indigo-600/25"
              >
                Unlock Teacher Mode
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADD BLOCK MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Add Pacing Element</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition resize-none"
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition shadow-lg shadow-indigo-600/25"
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
