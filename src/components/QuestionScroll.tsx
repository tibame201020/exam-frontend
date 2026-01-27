import React from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Quiz } from '../types/exam';
import { Check, X, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface QuestionScrollProps {
    quizzes: Quiz[];
    userAnswers?: string[][];
    onAnswerChange?: (quizIdx: number, choose: string) => void;
    readOnly?: boolean;
    showSolutions?: boolean;
    correctAnswers?: string[][];
    revealedIndices?: Set<number>;
    onReveal?: (idx: number) => void;
}

const QuestionScroll: React.FC<QuestionScrollProps> = ({
    quizzes,
    userAnswers = [],
    onAnswerChange,
    readOnly = false,
    showSolutions = false,
    correctAnswers = [],
    revealedIndices = new Set(),
    onReveal
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
            className="h-full overflow-y-auto scroll-modern bg-base-200/50 rounded-2xl border border-base-300"
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
                    const isRevealed = showSolutions || revealedIndices.has(virtualRow.index);
                    const isNotAns = !readOnly && !isRevealed && userAns.length === 0;

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
                            <motion.div
                                initial={{ opacity: 0, x: -25 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay: Math.min(virtualRow.index * 0.05, 0.5) }}
                                className="h-full"
                            >
                                <div
                                    className={`pro-card transition-all duration-300 ${isNotAns ? 'border-warning/30 bg-warning/5' : 'border-base-300'
                                        }`}
                                >
                                    <div className="p-8 space-y-6">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                            <div className="flex items-center gap-3">
                                                <span className="w-10 h-10 rounded-lg bg-primary text-primary-content flex items-center justify-center font-bold text-sm shadow-md">
                                                    {virtualRow.index + 1}
                                                </span>
                                                <span className="text-xs font-black uppercase tracking-widest text-base-content/40">Question Item</span>
                                            </div>
                                            {onReveal && !isRevealed && (
                                                <button
                                                    onClick={() => onReveal(virtualRow.index)}
                                                    className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-4 py-1.5 rounded-full hover:bg-primary/20 transition-colors"
                                                >
                                                    Reveal Verification
                                                </button>
                                            )}
                                            {isNotAns && !onReveal && (
                                                <span className="text-[10px] font-black text-warning uppercase tracking-widest bg-warning/10 px-3 py-1 rounded-full animate-pulse">
                                                    Pending Action
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-6">
                                            <pre className="whitespace-pre-wrap font-sans text-lg text-base-content leading-relaxed font-medium">
                                                {quiz.quizContent}
                                            </pre>

                                            <div className="grid grid-cols-1 gap-3">
                                                {quiz.chooses.map((option, optIdx) => {
                                                    const isSelected = userAns.includes(option);
                                                    const isCorrect = correctAnswers[virtualRow.index]?.includes(option);

                                                    let baseStyle = "border-base-300 bg-base-100 text-base-content/70";
                                                    let decorator = null;

                                                    if (isRevealed) {
                                                        if (isCorrect) {
                                                            baseStyle = "border-success bg-success/10 text-success ring-1 ring-success";
                                                            decorator = <Check size={16} className="text-success" />;
                                                        } else if (isSelected && !isCorrect) {
                                                            baseStyle = "border-error/40 bg-error/5 text-error opacity-80";
                                                            decorator = <X size={16} className="text-error" />;
                                                        } else if (isSelected) {
                                                            baseStyle = "border-success/30 bg-success/5 text-success/80 opacity-80";
                                                        }
                                                    } else if (isSelected) {
                                                        baseStyle = "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/5 ring-1 ring-primary";
                                                    }

                                                    return (
                                                        <button
                                                            key={optIdx}
                                                            disabled={readOnly}
                                                            onClick={() => onAnswerChange?.(virtualRow.index, option)}
                                                            className={`flex items-center gap-4 p-5 rounded-xl border-2 text-left transition-all ${baseStyle} ${!readOnly && 'hover:bg-base-200 active:scale-[0.99]'}`}
                                                        >
                                                            <span className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black font-mono transition-colors ${isSelected ? 'bg-primary text-primary-content' : 'bg-base-300 text-base-content/40 group-hover:bg-primary/20'}`}>
                                                                {String.fromCharCode(65 + optIdx)}
                                                            </span>
                                                            <span className="flex-1 font-medium">{option}</span>
                                                            {decorator}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {isRevealed && quiz.solution && (
                                                <div className="mt-8 p-6 rounded-2xl bg-primary/5 border border-primary/10 flex gap-4">
                                                    <Info size={20} className="text-primary/40 mt-1 flex-shrink-0" />
                                                    <div className="space-y-2">
                                                        <p className="text-xs font-black uppercase tracking-widest text-primary/70">Expert Analysis</p>
                                                        <pre className="whitespace-pre-wrap font-sans text-sm text-base-content/60 leading-relaxed italic">
                                                            {quiz.solution}
                                                        </pre>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default QuestionScroll;
