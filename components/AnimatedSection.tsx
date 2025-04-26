'use client';

import { motion, HTMLMotionProps } from 'framer-motion';

interface AnimatedSectionProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
}

export default function AnimatedSection({
  children,
  className,
  ...props
}: AnimatedSectionProps) {
  return (
    <motion.div
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
