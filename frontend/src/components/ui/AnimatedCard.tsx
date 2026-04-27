import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { hoverLift } from '@/utils/animations';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export const AnimatedCard = ({ children, className = '', delay = 0 }: AnimatedCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay }}
      {...hoverLift}
      className={className}
    >
      {children}
    </motion.div>
  );
};

