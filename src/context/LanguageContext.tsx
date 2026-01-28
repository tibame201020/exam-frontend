import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'tw';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Simple dictionary for localization
const translations: Record<Language, Record<string, string>> = {
    en: {
        // General
        'app.title': 'Question Banks',
        'app.desc': 'Select a module to begin your technical assessment.',
        'search.placeholder': 'Search exam modules...',
        'loading': 'Loading...',
        'no.exams': 'No modules found matching your criteria',

        // Home
        'home.start': 'Launch Examination',
        'home.init': 'Initialization Protocol',
        'home.config': 'Configuration Settings',
        'home.questions': 'Questions',
        'home.mode.exam': 'Assessment',
        'home.mode.practice': 'Training',
        'home.ensure': 'Ensure stable connection before starting the assessment',

        // Exam
        'exam.panel': 'Assessment Panel',
        'exam.quit': 'Quit System',
        'exam.finalize': 'Finalize',
        'exam.progress': 'Completion Progress',
        'exam.submit.title': 'Confirm Submission',
        'exam.submit.msg': 'Proceed to finalize your assessment? Once submitted, answers cannot be modified.',
        'exam.submit.warn': 'Warning: Some questions remain unanswered. Do you want to submit anyway?',
        'exam.submit.confirm': 'Submit Final Answers',
        'exam.submit.cancel': 'Continue Testing',

        // Solution
        'sol.title': 'Knowledge Solutions',
        'sol.desc': 'Browse verified answer keys and expert analysis.',
        'sol.filter': 'Filter repositories...',
        'sol.atlas': 'Standard Solution Atlas',
        'sol.overview': 'Solution Overview',
        'sol.verified': 'Verified Key',

        // Result
        'res.perf': 'Performance Breakdown',
        'res.desc': 'Detailed analysis for module',
        'res.explore': 'Explore',
        'res.logs': 'All Logs',
        'res.score': 'Score',
        'res.correct': 'Correct',
        'res.incorrect': 'Incorrect',
        'res.summary': 'Module Summary',
        'res.verified': 'Verified Responses',
        'res.total': 'Total Questions',
        'res.accuracy': 'Accuracy',
        'res.filters': 'Visibility Filters',
        'res.filter.all': 'Complete Ledger',
        'res.filter.correct': 'Verified Only',
        'res.filter.kv': 'Errors Only',

        // Settings
        'settings.title': 'System Preferences',
        'settings.desc': 'Fine-tune the interface and technical configuration.',
        'settings.lang': 'Language Localization',
        'settings.lang.desc': 'Select your preferred interface language.',
        'settings.theme': 'Interface Skin',
        'settings.api': 'API Infrastructure',
        'settings.save': 'Apply',
    },
    tw: {
        // General
        'app.title': '專業題庫系統',
        'app.desc': '選擇模組以開始您的技術評估。',
        'search.placeholder': '搜尋題庫模組...',
        'loading': '載入中...',
        'no.exams': '找不到符合條件的模組',

        // Home
        'home.start': '開始測驗',
        'home.init': '初始化協定',
        'home.config': '配置設定',
        'home.questions': '題數',
        'home.mode.exam': '正式測驗',
        'home.mode.practice': '練習模式',
        'home.ensure': '開始評估前請確保連線穩定',

        // Exam
        'exam.panel': '測驗控制台',
        'exam.quit': '退出系統',
        'exam.finalize': '交卷',
        'exam.progress': '完成進度',
        'exam.submit.title': '確認提交',
        'exam.submit.msg': '確定要結束測驗並提交答案嗎？提交後將無法修改。',
        'exam.submit.warn': '警告：尚有未作答的題目。確定要提交嗎？',
        'exam.submit.confirm': '確認提交',
        'exam.submit.cancel': '繼續測驗',

        // Solution
        'sol.title': '題庫詳解',
        'sol.desc': '瀏覽經過驗證的答案與專家解析。',
        'sol.filter': '篩選題庫...',
        'sol.atlas': '標準解答庫',
        'sol.overview': '詳解總覽',
        'sol.verified': '驗證答案',

        // Result
        'res.perf': '成效分析',
        'res.desc': '模組詳細分析報告',
        'res.explore': '瀏覽其他',
        'res.logs': '所有記錄',
        'res.score': '分數',
        'res.correct': '正確',
        'res.incorrect': '錯誤',
        'res.summary': '模組摘要',
        'res.verified': '答對題數',
        'res.total': '總題數',
        'res.accuracy': '準確率',
        'res.filters': '顯示篩選',
        'res.filter.all': '完整記錄',
        'res.filter.correct': '僅顯示正確',
        'res.filter.kv': '僅顯示錯誤',

        // Settings
        'settings.title': '系統偏好設定',
        'settings.desc': '調整介面與技術配置。',
        'settings.lang': '語系設定',
        'settings.lang.desc': '選擇介面偏好語言。',
        'settings.theme': '介面風格',
        'settings.api': 'API 架構',
        'settings.save': '套用變更',
    }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(() => {
        return (localStorage.getItem('language') as Language) || 'en';
    });

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
    };

    const t = (key: string): string => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
