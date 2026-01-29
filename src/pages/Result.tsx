import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { examApi } from '../services/api';
import type { ExamRecordScore, Quiz, ExamRecord } from '../types/exam';
import QuestionScroll from '../components/QuestionScroll';
import { useNotification } from '../context/NotificationContext';
import {
    Filter, ArrowLeft, CheckCircle2,
    ShieldCheck, PieChart as ChartIcon, Layout,
    TrendingUp, Activity
} from 'lucide-react';
import {
    ResponsiveContainer, Tooltip as ReTooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { useLanguage } from '../context/LanguageContext';

const Result = () => {
    const { t } = useLanguage();
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
                <span className="loading loading-spinner loading-lg text-primary"></span>
                <p className="font-bold text-base-content tracking-tight">Synthesizing Performance Data...</p>
            </div>
        );
    }

    const { quizzes, uAns, cAns } = getFilteredData();
    const scoreVal = parseFloat(scoreInfo.score);

    return (
        <div className="max-w-7xl mx-auto space-y-8 fade-in pb-12">
            {/* 1. Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-base-300 pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-base-content/40">
                        <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => navigate('/')}>Home</span>
                        <span>/</span>
                        <span>Analytics</span>
                    </div>
                    <h1 className="text-2xl font-black text-base-content tracking-tight">Performance Report</h1>
                    <p className="text-sm text-base-content/60 font-medium">
                        Assessment analysis for <span className="text-primary font-bold">{scoreInfo.examName}</span>
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => navigate('/history')} className="pro-btn btn-ghost btn-sm h-9 px-4 gap-2 text-base-content/60">
                        <ChartIcon size={14} /> {t('res.logs')}
                    </button>
                    <button onClick={() => navigate('/')} className="pro-btn btn-primary btn-sm h-9 px-6 gap-2 shadow-lg shadow-primary/20">
                        <ArrowLeft size={14} /> {t('res.explore')}
                    </button>
                </div>
            </div>

            {/* 2. Analytics Dashboard (HUD) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Card 1: Primary Score (Hero) */}
                <div className="pro-card p-6 bg-base-100 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>

                    <div className="space-y-1 relative z-10 w-full mb-10">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/40">Assessment Score</h3>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black text-base-content tracking-tighter">{scoreVal}</span>
                            <span className="text-sm font-bold text-base-content/30">/ 100</span>
                        </div>
                    </div>

                    <div className="flex items-end justify-between relative z-10">
                        <div className="space-y-1">
                            <div className={`badge ${scoreVal >= 60 ? 'badge-success text-success-content' : 'badge-error text-error-content'} font-bold gap-1 pl-1.5 pr-3 py-3`}>
                                {scoreVal >= 60 ? <CheckCircle2 size={12} /> : <Activity size={12} />}
                                {scoreVal >= 60 ? 'QUALIFIED' : 'ATTENTION'}
                            </div>
                            <p className="text-[10px] font-bold text-base-content/30 pl-1">Pass Threshold: 60%</p>
                        </div>

                        {/* Radial Indicator */}
                        <div className={`radial-progress ${scoreVal >= 60 ? 'text-success' : 'text-error'} transition-all opacity-20 group-hover:opacity-100`} style={{ "--value": scoreVal, "--size": "3.5rem", "--thickness": "0.3rem" } as any}>
                            <span className="text-[10px] font-black text-base-content">{scoreVal}%</span>
                        </div>
                    </div>
                </div>

                {/* Card 2: Key Metrics */}
                <div className="pro-card p-0 bg-base-100 flex flex-col md:col-span-1 overflow-hidden">
                    <div className="p-4 border-b border-base-200 bg-base-50/50">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/40 flex items-center gap-2">
                            <Layout size={12} /> Execution Metrics
                        </h3>
                    </div>
                    <div className="flex-1 grid grid-rows-3 divide-y divide-base-200">
                        {/* Accuracy */}
                        <div className="px-5 py-3 flex items-center justify-between hover:bg-base-50 transition-colors">
                            <span className="text-xs font-bold text-base-content/60">Accuracy Rate</span>
                            <div className="flex items-center gap-3">
                                <div className="w-24 h-1.5 bg-base-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${(scoreInfo.correctNums / scoreInfo.quizNums) * 100}%` }}></div>
                                </div>
                                <span className="text-xs font-black w-8 text-right">{((scoreInfo.correctNums / scoreInfo.quizNums) * 100).toFixed(0)}%</span>
                            </div>
                        </div>
                        {/* Verified */}
                        <div className="px-5 py-3 flex items-center justify-between hover:bg-base-50 transition-colors">
                            <span className="text-xs font-bold text-base-content/60">Verified Responses</span>
                            <span className="text-xs font-black text-base-content tabular-nums">
                                {scoreInfo.correctNums} <span className="text-base-content/30">/ {scoreInfo.quizNums}</span>
                            </span>
                        </div>
                        {/* Questions */}
                        <div className="px-5 py-3 flex items-center justify-between hover:bg-base-50 transition-colors">
                            <span className="text-xs font-bold text-base-content/60">Total Items</span>
                            <span className="text-xs font-black text-base-content tabular-nums">{scoreInfo.quizNums}</span>
                        </div>
                    </div>
                </div>

                {/* Card 3: Distribution Chart */}
                <div className="pro-card p-5 bg-base-100 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/40 flex items-center gap-2">
                            <TrendingUp size={12} /> Distribution
                        </h3>
                    </div>
                    <div className="flex-1 min-h-[120px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { name: 'Score', val: scoreVal, fill: '#6366f1' },
                                { name: 'Avg', val: 75, fill: '#e2e8f0' }, // Mock peer avg
                                { name: 'Best', val: 100, fill: '#e2e8f0' }
                            ]} barSize={24}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                                <YAxis hide domain={[0, 100]} />
                                <ReTooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                                />
                                <Bar dataKey="val" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 3. Detailed Breakdown */}
            <div className="space-y-5">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-base-200 pb-2">
                    <h3 className="text-lg font-black text-base-content tracking-tight flex items-center gap-2">
                        <ShieldCheck size={18} className="text-primary" />
                        Response Auditing
                    </h3>

                    <div className="bg-base-200/50 p-1 rounded-lg flex gap-1">
                        {[
                            { id: 'all', label: t('res.filter.all') },
                            { id: 'correct', label: t('res.filter.correct') },
                            { id: 'unCorrect', label: t('res.filter.kv') }
                        ].map(btn => (
                            <button
                                key={btn.id}
                                onClick={() => setFilter(btn.id as any)}
                                className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${filter === btn.id ? 'bg-base-100 text-base-content shadow-sm' : 'text-base-content/40 hover:text-base-content/70'
                                    }`}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* List View */}
                {quizzes.length > 0 ? (
                    <div className="bg-base-100 rounded-2xl border border-base-200 p-1">
                        <QuestionScroll
                            quizzes={quizzes}
                            userAnswers={uAns}
                            correctAnswers={cAns}
                            readOnly={true}
                            showSolutions={true}
                        />
                    </div>
                ) : (
                    <div className="text-center py-24 border-2 border-dashed border-base-200 rounded-2xl space-y-3 bg-base-50/50">
                        <div className="w-12 h-12 bg-base-200 rounded-xl flex items-center justify-center mx-auto text-base-content/20">
                            <Filter size={20} />
                        </div>
                        <p className="text-xs font-black text-base-content/30 uppercase tracking-widest">No matching records found</p>
                    </div>
                )}
            </div>
        </div >
    );
};

export default Result;
