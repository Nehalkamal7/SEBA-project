import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { api } from '@/utils/api';
import { t } from '@/utils/language';
import { useLanguage } from '@/contexts/LanguageContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | 'parent'>('student');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { language } = useLanguage();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await api.login(email, password);

      // Verify role matches selected tab (optional UX enforcement)
      if (response.user && response.user.role !== selectedRole) {
        setError(`This account is registered as a ${response.user.role}. Please switch tabs.`);
        setIsLoading(false);
        return;
      }

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || t('errorOccurred', language));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout showNavbar={false}>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <GraduationCap className="h-12 w-12 text-blue-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('login')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('dontHaveAccount')}{' '}
              <Link to="/register" className="text-blue-500 hover:underline">
                {t('register')}
              </Link>
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            {error && (
              <Alert type="error" className="mb-6" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg mb-6">
              {['student', 'parent', 'teacher'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role as any)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all capitalize ${selectedRole === role
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                  {t(role as any) || role}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                type="email"
                label={t('email')}
                placeholder={t('email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={isLoading}
              />

              <Input
                type="password"
                label={t('password')}
                placeholder={t('password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={isLoading}
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {t('rememberMe')}
                  </span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-500 hover:underline"
                >
                  {t('forgotPassword')}
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
                disabled={isLoading}
              >
                {t('login')}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Layout >
  );
};

