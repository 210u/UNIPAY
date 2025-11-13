'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <motion.div
      className="flex min-h-screen bg-gray-100 dark:bg-gray-800 items-center justify-center p-4 overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Main content area: illustration on left, form on right */}
      <motion.div
        className="flex w-full max-w-4xl h-[500px] bg-white dark:bg-gray-700 rounded-3xl shadow-xl overflow-hidden"
        variants={itemVariants}
      >
        {/* Left section for illustration */}
        <div
          className="hidden lg:flex w-1/2 h-full items-center justify-center p-8 relative overflow-hidden bg-black"
        >
          {/* Animated Diamond shapes at the top */}
          <div className="absolute top-0 w-full h-1/3 flex items-center justify-center overflow-hidden">
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: -50, scale: 0.5, rotate: 45 }}
                animate={{ opacity: 1, y: 0, scale: 1, rotate: 45 }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.1,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }}
                className="absolute w-8 h-8 bg-gray-800 border border-gray-400 m-2"
                style={{ left: `${10 + i * 8}%`, top: `${10 + (i % 3) * 15}%`}}
              ></motion.div>
            ))}
          </div>
          <div className="absolute bottom-8 text-white text-sm">
            Don't have an account? <span className="underline">Sign up</span>
          </div>
        </div>

        {/* Right section with authentication form */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 flex items-center justify-center">
          <div className="w-full max-w-sm">
            {children}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}