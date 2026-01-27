import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    Home, History, Settings, LayoutDashboard,
    Menu, X, ChevronRight, GraduationCap
} from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const location = useLocation();

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    // Listen for storage changes to sync theme
    useEffect(() => {
        const handleStorage = () => {
            const storedTheme = localStorage.getItem('theme');
            if (storedTheme) setTheme(storedTheme);
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const menuItems = [
        { path: '/', name: 'Explore Exams', icon: Home },
        { path: '/history', name: 'Test History', icon: History },
        { path: '/management', name: 'Management', icon: LayoutDashboard },
        { path: '/settings', name: 'Preferences', icon: Settings },
    ];

    const getPageTitle = () => {
        const item = menuItems.find(i => i.path === location.pathname);
        if (item) return item.name;
        if (location.pathname.startsWith('/exam/')) return 'Live Examination';
        if (location.pathname.startsWith('/edit/')) return 'Content Editor';
        if (location.pathname === '/test/result') return 'Performance Report';
        return 'Exam System';
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-outfit">
            {/* Professional Static Sidebar */}
            <aside
                className={`${isSidebarOpen ? 'w-72' : 'w-20'
                    } bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out z-50`}
            >
                <div className="p-6 flex items-center gap-3 overflow-hidden whitespace-nowrap">
                    <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-200">
                        <GraduationCap size={24} />
                    </div>
                    {isSidebarOpen && (
                        <span className="text-xl font-bold tracking-tight text-slate-800">ExamSync</span>
                    )}
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto no-scrollbar">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive
                                    ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100 shadow-sm'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
              `}
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isSidebarOpen ? '' : 'mx-auto'} />
                                    {isSidebarOpen && <span className="text-sm">{item.name}</span>}
                                    {isSidebarOpen && location.pathname === item.path && (
                                        <ChevronRight size={14} className="ml-auto opacity-50" />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 mt-auto">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="w-full flex items-center justify-center p-3 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"
                    >
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </aside>

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-40">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-bold text-slate-800">{getPageTitle()}</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="badge badge-outline text-[10px] py-3 px-4 border-slate-200 text-slate-500 font-mono uppercase tracking-widest">
                            {theme} Mode
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto scroll-modern bg-slate-50">
                    <div className="p-8 fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
