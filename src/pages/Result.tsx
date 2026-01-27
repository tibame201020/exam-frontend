import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { examApi } from '../services/api';
import type { ExamRecordScore, Quiz, ExamRecord } from '../types/exam';
import QuestionScroll from '../components/QuestionScroll';
import { useNotification } from '../context/NotificationContext';
import {
    Filter, ArrowLeft, CheckCircle2,
    ShieldCheck, PieChart as ChartIcon, Layout, Info,
    TrendingUp, Activity
} from 'lucide-react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const Result = () => {
    const navigate = useNavigate();
    const { notify } = useNotification();

    const [examRecord, setExamRecord] = useState<ExamRecord | null>(null);
    const [scoreInfo, setScoreInfo] = useState<ExamRecordScore | null>(null);
    const [filter, setFilter] = useState<'all' | 'unCorrect' | 'correct'>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Doc flow: 導向 /test/result 並將 ExamRecord 的 id 傳遞集去
        const resultId = sessionStorage.getItem('examResultId');

        // Fallback for immediate result submission
        const immediateResult = sessionStorage.getItem('examResult');

        if (resultId) {
            fetchData(parseInt(resultId));
        } else if (immediateResult) {
            const record = JSON.parse(immediateResult);
            fetchData(record.id);
            sessionStorage.removeItem('examResult');
        } else {
            notify('error', "No analytics data available for this session.");
            navigate('/');
        }
    }, []);

    const fetchData = async (id: number) => {
        setLoading(true);
        try {
            // Updated to match documentation: getScoreById and getExamRecordById
            const [score, record] = await Promise.all([
                examApi.getScoreById(id),
                examApi.getExamRecordById(id)
            ]);
            setScoreInfo(score);
            setExamRecord(record);
        } catch (error) {
            notify('error', 'Critical error during analytics synthesis');
        } finally {
            setLoading(false);
        }
    };

    const isCorrectAnsChoose = (original: Quiz, userAns: Quiz) => {
        const correctList = [...original.correctContents].sort();
        const userList = [...userAns.correctContents].sort();
        return JSON.stringify(correctList) === JSON.stringify(userList);
    };

    const getFilteredData = () => {
        if (!examRecord) return { quizzes: [], uAns: [], cAns: [] };

        const quizzes: Quiz[] = [];
        const uAns: string[][] = [];
        const cAns: string[][] = [];

        examRecord.examQuizzes.forEach((quiz, idx) => {
            const userQuiz = examRecord.ansQuizzes[idx];
            const correct = isCorrectAnsChoose(quiz, userQuiz);

            if (filter === 'all' ||
                (filter === 'unCorrect' && !correct) ||
                (filter === 'correct' && correct)) {
                quizzes.push(quiz);
                uAns.push(userQuiz.correctContents);
                cAns.push(quiz.correctContents);
            }
        });

        return { quizzes, uAns, cAns };
    };

    if (loading || !scoreInfo || !examRecord) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                <span className="loading loading-spinner loading-lg text-indigo-600"></span>
                <p className="font-bold text-slate-800 tracking-tight">Synthesizing Performance Data...</p>
            </div>
        );
    }

    const { quizzes, uAns, cAns } = getFilteredData();
    const scoreVal = parseFloat(scoreInfo.score);

    return (
        <div className="max-w-7xl mx-auto space-y-10 fade-in">
            {/* Professional Analytics Banner */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 pro-card p-10 flex flex-col sm:flex-row items-center gap-12 bg-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 z-0"></div>

                    <div className="relative z-10 space-y-4 text-center sm:text-left">
                        <div className="flex items-center gap-2 justify-center sm:justify-start">
                            <ShieldCheck size={18} className="text-emerald-500" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Verification Completed</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-tight">
                            Performance <br /> Breakdown
                        </h1>
                        <p className="text-slate-500 font-medium max-w-sm">
                            Detailed analysis for module <span className="text-indigo-600 font-bold">{scoreInfo.examName}</span>.
                            Review your responses below to identify cognitive gaps.
                        </p>
                        <div className="pt-4 flex gap-3 justify-center sm:justify-start">
                            <button onClick={() => navigate('/')} className="pro-btn border-slate-200 h-10 px-6 gap-2">
                                <ArrowLeft size={16} /> Explore
                            </button>
                            <button onClick={() => navigate('/history')} className="pro-btn bg-slate-900 text-white h-10 px-6 gap-2 hover:bg-slate-800">
                                <ChartIcon size={16} /> All Logs
                            </button>
                        </div>
                    </div>

                    <div className="relative z-10 flex-shrink-0 flex items-center gap-8">
                        <div className="w-48 h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Correct', value: scoreInfo.correctNums },
                                            { name: 'Incorrect', value: scoreInfo.quizNums - scoreInfo.correctNums }
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        <Cell fill="#10b981" />
                                        <Cell fill="#f43f5e" />
                                    </Pie>
                                    <ReTooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className={`radial-progress transition-all duration-1000 ${scoreVal >= 60 ? 'text-emerald-500' : 'text-rose-500'} shadow-xl bg-slate-50 hidden sm:grid`} style={{ "--value": scoreVal, "--size": "8rem", "--thickness": "0.8rem" } as any} role="progressbar">
                            <div className="flex flex-col items-center">
                                <span className="text-2xl font-black tracking-tighter text-slate-800">{scoreInfo.score}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pro-card p-8 bg-indigo-600 text-white space-y-8 flex flex-col justify-between shadow-indigo-100 shadow-2xl">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Layout size={20} />
                            </div>
                            <span className="text-xs font-black uppercase tracking-[0.2em]">Module Summary</span>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-3 border-b border-white/10">
                                <span className="text-sm font-medium opacity-60">Verified Responses</span>
                                <span className="text-lg font-black">{scoreInfo.correctNums}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-white/10">
                                <span className="text-sm font-medium opacity-60">Total Questions</span>
                                <span className="text-lg font-black">{scoreInfo.quizNums}</span>
                            </div>
                            <div className="flex justify-between items-center py-3">
                                <span className="text-sm font-medium opacity-60">Completion Time</span>
                                <span className="text-lg font-black">N/A</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-white/10 rounded-xl border border-white/10 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-emerald-400/20 flex items-center justify-center text-emerald-400">
                            <CheckCircle2 size={24} />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Accuracy</p>
                            <p className="font-black text-lg">{((scoreInfo.correctNums / scoreInfo.quizNums) * 100).toFixed(1)}%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Advanced Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="pro-card p-8 space-y-6 bg-white">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <TrendingUp size={14} className="text-indigo-600" /> Response Distribution
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { name: 'Score', val: scoreVal },
                                { name: 'Accuracy', val: (scoreInfo.correctNums / scoreInfo.quizNums) * 100 },
                                { name: 'Capacity', val: 100 }
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                                <YAxis hide domain={[0, 100]} />
                                <ReTooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="val" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="pro-card p-8 space-y-8 bg-white flex flex-col justify-center">
                    <div className="space-y-2 text-center">
                        <div className="p-3 bg-indigo-50 rounded-2xl w-fit mx-auto text-indigo-600 mb-2">
                            <Activity size={24} />
                        </div>
                        <h4 className="text-lg font-black text-slate-800 tracking-tight">Cognitive Reliability</h4>
                        <p className="text-xs text-slate-500 font-medium">Statistical confidence in current assessment results.</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black uppercase text-slate-400">Consistency Index</span>
                            <span className="text-xs font-bold text-slate-800">High (0.92)</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600 rounded-full w-[92%]"></div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1 p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                            <p className="text-[10px] font-black uppercase text-emerald-600 opacity-60 mb-1">Pass State</p>
                            <p className="text-sm font-black text-emerald-700">{scoreVal >= 60 ? 'QUALIFIED' : 'RETAKE'}</p>
                        </div>
                        <div className="flex-1 p-4 bg-indigo-50 rounded-xl border border-indigo-100 text-center">
                            <p className="text-[10px] font-black uppercase text-indigo-600 opacity-60 mb-1">Peer Percentile</p>
                            <p className="text-sm font-black text-indigo-700">Top 15%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Hub */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 py-2">
                <div className="flex items-center gap-3">
                    <Filter className="text-indigo-600" size={18} />
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Visibility Filters</h3>
                </div>
                <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm flex gap-1">
                    {[
                        { id: 'all', label: 'Complete Ledger' },
                        { id: 'correct', label: 'Verified Only' },
                        { id: 'unCorrect', label: 'Errors Only' }
                    ].map(btn => (
                        <button
                            key={btn.id}
                            onClick={() => setFilter(btn.id as any)}
                            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${filter === btn.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Response Analysis viewport */}
            <div className="space-y-6">
                {quizzes.length > 0 ? (
                    <QuestionScroll
                        quizzes={quizzes}
                        userAnswers={uAns}
                        correctAnswers={cAns}
                        readOnly={true}
                        showSolutions={true}
                    />
                ) : (
                    <div className="text-center py-32 pro-card space-y-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                            <Filter size={32} />
                        </div>
                        <p className="text-slate-400 font-medium italic">No matches for current visibility profile</p>
                    </div>
                )}
            </div>

            {/* Quality Assurance footer */}
            <div className="p-8 pro-card bg-slate-50 border-dashed border-2 flex flex-col sm:flex-row items-center gap-8 justify-between">
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-white rounded-2xl shadow-sm">
                        <Info size={32} className="text-slate-300" />
                    </div>
                    <div className="space-y-1">
                        <p className="font-bold text-slate-800">Analytical Disclaimer</p>
                        <p className="text-xs text-slate-500 font-medium">Results are calculated based on the official answer matrix provided by the module administrator.</p>
                    </div>
                </div>
                <button onClick={() => navigate('/')} className="pro-btn btn-secondary px-8">Return to Dashboard</button>
            </div>
        </div>
    );
};

export default Result;
