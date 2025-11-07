import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext'; // Theme context import karein

const LandingNavbar = () => {
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border-b border-slate-200/80 dark:border-slate-700/80">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center shadow-md">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-slate-800 dark:text-white">EMS Portal</h1>
                    </div>

                    {/* Nav Buttons */}
                    <div className="flex items-center space-x-2">
                        <button onClick={toggleTheme} className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700">
                            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                        >
                            Login
                        </button>
                        <button
                            onClick={() => navigate('/signup')}
                            className="px-4 py-2 text-sm font-medium bg-teal-600 text-white hover:bg-teal-700 rounded-lg shadow-sm"
                        >
                            Sign Up
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default LandingNavbar;