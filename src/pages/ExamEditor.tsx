import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { examApi } from '../services/api';
import type { Exam, Quiz } from '../types/exam';
import QuizForm from '../components/QuizForm';
import { useNotification } from '../context/NotificationContext';
import {
    useVirtualizer,
} from '@tanstack/react-virtual';
import {
    Save, Plus, Upload,
    ArrowLeft, Search, Database,
    Layers, FileText
} from 'lucide-react';

const ExamEditor = () => {
    const { name } = useParams<{ name: string }>();
    const isNew = name === 'NEW_EXAM';
    const navigate = useNavigate();
    const { notify, confirm } = useNotification();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [exam, setExam] = useState<Exam>({ name: isNew ? '' : name || '', quizzes: [] });
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(!isNew);

    useEffect(() => {
        if (!isNew && name) {
            fetchExam(name);
        }
    }, [name, isNew]);

    const fetchExam = async (examName: string) => {
        setLoading(true);
        try {
            // Updated to match documentation: getExamByName
            const data = await examApi.getExamByName(examName);
            setExam(data);
        } catch (error) {
            notify('error', 'Integrity breach: Failed to fetch module definition.');
            navigate('/management');
        } finally {
            setLoading(false);
        }
    };

    const handleAddQuiz = () => {
        const newQuiz: Quiz = {
            quizContent: '',
            chooses: [],
            correctContents: [],
            solution: ''
        };
        // Parity with legacy unshift behavior
        setExam(prev => ({ ...prev, quizzes: [newQuiz, ...prev.quizzes] }));
    };

    const handleQuizChange = useCallback((idx: number, updatedQuiz: Quiz) => {
        setExam(prev => {
            const updatedQuizzes = [...prev.quizzes];
            updatedQuizzes[idx] = updatedQuiz;
            return { ...prev, quizzes: updatedQuizzes };
        });
    }, []);

    const handleRemoveQuiz = useCallback((idx: number) => {
        setExam(prev => ({
            ...prev,
            quizzes: prev.quizzes.filter((_, i) => i !== idx)
        }));
    }, []);

    const handleSave = async () => {
        if (!exam.name.trim()) {
            notify('error', 'Validation Error: Module identifier is mandatory.');
            return;
        }

        if (exam.quizzes.length === 0) {
            notify('error', 'Schema Error: Module must contain at least one question definition.');
            return;
        }

        // Check for empty correct answers
        const invalidQuizzes = exam.quizzes.filter(q => q.correctContents.length === 0);
        if (invalidQuizzes.length > 0) {
            notify('warning', `Logical Deficiency: ${invalidQuizzes.length} questions lack verification markers.`);
            return;
        }

        confirm({
            title: 'Authorize Deployment',
            message: 'Commit these changes to the production repository? This will overwrite existing metadata.',
            confirmText: 'Commit Changes',
            onConfirm: async () => {
                try {
                    // Documented flow: addExam (handles both update and add)
                    const success = await examApi.addExam(exam);
                    if (success) {
                        notify('success', 'Metadata synchronized successfully.');
                        navigate('/management');
                    } else {
                        notify('error', 'Repository rejected the submission.');
                    }
                } catch (error) {
                    notify('error', 'Critical synchronization error.');
                }
            }
        });
    };

    // Precise legacy logic from Angular's onFileChanged and wrapper helpers
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result as string;

            // Try standard JSON first (as Angular does with JSON.parse(upload_quizzes))
            try {
                const quizs = JSON.parse(result);
                if (Array.isArray(quizs)) {
                    setExam(prev => ({ ...prev, quizzes: [...quizs, ...prev.quizzes] }));
                    notify('success', `Imported ${quizs.length} definitions via JSON.`);
                    return;
                }
            } catch (err) {
                // Fallback to legacy parser
                const stringified = JSON.stringify(result);
                const newQuizzes = wrapperFileToQuizzes(stringified);
                setExam(prev => ({ ...prev, quizzes: [...newQuizzes, ...prev.quizzes] }));
                notify('success', `Synthesized ${newQuizzes.length} definitions from legacy format.`);
            }
        };
        reader.readAsText(file, 'UTF-8');
    };

    const wrapperFileToQuizzes = (upload_quizzes: string): Quiz[] => {
        const rtn: Quiz[] = [];
        // Angular: upload_quizzes.split('@@@#')
        const quizzesArray = upload_quizzes.split('@@@#');
        quizzesArray.forEach((upload_quiz: string) => {
            const quiz = wrapperStrToQuiz(upload_quiz);
            // Angular check: if (quiz && quiz.solution)
            if (quiz && quiz.solution) {
                rtn.push(quiz);
            }
        });
        return rtn;
    };

    const wrapperStrToQuiz = (upload_quiz: string): Quiz | null => {
        try {
            const contentIdx = upload_quiz.indexOf('quizContent=');
            if (contentIdx === -1) return null;

            const choosesIdx = upload_quiz.indexOf('chooses=');
            const correctIdx = upload_quiz.indexOf('correctContents=');
            const solutionIdx = upload_quiz.indexOf('solution=');

            // Exact Angular substring logic (replicating the escaped JSON string offsets)
            const quizContent = upload_quiz
                .substring(contentIdx, choosesIdx - 4)
                .replace('quizContent=', '')
                .substring(4);
            const chooses = upload_quiz
                .substring(choosesIdx, correctIdx - 4)
                .replace('chooses=', '')
                .substring(4);
            const correct = upload_quiz
                .substring(correctIdx, solutionIdx - 4)
                .replace('correctContents=', '')
                .substring(4);
            const solution = upload_quiz
                .substring(solutionIdx)
                .replace('solution=', '')
                .substring(4);

            const quizStr = `{
                "quizContent":"${quizContent}",
                "chooses":${wrapperToArray(chooses)},
                "correctContents":${wrapperToArray(correct)},
                "solution":"${solution}"
            }`;

            // Angular's final cleanup: JSON.parse(quizStr.replace('""', '"'))
            return JSON.parse(quizStr.replace(/""/g, '"'));
        } catch (e) {
            return null;
        }
    };

    const wrapperToArray = (str: string): string => {
        const items = str.split('##').filter(s => s && s.length > 0);
        return '[' + items.map(s => `"${s}"`).join(', ') + ']';
    };

    const filteredQuizzes = useMemo(() =>
        exam.quizzes.map((quiz, originalIndex) => ({ quiz, originalIndex }))
            .filter(item => item.quiz.quizContent?.toLowerCase().includes(searchTerm.toLowerCase())),
        [exam.quizzes, searchTerm]
    );

    const parentRef = useRef<HTMLDivElement>(null);

    const virtualizer = useVirtualizer({
        count: filteredQuizzes.length,
        getScrollElement: () => parentRef.current?.closest('main') || null,
        estimateSize: () => 450, // Slightly larger estimate for QuizForm
        overscan: 10,
    });

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <span className="loading loading-spinner loading-lg text-indigo-600"></span>
            <p className="font-bold text-slate-800 tracking-tight">Accessing Repository...</p>
        </div>
    );

    const virtualItems = virtualizer.getVirtualItems();

    return (
        <div className="max-w-7xl mx-auto space-y-10 fade-in">
            {/* Command Bar */}
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 flex flex-col xl:flex-row justify-between items-center gap-6 sticky top-0 z-40 border-b-indigo-400">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/management')} className="btn btn-ghost btn-circle border-slate-200">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`${isNew ? 'bg-indigo-600' : 'bg-slate-800'} text-[10px] font-black text-white uppercase tracking-[0.2em] px-3 py-1 rounded-md`}>
                                {isNew ? 'New Schema' : 'Drafting'}
                            </span>
                            <span className="text-slate-300">/</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{name || 'Unidentified'}</span>
                        </div>
                        <input
                            type="text"
                            className="text-2xl font-black text-slate-800 tracking-tight bg-transparent border-none focus:outline-none focus:ring-0 placeholder:opacity-20 max-w-sm"
                            placeholder="Set Module Identifier..."
                            value={exam.name}
                            onChange={(e) => setExam({ ...exam, name: e.target.value })}
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 w-full xl:w-auto">
                    <div className="relative flex-1 xl:flex-none xl:w-80 group">
                        <input
                            type="text"
                            placeholder="Local filter..."
                            className="pro-input w-full pl-10 h-11 text-xs"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                    </div>

                    <button onClick={() => fileInputRef.current?.click()} className="pro-btn border-slate-200 h-11 flex-1 xl:flex-none gap-2">
                        <Upload size={16} /> Legacy Import
                    </button>
                    <button onClick={handleSave} className="pro-btn btn-primary h-11 px-8 flex-1 xl:flex-none gap-3 shadow-lg shadow-indigo-200">
                        <Save size={18} /> Sync Metadata
                    </button>
                    <input ref={fileInputRef} type="file" className="hidden" accept=".json,.txt" onChange={handleFileUpload} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start pb-20">
                {/* Information Sidebar */}
                <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-32">
                    <div className="pro-card p-6 space-y-6">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Database size={14} /> Repository Stats
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Definitions</span>
                                <span className="text-2xl font-black text-indigo-600 leading-none">{exam.quizzes.length}</span>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Matched</span>
                                <span className="text-2xl font-black text-slate-800 leading-none">{filteredQuizzes.length}</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <button
                                onClick={handleAddQuiz}
                                className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg group"
                            >
                                <div className="p-1 bg-white/10 rounded-md group-hover:scale-110 transition-transform">
                                    <Plus size={16} />
                                </div>
                                Append Definition
                            </button>
                        </div>
                    </div>

                    <div className="p-6 bg-indigo-50/50 rounded-2xl border border-dashed border-indigo-200 space-y-4">
                        <div className="flex items-center gap-3">
                            <Layers className="text-indigo-400" size={20} />
                            <span className="text-xs font-black text-indigo-700 uppercase tracking-widest">Protocol Rules</span>
                        </div>
                        <ul className="space-y-3">
                            {[
                                "Module ID must be unique",
                                "Questions require 2+ options",
                                "1+ Answer required per set",
                                "Explanation field is advisory"
                            ].map((rule, idx) => (
                                <li key={idx} className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
                                    <div className="w-1 h-1 bg-indigo-400 rounded-full"></div> {rule}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Definitions viewport */}
                <div ref={parentRef} className="lg:col-span-9 relative" style={{ height: `${virtualizer.getTotalSize()}px` }}>
                    {filteredQuizzes.length > 0 ? (
                        virtualItems.map((virtualRow) => {
                            const { quiz, originalIndex } = filteredQuizzes[virtualRow.index];
                            return (
                                <div
                                    key={virtualRow.key}
                                    data-index={virtualRow.index}
                                    ref={virtualizer.measureElement}
                                    className="absolute top-0 left-0 w-full"
                                    style={{ transform: `translateY(${virtualRow.start}px)` }}
                                >
                                    <QuizForm
                                        quiz={quiz}
                                        index={originalIndex}
                                        onChange={(q) => handleQuizChange(originalIndex, q)}
                                        onRemove={() => handleRemoveQuiz(originalIndex)}
                                    />
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-40 pro-card space-y-4">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200 border border-slate-200">
                                <FileText size={40} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-slate-800 font-black tracking-tight text-xl">Repository Void</p>
                                <p className="text-slate-400 text-sm font-medium">No definitions currently reside in this module schema.</p>
                            </div>
                            <button onClick={handleAddQuiz} className="btn btn-link no-underline text-indigo-600 font-bold gap-2">
                                <Plus size={16} /> Append First Definition
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="fixed bottom-8 right-8 z-50 lg:hidden">
                <button onClick={handleAddQuiz} className="btn btn-circle btn-primary btn-lg shadow-2xl">
                    <Plus size={32} />
                </button>
            </div>
        </div>
    );
};

export default ExamEditor;
