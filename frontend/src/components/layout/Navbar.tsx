import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Moon, Sun, Globe, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/utils/language';
import { api } from '@/utils/api';
import { Button } from '@/components/ui/Button';

export const Navbar = () => {
  const { theme, toggle: toggleTheme } = useTheme();
  const { language, toggle: toggleLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.01 }}
        className="w-full max-w-6xl bg-white/90 dark:bg-[#0d0d2b]/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-2xl shadow-gray-900/10 dark:shadow-gray-900/50 hover:shadow-3xl hover:shadow-gray-900/20 dark:hover:shadow-gray-900/60 transition-shadow"
      >
        <div className="flex items-center justify-between h-16 px-6">
          <Link to="/dashboard" className="flex items-center">
            <img src="/seba-logo.png" alt="SEBA Logo" className="h-12 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/dashboard"
              className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-500 transition-colors"
            >
              {t('dashboard')}
            </Link>
            <Link
              to="/courses"
              className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-500 transition-colors"
            >
              {t('courses')}
            </Link>



            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-200 dark:border-gray-700">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button
                onClick={toggleLanguage}
                className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle language"
              >
                <Globe className="h-5 w-5" />
              </button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                {t('logout')}
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 px-6 border-t border-gray-200/50 dark:border-gray-700/50">
            <Link
              to="/dashboard"
              className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-500"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('dashboard')}
            </Link>
            <Link
              to="/courses"
              className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-500"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('courses')}
            </Link>


            <div className="flex items-center gap-2 px-3 py-2 mt-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button
                onClick={toggleLanguage}
                className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Globe className="h-5 w-5" />
              </button>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="flex-1">
                {t('logout')}
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </nav>
  );
};

