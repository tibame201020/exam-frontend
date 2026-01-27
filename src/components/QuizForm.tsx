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
        <div className="pro-card p-8 space-y-10 focus-within:ring-2 focus-within:ring-primary/10 transition-all border-l-[6px] border-l-primary mb-8">
            {/* Form Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-lg bg-primary text-primary-content flex items-center justify-center font-bold text-xs">
                        {index + 1}
                    </span>
                    <h3 className="text-xs font-black text-base-content/40 tracking-widest uppercase">Question Definition</h3>
                </div>
                <button
                    onClick={onRemove}
                    type="button"
                    className="btn btn-ghost btn-xs text-error/60 hover:text-error hover:bg-error/10 rounded-lg px-2 h-8"
                >
                    <Trash2 size={14} /> <span className="text-[10px] font-bold">Remove Page</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left: Content Definition */}
                <div className="space-y-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-base-content/40 uppercase tracking-[0.2em] flex items-center gap-2">
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
                        <label className="text-[10px] font-black text-base-content/40 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Edit3 size={12} /> Expert Analysis
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
                        <label className="text-[10px] font-black text-base-content/40 uppercase tracking-[0.2em] flex items-center gap-2">
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
                            <button onClick={addOption} type="button" className="btn btn-square btn-sm h-10 w-10 btn-primary rounded-lg text-primary-content">
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
                                            ? 'border-success/30 bg-success/10 shadow-sm'
                                            : 'border-base-300 bg-base-200/50 grayscale opacity-60 hover:opacity-100 hover:grayscale-0'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => toggleCorrect(option)}
                                                type="button"
                                                className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${isCorrect ? 'bg-success text-success-content' : 'bg-base-300 text-base-content/40'
                                                    }`}
                                            >
                                                <CheckCircle2 size={14} />
                                            </button>
                                            <span className={`text-xs font-bold ${isCorrect ? 'text-success-content' : 'text-base-content/60'}`}>
                                                {option}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => removeOption(option)}
                                            type="button"
                                            className="opacity-0 group-hover:opacity-100 p-1.5 text-base-content/20 hover:text-error transition-all"
                                        >
                                            <XCircle size={16} />
                                        </button>
                                    </div>
                                );
                            })}

                            {quiz.chooses.length === 0 && (
                                <div className="text-center py-10 border-2 border-dashed border-base-300 rounded-xl space-y-2 opacity-50">
                                    <HelpCircle className="mx-auto text-base-content/20" size={24} />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-base-content/40">Awaiting Definition</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-4 bg-base-200 rounded-2xl border border-base-300">
                        <p className="text-[10px] font-black text-base-content/40 uppercase tracking-widest leading-relaxed">
                            Validation State: {quiz.correctContents.length > 0 ? (
                                <span className="text-success ml-2 font-black">Verified (1+ Answer Selected)</span>
                            ) : (
                                <span className="text-error ml-2 font-black">Incomplete (No Correct Answer set)</span>
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default QuizForm;
