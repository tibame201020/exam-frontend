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
        <div className="pro-card p-5 space-y-6 focus-within:ring-2 focus-within:ring-primary/10 transition-all border-l-[6px] border-l-primary mb-6">
            {/* Form Header */}
            <div className="flex items-center justify-between border-b border-base-200 pb-3">
                <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-md bg-primary text-primary-content flex items-center justify-center font-bold text-[10px]">
                        {index + 1}
                    </span>
                    <h3 className="text-[10px] font-black text-base-content/40 tracking-widest uppercase">Question Definition</h3>
                </div>
                <button
                    onClick={onRemove}
                    type="button"
                    className="btn btn-ghost btn-xs text-error/60 hover:text-error hover:bg-error/10 rounded-md px-2 h-7 min-h-0"
                >
                    <Trash2 size={12} /> <span className="text-[10px] font-bold">Remove</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Content Definition */}
                <div className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-base-content/40 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Type size={12} /> Prompt / Question
                        </label>
                        <textarea
                            className="textarea textarea-bordered w-full h-28 pro-input focus:h-40 transition-all resize-none shadow-sm text-sm font-medium leading-relaxed p-3"
                            placeholder="Specify the technical challenge or question text here..."
                            value={quiz.quizContent}
                            onChange={(e) => onChange({ ...quiz, quizContent: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-base-content/40 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Edit3 size={12} /> Expert Analysis
                        </label>
                        <textarea
                            className="textarea textarea-bordered w-full h-20 pro-input focus:h-28 transition-all resize-none shadow-sm text-xs font-medium italic opacity-70 p-3"
                            placeholder="Optional: Contextual knowledge or why the answer is correct..."
                            value={quiz.solution}
                            onChange={(e) => onChange({ ...quiz, solution: e.target.value })}
                        />
                    </div>
                </div>

                {/* Right: Answer Logic */}
                <div className="space-y-5">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-base-content/40 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Settings2 size={12} /> Option Matrix
                        </label>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="pro-input flex-1 h-9 text-xs px-3 py-2"
                                placeholder="Add variable response..."
                                value={tempOption}
                                onChange={(e) => setTempOption(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addOption()}
                            />
                            <button onClick={addOption} type="button" className="btn btn-square btn-sm h-9 w-9 btn-primary rounded-lg text-primary-content">
                                <Plus size={16} />
                            </button>
                        </div>

                        <div className="space-y-2 max-h-[250px] overflow-y-auto scroll-modern pr-1">
                            {quiz.chooses.map((option, idx) => {
                                const isCorrect = quiz.correctContents.includes(option);
                                return (
                                    <div
                                        key={idx}
                                        className={`group flex items-center justify-between p-2 rounded-lg border transition-all ${isCorrect
                                            ? 'border-success/30 bg-success/10 shadow-sm'
                                            : 'border-base-200 bg-base-100 hover:bg-base-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => toggleCorrect(option)}
                                                type="button"
                                                className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${isCorrect ? 'bg-success text-success-content' : 'bg-base-200 text-base-content/20 hover:bg-base-300'
                                                    }`}
                                            >
                                                <CheckCircle2 size={12} />
                                            </button>
                                            <span className={`text-xs font-bold leading-tight ${isCorrect ? 'text-success-content' : 'text-base-content/70'}`}>
                                                {option}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => removeOption(option)}
                                            type="button"
                                            className="opacity-0 group-hover:opacity-100 p-1 text-base-content/20 hover:text-error transition-all"
                                        >
                                            <XCircle size={14} />
                                        </button>
                                    </div>
                                );
                            })}

                            {quiz.chooses.length === 0 && (
                                <div className="text-center py-6 border-2 border-dashed border-base-200 rounded-xl space-y-1 opacity-50">
                                    <HelpCircle className="mx-auto text-base-content/20" size={20} />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-base-content/40">Awaiting Options</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-3 bg-base-200/50 rounded-xl border border-base-200">
                        <p className="text-[10px] font-black text-base-content/40 uppercase tracking-widest leading-relaxed">
                            Validation: {quiz.correctContents.length > 0 ? (
                                <span className="text-success ml-2 font-black">Verified</span>
                            ) : (
                                <span className="text-error ml-2 font-black">Incomplete</span>
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default QuizForm;
