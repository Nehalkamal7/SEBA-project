import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Moon, Sun, Globe } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/utils/language';
import { Button } from '@/components/ui/Button';

export const HomeHeader = () => {
  const { theme, toggle: toggleTheme } = useTheme();
  const { language, toggle: toggleLanguage } = useLanguage();

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4"
    >
      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-6xl bg-white/90 dark:bg-[#0d0d2b]/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-2xl shadow-gray-900/10 dark:shadow-gray-900/50 hover:shadow-3xl hover:shadow-gray-900/20 dark:hover:shadow-gray-900/60 transition-shadow"
      >
        <div className="flex items-center justify-between h-16 px-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/" className="flex items-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <img src="/seba-logo.png" alt="SEBA Logo" className="h-12 w-auto" />
              </motion.div>
            </Link>
          </motion.div>

          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1, rotate: -15 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleLanguage}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle language"
            >
              <Globe className="h-5 w-5" />
            </motion.button>
            <Link to="/login">
              <Button variant="ghost" size="sm">
                {t('login')}
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm">
                {t('register')}
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.nav>
  );
};

