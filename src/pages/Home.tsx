import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { examApi } from '../services/api';
import {
    Search, Play, BookOpen, Clock,
    ChevronRight, ArrowRight, Sparkles
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const Home = () => {
    const [exams, setExams] = useState<string[]>([]);
    const [keyword, setKeyword] = useState('');
    const [selectedExam, setSelectedExam] = useState<string | null>(null);
    const [quizCount, setQuizCount] = useState<string>("0");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { confirm, notify } = useNotification();

    useEffect(() => {
        fetchExams();
    }, []);

    // Use getExamListByKeyWord for search as per documentation
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (keyword) {
                searchExams(keyword);
            } else {
                fetchExams();
            }
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [keyword]);

    const fetchExams = async () => {
        setLoading(true);
        try {
            const data = await examApi.getExamList();
            setExams(data);
        } catch (error) {
            notify('error', 'Failed to fetch exams');
        } finally {
            setLoading(false);
        }
    };

    const searchExams = async (key: string) => {
        setLoading(true);
        try {
            const data = await examApi.getExamListByKeyWord(key);
            setExams(data);
        } catch (error) {
            notify('error', 'Search failed');
        } finally {
            setLoading(false);
        }
    };

    const handleExamClick = (name: string) => {
        setSelectedExam(name);
    };

    const handleStartExam = async () => {
        if (!selectedExam) return;

        confirm({
            title: 'Initialize Test Session',
            message: `You are about to start the "${selectedExam}" exam. Would you like to proceed?`,
            confirmText: 'Start Session',
            onConfirm: async () => {
                try {
                    setLoading(true);
                    const param = {
                        name: selectedExam,
                        quizzesNum: parseInt(quizCount)
                    };

                    // Call API before navigation - as per user requirement and Angular parity
                    const record = await examApi.getExamModeQuizzes(param);

                    // Documentation suggests storing both the param and the resulting record if needed, 
                    // but the record is the primary data source for ExamMode.
                    sessionStorage.setItem('examModeParam', JSON.stringify(param));
                    sessionStorage.setItem('examRecord', JSON.stringify(record));

                    navigate(`/exam/${selectedExam}`);
                } catch (error) {
                    notify('error', 'Failed to initialize session. Please check connectivity.');
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10">
            {/* Search & Orientation */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-slate-200">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        Question Banks
                        <Sparkles className="text-indigo-500" size={24} />
                    </h1>
                    <p className="text-slate-500 text-sm font-medium">Select a module to begin your technical assessment.</p>
                </div>

                <div className="relative w-full md:w-96 group">
                    <input
                        type="text"
                        placeholder="Search exam modules..."
                        className="pro-input w-full pl-11 h-12 shadow-sm focus:shadow-md"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Main Selection Area */}
                <div className="lg:col-span-8">
                    {!selectedExam ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {loading ? (
                                Array(6).fill(0).map((_, i) => (
                                    <div key={i} className="h-28 bg-white border border-slate-100 rounded-xl animate-pulse"></div>
                                ))
                            ) : exams.length === 0 ? (
                                <div className="col-span-full py-24 text-center pro-card">
                                    <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                        <Search size={32} />
                                    </div>
                                    <p className="text-slate-400 font-medium italic">No modules found matching your criteria</p>
                                </div>
                            ) : (
                                exams.map((name) => (
                                    <button
                                        key={name}
                                        onClick={() => handleExamClick(name)}
                                        className="pro-card group p-6 flex items-center justify-between text-left active:scale-[0.98] border-transparent hover:border-indigo-200 hover:bg-indigo-50/30"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
                                                <BookOpen size={24} />
                                            </div>
                                            <div>
                                                <span className="font-bold text-slate-800 block">{name}</span>
                                                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Standard Bank</span>
                                            </div>
                                        </div>
                                        <ArrowRight className="text-slate-300 group-hover:text-indigo-500 transition-colors -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 opacity-0" size={20} />
                                    </button>
                                ))
                            )}
                        </div>
                    ) : (
                        /* Professional Config Screen */
                        <div className="pro-card p-10 space-y-8 fade-in">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setSelectedExam(null)} className="btn btn-circle btn-ghost btn-sm">
                                        <ChevronRight className="rotate-180" size={20} />
                                    </button>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">{selectedExam}</h2>
                                        <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest">Initialization Protocol</p>
                                    </div>
                                </div>
                                <Sparkles size={32} className="text-indigo-200" />
                            </div>

                            <div className="space-y-6">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Clock size={14} /> Configuration Settings
                                </label>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {[
                                        { id: "0", label: "Complete", sub: "All questions", count: "FULL" },
                                        { id: "10", label: "Focused", sub: "Random 10", count: "10" },
                                        { id: "25", label: "Intensive", sub: "Random 25", count: "25" }
                                    ].map(opt => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setQuizCount(opt.id)}
                                            className={`p-6 rounded-2xl border-2 text-left transition-all relative ${quizCount === opt.id
                                                ? 'border-indigo-600 bg-indigo-50/50 shadow-indigo-100 shadow-lg'
                                                : 'border-slate-100 bg-white hover:border-slate-200'
                                                }`}
                                        >
                                            <div className="flex flex-col gap-1">
                                                <span className={`text-xs font-black uppercase tracking-widest ${quizCount === opt.id ? 'text-indigo-600' : 'text-slate-400'}`}>
                                                    {opt.label}
                                                </span>
                                                <span className="text-lg font-bold text-slate-800">{opt.sub}</span>
                                            </div>
                                            {quizCount === opt.id && (
                                                <div className="absolute top-4 right-4 bg-indigo-600 w-2 h-2 rounded-full ring-4 ring-indigo-100"></div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6">
                                <button
                                    onClick={handleStartExam}
                                    className="pro-btn btn-primary w-full h-14 text-lg shadow-xl shadow-indigo-200 gap-3"
                                >
                                    Launch Examination
                                    <Play size={20} fill="currentColor" />
                                </button>
                                <p className="text-center text-[10px] text-slate-400 mt-4 uppercase tracking-tighter">
                                    Ensure stable connection before starting the assessment
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Info Area */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl"></div>
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            Quick Guide
                        </h3>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 flex-shrink-0 mt-0.5 font-bold text-[10px]">1</div>
                                <span>Search for your target module using the top search bar.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 flex-shrink-0 mt-0.5 font-bold text-[10px]">2</div>
                                <span>Choose between full practice or time-boxed random sessions.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 flex-shrink-0 mt-0.5 font-bold text-[10px]">3</div>
                                <span>Complete the assessment and review detailed performance metrics.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
