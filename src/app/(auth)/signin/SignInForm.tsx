'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase/config';
import Link from 'next/link';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  console.log('SignInForm mounted', { 
    supabaseConfigured: !!supabase,
    supabaseUrl: supabase?.supabaseUrl 
  });
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormData) => {
    console.log('SIGNIN: Form submitted', { email: data.email });
    
    try {
      setIsLoading(true);
      console.log('SIGNIN: Calling Supabase auth...');
      
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      console.log('SIGNIN: Response received', { 
        hasSession: !!authData?.session, 
        hasUser: !!authData?.user,
        error: error?.message 
      });

      if (error) {
        console.error('SIGNIN ERROR:', error);
        setError('root', {
          message: error.message || 'Invalid email or password',
        });
        return;
      }

      console.log('SIGNIN: Success! Redirecting to dashboard...');
      
      // Force a hard redirect to ensure cookies are set properly
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('SIGNIN CATCH ERROR:', error);
      setError('root', {
        message: 'An error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
      console.log('SIGNIN: Loading state cleared');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full text-[color:var(--color-text-primary)]"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[color:var(--color-text-secondary)]" />
            <Input
              {...register('email')}
              type="email"
              placeholder="email address"
              className="pl-10"
              error={errors.email?.message}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[color:var(--color-text-secondary)]" />
            <Input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              className="pl-10 pr-10"
              error={errors.password?.message}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)]"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <p className="text-xs text-[color:var(--color-text-secondary)] mt-1 ml-3">Must be at least 8 characters.</p>
          <div className="flex justify-end pr-3">
            <Link href="/auth/forgot-password" className="text-sm text-textAccent hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>

        {errors.root && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-red-500 text-center"
          >
            {errors.root.message}
          </motion.p>
        )}

        <div className="pt-4 pb-4">
          <Button
            type="submit"
            className="w-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center space-x-2 hover:text-gray-400 dark:hover:text-gray-700 transition-colors"
            size="lg"
            isLoading={isLoading}
          >
            <span>Log In</span>
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </motion.div>
  );
}

