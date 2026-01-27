import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { examApi } from '../services/api';
import type { ExamRecordScore } from '../types/exam';
import {
    Trash2, Calendar,
    ArrowRight, BarChart3, History as HistoryIcon,
    Filter, Clock, Info
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const History = () => {
    const [records, setRecords] = useState<ExamRecordScore[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { notify, confirm } = useNotification();

    useEffect(() => {
        fetchHistory();
    }, []);

    // Use getScoreByKeyword for searching as per documentation
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm) {
                searchHistory(searchTerm);
            } else {
                fetchHistory();
            }
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            // Updated to use the correct documented flow (getRecordList was internal, using empty keyword for all)
            const data = await examApi.getScoreByKeyword('getScoreByKeyword');
            setRecords(data);
        } catch (error) {
            notify('error', 'Failed to retrieve session history');
        } finally {
            setLoading(false);
        }
    };

    const searchHistory = async (key: string) => {
        setLoading(true);
        try {
            const data = await examApi.getScoreByKeyword(key);
            setRecords(data);
        } catch (error) {
            notify('error', 'Search operation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: number) => {
        confirm({
            title: 'Delete Performance Record',
            message: 'This action will permanently erase the record from the central database. Proceed?',
            confirmText: 'Delete Forever',
            cancelText: 'Retain Record',
            onConfirm: async () => {
                try {
                    await examApi.deleteRecordScore(id);
                    notify('success', 'Record purged successfully');
                    if (searchTerm) searchHistory(searchTerm);
                    else fetchHistory();
                } catch (error) {
                    notify('error', 'Critical storage error');
                }
            }
        });
    };

    const handleViewDetail = (id: number) => {
        // Doc flow:導向 /test/result 並將 ExamRecord 的 id 傳遞集去
        sessionStorage.setItem('examResultId', id.toString());
        navigate('/test/result');
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10">
            {/* Professional Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-slate-200">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-base-content tracking-tight flex items-center gap-3">
                        Test History
                        <BarChart3 className="text-primary" size={24} />
                    </h1>
                    <p className="text-base-content/50 text-sm font-medium">Review your historical data and performance metrics.</p>
                </div>

                <div className="relative w-full md:w-80 group">
                    <input
                        type="text"
                        placeholder="Filter by module namer..."
                        className="pro-input w-full pl-10 h-11 text-sm rounded-xl"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/30 group-focus-within:text-primary transition-colors" size={16} />
                </div>
            </div>

            {/* Performance Ledger */}
            <div className="pro-card overflow-hidden">
                <div className="overflow-x-auto scroll-modern">
                    <table className="pro-table">
                        <thead>
                            <tr>
                                <th className="w-16">#</th>
                                <th>Exam Module</th>
                                <th className="text-center">Score</th>
                                <th className="text-center">Accuracy</th>
                                <th>Completion Date</th>
                                <th className="text-right">Intelligence</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="py-8 px-4"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : records.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-32 opacity-30 italic text-base-content/40 text-sm">
                                        <HistoryIcon size={48} className="mx-auto mb-4 opacity-20" />
                                        No performance records found in database.
                                    </td>
                                </tr>
                            ) : (
                                records.map((record, idx) => (
                                    <tr key={record.id} className="hover:bg-base-200 transition-colors group">
                                        <td className="font-mono text-[10px] text-base-content/30 font-bold">{idx + 1}</td>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                                    {record.examName.charAt(0)}
                                                </div>
                                                <span className="font-bold text-base-content/80">{record.examName}</span>
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <span className={`text-lg font-black tracking-tighter ${parseFloat(record.score) >= 60 ? 'text-success' : 'text-error'}`}>
                                                {record.score}%
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="text-[10px] font-black text-base-content/30 uppercase">{record.correctNums} / {record.quizNums}</span>
                                                <div className="w-20 bg-base-300 h-1 rounded-full overflow-hidden">
                                                    <div className="bg-primary h-full" style={{ width: `${(record.correctNums / record.quizNums) * 100}%` }}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2 text-xs font-medium text-base-content/50">
                                                <Calendar size={14} className="opacity-40" />
                                                {new Date(record.logTime).toLocaleDateString()}
                                                <span className="opacity-20 mx-1">|</span>
                                                <Clock size={14} className="opacity-40" />
                                                {new Date(record.logTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleViewDetail(record.id)}
                                                    className="btn btn-ghost btn-sm h-9 px-4 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 gap-2 normal-case font-bold"
                                                >
                                                    Report <ArrowRight size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(record.id)}
                                                    className="btn btn-ghost btn-sm btn-square h-9 rounded-lg hover:bg-error/10 hover:text-error text-base-content/20"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex items-center gap-4 bg-neutral text-neutral-content rounded-2xl p-6 shadow-lg overflow-hidden relative">
                <div className="absolute right-0 top-0 p-8 opacity-10">
                    <BarChart3 size={120} />
                </div>
                <div className="p-3 bg-neutral-content/10 rounded-xl">
                    <Info size={24} className="text-primary" />
                </div>
                <div>
                    <h3 className="font-bold">Intelligence Insight</h3>
                    <p className="text-xs opacity-60 font-medium">Your historical data is analyzed to provide personalized learning recommendations.</p>
                </div>
            </div>
        </div>
    );
};

export default History;
