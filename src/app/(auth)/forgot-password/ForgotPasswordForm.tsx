'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail } from 'lucide-react';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase/config';

const ALLOWED_DOMAINS = ['university.edu', 'uni.edu']; // Add your university domains
const MAX_ATTEMPTS = 5;
const ATTEMPT_WINDOW = 3600000; // 1 hour in milliseconds

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .refine(
      (email) => ALLOWED_DOMAINS.some((domain) => email.endsWith(`@${domain}`)),
      'Please use your university email address'
    ),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [attempts, setAttempts] = useState<number>(0);
  const [lastAttempt, setLastAttempt] = useState<number>(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const checkRateLimit = () => {
    const now = Date.now();
    if (now - lastAttempt < ATTEMPT_WINDOW) {
      if (attempts >= MAX_ATTEMPTS) {
        return false;
      }
    } else {
      // Reset attempts if window has passed
      setAttempts(0);
    }
    setLastAttempt(now);
    setAttempts((prev) => prev + 1);
    return true;
  };

  const onSubmit = async (data: ForgotPasswordFormData) => {
    if (!checkRateLimit()) {
      setError('root', {
        message: `Too many attempts. Please try again in ${Math.ceil((ATTEMPT_WINDOW - (Date.now() - lastAttempt)) / 60000)} minutes.`,
      });
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError('root', {
          message: error.message || 'An error occurred. Please try again.',
        });
        return;
      }

      setIsSuccess(true);
    } catch (error) {
      setError('root', {
        message: error instanceof Error ? error.message : 'An error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isSuccess ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="rounded-md bg-green-50 p-4"
        >
          <div className="flex">
            <div className="shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Password reset email sent
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  Check your email for a link to reset your password. If it
                  doesn&apos;t appear within a few minutes, check your spam folder.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <div className="rounded-md shadow-sm space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden="true" />
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="University email address"
                  className="pl-10"
                  error={errors.email?.message}
                  aria-label="Email address"
                />
              </div>
            </div>

            {errors.root && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-red-500 text-center"
                role="alert"
              >
                {errors.root.message}
              </motion.p>
            )}

            <div>
              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}
                aria-disabled={isLoading}
              >
                Send reset link
              </Button>
            </div>

            <div className="text-sm text-center">
              <Link
                href="/signin"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Back to sign in
              </Link>
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}