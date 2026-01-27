import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
    id: string;
    type: NotificationType;
    message: string;
}

interface ConfirmOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
}

interface NotificationContextType {
    notify: (type: NotificationType, message: string) => void;
    confirm: (options: ConfirmOptions) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [confirmModal, setConfirmModal] = useState<ConfirmOptions | null>(null);

    const notify = (type: NotificationType, message: string) => {
        const id = Math.random().toString(36).substring(2, 9);
        setNotifications((prev) => [...prev, { id, type, message }]);
        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, 3000);
    };

    const confirm = (options: ConfirmOptions) => {
        setConfirmModal(options);
    };

    const handleConfirm = () => {
        if (confirmModal) {
            confirmModal.onConfirm();
            setConfirmModal(null);
        }
    };

    const handleCancel = () => {
        if (confirmModal) {
            if (confirmModal.onCancel) confirmModal.onCancel();
            setConfirmModal(null);
        }
    };

    return (
        <NotificationContext.Provider value={{ notify, confirm }}>
            {children}

            {/* Toasts Container */}
            <div className="toast toast-end toast-bottom z-[9999]">
                {notifications.map((n) => (
                    <div key={n.id} className={`alert alert-${n.type} shadow-lg animate-in slide-in-from-right-full duration-300`}>
                        <div className="flex items-center gap-2">
                            {n.type === 'success' && <CheckCircle size={18} />}
                            {n.type === 'error' && <AlertCircle size={18} />}
                            {n.type === 'warning' && <AlertTriangle size={18} />}
                            {n.type === 'info' && <Info size={18} />}
                            <span className="text-sm font-medium">{n.message}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Confirm Modal */}
            {confirmModal && (
                <div className="modal modal-open">
                    <div className="modal-box border border-base-300 shadow-2xl">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <HelpCircleIcon /> {confirmModal.title}
                        </h3>
                        <p className="py-4 opacity-70">{confirmModal.message}</p>
                        <div className="modal-action">
                            <button className="btn btn-ghost" onClick={handleCancel}>
                                {confirmModal.cancelText || 'Cancel'}
                            </button>
                            <button className="btn btn-primary" onClick={handleConfirm}>
                                {confirmModal.confirmText || 'Confirm'}
                            </button>
                        </div>
                    </div>
                    <div className="modal-backdrop bg-black/40" onClick={handleCancel}></div>
                </div>
            )}
        </NotificationContext.Provider>
    );
};

const HelpCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotification must be used within NotificationProvider');
    return context;
};
