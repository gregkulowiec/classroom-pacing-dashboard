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
  Maximize2,
  Lock,
  Unlock,
  Check
} from 'lucide-react';

// SET YOUR DESIRED TEACHER SECRET PIN HERE:
const TEACHER_PIN = "1234"; 

export default function App() {
  // Role State: Default to 'student' so public visitors/projected screen cannot edit
  const [role, setRole] = useState('student'); // 'teacher' | 'student'
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);
  
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

  // New Block Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newMinutes, setNewMinutes] = useState(10);
  const [newDesc, setNewDesc] = useState('');
  const [newLink, setNewLink] = useState('');

  // Share Link Feedback
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

  // PIN Authentication Handler
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
    if (!newTitle) return;

    const newBlock = {
      id: String(Date.now()),
      title: newTitle,
      durationMinutes: Number(newMinutes) || 5,
      description: newDesc,
      resourceLink: newLink
    };

    setBlocks([...blocks, newBlock]);
    setNewTitle('');
    setNewMinutes(10);
    setNewDesc('');
    setNewLink('');
    setIsAddModalOpen(false);
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

        {/* Auth / Mode Controls */}
        <div className="flex items-center space-x-3">
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

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Pacing Blocks Dashboard (7 Cols) */}
        <section className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Classroom Pacing Blocks ({blocks.length})
            </h2>
            {role === 'teacher' && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center space-x-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition shadow-lg shadow-indigo-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>Add Element</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {blocks.map((block, idx) => {
              const isActive = idx === activeBlockIndex;
              const isPast = idx < activeBlockIndex;

              return (
                <div
                  key={block.id}
                  draggable={role === 'teacher'}
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragEnd={handleDragEnd}
                  onClick={() => role === 'teacher' && selectBlock(idx)}
                  className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                    role === 'teacher' ? 'cursor-pointer' : ''
                  } ${
                    isActive
                      ? 'bg-slate-900 border-indigo-500/80 shadow-2xl shadow-indigo-500/10 ring-1 ring-indigo-500/30'
                      : isPast
                      ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {isActive && (
                    <div
                      className="absolute top-0 left-0 bottom-0 bg-indigo-600/15 transition-all duration-1000 ease-linear pointer-events-none"
                      style={{ width: `${progressRatio * 100}%` }}
                    />
                  )}

                  <div className="relative p-5 flex items-center justify-between gap-4 z-10">
                    <div className="flex items-center space-x-3">
                      {role === 'teacher' && (
                        <div className="cursor-grab text-slate-600 hover:text-slate-400 transition">
                          <GripVertical className="w-5 h-5" />
                        </div>
                      )}

                      <div>
                        {isPast ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : isActive ? (
                          <div className="relative flex items-center justify-center">
                            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-indigo-400 opacity-75"></span>
                            <Circle className="w-5 h-5 text-indigo-400 fill-indigo-400/20" />
                          </div>
                        ) : (
                          <Circle className="w-5 h-5 text-slate-600" />
                        )}
                      </div>

                      <div>
                        <h3 className={`font-bold transition-all duration-500 ${
                          isActive ? 'text-lg text-white font-extrabold' : 'text-base text-slate-300'
                        }`}>
                          {block.title}
                        </h3>
                        {block.description && (
                          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5 max-w-md">
                            {block.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 flex-shrink-0">
                      {block.resourceLink && (
                        <a
                          href={block.resourceLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-slate-700 transition"
                          title="Open Resource Link"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}

                      <div className="text-right font-mono">
                        <div className={`text-base font-bold ${isActive ? 'text-indigo-400' : 'text-slate-300'}`}>
                          {block.durationMinutes} min
                        </div>
                      </div>

                      {role === 'teacher' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBlock(block.id, idx);
                          }}
                          className="p-1.5 text-slate-600 hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* RIGHT COLUMN: Active Focus Display & Controls (5 Cols) */}
        <section className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col items-center text-center space-y-6">
            
            <div className="flex items-center space-x-2 bg-indigo-500/10 text-indigo-400 px-3.5 py-1.5 rounded-full border border-indigo-500/20 text-xs font-semibold uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5" />
              <span>Current Activity</span>
            </div>

            <h2 className="text-2xl font-black text-white max-w-sm leading-tight">
              {currentBlock ? currentBlock.title : 'No Activity Selected'}
            </h2>

            {/* BIG COUNTDOWN DISPLAY */}
            <div className="relative my-2">
              <div className="text-6xl lg:text-7xl font-black font-mono tracking-tighter bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
                {formatTime(secondsRemaining)}
              </div>
              <div className="text-xs text-slate-500 font-mono mt-1 uppercase tracking-widest">
                Time Remaining
              </div>
            </div>

            {/* PROGRESS BAR */}
            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 relative">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-1000 ease-linear"
                style={{ width: `${progressRatio * 100}%` }}
              />
            </div>

            {/* Description & Links */}
            {currentBlock && (
              <div className="space-y-4 pt-2 border-t border-slate-800/80 w-full text-left">
                {currentBlock.description && (
                  <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/60">
                    {currentBlock.description}
                  </p>
                )}

                {currentBlock.resourceLink && (
                  <a
                    href={currentBlock.resourceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3.5 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition group"
                  >
                    <span className="truncate pr-2">Resource: {currentBlock.resourceLink}</span>
                    <ExternalLink className="w-4 h-4 flex-shrink-0 group-hover:translate-x-0.5 transition" />
                  </a>
                )}
              </div>
            )}

            {/* Teacher Only Controls */}
            {role === 'teacher' && (
              <div className="flex items-center justify-center space-x-3 pt-2 w-full">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3.5 px-6 rounded-2xl font-semibold transition shadow-xl ${
                    isRunning
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25'
                  }`}
                >
                  {isRunning ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                  <span>{isRunning ? 'Pause' : 'Start Timer'}</span>
                </button>

                <button
                  onClick={() => {
                    setIsRunning(false);
                    setSecondsRemaining(currentBlock ? currentBlock.durationMinutes * 60 : 0);
                  }}
                  className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </section>
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
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
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
                  value={newMinutes}
                  onChange={(e) => setNewMinutes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                  Description / Prompt
                </label>
                <textarea
                  placeholder="Instructions for students during this segment..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
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
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
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
