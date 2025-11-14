'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Lock, Mail, User, Phone, AtSign, CheckCircle, Eye, EyeOff, ArrowRight } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase/config';
import type { Database } from '@/lib/supabase/database.types';
import Link from 'next/link';

const signUpSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SignUpFormData = z.infer<typeof signUpSchema>;
type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert'];

export default function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormData) => {
    console.log('SIGNUP: Form submitted', { 
      email: data.email
    });
    
    try {
      setIsLoading(true);
      setUserEmail(data.email);
      
      console.log('SIGNUP: Calling Supabase signUp...');
      
      // Sign up the user with email confirmation
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
          },
        },
      });

      console.log('SIGNUP: Auth response', { 
        hasUser: !!authData?.user,
        userId: authData?.user?.id,
        hasSession: !!authData?.session,
        error: signUpError?.message 
      });

      if (signUpError) {
        console.error('SIGNUP ERROR:', signUpError);
        setError('root', {
          message: signUpError.message,
        });
        return;
      }

      if (authData.user) {
        console.log('SIGNUP: Creating user profile...');
        
        // Create user profile with all fields
        // Note: university_id will be null initially and set by admin later
        const profilePayload: UserProfileInsert = {
            id: authData.user.id,
            email: data.email,
            first_name: data.firstName,
            last_name: data.lastName,
          role: 'employee',
          university_id: null,
        };

        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles' as any)
          .insert([profilePayload] as any)
          .select()
          .single();

        if (profileError) {
          console.error('PROFILE ERROR:', profileError);
          console.error('Error details:', {
            message: profileError.message,
            details: profileError.details,
            hint: profileError.hint,
            code: profileError.code
          });
          // Continue anyway - user is created in auth
        } else {
          console.log('PROFILE CREATED:', profileData);
        }

        // Check if email confirmation is required
        if (authData.session) {
          // No email confirmation required - redirect immediately
          console.log('SIGNUP: Session created, redirecting...');
          router.push('/dashboard');
        } else {
          // Email confirmation required - show welcome message
          console.log('SIGNUP: Email confirmation required');
          setShowWelcome(true);
        }
      }
    } catch (error) {
      console.error('SIGNUP CATCH ERROR:', error);
      setError('root', {
        message: 'An error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
      console.log('SIGNUP: Process complete');
    }
  };

  // Show welcome message if email confirmation is required
  if (showWelcome) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="mt-8 bg-[color:var(--color-card-background)] rounded-lg shadow-xl p-8 text-center border border-[color:var(--color-border)]"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          <CheckCircle className="mx-auto h-16 w-16 text-[color:var(--color-text-accent)] mb-4" />
        </motion.div>
        <h3 className="text-2xl font-bold text-[color:var(--color-text-primary)] mb-2">Welcome to Unipay!</h3>
        <p className="text-[color:var(--color-text-secondary)] mb-4">
          Thank you for creating your account, <span className="font-semibold">{userEmail}</span>!
        </p>
        <div className="bg-[color:var(--color-card-background)] border border-[color:var(--color-border)] rounded-lg p-4 mb-6">
          <Mail className="mx-auto h-8 w-8 text-[color:var(--color-text-accent)] mb-2" />
          <p className="text-sm text-[color:var(--color-text-primary)]">
            <strong>Please check your email to confirm your account.</strong>
            <br />
            We've sent a confirmation link to verify your email address.
          </p>
        </div>
        <p className="text-sm text-[color:var(--color-text-secondary)] mb-6">
          After confirming your email, you'll be able to sign in and access all features.
        </p>
        <Link href="/signin">
          <Button className="w-full">Go to Sign In</Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full text-[color:var(--color-text-primary)]"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[color:var(--color-text-secondary)]" />
              <Input
                {...register('firstName')}
                type="text"
                placeholder="eg. John"
                className="pl-10"
                error={errors.firstName?.message}
              />
            </div>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[color:var(--color-text-secondary)]" />
              <Input
                {...register('lastName')}
                type="text"
                placeholder="eg. Francisco"
                className="pl-10"
                error={errors.lastName?.message}
              />
            </div>
          </div>

          {/* Removed Username and Phone Number as per new design */}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[color:var(--color-text-secondary)]" />
            <Input
              {...register('email')}
              type="email"
              placeholder="eg. johnfrans@gmail.com"
              className="pl-10"
              error={errors.email?.message}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[color:var(--color-text-secondary)]" />
            <Input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
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

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[color:var(--color-text-secondary)]" />
            <Input
              {...register('confirmPassword')}
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              className="pl-10 pr-10"
              error={errors.confirmPassword?.message}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)]"
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              title={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
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

        <div className="pt-0">
          <Button
            type="submit"
            className="w-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center space-x-2 hover:text-gray-400 dark:hover:text-gray-700 transition-colors"
            size="lg"
            isLoading={isLoading}
          >
            <span>Sign Up</span>
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </motion.div>
  );
}

