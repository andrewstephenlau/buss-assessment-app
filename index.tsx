import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  ShieldCheck, 
  BookOpen, 
  User, 
  BarChart3, 
  PlusCircle, 
  Save, 
  Trash2, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  LogOut,
  Download,
  Calendar,
  MapPin,
  Hash,
  Lock,
  Repeat
} from 'lucide-react';

import { Assessment, Question, ResultLog, ActiveSession } from './types';
import { getAssessments, saveAssessment, deleteAssessment, saveResult, getResults, saveSession, getSession, clearSession } from './db';
import { generateQuestionsFromText } from './ai';

// --- COMPONENTS ---

const Header = ({ title, subtitle, isAdmin, onLogout }: { title: string, subtitle?: string, isAdmin?: boolean, onLogout?: () => void }) => (
  <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
    <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${isAdmin ? 'bg-blue-100 text-blue-700' : 'bg-blue-50 text-blue-600'}`}>
          <ShieldCheck size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 leading-tight">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
      {onLogout && (
        <button onClick={onLogout} className="text-gray-500 hover:text-blue-700 flex items-center gap-2 text-sm font-medium">
          <LogOut size={16} /> Exit
        </button>
      )}
    </div>
  </header>
);

// --- VIEW: HOME / LANDING ---

const HomeView = ({ onSelectMode }: { onSelectMode: (mode: 'admin' | 'user') => void }) => (
  <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-gray-50">
    <div className="max-w-md w-full text-center space-y-8">
      <div className="flex justify-center mb-6">
        <div className="bg-blue-600 p-4 rounded-2xl shadow-xl shadow-blue-200">
          <ShieldCheck size={64} className="text-white" />
        </div>
      </div>
      <h1 className="text-4xl font-extrabold text-gray-900">e-Assessment</h1>
      <p className="text-lg text-gray-600">Secure, reliable assessment platform with instant grading.</p>
      
      <div className="grid gap-4 pt-8">
        <button 
          onClick={() => onSelectMode('user')}
          className="w-full bg-white border-2 border-gray-200 hover:border-blue-400 hover:text-blue-600 hover:shadow-lg transition-all p-6 rounded-xl flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 text-blue-600 p-3 rounded-lg">
              <User size={24} />
            </div>
            <div className="text-left">
              <span className="block font-bold text-lg">Assessment</span>
              <span className="text-sm text-gray-500">Take an assessment</span>
            </div>
          </div>
          <ArrowRight className="text-gray-300 group-hover:text-blue-500" />
        </button>

        <button 
          onClick={() => onSelectMode('admin')}
          className="w-full bg-white border-2 border-gray-200 hover:border-blue-700 hover:text-blue-800 hover:shadow-lg transition-all p-6 rounded-xl flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 text-blue-800 p-3 rounded-lg">
              <BookOpen size={24} />
            </div>
            <div className="text-left">
              <span className="block font-bold text-lg">Admin Portal</span>
              <span className="text-sm text-gray-500">Manage assessments & results</span>
            </div>
          </div>
          <ArrowRight className="text-gray-300 group-hover:text-blue-700" />
        </button>
      </div>
    </div>
  </div>
);

// --- VIEW: ADMIN LOGIN ---

const AdminLogin = ({ onLogin, onCancel }: { onLogin: () => void, onCancel: () => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'buss123') {
      onLogin();
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6 bg-blue-700 text-white flex items-center gap-3">
          <Lock size={24} />
          <h2 className="text-xl font-bold">Admin Access</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium flex items-center gap-2">
              <AlertTriangle size={16} /> {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-black" 
              placeholder="Enter username"
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-black" 
              placeholder="Enter password"
            />
          </div>

          <div className="flex gap-4 pt-2">
            <button 
              type="button" 
              onClick={onCancel}
              className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 py-3 px-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- VIEW: ADMIN DASHBOARD ---

const AdminDashboard = ({ onNavigate }: { onNavigate: (view: string, id?: string) => void }) => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [results, setResults] = useState<ResultLog[]>([]);
  const [activeTab, setActiveTab] = useState<'assessments' | 'reports'>('assessments');

  useEffect(() => {
    getAssessments().then(setAssessments);
    getResults().then(setResults);
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this assessment? \n\nWARNING: If you delete this, you will no longer be able to generate detailed question-by-question reports for past results.')) {
      await deleteAssessment(id);
      setAssessments(await getAssessments());
    }
  };

  const handleExportTopicCSV = (assessmentId: string) => {
    // Find the assessment details
    const assessment = assessments.find(a => a.id === assessmentId);
    if (!assessment) return alert('Assessment definition not found. Cannot generate detailed report because the questions have been deleted.');

    // Filter results for this assessment
    const topicResults = results.filter(r => r.assessmentId === assessmentId);
    if (topicResults.length === 0) return alert('No results found for this topic.');

    // Prepare CSV Headers: Standard fields + Q1, Q2, Q3...
    const stdHeaders = ['Assessment Title', 'Date', 'Time', 'Student Name', 'Agent Code', 'Location', 'Score', 'Result'];
    const questionHeaders = assessment.questions.map((q, i) => `Q${i + 1}: ${q.text.substring(0, 30).replace(/,/g, '')}...`); // Truncate and clean for CSV header
    
    const headers = [...stdHeaders, ...questionHeaders];

    const rows = topicResults.map(r => {
      const date = new Date(r.timestamp);
      
      // Map user answers to the columns
      const answerCells = assessment.questions.map(q => {
        const selectedOptId = r.answers?.[q.id];
        // If we have an answer ID, try to find the text, or just show the ID
        const optText = q.options.find(o => o.id === selectedOptId)?.text || selectedOptId || '-';
        return `"${optText.replace(/"/g, '""')}"`; // CSV escape
      });

      return [
        `"${r.assessmentTitle || assessment.title}"`,
        `"${date.toLocaleDateString()}"`,
        `"${date.toLocaleTimeString()}"`,
        `"${r.studentName}"`,
        `"${r.agentCode || '-'}"`,
        `"${r.location || '-'}"`,
        `="${r.score}/${r.totalQuestions}"`, // FORCE EXCEL TEXT FORMAT: ="7/20"
        `"${r.passed ? 'PASSED' : 'FAILED'}"`,
        ...answerCells
      ].join(',');
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    const safeTitle = assessment.title.replace(/[^a-z0-9]/gi, '_');
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Report_${safeTitle}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Group unique assessments from results for the reports view
  const resultGroups = Array.from(new Set(results.map(r => r.assessmentId))).map(id => {
    const meta = results.find(r => r.assessmentId === id);
    const count = results.filter(r => r.assessmentId === id).length;
    const passCount = results.filter(r => r.assessmentId === id && r.passed).length;
    return {
      id,
      title: meta?.assessmentTitle || 'Unknown Assessment',
      count,
      passRate: count > 0 ? Math.round((passCount / count) * 100) : 0
    };
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Admin Dashboard" subtitle="Manage assessments & results" isAdmin onLogout={() => onNavigate('HOME')} />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setActiveTab('assessments')}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${activeTab === 'assessments' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            <BookOpen size={18} /> Assessments
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${activeTab === 'reports' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            <BarChart3 size={18} /> Student Reports
          </button>
        </div>

        {activeTab === 'assessments' && (
          <div className="space-y-6">
            <button 
              onClick={() => onNavigate('ADMIN_CREATE')}
              className="w-full border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-500 hover:text-blue-600 p-8 rounded-xl flex flex-col items-center justify-center transition-colors"
            >
              <PlusCircle size={40} className="mb-2" />
              <span className="font-semibold text-lg">Create New Assessment</span>
              <span className="text-sm">Import from text or create manually</span>
            </button>

            <div className="grid gap-4">
              {assessments.map(a => (
                <div key={a.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{a.title}</h3>
                    <p className="text-sm text-gray-500">{a.category} • {a.questions.length} Questions • Created {new Date(a.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleDelete(a.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
              {assessments.length === 0 && <p className="text-center text-gray-400">No assessments found.</p>}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="grid gap-6">
            {resultGroups.map(group => (
              <div key={group.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900">{group.title}</h3>
                  <div className="flex gap-4 text-sm text-gray-500 mt-1">
                    <span className="flex items-center gap-1"><User size={14}/> {group.count} Attempts</span>
                    <span className="flex items-center gap-1"><CheckCircle size={14}/> {group.passRate}% Pass Rate</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleExportTopicCSV(group.id)} 
                  className="w-full md:w-auto px-4 py-2 bg-blue-100 text-blue-700 font-bold rounded-lg hover:bg-blue-200 flex items-center justify-center gap-2"
                >
                  <Download size={18} /> Download CSV
                </button>
              </div>
            ))}
            
            {resultGroups.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
                <BarChart3 className="mx-auto text-gray-300 mb-2" size={48} />
                <p className="text-gray-500">No results recorded yet.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

// --- VIEW: ADMIN CREATE ---

const AdminCreate = ({ onNavigate }: { onNavigate: (view: string) => void }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [rawText, setRawText] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);

  const fillSample = () => {
    setTitle("FIRE SAFETY BASIC");
    setCategory("SAFETY COMPLIANCE");
    setRawText(`Fire safety is the set of practices intended to reduce the destruction caused by fire. Fire safety measures include those that are intended to prevent ignition of an uncontrolled fire, and those that are used to limit the development and effects of a fire after it starts.
    
    Key elements include:
    1. Fire Alarms: Devices that warn people of a fire.
    2. Extinguishers: Portable devices used to put out small fires. Types include Water, Foam, CO2, and Powder.
    3. Evacuation Routes: Planned paths to exit a building safely.
    4. Assembly Points: Safe areas outside the building where people gather.
    5. Smoke Detectors: Sensors that detect smoke and trigger alarms.
    
    PASS (Pull, Aim, Squeeze, Sweep) is the standard method for using an extinguisher.
    Class A fires involve ordinary combustibles like wood and paper.
    Class B fires involve flammable liquids.
    Class C fires involve electrical equipment.
    
    Never use water on an electrical fire.
    Stop, Drop, and Roll if your clothes catch fire.
    Keep fire doors closed to prevent spread.
    Do not use elevators during a fire.`);
  };

  const handleGenerate = async () => {
    if (!rawText.trim()) return alert('Please enter some text');
    setLoading(true);
    try {
      const generated = await generateQuestionsFromText(rawText);
      setQuestions(generated);
      setStep(2);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title || !category) return alert('Please enter title and category');
    const newAssessment: Assessment = {
      id: crypto.randomUUID(),
      title,
      category,
      createdAt: new Date().toISOString(),
      isActive: true,
      questions
    };
    await saveAssessment(newAssessment);
    onNavigate('ADMIN_DASHBOARD');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="New Assessment" subtitle="Step-by-step wizard" isAdmin onLogout={() => onNavigate('ADMIN_DASHBOARD')} />
      <main className="max-w-4xl mx-auto px-4 py-8">
        
        {step === 1 && (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <FileText className="text-blue-600" /> 
              Step 1: Import Content
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assessment Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value.toUpperCase())}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase bg-white text-black" 
                  placeholder="E.G. FIRE SAFETY 101" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input 
                  type="text" 
                  value={category}
                  onChange={e => setCategory(e.target.value.toUpperCase())}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase bg-white text-black" 
                  placeholder="E.G. SAFETY COMPLIANCE" 
                />
              </div>
              <div>
                <div className="flex justify-between items-end mb-1">
                  <label className="block text-sm font-medium text-gray-700">Source Material</label>
                  <button onClick={fillSample} className="text-xs text-blue-600 hover:underline font-medium">Insert Sample Text for Testing</button>
                </div>
                <p className="text-xs text-gray-500 mb-2">Paste content from your PDF/Word doc here. AI will extract 20 questions.</p>
                <textarea 
                  value={rawText}
                  onChange={e => setRawText(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg h-64 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm bg-white text-black"
                  placeholder="Paste assessment content here..."
                ></textarea>
              </div>
              <button 
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 flex justify-center items-center gap-3 disabled:opacity-70"
              >
                {loading ? <RefreshCw className="animate-spin" /> : <div className="flex items-center gap-2"><div className="text-yellow-300">✨</div> Generate 20 Questions</div>}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 flex items-center gap-3 text-green-800">
              <CheckCircle />
              <span className="font-medium">Successfully generated {questions.length} questions!</span>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
              {questions.map((q, i) => (
                <div key={q.id} className="p-6">
                  <div className="flex gap-4">
                    <span className="bg-gray-100 text-gray-600 font-bold px-3 py-1 rounded h-fit text-sm">Q{i+1}</span>
                    <div className="flex-1">
                      <p className="font-medium text-lg mb-4">{q.text}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {q.options.map(opt => (
                          <div key={opt.id} className={`p-3 rounded-lg border ${opt.id === q.correctOptionId ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'}`}>
                            <span className="font-semibold mr-2">{opt.id.toUpperCase()}.</span>
                            {opt.text}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="flex-1 py-4 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold text-gray-700">Back</button>
              <button onClick={handleSave} className="flex-1 py-4 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold shadow-lg flex items-center justify-center gap-2">
                <Save size={20} /> Save Assessment
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

// --- VIEW: USER PORTAL ---

const UserPortal = ({ onNavigate, setSessionData }: { onNavigate: (view: string, id?: string) => void, setSessionData: any }) => {
  const [name, setName] = useState('');
  const [agentCode, setAgentCode] = useState('');
  const [location, setLocation] = useState('Buss Oasis');
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [resumableSession, setResumableSession] = useState<ActiveSession | null>(null);

  const locations = ['Buss Oasis', 'Buss Melaka', 'Buss BM'];

  useEffect(() => {
    getAssessments().then(setAssessments);
    const session = getSession();
    if (session) setResumableSession(session);
  }, []);

  const handleStart = (assessment: Assessment) => {
    if (!name.trim()) return alert('Please enter your name');
    if (!agentCode.trim()) return alert('Please enter your Agent Code');
    
    setSessionData({ 
      studentName: name, 
      agentCode, 
      location, 
      assessment 
    });
    onNavigate('ASSESSMENT_RUNNER');
  };

  const handleResume = () => {
    if (resumableSession) {
      const assessment = assessments.find(a => a.id === resumableSession.assessmentId);
      if (assessment) {
        setSessionData({ 
          studentName: resumableSession.studentName, 
          agentCode: resumableSession.agentCode, 
          location: resumableSession.location, 
          assessment, 
          existingSession: resumableSession 
        });
        onNavigate('ASSESSMENT_RUNNER');
      } else {
        alert("Original assessment data not found.");
        clearSession();
        setResumableSession(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Assessment" subtitle="Select an assessment" onLogout={() => onNavigate('HOME')} />
      <main className="max-w-3xl mx-auto px-4 py-8">
        
        {resumableSession && (
          <div className="mb-8 bg-blue-50 border border-blue-200 p-6 rounded-xl flex items-center justify-between shadow-sm">
            <div>
              <h3 className="text-blue-900 font-bold text-lg">Unfinished Assessment Found</h3>
              <p className="text-blue-700 text-sm">You were taking a quiz as <strong>{resumableSession.studentName}</strong>.</p>
            </div>
            <button onClick={handleResume} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700">
              Resume Quiz
            </button>
          </div>
        )}

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 mb-8 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">Candidate Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <User size={16} /> Full Name
              </label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value.toUpperCase())}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase bg-white text-black"
                placeholder="ENTER YOUR FULL NAME" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Hash size={16} /> Agent Code
              </label>
              <input 
                type="text" 
                value={agentCode}
                onChange={e => setAgentCode(e.target.value.toUpperCase())}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase bg-white text-black"
                placeholder="E.G. A12345" 
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Calendar size={16} /> Date
              </label>
              <input 
                type="text" 
                value={new Date().toLocaleDateString()}
                readOnly
                className="w-full p-3 border border-gray-300 bg-gray-100 text-gray-600 rounded-lg cursor-not-allowed outline-none" 
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <MapPin size={16} /> Location
              </label>
              <div className="relative">
                <select 
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white text-black"
                >
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h3 className="text-gray-500 font-bold uppercase tracking-wider text-sm mb-4">Available Assessments</h3>
        <div className="grid gap-4">
          {assessments.map(a => (
            <button 
              key={a.id}
              onClick={() => handleStart(a)}
              className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all text-left group"
            >
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600">{a.title}</h3>
              <div className="flex justify-between items-center mt-2">
                <p className="text-gray-500">{a.category}</p>
                <div className="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold text-gray-600">{a.questions.length} Questions</div>
              </div>
            </button>
          ))}
          {assessments.length === 0 && <p className="text-gray-400 text-center py-8">No assessments available right now.</p>}
        </div>
      </main>
    </div>
  );
};

// --- VIEW: ASSESSMENT RUNNER ---

const AssessmentRunner = ({ data, onNavigate, onComplete }: { data: any, onNavigate: (v:string)=>void, onComplete: (r: ResultLog) => void }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const assessment = data.assessment as Assessment;
  const question = assessment.questions[currentIdx];

  // Initialize or Restore
  useEffect(() => {
    if (data.existingSession) {
      setAnswers(data.existingSession.answers);
      setCurrentIdx(data.existingSession.currentQuestionIndex);
    } else {
      // If no existing session, ensure we start fresh (important for retries)
      setAnswers({});
      setCurrentIdx(0);
    }
  }, [data]);

  // Auto-Save
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      saveSession({
        studentName: data.studentName,
        agentCode: data.agentCode,
        location: data.location,
        assessmentId: assessment.id,
        currentQuestionIndex: currentIdx,
        answers,
        startTime: new Date().toISOString()
      });
    }
  }, [answers, currentIdx, data.studentName, data.agentCode, data.location, assessment.id]);

  const handleAnswer = (optionId: string) => {
    setAnswers(prev => ({ ...prev, [question.id]: optionId }));
  };

  const handleSubmit = async () => {
    const total = assessment.questions.length;
    let score = 0;
    const missedIds: string[] = [];

    assessment.questions.forEach(q => {
      if (answers[q.id] === q.correctOptionId) {
        score++;
      } else {
        missedIds.push(q.id);
      }
    });

    const result: ResultLog = {
      id: crypto.randomUUID(),
      assessmentId: assessment.id,
      assessmentTitle: assessment.title,
      studentName: data.studentName,
      agentCode: data.agentCode,
      location: data.location,
      score,
      totalQuestions: total,
      passed: score >= 16, // The core logic: 16/20
      timestamp: new Date().toISOString(),
      missedQuestionIds: missedIds,
      answers: answers // Store all answers for CSV export
    };

    await saveResult(result);
    clearSession();
    onComplete(result);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header title={assessment.title} subtitle={`Question ${currentIdx + 1} of ${assessment.questions.length}`} />
      
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 flex flex-col">
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${((currentIdx + 1) / assessment.questions.length) * 100}%` }}
          ></div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 flex-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 leading-snug">{question.text}</h2>
          
          <div className="space-y-4">
            {question.options.map(opt => {
              const isSelected = answers[question.id] === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleAnswer(opt.id)}
                  className={`w-full p-5 rounded-xl border-2 text-left transition-all flex items-center gap-4 group
                    ${isSelected 
                      ? 'border-blue-500 bg-blue-50 text-blue-800' 
                      : 'border-gray-100 hover:border-gray-300 text-gray-700'
                    }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border
                    ${isSelected ? 'bg-blue-500 text-white border-blue-500' : 'bg-white border-gray-300 text-gray-500'}`}>
                    {opt.id.toUpperCase()}
                  </div>
                  <span className="text-lg font-medium">{opt.text}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex justify-between items-center">
          <button 
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx(prev => prev - 1)}
            className="text-gray-500 font-bold px-6 py-3 rounded-lg hover:bg-gray-200 disabled:opacity-30"
          >
            Previous
          </button>

          {currentIdx < assessment.questions.length - 1 ? (
            <button 
              onClick={() => setCurrentIdx(prev => prev + 1)}
              className="bg-blue-600 text-white font-bold px-8 py-3 rounded-lg hover:bg-blue-700 shadow-lg"
            >
              Next Question
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={Object.keys(answers).length < assessment.questions.length}
              className="bg-blue-800 text-white font-bold px-8 py-3 rounded-lg hover:bg-blue-900 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Assessment
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

// --- VIEW: RESULTS ---

const ResultsView = ({ result, assessment, onExit, onRetry }: { result: ResultLog, assessment: Assessment, onExit: () => void, onRetry: () => void }) => {
  const isPassed = result.passed;
  
  // --- Score Calculations for Circular Ring ---
  const scorePercentage = (result.score / result.totalQuestions) * 100;
  const ringColorClass = isPassed ? "text-green-500" : "text-red-500";
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (scorePercentage / 100) * circumference;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner Section */}
      <div className={`h-48 ${isPassed ? 'bg-green-600' : 'bg-red-600'} flex items-center justify-center`}>
        <div className="text-center text-white">
          {isPassed ? <CheckCircle size={64} className="mx-auto mb-2" /> : <XCircle size={64} className="mx-auto mb-2" />}
          <h1 className="text-4xl font-extrabold">{isPassed ? 'Assessment Passed!' : 'Assessment Failed'}</h1>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 -mt-10 pb-12">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          
          {/* --- NEW: Circular Progress Ring Section --- */}
          <div className="p-8 flex flex-col items-center border-b border-gray-100">
            <div className="relative flex items-center justify-center mb-4">
              <svg className="transform -rotate-90 w-48 h-48">
                {/* Background Track */}
                <circle
                  cx="96" cy="96" r={radius}
                  stroke="currentColor" strokeWidth="12"
                  fill="transparent" className="text-gray-100"
                />
                {/* Dynamic Progress Ring */}
                <circle
                  cx="96" cy="96" r={radius}
                  stroke="currentColor" strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  className={`${ringColorClass} transition-all duration-1000 ease-out`}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className={`text-3xl font-bold ${ringColorClass}`}>
                  {result.score}/{result.totalQuestions}
                </span>
                <span className="text-sm text-gray-500 font-medium">
                  {Math.round(scorePercentage)}% Correct
                </span>
              </div>
            </div>
            
            <p className="text-gray-600 max-w-md text-center mt-2">
              {isPassed 
                ? "Congratulations! You have demonstrated sufficient knowledge in this area." 
                : "You did not meet the minimum requirement of 16 correct answers. Please review the material and try again."}
            </p>
          </div>

          {/* Missed Questions Section (Remains the same) */}
          {result.missedQuestionIds.length > 0 && (
            <div className="bg-orange-50 p-6">
              <h3 className="text-orange-900 font-bold flex items-center gap-2 mb-4">
                <AlertTriangle size={20} />
                Topics to Review
              </h3>
              <div className="space-y-4">
                {assessment.questions
                  .map((q, index) => ({ q, num: index + 1 }))
                  .filter(item => result.missedQuestionIds.includes(item.q.id))
                  .map((item) => (
                    <div key={item.q.id} className="bg-white p-4 rounded-lg border border-orange-100">
                      <p className="font-bold text-gray-800 mb-2">Question {item.num}: {item.q.text}</p>
                      <p className="text-sm text-red-500 font-medium">Your answer was incorrect.</p>
                    </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="p-6 bg-gray-50 flex flex-col md:flex-row gap-4 justify-center">
            <button onClick={onExit} className="flex-1 max-w-xs bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-bold hover:bg-gray-300">
              Return to Home
            </button>
            {!isPassed && (
              <button onClick={onRetry} className="flex-1 max-w-xs bg-blue-800 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-900 flex items-center justify-center gap-2">
                <Repeat size={20} /> Retry Assessment
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
// --- MAIN APP ROUTER ---

const App = () => {
  const [view, setView] = useState('HOME'); // HOME, ADMIN_LOGIN, ADMIN_DASHBOARD, ADMIN_CREATE, USER_PORTAL, ASSESSMENT_RUNNER, RESULT
  const [sessionData, setSessionData] = useState<any>(null); // Passed between User views
  const [lastResult, setLastResult] = useState<ResultLog | null>(null);

  const handleNavigate = (target: string, id?: string) => {
    window.scrollTo(0, 0);
    setView(target);
  };

  const handleAssessmentComplete = (result: ResultLog) => {
    setLastResult(result);
    handleNavigate('RESULT');
  };

  const handleRetry = () => {
    if (sessionData) {
      // Clear existing session flags to ensure a fresh start
      const newSession = { ...sessionData, existingSession: null };
      setSessionData(newSession);
      handleNavigate('ASSESSMENT_RUNNER');
    }
  };

  return (
    <>
      {view === 'HOME' && <HomeView onSelectMode={mode => handleNavigate(mode === 'admin' ? 'ADMIN_LOGIN' : 'USER_PORTAL')} />}
      
      {view === 'ADMIN_LOGIN' && <AdminLogin onLogin={() => setView('ADMIN_DASHBOARD')} onCancel={() => setView('HOME')} />}

      {view === 'ADMIN_DASHBOARD' && <AdminDashboard onNavigate={handleNavigate} />}
      {view === 'ADMIN_CREATE' && <AdminCreate onNavigate={handleNavigate} />}
      
      {view === 'USER_PORTAL' && <UserPortal onNavigate={handleNavigate} setSessionData={setSessionData} />}
      
      {view === 'ASSESSMENT_RUNNER' && sessionData && (
        <AssessmentRunner 
          data={sessionData} 
          onNavigate={handleNavigate} 
          onComplete={handleAssessmentComplete} 
        />
      )}
      
      {view === 'RESULT' && lastResult && sessionData && (
        <ResultsView 
          result={lastResult} 
          assessment={sessionData.assessment} 
          onExit={() => handleNavigate('HOME')}
          onRetry={handleRetry} 
        />
      )}
    </>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);