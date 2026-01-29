import { useState } from 'react';
import {
    Settings as SettingsIcon, Palette,
    Globe, Save, RefreshCw,
    Shield, Terminal, LayoutTemplate,
    Download, Upload, FileJson,
    Copy, Check, Key
} from 'lucide-react';
import { backupApi } from '../services/api';
import { useNotification, type ToastPosition } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const Settings = () => {
    const [apiUrl, setApiUrl] = useState(localStorage.getItem('exam_api_url') || 'http://localhost:12058/api');
    const { theme, setTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();
    const { notify, position, setPosition } = useNotification();

    const positions: { id: ToastPosition; label: string }[] = [
        { id: 'top-start', label: 'Top Left' },
        { id: 'top-center', label: 'Top Center' },
        { id: 'top-end', label: 'Top Right' },
        { id: 'bottom-start', label: 'Bottom Left' },
        { id: 'bottom-center', label: 'Bottom Center' },
        { id: 'bottom-end', label: 'Bottom Right' },
    ];

    const themes = [
        "light", "dark", "cupcake", "bumblebee", "emerald", "corporate", "synthwave",
        "retro", "cyberpunk", "valentine", "halloween", "garden", "forest", "aqua",
        "lofi", "pastel", "fantasy", "wireframe", "black", "luxury", "dracula",
        "cmyk", "autumn", "business", "acid", "lemonade", "night", "coffee", "winter",
    ];

    const handleSaveApi = () => {
        localStorage.setItem('exam_api_url', apiUrl);
        notify('success', 'API Endpoints synchronized successfully.');
        // Force refresh to apply new API URL across all services
        setTimeout(() => window.location.reload(), 1000);
    };

    // --- Backup & Restore Logic ---
    const [includeHistory, setIncludeHistory] = useState(true);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [importKey, setImportKey] = useState('');
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [exportPin, setExportPin] = useState<string | null>(null);
    const [isPinCopied, setIsPinCopied] = useState(false);

    const generateKey = () => Math.floor(10000 + Math.random() * 90000).toString();

    const xorCipher = (str: string, key: string) => {
        let output = '';
        for (let i = 0; i < str.length; i++) {
            const charCode = str.charCodeAt(i) ^ key.charCodeAt(i % key.length);
            output += String.fromCharCode(charCode);
        }
        return output;
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const data = await backupApi.exportData(includeHistory);
            const key = generateKey();
            const jsonStr = JSON.stringify(data);
            const encrypted = xorCipher(jsonStr, key);
            const base64 = btoa(unescape(encodeURIComponent(encrypted)));

            const blob = new Blob([base64], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `exam_backup_${new Date().toISOString().split('T')[0]}.dat`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            notify('success', 'Export Successful! Please save your PIN.');
            setExportPin(key);
            setIsPinCopied(false);

        } catch (e) {
            console.error(e);
            notify('error', 'Export failed.');
        } finally {
            setIsExporting(false);
        }
    };

    const handleImport = async () => {
        if (!importFile || importKey.length !== 5) {
            notify('warning', 'Please select a file and enter the 5-digit PIN.');
            return;
        }

        setIsImporting(true);
        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const base64 = e.target?.result as string;
                    const encrypted = decodeURIComponent(escape(atob(base64)));
                    const decrypted = xorCipher(encrypted, importKey);
                    const data = JSON.parse(decrypted);

                    await backupApi.importData(data);
                    notify('success', 'Data restored successfully! Reloading...');
                    setTimeout(() => window.location.reload(), 1500);
                } catch (err) {
                    console.error(err);
                    notify('error', 'Import failed. Invalid PIN or corrupted file.');
                } finally {
                    setIsImporting(false);
                }
            };
            reader.readAsText(importFile);
        } catch (e) {
            console.error(e);
            notify('error', 'Import failed.');
            setIsImporting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-20">
            {/* Page Header */}
            <div className="space-y-1 pb-4 border-b border-slate-200">
                <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                    {t('settings.title')}
                    <SettingsIcon className="text-indigo-500" size={24} />
                </h1>
                <p className="text-slate-500 text-sm font-medium">{t('settings.desc')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                {/* Visual Settings */}
                <div className="md:col-span-12 lg:col-span-7 space-y-8">
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Globe className="text-indigo-600" size={20} />
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('settings.lang')}</h2>
                        </div>
                        <div className="pro-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-sm font-bold text-slate-600">{t('settings.lang.desc')}</p>
                            <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                                <button
                                    onClick={() => setLanguage('en')}
                                    className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${language === 'en' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    English
                                </button>
                                <button
                                    onClick={() => setLanguage('tw')}
                                    className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${language === 'tw' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    繁體中文
                                </button>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <LayoutTemplate className="text-indigo-600" size={20} />
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Notification Position</h2>
                        </div>
                        <div className="pro-card p-6">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {positions.map((pos) => (
                                    <button
                                        key={pos.id}
                                        onClick={() => {
                                            setPosition(pos.id);
                                            notify('info', `Position updated to ${pos.label}`);
                                        }}
                                        className={`px-4 py-3 rounded-xl text-xs font-bold transition-all border-2 flex items-center justify-center gap-2 ${position === pos.id
                                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md'
                                            : 'border-slate-100 text-slate-500 hover:border-slate-200 hover:bg-slate-50'
                                            }`}
                                    >
                                        {/* Mini visual indicator of position */}
                                        <div className={`w-3 h-2 rounded-[1px] border border-current opacity-50 flex ${pos.id.includes('start') ? 'justify-start' : pos.id.includes('end') ? 'justify-end' : 'justify-center'} ${pos.id.includes('top') ? 'items-start' : 'items-end'}`}>
                                            <div className="w-1 h-1 bg-current rounded-[1px]"></div>
                                        </div>
                                        {pos.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Palette className="text-indigo-600" size={20} />
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('settings.theme')}</h2>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {themes.map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setTheme(t)}
                                    data-theme={t}
                                    className={`p-3 rounded-2xl border-2 text-left transition-all group relative overflow-hidden ${theme === t
                                        ? 'border-primary ring-2 ring-primary/20 shadow-lg'
                                        : 'border-base-300 hover:border-primary/50'
                                        } bg-base-100`}
                                >
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-base-content">{t}</span>
                                            {theme === t && (
                                                <div className="w-2 h-2 bg-primary rounded-full ring-4 ring-primary/20"></div>
                                            )}
                                        </div>
                                        <div className="flex gap-1.5 mt-1">
                                            <div className="w-full h-4 bg-primary rounded-sm shadow-sm"></div>
                                            <div className="w-full h-4 bg-secondary rounded-sm shadow-sm"></div>
                                            <div className="w-full h-4 bg-accent rounded-sm shadow-sm"></div>
                                            <div className="w-full h-4 bg-neutral rounded-sm shadow-sm"></div>
                                        </div>
                                    </div>
                                    {/* Aesthetic overlay for hover */}
                                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Terminal className="text-indigo-600" size={20} />
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('settings.api')}</h2>
                        </div>

                        <div className="pro-card p-8 space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Gateway Endpoint URL</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1 group">
                                        <input
                                            type="text"
                                            className="pro-input w-full h-10 pl-10 text-sm"
                                            placeholder="Enter Gateway URL..."
                                            value={apiUrl}
                                            onChange={(e) => setApiUrl(e.target.value)}
                                        />
                                        <Terminal className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500" size={16} />
                                    </div>
                                    <button
                                        onClick={handleSaveApi}
                                        className="btn btn-primary btn-sm h-10 px-6 rounded-xl gap-2 shadow-lg shadow-indigo-100"
                                    >
                                        <Save size={16} /> {t('settings.save')}
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

                    {/* Backup & Restore Card */}
                    <div className="pro-card p-6 border-indigo-100 shadow-lg">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                <FileJson size={20} />
                            </div>
                            <h3 className="font-bold text-slate-700">Backup & Restore</h3>
                        </div>

                        {/* Export */}
                        <div className="space-y-4 mb-8">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                                <Download size={12} /> Export Data
                            </h4>

                            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors">
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-primary checkbox-sm"
                                    checked={includeHistory}
                                    onChange={(e) => setIncludeHistory(e.target.checked)}
                                />
                                <span className="text-xs font-bold text-slate-600">Include Test History</span>
                            </label>

                            <button
                                onClick={handleExport}
                                disabled={isExporting}
                                className="btn btn-primary btn-sm w-full gap-2 shadow-indigo-100 shadow-lg"
                            >
                                {isExporting ? <span className="loading loading-spinner loading-xs" /> : <Download size={14} />}
                                Export Backup
                            </button>
                        </div>

                        {/* Import */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                                <Upload size={12} /> Import Data
                            </h4>

                            <input
                                type="file"
                                accept=".dat"
                                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                                className="file-input file-input-bordered file-input-sm w-full text-xs"
                            />

                            <div className="relative">
                                <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <input
                                    type="text"
                                    maxLength={5}
                                    placeholder="Enter 5-digit PIN"
                                    value={importKey}
                                    onChange={(e) => setImportKey(e.target.value.replace(/\D/g, ''))}
                                    className="input input-bordered input-sm w-full pl-9 tracking-widest font-mono text-sm"
                                />
                            </div>

                            <button
                                onClick={handleImport}
                                disabled={!importFile || importKey.length !== 5 || isImporting}
                                className="btn btn-outline btn-sm w-full gap-2 hover:bg-slate-800 hover:text-white"
                            >
                                {isImporting ? <span className="loading loading-spinner loading-xs" /> : <Upload size={14} />}
                                Restore from File
                            </button>
                            <p className="text-[10px] text-slate-400 text-center leading-tight">
                                Restoring will overwrite all current data. <br />This action cannot be undone.
                            </p>
                        </div>
                    </div>

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

                {/* Export PIN Modal */}
                {exportPin && (
                    <div className="modal modal-open">
                        <div className="modal-box border border-base-300 shadow-2xl p-0 overflow-hidden max-w-sm">
                            <div className="bg-indigo-600 p-6 text-white text-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Key size={80} />
                                </div>
                                <div className="relative z-10 flex flex-col items-center gap-2">
                                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full mb-2">
                                        <Shield size={32} className="text-white" />
                                    </div>
                                    <h3 className="font-black text-xl tracking-tight">Export Successful</h3>
                                    <p className="text-indigo-100 text-xs font-medium max-w-[200px]">
                                        Your data has been encrypted. You will need this PIN to restore it.
                                    </p>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center space-y-2 relative group">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        Decryption PIN
                                    </label>
                                    <div className="text-4xl font-mono font-black text-slate-800 tracking-widest flex justify-center items-center gap-2">
                                        {exportPin}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(exportPin);
                                            setIsPinCopied(true);
                                            setTimeout(() => setIsPinCopied(false), 2000);
                                        }}
                                        className={`btn ${isPinCopied ? 'btn-success text-white' : 'btn-outline border-slate-200 hover:bg-slate-50 hover:text-slate-700'} btn-block gap-2`}
                                    >
                                        {isPinCopied ? <Check size={18} /> : <Copy size={18} />}
                                        {isPinCopied ? 'Copied to Clipboard' : 'Copy PIN'}
                                    </button>

                                    <button
                                        onClick={() => setExportPin(null)}
                                        className="btn btn-primary btn-block text-white shadow-lg shadow-indigo-100"
                                    >
                                        I have saved my PIN
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;
