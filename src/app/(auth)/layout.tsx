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

const backgroundVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 0.2,
    transition: { duration: 1 }
  }
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [imageError, setImageError] = useState(false);
  const pathname = usePathname();

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Loading skeleton
  if (!mounted) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-50">
        <div className="relative container mx-auto px-6 py-12 lg:px-8 lg:py-24">
          <div className="animate-pulse space-y-8">
            <div className="flex justify-center">
              <div className="h-12 w-48 bg-gray-200 rounded" />
            </div>
            <div className="bg-white/80 rounded-2xl shadow-xl p-6 sm:p-8 max-w-lg mx-auto">
              <div className="space-y-4">
                <div className="h-8 bg-gray-100 rounded w-3/4 mx-auto" />
                <div className="h-4 bg-gray-100 rounded w-1/2 mx-auto" />
                <div className="h-[300px] bg-gray-100 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-50 relative overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      role="main"
      aria-label="Authentication page"
    >
      {/* Animated Background Pattern */}
      <motion.div 
        className="absolute inset-0 bg-center pointer-events-none"
        variants={backgroundVariants}
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              -45deg,
              rgba(0, 0, 0, 0.05) 0px,
              rgba(0, 0, 0, 0.05) 1px,
              transparent 1px,
              transparent 20px
            ),
            repeating-linear-gradient(
              45deg,
              rgba(0, 0, 0, 0.05) 0px,
              rgba(0, 0, 0, 0.05) 1px,
              transparent 1px,
              transparent 20px
            )
          `,
          backgroundSize: '30px 30px',
          maskImage: 'linear-gradient(to bottom, white 50%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, white 50%, transparent)'
        }}
        aria-hidden="true"
      />

      <div className="relative container mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:px-8 lg:py-24">
        {/* Logo Section */}
        <motion.header 
          className="mb-8"
          variants={itemVariants}
        >
          <div className="flex justify-center">
            {!imageError ? (
              <div className="relative h-16 w-auto aspect-3/1 max-w-[200px]">
                <Image
                  src="/logo.svg"
                  alt="University Logo"
                  fill
                  priority
                  className="object-contain"
                  onError={() => setImageError(true)}
                  sizes="(max-width: 768px) 150px, 200px"
                />
              </div>
            ) : (
              <div className="h-16 flex items-center justify-center px-6 bg-white/50 backdrop-blur-sm rounded-lg shadow-sm">
                <h1 className="text-2xl font-semibold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  University Portal
                </h1>
              </div>
            )}
          </div>
        </motion.header>

        {/* Main Content with Page Transitions */}
        <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            variants={itemVariants}
            className="relative max-w-lg mx-auto"
          >
            <div className="relative">
              {/* Decorative Elements */}
              <div className="absolute -inset-1 bg-linear-to-r from-blue-600 to-indigo-600 rounded-2xl opacity-10 blur" />
              
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl ring-1 ring-gray-900/5 overflow-hidden">
                <div className="p-6 sm:p-8">
                  {children}
                </div>
              </div>
            </div>
          </motion.main>
        </AnimatePresence>

        {/* Footer */}
        <motion.footer 
          variants={itemVariants}
          className="mt-8 text-center text-sm text-gray-600"
        >
          <div className="space-y-2">
            <p>© {new Date().getFullYear()} University Payroll System</p>
            <p className="text-xs text-gray-500">
              Secure Access Portal • All rights reserved
            </p>
          </div>
        </motion.footer>
      </div>
    </motion.div>
  );
}