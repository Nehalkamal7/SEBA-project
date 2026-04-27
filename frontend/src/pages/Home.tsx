import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Users, TrendingUp, ArrowRight, Sparkles, Zap, Target, Play, CheckCircle } from 'lucide-react';
import { HomeHeader } from '@/components/layout/HomeHeader';
import { Button } from '@/components/ui/Button';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { fadeInUp, staggerContainer, hoverScale } from '@/utils/animations';

export const Home = () => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const features = [
    {
      icon: Play,
      iconBg: 'from-orange-400 to-amber-500',
      title: language === 'en' ? 'Video Lessons' : 'دروس فيديو',
      description: language === 'en'
        ? 'High-quality video content from expert teachers.'
        : 'محتوى فيديو عالي الجودة من معلمين خبراء.',
    },
    {
      icon: Sparkles,
      iconBg: 'from-blue-500 to-blue-600',
      iconText: 'AI',
      title: language === 'en' ? 'AI Tutor' : 'مدرس ذكي',
      description: language === 'en'
        ? 'Get instant help with our intelligent AI assistant.'
        : 'احصل على مساعدة فورية مع مساعدنا الذكي.',
    },
    {
      icon: TrendingUp,
      iconBg: 'from-cyan-400 to-teal-500',
      title: language === 'en' ? 'Track Progress' : 'تتبع التقدم',
      description: language === 'en'
        ? 'Monitor your performance with detailed analytics.'
        : 'راقب أدائك مع تحليلات مفصلة.',
    },
  ];

  const benefits = [
    { icon: Zap, text: language === 'en' ? 'Self-paced learning' : 'تعلم ذاتي الخطى' },
    { icon: Target, text: language === 'en' ? 'Interactive quizzes' : 'اختبارات تفاعلية' },
    { icon: Sparkles, text: language === 'en' ? 'AI study assistant' : 'مساعد دراسة ذكي' },
    { icon: TrendingUp, text: language === 'en' ? 'Progress tracking' : 'تتبع التقدم' },
    { icon: BookOpen, text: language === 'en' ? 'Bilingual support' : 'دعم ثنائي اللغة' },
    { icon: Users, text: language === 'en' ? 'Mobile responsive' : 'متجاوب مع الجوال' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0d2b] overflow-hidden">
      <HomeHeader />

      {/* Hero Section - Responsive to Light/Dark Mode */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20 bg-white dark:bg-[#0d0d2b]">

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left Side - Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-left"
            >
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight"
              >
                <span className="text-gray-900 dark:text-white">Learn</span>
                <br />
                <span className="bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">Smarter,</span>
                <br />
                <span className="text-gray-900 dark:text-white">Achieve</span>
                <br />
                <span className="bg-gradient-to-r from-cyan-500 to-teal-600 bg-clip-text text-transparent">More</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-lg md:text-xl mb-10 max-w-xl text-gray-600 dark:text-gray-300 leading-relaxed"
              >
                {language === 'en'
                  ? 'The future of education is here. Join thousands of Egyptian students mastering their subjects with AI-powered learning.'
                  : 'مستقبل التعليم هنا. انضم إلى آلاف الطلاب المصريين الذين يتقنون مواضيعهم بالتعلم المدعوم بالذكاء الاصطناعي.'}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <Link to="/register">
                  <Button
                    size="lg"
                    className="text-lg px-10 py-6 shadow-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-gray-900 font-bold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-amber-500/50"
                  >
                    <span className="flex items-center gap-2">
                      {language === 'en' ? 'Start Learning!' : 'ابدأ التعلم!'}
                    </span>
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Right Side - Book Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="relative flex items-center justify-center"
            >
              {/* Colorful Background Blobs */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute w-96 h-96 bg-gradient-to-br from-blue-500/30 to-blue-600/30 rounded-full blur-3xl"
                />
                <motion.div
                  animate={{
                    rotate: [360, 0],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute w-80 h-80 bg-gradient-to-br from-orange-400/40 to-amber-500/40 rounded-full blur-2xl"
                />
                <motion.div
                  animate={{
                    rotate: [0, -360],
                    scale: [1, 1.15, 1],
                  }}
                  transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute w-72 h-72 bg-gradient-to-br from-cyan-400/30 to-teal-400/30 rounded-full blur-2xl"
                />
              </div>

              {/* Book Image */}
              <motion.div
                animate={{
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative z-10"
              >
                <img
                  src="/book.png"
                  alt="Learning Book"
                  className="w-full max-w-md h-auto drop-shadow-2xl"
                />

                {/* Floating Math Symbols */}
                <motion.div
                  animate={{
                    y: [0, -15, 0],
                    rotate: [0, 10, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.2
                  }}
                  className="absolute -top-8 -left-4 w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg rotate-12"
                >
                  ×
                </motion.div>

                <motion.div
                  animate={{
                    y: [0, -20, 0],
                    rotate: [0, -15, 0],
                  }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                  className="absolute top-12 -right-6 w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg"
                >
                  +
                </motion.div>

                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 8, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.8
                  }}
                  className="absolute bottom-8 -left-8 w-14 h-14 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg -rotate-6"
                >
                  ÷
                </motion.div>

                <motion.div
                  animate={{
                    y: [0, -18, 0],
                    rotate: [0, -12, 0],
                  }}
                  transition={{
                    duration: 3.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                  className="absolute bottom-16 -right-8 w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg rotate-6"
                >
                  =
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 dark:bg-[#0d0d2b] py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer as any}
            className="text-center mb-20"
          >
            <motion.h2
              variants={fadeInUp as any}
              className="text-4xl md:text-5xl font-extrabold mb-4"
            >
              <span className="text-gray-900 dark:text-white">{language === 'en' ? 'Why choose ' : 'لماذا تختار '}</span>
              <span className="text-orange-500">SEBA</span>
              <span className="text-gray-900 dark:text-white"> ?</span>
            </motion.h2>

          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <AnimatedCard key={index} delay={index * 0.1}>
                  <motion.div
                    whileHover={{ y: -8 }}
                    className="bg-gray-50 dark:bg-[#1a1a3e] rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700/50 group h-full"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                      className={`w-20 h-20 bg-gradient-to-br ${feature.iconBg} rounded-2xl flex items-center justify-center mb-6 shadow-lg mx-auto`}
                    >
                      {feature.iconText ? (
                        <span className="text-3xl font-bold text-white">{feature.iconText}</span>
                      ) : (
                        <Icon className="h-10 w-10 text-white" />
                      )}
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 text-center">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-center text-sm">
                      {feature.description}
                    </p>
                  </motion.div>
                </AnimatedCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-white dark:bg-[#1a1a3e] py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">
                {language === 'en' ? 'Everything You Need to Succeed' : 'كل ما تحتاجه للنجاح'}
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
                {language === 'en'
                  ? 'SEBA provides all the tools and resources you need for effective learning and teaching.'
                  : 'توفر سيبا جميع الأدوات والموارد التي تحتاجها للتعلم والتدريس الفعال.'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                      whileHover={{ x: isRTL ? -5 : 5 }}
                      className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{benefit.text}</span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              whileHover={{ scale: 1.02 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-violet-500 rounded-3xl blur-2xl opacity-50"></div>
              <div className="relative bg-gradient-to-br from-blue-500 via-violet-500 to-pink-500 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkles className="h-12 w-12 mb-6" />
                </motion.div>
                <h3 className="text-3xl font-bold mb-4">
                  {language === 'en' ? 'Ready to Start?' : 'هل أنت مستعد للبدء؟'}
                </h3>
                <p className="mb-8 text-lg opacity-90 leading-relaxed">
                  {language === 'en'
                    ? 'Join thousands of students already learning on SEBA. Create your account today and start your learning journey.'
                    : 'انضم إلى آلاف الطلاب الذين يتعلمون بالفعل على سيبا. أنشئ حسابك اليوم وابدأ رحلة التعلم الخاصة بك.'}
                </p>
                <motion.div {...hoverScale}>
                  <Link to="/register">
                    <Button size="lg" variant="outline" className="w-full !bg-white !text-blue-600 hover:!bg-gray-100 !border-white shadow-xl">
                      <span className="flex items-center justify-center gap-2">
                        {language === 'en' ? 'Create Free Account' : 'إنشاء حساب مجاني'}
                        <ArrowRight className={`h-5 w-5 ${isRTL ? 'mr-2' : 'ml-2'}`} />
                      </span>
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-[#0d0d2b] text-gray-700 dark:text-gray-300 py-16 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center mb-4">
                <img src="/seba-logo.png" alt="SEBA Logo" className="h-12 w-auto" />
              </div>
              <p className="text-sm leading-relaxed">
                {language === 'en'
                  ? 'Empowering learners worldwide with modern education technology.'
                  : 'تمكين المتعلمين في جميع أنحاء العالم بتقنية التعليم الحديثة.'}
              </p>
            </motion.div>
            {[
              {
                title: language === 'en' ? 'Platform' : 'المنصة', links: [
                  { text: language === 'en' ? 'Courses' : 'الدورات', to: '/courses' },
                  { text: language === 'en' ? 'Insights' : 'الرؤى', to: '/insights' }
                ]
              },
              {
                title: language === 'en' ? 'Account' : 'الحساب', links: [
                  { text: language === 'en' ? 'Sign In' : 'تسجيل الدخول', to: '/login' },
                  { text: language === 'en' ? 'Sign Up' : 'إنشاء حساب', to: '/register' }
                ]
              },
              {
                title: language === 'en' ? 'Support' : 'الدعم', links: [
                  { text: language === 'en' ? 'Help Center' : 'مركز المساعدة', to: '#' },
                  { text: language === 'en' ? 'Contact Us' : 'اتصل بنا', to: '#' }
                ]
              }
            ].map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">{section.title}</h4>
                <ul className="space-y-3 text-sm">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link to={link.to} className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
                        {link.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="border-t border-gray-800 mt-12 pt-8 text-center text-sm"
          >
            <p>
              {language === 'en'
                ? '© 2026 SEBA. All rights reserved.'
                : '© 2026 سيبا. جميع الحقوق محفوظة.'}
            </p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};