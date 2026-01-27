import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { examApi } from '../services/api';
import type { ExamRecord } from '../types/exam';
import QuestionScroll from '../components/QuestionScroll';
import { useNotification } from '../context/NotificationContext';
import {
    Send, LogOut, Info, Clock,
    HelpCircle
} from 'lucide-react';

const ExamMode = () => {
    const { name } = useParams<{ name: string }>();
    const navigate = useNavigate();
    const { notify, confirm } = useNotification();

    const [examRecord, setExamRecord] = useState<ExamRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [mode, setMode] = useState<'exam' | 'practice'>('exam');
    const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());

    useEffect(() => {
        const paramStr = sessionStorage.getItem('examModeParam');
        const recordStr = sessionStorage.getItem('examRecord');

        if (!paramStr || !recordStr) {
            notify('error', "Assessment session not initialized. Re-routing to library.");
            navigate('/');
            return;
        }

        const param = JSON.parse(paramStr);
        const record = JSON.parse(recordStr);

        setMode(param.mode || 'exam');
        if (param.timer > 0) {
            setTimeLeft(param.timer * 60);
        }

        if (param.name !== name) {
            notify('error', "Module signature mismatch. Verification failed.");
            navigate('/');
            return;
        }

        // Prepare the record for user input: 
        // Ensure ansQuizzes has empty correctContents so user starts fresh
        const preparedRecord: ExamRecord = {
            ...record,
            ansQuizzes: record.ansQuizzes.map((q: any) => ({
                ...q,
                correctContents: []
            }))
        };

        setExamRecord(preparedRecord);
        setLoading(false);

        // Clear the temporary record from storage to prevent stale sessions
        // sessionStorage.removeItem('examRecord'); // Optional: keep for refresh persistence
    }, [name]);

    useEffect(() => {
        if (timeLeft === null) return;
        if (timeLeft <= 0) {
            handleAutoCommit();
            return;
        }

        const timerId = setInterval(() => {
            setTimeLeft(prev => (prev !== null ? prev - 1 : null));
        }, 1000);

        return () => clearInterval(timerId);
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleAutoCommit = async () => {
        if (!examRecord) return;
        notify('warning', 'Session duration expired. Auto-synchronizing current data...');
        await performCommit(examRecord);
    };

    const handleReveal = (idx: number) => {
        setRevealedIndices(prev => new Set([...prev, idx]));
    };

    const performCommit = async (record: ExamRecord) => {
        try {
            setLoading(true);
            const finalizedRecord = {
                ...record,
                logTime: new Date().toISOString()
            };

            const result = await examApi.commitAnsToRecord(finalizedRecord);
            sessionStorage.setItem('examResult', JSON.stringify(result));
            sessionStorage.setItem('examResultId', result.id.toString());

            notify('success', 'Assessment completed successfully.');
            navigate('/test/result');
        } catch (error) {
            notify('error', 'Transmission error during final sync.');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (quizIdx: number, choose: string) => {
        if (!examRecord) return;

        setExamRecord(prev => {
            if (!prev) return null;
            const newAnsQuizzes = [...prev.ansQuizzes];
            const quiz = { ...newAnsQuizzes[quizIdx] };
            const correctContents = [...quiz.correctContents];

            if (correctContents.includes(choose)) {
                const index = correctContents.indexOf(choose);
                correctContents.splice(index, 1);
            } else {
                correctContents.push(choose);
            }

            quiz.correctContents = correctContents;
            newAnsQuizzes[quizIdx] = quiz;
            return { ...prev, ansQuizzes: newAnsQuizzes };
        });
    };

    const countAnswered = () => {
        if (!examRecord) return 0;
        return examRecord.ansQuizzes.filter(q => q.correctContents.length > 0).length;
    };

    const isComplete = () => {
        if (!examRecord) return false;
        return countAnswered() === examRecord.ansQuizzes.length;
    };

    const handleCommit = () => {
        if (!examRecord) return;

        const allAnswered = isComplete();
        const message = allAnswered
            ? 'Proceed to finalize your assessment? Once submitted, answers cannot be modified.'
            : 'Warning: Some questions remain unanswered. Do you want to submit anyway?';

        confirm({
            title: 'Confirm Submission',
            message,
            confirmText: 'Submit Final Answers',
            cancelText: 'Continue Testing',
            onConfirm: () => performCommit(examRecord)
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                <span className="loading loading-spinner loading-lg text-primary"></span>
                <div className="text-center space-y-1">
                    <p className="font-black text-base-content text-xl tracking-tight">Initializing Session</p>
                    <p className="text-base-content/40 text-sm font-medium">Validating question banks and preparing metadata...</p>
                </div>
            </div>
        );
    }

    if (!examRecord) return null;

    const answeredCount = countAnswered();
    const totalCount = examRecord.ansQuizzes.length;
    const progress = (answeredCount / totalCount) * 100;

    return (
        <div className="max-w-7xl mx-auto space-y-8 fade-in">
            {/* Professional Command Center */}
            <div className="bg-base-100 p-6 rounded-2xl shadow-xl border border-base-300 flex flex-col md:flex-row justify-between items-center gap-6 sticky top-0 z-30 shadow-primary/5">
                <div className="flex items-center gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-primary/10 px-3 py-1 rounded-md">Live Session</span>
                            <span className="text-base-content/20">/</span>
                            <span className="text-[10px] font-black text-base-content/40 uppercase tracking-[0.2em]">{name}</span>
                        </div>
                        <h1 className="text-2xl font-black text-base-content tracking-tight flex items-center gap-3">
                            Assessment Panel
                        </h1>
                    </div>

                    <div className="h-12 w-[1px] bg-base-300 hidden md:block"></div>

                    <div className="space-y-2 min-w-[200px] hidden sm:block">
                        <div className="flex justify-between text-[10px] font-black text-base-content/40 uppercase tracking-tighter">
                            <span>Completion Progress</span>
                            <span>{answeredCount} / {totalCount}</span>
                        </div>
                        <div className="w-full bg-base-300 h-2 rounded-full overflow-hidden">
                            <div className="bg-primary h-full transition-all duration-500 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <button onClick={() => navigate('/')} className="pro-btn border-base-300 gap-2 flex-1 md:flex-none">
                        <LogOut size={16} /> Quit System
                    </button>
                    <button onClick={handleCommit} className="pro-btn btn-primary px-10 gap-2 shadow-lg shadow-primary/20 flex-1 md:flex-none">
                        <Send size={16} /> Finalize
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                {/* Information Hub */}
                <div className="xl:col-span-1 space-y-6">
                    <div className="pro-card p-6 space-y-6">
                        <div>
                            <h3 className="text-xs font-black text-base-content/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Info size={14} /> session metadata
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-base-200 rounded-xl border border-base-300">
                                    <span className="text-xs font-bold text-base-content/60">Module</span>
                                    <span className="text-xs font-black text-base-content uppercase">{name}</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-base-200 rounded-xl border border-base-300">
                                    <span className="text-xs font-bold text-base-content/60">Status</span>
                                    <span className="text-xs font-black text-success uppercase flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 bg-success rounded-full animate-ping"></div>
                                        Active
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-base-300 space-y-4">
                            <h3 className="text-xs font-black text-base-content/40 uppercase tracking-widest flex items-center gap-2">
                                <HelpCircle size={14} /> Legend
                            </h3>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 text-xs font-medium text-base-content/60 px-1">
                                    <div className="w-3 h-3 rounded-full bg-primary shadow-sm"></div> Selected
                                </div>
                                <div className="flex items-center gap-3 text-xs font-medium text-base-content/60 px-1">
                                    <div className="w-3 h-3 rounded-full bg-warning/30 border border-warning/50"></div> Pending
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-neutral text-neutral-content rounded-2xl space-y-4 shadow-xl">
                        <div className="flex items-center gap-3">
                            <Clock className={timeLeft !== null && timeLeft < 60 ? 'text-error animate-pulse' : 'text-primary'} size={20} />
                            <span className="text-sm font-bold opacity-80 uppercase tracking-widest">Time Tracking</span>
                        </div>
                        <div className="text-2xl font-black font-mono tracking-wider">
                            {timeLeft !== null ? formatTime(timeLeft) : 'UNRESTRICTED'}
                        </div>
                        <p className="text-[10px] uppercase tracking-wider opacity-40 font-bold">
                            {mode === 'exam' ? 'Standard Protocol' : 'Interactive Training'}
                        </p>
                    </div>
                </div>

                {/* Primary viewport */}
                <div className="xl:col-span-3">
                    <QuestionScroll
                        quizzes={examRecord.ansQuizzes}
                        userAnswers={examRecord.ansQuizzes.map(q => q.correctContents)}
                        onAnswerChange={handleAnswerChange}
                        revealedIndices={revealedIndices}
                        onReveal={mode === 'practice' ? handleReveal : undefined}
                        correctAnswers={mode === 'practice' ? examRecord.examQuizzes.map(q => q.correctContents) : []}
                    />
                </div>
            </div>
        </div>
    );
};

export default ExamMode;
