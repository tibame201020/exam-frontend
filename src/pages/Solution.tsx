import { useState, useEffect, useMemo } from 'react';
import { examApi } from '../services/api';
import type { Exam } from '../types/exam';
import QuestionScroll from '../components/QuestionScroll';
import { useNotification } from '../context/NotificationContext';
import {
    Search, BookOpen, Layers,
    ChevronLeft, Palette,
    ArrowRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

const Solution = () => {
    const { t } = useLanguage();
    const { notify } = useNotification();
    const [examList, setExamList] = useState<string[]>([]);
    const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [listLoading, setListLoading] = useState(true);

    useEffect(() => {
        fetchExamList();
    }, []);

    const fetchExamList = async () => {
        try {
            setListLoading(true);
            const data = await examApi.getExamList();
            setExamList(data);
        } catch (error) {
            notify('error', 'Failed to synchronize module repository.');
        } finally {
            setListLoading(false);
        }
    };

    const handleSelectExam = async (name: string) => {
        try {
            setLoading(true);
            const data = await examApi.getExamByName(name);
            setSelectedExam(data);
            // Reset search when entering detail view
            setSearchTerm('');
        } catch (error) {
            notify('error', 'Integrity breach: Failed to fetch module definition.');
        } finally {
            setLoading(false);
        }
    };

    const filteredExams = useMemo(() =>
        examList.filter(name => name.toLowerCase().includes(searchTerm.toLowerCase())),
        [examList, searchTerm]
    );

    if (listLoading && !selectedExam) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                <span className="loading loading-spinner loading-lg text-primary"></span>
                <p className="font-bold text-base-content tracking-tight">Syncing Module Inventory...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 fade-in">
            <AnimatePresence mode="wait">
                {!selectedExam ? (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-6"
                    >
                        {/* Header Area */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-base-300">
                            <div className="space-y-1">
                                <h1 className="text-2xl font-black text-base-content tracking-tight flex items-center gap-3">
                                    {t('sol.title')}
                                    <BookOpen className="text-primary" size={20} />
                                </h1>
                                <p className="text-base-content/50 text-sm font-medium">{t('sol.desc')}</p>
                            </div>

                            <div className="relative group w-full md:w-80">
                                <input
                                    type="text"
                                    placeholder={t('sol.filter')}
                                    className="pro-input w-full pl-11 h-10 text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30 group-focus-within:text-primary transition-colors" size={16} />
                            </div>
                        </div>

                        {/* Grid View */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredExams.map((name) => (
                                <button
                                    key={name}
                                    onClick={() => handleSelectExam(name)}
                                    className="pro-card group bg-base-100 p-5 hover:border-primary/30 transition-all text-left space-y-4 hover:shadow-xl hover:shadow-primary/5 active:scale-[0.98]"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black overflow-hidden shadow-inner text-xs">
                                            {name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="p-1.5 rounded-lg bg-base-200 text-base-content/20 group-hover:bg-primary group-hover:text-primary-content transition-colors">
                                            <ArrowRight size={14} />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-black text-base-content tracking-tight group-hover:text-primary transition-colors line-clamp-1 text-sm">{name}</h3>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/30">{t('sol.atlas')}</p>
                                    </div>
                                </button>
                            ))}

                            {filteredExams.length === 0 && (
                                <div className="col-span-full py-20 text-center pro-card border-dashed bg-base-200/50">
                                    <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mx-auto mb-3 text-base-content/20">
                                        <Layers size={32} />
                                    </div>
                                    <h3 className="text-lg font-black text-base-content tracking-tight">No Modules Matched</h3>
                                    <p className="text-base-content/40 text-[10px] font-medium uppercase tracking-widest">Adjust criteria</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="detail"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        {/* Detail Command Bar */}
                        <div className="bg-base-100 p-4 rounded-2xl shadow-xl border border-base-300 flex flex-col md:flex-row justify-between items-center gap-6 sticky top-0 z-30 shadow-primary/5">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setSelectedExam(null)}
                                    className="btn btn-ghost btn-circle border-base-300"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-primary/10 px-3 py-1 rounded-md">Atlas Access</span>
                                        <span className="text-base-content/20">/</span>
                                        <span className="text-[10px] font-black text-base-content/40 uppercase tracking-[0.2em]">{selectedExam.name}</span>
                                    </div>
                                    <h1 className="text-2xl font-black text-base-content tracking-tight">
                                        {t('sol.overview')}
                                    </h1>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-base-200 px-6 py-3 rounded-2xl border border-base-300">
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-black text-base-content/30 uppercase tracking-widest leading-none mb-1">Total Definitions</span>
                                    <span className="text-sm font-black text-base-content">{selectedExam.quizzes.length} Items</span>
                                </div>
                                <div className="w-[1px] h-8 bg-base-300"></div>
                                <div className="flex items-center gap-2 text-success">
                                    <Palette size={16} />
                                    <span className="text-xs font-black uppercase tracking-widest">{t('sol.verified')}</span>
                                </div>
                            </div>
                        </div>


                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            {/* Solution Sidebar - Removed Intelligence Meta and Navigation Rule, keeping layout cleaner */}
                            <div className="hidden lg:block lg:col-span-0">
                                {/* Intentionally left empty or removed completely to give full width to questions */}
                            </div>

                            {/* Solution Viewport - Widened to Full or near Full */}
                            <div className="lg:col-span-4 px-4 sm:px-0">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-40 gap-6 pro-card">
                                        <span className="loading loading-spinner loading-lg text-primary"></span>
                                        <p className="font-bold text-base-content/40 text-sm">Synchronizing Metadata...</p>
                                    </div>
                                ) : (
                                    <QuestionScroll
                                        quizzes={selectedExam.quizzes}
                                        readOnly={true}
                                        showSolutions={true}
                                        correctAnswers={selectedExam.quizzes.map(q => q.correctContents)}
                                    />
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
};

export default Solution;
