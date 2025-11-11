import React, { useState } from 'react';
import { Bell, Menu, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotification } from '../../contexts/NotificationContext'; // <-- NAYA IMPORT

const Header = ({ onMenuToggle, title }) => {
    const { isDarkMode, toggleTheme } = useTheme();

    // --- YEH POORA SECTION UPDATE HUA HAI ---
    // Hum local state (useState) ke bajaye seedha context se data le rahe hain
    const {
        notifications,
        unreadCount,
        markAsRead
    } = useNotification();

    const [showNotifications, setShowNotifications] = useState(false);

    // useEffect aur apiGetNotifications() yahaan se HATA diye gaye hain.
    // --- END UPDATE ---

    const handleBellClick = () => {
        setShowNotifications(prev => !prev);
        // Jab user dropdown khole, toh notifications ko 'read' mark karein
        if (!showNotifications) {
            markAsRead();
        }
    };

    const iconButtonClass = "p-2 rounded-full transition-colors duration-200 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700";

    return (
        <header className="p-2 sm:p-4">
            <div className="flex items-center justify-between w-full h-16 px-4 sm:px-6 rounded-2xl border bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border-slate-200/80 dark:border-slate-700">
                <div className="flex items-center space-x-4">
                    <button onClick={onMenuToggle} className={`lg:hidden ${iconButtonClass}`}>
                        <Menu className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100 capitalize">
                        {title}
                    </h1>
                </div>

                <div className="flex items-center space-x-3">
                    <button onClick={toggleTheme} className={iconButtonClass}>
                        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>

                    <div className="relative">
                        <button onClick={handleBellClick} className={`relative ${iconButtonClass}`}>
                            <Bell className="w-5 h-5" />
                            {/* Unread count ab context se aa raha hai */}
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                        {showNotifications && (
                            <div className="fade-in-section is-visible absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50">
                                <div className="p-3 font-bold border-b border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100">Notifications</div>
                                <div className="p-2 max-h-80 overflow-y-auto">
                                    {/* Notification list ab context se aa rahi hai */}
                                    {notifications.length > 0 ? notifications.map(n => (
                                        <div key={n.id} className="p-2 border-b border-slate-100 dark:border-slate-700/50">
                                            <p className="text-sm text-slate-700 dark:text-slate-200">{n.message}</p>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                                        </div>
                                    )) : (
                                        <p className="p-4 text-sm text-center text-slate-500">No new notifications.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;