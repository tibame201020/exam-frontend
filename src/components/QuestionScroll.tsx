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
                            className="absolute top-0 left-0 w-full p-3 sm:p-4"
                            style={{
                                transform: `translateY(${virtualRow.start}px)`,
                            }}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className="h-full"
                            >
                                <div
                                    className={`pro-card transition-all duration-300 ${isNotAns ? 'border-warning/30 bg-warning/5' : 'border-base-300'
                                        }`}
                                >
                                    <div className="p-5 space-y-4">
                                        <div className="flex items-center justify-between border-b border-base-200 pb-3">
                                            <div className="flex items-center gap-3">
                                                <span className="w-7 h-7 rounded-md bg-primary text-primary-content flex items-center justify-center font-bold text-xs shadow-sm">
                                                    {virtualRow.index + 1}
                                                </span>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-base-content/40">Question Item</span>
                                            </div>
                                            <div className="flex gap-2">
                                                {onReveal && !isRevealed && (
                                                    <button
                                                        onClick={() => onReveal(virtualRow.index)}
                                                        className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full hover:bg-primary/20 transition-colors"
                                                    >
                                                        Reveal
                                                    </button>
                                                )}
                                                {isNotAns && !onReveal && (
                                                    <span className="text-[10px] font-black text-warning uppercase tracking-widest bg-warning/10 px-2 py-1 rounded-full animate-pulse">
                                                        Pending
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <pre className="whitespace-pre-wrap font-sans text-base text-base-content leading-relaxed font-medium pl-1">
                                                {quiz.quizContent}
                                            </pre>

                                            <div className="grid grid-cols-1 gap-2">
                                                {quiz.chooses.map((option, optIdx) => {
                                                    const isSelected = userAns.includes(option);
                                                    const isCorrect = correctAnswers[virtualRow.index]?.includes(option);

                                                    let baseStyle = "border-base-200 bg-base-100 text-base-content/70 hover:bg-base-50";
                                                    let decorator = null;

                                                    if (isRevealed) {
                                                        if (isCorrect) {
                                                            baseStyle = "border-success bg-success/10 text-success ring-1 ring-success";
                                                            decorator = <Check size={14} className="text-success" />;
                                                        } else if (isSelected && !isCorrect) {
                                                            baseStyle = "border-error/40 bg-error/5 text-error opacity-80";
                                                            decorator = <X size={14} className="text-error" />;
                                                        } else if (isSelected) {
                                                            baseStyle = "border-success/30 bg-success/5 text-success/80 opacity-80";
                                                        }
                                                    } else if (isSelected) {
                                                        baseStyle = "border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary";
                                                    }

                                                    return (
                                                        <button
                                                            key={optIdx}
                                                            disabled={readOnly}
                                                            onClick={() => onAnswerChange?.(virtualRow.index, option)}
                                                            className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${baseStyle} ${!readOnly && 'active:scale-[0.99]'}`}
                                                        >
                                                            <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-black font-mono transition-colors ${isSelected ? 'bg-primary text-primary-content' : 'bg-base-200 text-base-content/40 group-hover:bg-primary/20'}`}>
                                                                {String.fromCharCode(65 + optIdx)}
                                                            </span>
                                                            <span className="flex-1 text-sm font-medium leading-snug">{option}</span>
                                                            {decorator}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {isRevealed && quiz.solution && (
                                                <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10 flex gap-3 text-sm">
                                                    <Info size={16} className="text-primary/40 mt-0.5 flex-shrink-0" />
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/70">Expert Analysis</p>
                                                        <pre className="whitespace-pre-wrap font-sans text-base-content/60 leading-relaxed italic">
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
