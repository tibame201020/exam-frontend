import { useState, useEffect } from 'react';
import {
    Settings as SettingsIcon, Palette,
    Globe, Save, RefreshCw, Check,
    Shield, Terminal
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const Settings = () => {
    const [apiUrl, setApiUrl] = useState(localStorage.getItem('exam_api_url') || 'http://localhost:12058/api');
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const { notify } = useNotification();

    const themes = [
        "light", "dark", "cupcake", "bumblebee", "emerald", "corporate", "synthwave",
        "retro", "cyberpunk", "valentine", "halloween", "garden", "forest", "aqua",
        "lofi", "pastel", "fantasy", "wireframe", "black", "luxury", "dracula",
        "cmyk", "autumn", "business", "acid", "lemonade", "night", "coffee", "winter",
    ];

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        // Dispatch storage event for Layout sync
        window.dispatchEvent(new Event('storage'));
    }, [theme]);

    const handleSaveApi = () => {
        localStorage.setItem('exam_api_url', apiUrl);
        notify('success', 'API Endpoints synchronized successfully.');
        // Force refresh to apply new API URL across all services
        setTimeout(() => window.location.reload(), 1000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-20">
            {/* Page Header */}
            <div className="space-y-1 pb-4 border-b border-slate-200">
                <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                    System Preferences
                    <SettingsIcon className="text-indigo-500" size={24} />
                </h1>
                <p className="text-slate-500 text-sm font-medium">Fine-tune the interface and technical configuration.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                {/* Visual Settings */}
                <div className="md:col-span-12 lg:col-span-7 space-y-8">
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Palette className="text-indigo-600" size={20} />
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Interface Skin</h2>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {themes.map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setTheme(t)}
                                    className={`p-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${theme === t
                                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-lg shadow-indigo-100'
                                            : 'border-slate-100 bg-white hover:border-slate-200 text-slate-400'
                                        }`}
                                >
                                    {t}
                                    {theme === t && <Check size={10} className="inline ml-1" />}
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Globe className="text-indigo-600" size={20} />
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">API Infrastructure</h2>
                        </div>

                        <div className="pro-card p-8 space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Gateway Endpoint URL</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1 group">
                                        <input
                                            type="text"
                                            className="pro-input w-full h-12 pl-10 text-sm"
                                            placeholder="Enter Gateway URL..."
                                            value={apiUrl}
                                            onChange={(e) => setApiUrl(e.target.value)}
                                        />
                                        <Terminal className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500" size={16} />
                                    </div>
                                    <button
                                        onClick={handleSaveApi}
                                        className="btn btn-primary h-12 px-6 rounded-xl gap-2 shadow-lg shadow-indigo-100"
                                    >
                                        <Save size={18} /> Apply
                                    </button>
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium">
                                Changes will require a partial system synchronization (reload).
                            </p>
                        </div>
                    </section>
                </div>

                {/* Info Sidebar */}
                <div className="md:col-span-12 lg:col-span-5 space-y-6">
                    <div className="pro-card p-8 bg-slate-900 text-white space-y-6 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-10">
                            <Shield size={100} />
                        </div>
                        <div className="flex items-center gap-3">
                            <Shield className="text-indigo-400" size={20} />
                            <span className="text-xs font-black uppercase tracking-[0.2em]">Security Clearance</span>
                        </div>
                        <p className="text-sm font-medium text-slate-400 leading-relaxed relative z-10">
                            These settings alter the fundamental behavior of the client. Only personnel with valid administrative credentials should modify API endpoints in production environments.
                        </p>
                        <div className="pt-4 border-t border-white/10 relative z-10">
                            <button className="text-[10px] font-black uppercase text-indigo-400 flex items-center gap-2 hover:text-indigo-300 transition-colors">
                                View Security Logs <RefreshCw size={12} />
                            </button>
                        </div>
                    </div>

                    <div className="p-8 rounded-3xl bg-indigo-50 border border-indigo-100 space-y-4">
                        <h4 className="text-xs font-black text-indigo-900 uppercase">System Integrity</h4>
                        <div className="space-y-2 text-[10px] font-bold text-indigo-700/60 uppercase tracking-widest">
                            <div className="flex justify-between">
                                <span>Core Version</span>
                                <span>v2.4.12-pro</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Latency</span>
                                <span className="text-emerald-600">Optimal (12ms)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
