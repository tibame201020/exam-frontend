import React, { useState } from 'react';
import type { Quiz } from '../types/exam';
import {
    Plus, Trash2, CheckCircle2,
    XCircle, HelpCircle,
    Type, Edit3, Settings2
} from 'lucide-react';

interface QuizFormProps {
    quiz: Quiz;
    onChange: (updatedQuiz: Quiz) => void;
    onRemove: () => void;
    index: number;
}

const QuizForm: React.FC<QuizFormProps> = React.memo(({ quiz, onChange, onRemove, index }) => {
    const [tempOption, setTempOption] = useState('');

    const toggleCorrect = (option: string) => {
        const correctContents = [...quiz.correctContents];
        if (correctContents.includes(option)) {
            const idx = correctContents.indexOf(option);
            correctContents.splice(idx, 1);
        } else {
            correctContents.push(option);
        }
        onChange({ ...quiz, correctContents });
    };

    const addOption = () => {
        if (!tempOption.trim()) return;
        if (quiz.chooses.includes(tempOption.trim())) return;
        const chooses = [...quiz.chooses, tempOption.trim()];
        onChange({ ...quiz, chooses });
        setTempOption('');
    };

    const removeOption = (option: string) => {
        const chooses = quiz.chooses.filter(o => o !== option);
        const correctContents = quiz.correctContents.filter(o => o !== option);
        onChange({ ...quiz, chooses, correctContents });
    };

    return (
        <div className="pro-card p-8 space-y-10 focus-within:ring-2 focus-within:ring-indigo-100 transition-all border-l-[6px] border-l-indigo-600 mb-8">
            {/* Form Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                        {index + 1}
                    </span>
                    <h3 className="text-xs font-black text-slate-400 tracking-widest uppercase">Question Definition</h3>
                </div>
                <button
                    onClick={onRemove}
                    type="button"
                    className="btn btn-ghost btn-xs text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg px-2 h-8"
                >
                    <Trash2 size={14} /> <span className="text-[10px] font-bold">Remove Page</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left: Content Definition */}
                <div className="space-y-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Type size={12} /> Prompt / Question
                        </label>
                        <textarea
                            className="textarea textarea-bordered w-full h-32 pro-input focus:h-48 transition-all resize-none shadow-sm text-sm font-medium leading-relaxed p-4"
                            placeholder="Specify the technical challenge or question text here..."
                            value={quiz.quizContent}
                            onChange={(e) => onChange({ ...quiz, quizContent: e.target.value })}
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Edit3 size={12} /> Expert Explanation
                        </label>
                        <textarea
                            className="textarea textarea-bordered w-full h-24 pro-input focus:h-32 transition-all resize-none shadow-sm text-xs font-medium italic opacity-70 p-4"
                            placeholder="Optional: Contextual knowledge or why the answer is correct..."
                            value={quiz.solution}
                            onChange={(e) => onChange({ ...quiz, solution: e.target.value })}
                        />
                    </div>
                </div>

                {/* Right: Answer Logic */}
                <div className="space-y-8">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Settings2 size={12} /> Option Matrix
                        </label>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="pro-input flex-1 h-10 text-xs"
                                placeholder="Add variable response..."
                                value={tempOption}
                                onChange={(e) => setTempOption(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addOption()}
                            />
                            <button onClick={addOption} type="button" className="btn btn-square btn-sm h-10 w-10 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                <Plus size={18} />
                            </button>
                        </div>

                        <div className="space-y-2 max-h-[300px] overflow-y-auto scroll-modern pr-2">
                            {quiz.chooses.map((option, idx) => {
                                const isCorrect = quiz.correctContents.includes(option);
                                return (
                                    <div
                                        key={idx}
                                        className={`group flex items-center justify-between p-3 rounded-xl border transition-all ${isCorrect
                                            ? 'border-emerald-200 bg-emerald-50 shadow-sm'
                                            : 'border-slate-100 bg-slate-50/50 grayscale hover:grayscale-0'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => toggleCorrect(option)}
                                                type="button"
                                                className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-white'
                                                    }`}
                                            >
                                                <CheckCircle2 size={14} />
                                            </button>
                                            <span className={`text-xs font-bold ${isCorrect ? 'text-emerald-800' : 'text-slate-500'}`}>
                                                {option}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => removeOption(option)}
                                            type="button"
                                            className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-rose-500 transition-all"
                                        >
                                            <XCircle size={16} />
                                        </button>
                                    </div>
                                );
                            })}

                            {quiz.chooses.length === 0 && (
                                <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-xl space-y-2 opacity-50">
                                    <HelpCircle className="mx-auto" size={24} />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Definition</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                            Validation State: {quiz.correctContents.length > 0 ? (
                                <span className="text-emerald-600 ml-2">Verified (1+ Answer Selected)</span>
                            ) : (
                                <span className="text-rose-400 ml-2">Incomplete (No Correct Answer set)</span>
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default QuizForm;
