import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { examApi } from '../services/api';
import {
    Search, Plus, Edit2, Trash2,
    LayoutDashboard, Package,
    ExternalLink, AlertCircle
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const Management = () => {
    const [exams, setExams] = useState<string[]>([]);
    const [keyword, setKeyword] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { notify, confirm } = useNotification();

    useEffect(() => {
        fetchExams();
    }, []);

    // Sync search with getExamListByKeyWord
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (keyword) {
                searchExams(keyword);
            } else {
                fetchExams();
            }
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [keyword]);

    const fetchExams = async () => {
        setLoading(true);
        try {
            // Updated to match documentation: getExamList('')
            const data = await examApi.getExamList();
            setExams(data);
        } catch (error) {
            notify('error', 'Failed to retrieve administrative inventory');
        } finally {
            setLoading(false);
        }
    };

    const searchExams = async (key: string) => {
        setLoading(true);
        try {
            const data = await examApi.getExamListByKeyWord(key);
            setExams(data);
        } catch (error) {
            notify('error', 'Module search failed');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = (name: string) => {
        confirm({
            title: 'Authorize Permanent Deletion',
            message: `Warning: This will permanently remove the module "${name}" and all associated questions from the system. This cannot be undone.`,
            confirmText: 'Confirm Removal',
            onConfirm: async () => {
                try {
                    await examApi.removeExam(name);
                    notify('success', `Module "${name}" has been purged`);
                    fetchExams();
                } catch (error) {
                    notify('error', 'Operation failed. Module may be in use.');
                }
            }
        });
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-slate-200">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-base-content tracking-tight flex items-center gap-3">
                        Content Inventory
                        <Package className="text-primary" size={24} />
                    </h1>
                    <p className="text-base-content/50 text-sm font-medium">Manage and deploy assessment question banks.</p>
                </div>

                <div className="flex gap-3">
                    <div className="relative group w-full md:w-64">
                        <input
                            type="text"
                            placeholder="Filter library..."
                            className="pro-input w-full pl-10 h-11 text-sm rounded-xl"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/30 group-focus-within:text-primary transition-colors" size={16} />
                    </div>
                    <button
                        onClick={() => navigate('/edit/NEW_EXAM')}
                        className="pro-btn btn-primary h-11 px-6 gap-2 shadow-lg shadow-primary/20"
                    >
                        <Plus size={18} /> New Module
                    </button>
                </div>
            </div>

            {/* Inventory Ledger */}
            <div className="pro-card transition-all">
                <div className="overflow-x-auto scroll-modern">
                    <table className="pro-table">
                        <thead>
                            <tr>
                                <th className="w-16">Status</th>
                                <th>Module Specification</th>
                                <th>Library Identifier</th>
                                <th className="text-right px-8">Administrative Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={4} className="py-8 px-4"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : exams.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-32 opacity-30 italic text-slate-400">
                                        <AlertCircle size={48} className="mx-auto mb-4" />
                                        No active modules identified in the current context.
                                    </td>
                                </tr>
                            ) : (
                                exams.map((name) => (
                                    <tr key={name} className="hover:bg-slate-50 transition-colors group">
                                        <td>
                                            <div className="flex items-center justify-center">
                                                <div className="w-2.5 h-2.5 rounded-full bg-success shadow-sm shadow-success/20"></div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-xs shadow-sm shadow-primary/5 group-hover:bg-primary group-hover:text-primary-content transition-all">
                                                    {name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-base-content/80">{name}</span>
                                                    <span className="text-[10px] text-base-content/30 font-black uppercase tracking-widest">Question Bank v1.0</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <code className="text-[10px] bg-base-200 px-3 py-1 rounded-md text-base-content/40 font-bold tracking-tight border border-base-300">
                                                REF-{name.replace(/\s+/g, '-').toUpperCase()}
                                            </code>
                                        </td>
                                        <td className="text-right px-8">
                                            <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                                                <button
                                                    onClick={() => navigate(`/edit/${name}`)}
                                                    className="btn btn-ghost btn-sm h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-primary-content hover:border-primary gap-2 normal-case font-bold"
                                                >
                                                    Modify <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleRemove(name)}
                                                    className="btn btn-ghost btn-sm btn-square h-10 rounded-xl hover:bg-error/10 hover:text-error text-base-content/20 border-transparent"
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

            {/* Admin Notice */}
            <div className="flex items-center gap-4 bg-neutral text-neutral-content rounded-3xl p-8 shadow-2xl overflow-hidden relative group">
                <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-5 transition-opacity"></div>
                <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-neutral-content/5 rounded-full blur-3xl"></div>

                <div className="p-4 bg-neutral-content/10 rounded-2xl flex-shrink-0">
                    <LayoutDashboard size={32} className="text-primary" />
                </div>
                <div className="flex-1 space-y-2">
                    <h3 className="font-black tracking-tight text-xl">Governance Control</h3>
                    <p className="text-sm opacity-40 leading-relaxed max-w-xl">
                        Content deployment follows rigorous integrity checks. Modified modules will propagate to live assessment instances immediately upon saving.
                    </p>
                </div>
                <div className="hidden lg:block">
                    <button onClick={() => navigate('/')} className="pro-btn bg-neutral-content/10 text-neutral-content border-neutral-content/10 hover:bg-primary hover:border-primary hover:text-primary-content normal-case gap-2">
                        View Live <ExternalLink size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Management;
