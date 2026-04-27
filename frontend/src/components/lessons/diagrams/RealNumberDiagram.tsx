import { motion } from 'framer-motion';

export const RealNumberDiagram = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      {/* Container for Real Numbers (R) */}
      <div className="relative w-full max-w-md aspect-square bg-gray-50 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl p-4 shadow-sm">
        <span className="absolute top-2 left-3 font-bold text-gray-800 dark:text-gray-200">
          Real Numbers (R)
        </span>

        {/* Irrational Numbers Label */}
        <span className="absolute top-2 right-3 text-sm text-gray-500 dark:text-gray-400 text-right">
          Irrational
          <br />
          (√2, π, etc.)
        </span>

        {/* Rational Numbers (Q) */}
        <motion.div 
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}
          className="w-[85%] h-[85%] bg-blue-100/50 dark:bg-blue-900/20 border-2 border-blue-400 rounded-full flex items-end justify-center pb-2 absolute bottom-4 left-4"
        >
          <span className="mb-2 font-semibold text-blue-700 dark:text-blue-300">Rational (Q)</span>
          
          {/* Integers (Z) */}
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 }}
            className="absolute bottom-4 w-[70%] h-[70%] bg-green-100/50 dark:bg-green-900/20 border-2 border-green-400 rounded-full flex items-end justify-center pb-2"
          >
            <span className="mb-2 font-semibold text-green-700 dark:text-green-300">Integers (Z)</span>

            {/* Natural Numbers (N) */}
            <motion.div 
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6 }}
              className="absolute bottom-4 w-[60%] h-[60%] bg-purple-100/50 dark:bg-purple-900/20 border-2 border-purple-400 rounded-full flex items-center justify-center"
            >
              <div className="text-center">
                <span className="font-bold text-purple-700 dark:text-purple-300 block">Natural (N)</span>
                <span className="text-xs text-purple-600 dark:text-purple-400">{`{0, 1, 2...}`}</span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};