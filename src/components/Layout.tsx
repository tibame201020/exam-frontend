import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    Home, History, Settings, LayoutDashboard,
    Menu, X, ChevronRight, GraduationCap,
    Palette, Check, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme, themes } from '../context/ThemeContext';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { theme, setTheme } = useTheme();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [themeSearch, setThemeSearch] = useState('');
    const location = useLocation();

    const filteredThemes = themes.filter(t =>
        t.toLowerCase().includes(themeSearch.toLowerCase())
    );

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
        <div className="flex h-screen bg-base-200 overflow-hidden font-outfit">
            {/* Professional Static Sidebar */}
            <aside
                className={`${isSidebarOpen ? 'w-72' : 'w-20'
                    } bg-base-100 border-r border-base-300 flex flex-col transition-all duration-300 ease-in-out z-50`}
            >
                <div className="p-6 flex items-center gap-3 overflow-hidden whitespace-nowrap">
                    <div className="bg-primary p-2 rounded-lg text-primary-content shadow-lg shadow-primary/20">
                        <GraduationCap size={24} />
                    </div>
                    {isSidebarOpen && (
                        <span className="text-xl font-bold tracking-tight text-base-content">ExamSync</span>
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
                                    ? 'bg-primary/10 text-primary font-bold border border-primary/20 shadow-sm'
                                    : 'text-base-content/60 hover:bg-base-200 hover:text-base-content'}
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
                        className="w-full flex items-center justify-center p-3 rounded-xl hover:bg-base-200 text-base-content/40 transition-colors"
                    >
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </aside>

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 bg-base-100 border-b border-base-300 flex items-center justify-between px-8 z-40">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-bold text-base-content">{getPageTitle()}</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="dropdown dropdown-end">
                            <label tabIndex={0} className="pro-btn btn-ghost btn-sm gap-2 normal-case border border-base-300">
                                <Palette size={14} className="text-primary" />
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{theme}</span>
                            </label>
                            <div tabIndex={0} className="dropdown-content z-[100] p-2 shadow-2xl bg-base-100 border border-base-300 rounded-2xl w-64 mt-4 flex flex-col gap-2">
                                <div className="px-2 pt-2">
                                    <div className="relative group">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30 group-focus-within:text-primary transition-colors" size={14} />
                                        <input
                                            type="text"
                                            placeholder="Search themes..."
                                            className="w-full bg-base-200 border-none focus:ring-1 focus:ring-primary rounded-xl pl-9 pr-4 py-2 text-xs font-bold transition-all outline-none"
                                            value={themeSearch}
                                            onChange={(e) => setThemeSearch(e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                </div>
                                <ul className="menu p-1 flex-nowrap max-h-80 overflow-y-auto scroll-modern space-y-px">
                                    <li className="menu-title text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 opacity-40">Available Skins</li>
                                    {filteredThemes.length > 0 ? (
                                        filteredThemes.map((t) => (
                                            <li key={t}>
                                                <button
                                                    onClick={() => setTheme(t)}
                                                    className={`flex justify-between items-center py-3 px-4 rounded-xl text-xs font-bold transition-all ${theme === t ? 'bg-primary/10 text-primary' : 'hover:bg-base-200 opacity-70 hover:opacity-100'}`}
                                                    data-theme={t}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex gap-0.5">
                                                            <div className="w-1.5 h-3 bg-primary rounded-full"></div>
                                                            <div className="w-1.5 h-3 bg-secondary rounded-full"></div>
                                                        </div>
                                                        <span className="capitalize">{t}</span>
                                                    </div>
                                                    {theme === t && <Check size={12} />}
                                                </button>
                                            </li>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center opacity-30 text-[10px] font-bold uppercase tracking-widest">No matching skins</div>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto scroll-modern bg-base-100">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                            className="p-8"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default Layout;
