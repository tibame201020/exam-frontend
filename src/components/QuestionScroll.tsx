import React from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Quiz } from '../types/exam';
import { Check, X, Info } from 'lucide-react';

interface QuestionScrollProps {
    quizzes: Quiz[];
    userAnswers?: string[][];
    onAnswerChange?: (quizIdx: number, choose: string) => void;
    readOnly?: boolean;
    showSolutions?: boolean;
    correctAnswers?: string[][];
}

const QuestionScroll: React.FC<QuestionScrollProps> = ({
    quizzes,
    userAnswers = [],
    onAnswerChange,
    readOnly = false,
    showSolutions = false,
    correctAnswers = []
}) => {
    const parentRef = React.useRef<HTMLDivElement>(null);

    const rowVirtualizer = useVirtualizer({
        count: quizzes.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 350,
        overscan: 10,
    });

    return (
        <div
            ref={parentRef}
            className="h-full overflow-y-auto scroll-modern bg-slate-50/50 rounded-2xl border border-slate-200"
            style={{ height: 'calc(100vh - 280px)' }}
        >
            <div
                style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                }}
            >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const quiz = quizzes[virtualRow.index];
                    const userAns = userAnswers[virtualRow.index] || [];
                    const isNotAns = !readOnly && !showSolutions && userAns.length === 0;

                    return (
                        <div
                            key={virtualRow.key}
                            data-index={virtualRow.index}
                            ref={rowVirtualizer.measureElement}
                            className="absolute top-0 left-0 w-full p-6"
                            style={{
                                transform: `translateY(${virtualRow.start}px)`,
                            }}
                        >
                            <div
                                className={`pro-card transition-all duration-300 ${isNotAns ? 'border-amber-200 bg-amber-50/20' : 'border-slate-200'
                                    }`}
                            >
                                <div className="p-8 space-y-6">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                        <div className="flex items-center gap-3">
                                            <span className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                                                {virtualRow.index + 1}
                                            </span>
                                            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Question Item</span>
                                        </div>
                                        {isNotAns && (
                                            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-100 px-3 py-1 rounded-full animate-pulse">
                                                Pending Action
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-6">
                                        <pre className="whitespace-pre-wrap font-sans text-lg text-slate-800 leading-relaxed font-medium">
                                            {quiz.quizContent}
                                        </pre>

                                        <div className="grid grid-cols-1 gap-3">
                                            {quiz.chooses.map((option, optIdx) => {
                                                const isSelected = userAns.includes(option);
                                                const isCorrect = correctAnswers[virtualRow.index]?.includes(option);

                                                let baseStyle = "border-slate-200 bg-white text-slate-600";
                                                let decorator = null;

                                                if (showSolutions) {
                                                    if (isCorrect) {
                                                        baseStyle = "border-emerald-500 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-500";
                                                        decorator = <Check size={16} className="text-emerald-600" />;
                                                    } else if (isSelected && !isCorrect) {
                                                        baseStyle = "border-rose-300 bg-rose-50 text-rose-800 opacity-80";
                                                        decorator = <X size={16} className="text-rose-600" />;
                                                    } else if (isSelected) {
                                                        baseStyle = "border-emerald-200 bg-emerald-50 text-emerald-700 opacity-80";
                                                    }
                                                } else if (isSelected) {
                                                    baseStyle = "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-lg shadow-indigo-100 ring-1 ring-indigo-600";
                                                }

                                                return (
                                                    <button
                                                        key={optIdx}
                                                        disabled={readOnly}
                                                        onClick={() => onAnswerChange?.(virtualRow.index, option)}
                                                        className={`flex items-center gap-4 p-5 rounded-xl border-2 text-left transition-all ${baseStyle} ${!readOnly && 'hover:bg-slate-50 active:scale-[0.99]'}`}
                                                    >
                                                        <span className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black font-mono transition-colors ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100'}`}>
                                                            {String.fromCharCode(65 + optIdx)}
                                                        </span>
                                                        <span className="flex-1 font-medium">{option}</span>
                                                        {decorator}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {showSolutions && quiz.solution && (
                                            <div className="mt-8 p-6 rounded-2xl bg-indigo-50/50 border border-indigo-100/50 flex gap-4">
                                                <Info size={20} className="text-indigo-400 mt-1 flex-shrink-0" />
                                                <div className="space-y-2">
                                                    <p className="text-xs font-black uppercase tracking-widest text-indigo-700">Expert Analysis</p>
                                                    <pre className="whitespace-pre-wrap font-sans text-sm text-slate-600 leading-relaxed italic">
                                                        {quiz.solution}
                                                    </pre>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default QuestionScroll;
