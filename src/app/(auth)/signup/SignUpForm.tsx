'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Lock, Mail, User, Phone, AtSign, CheckCircle, Eye, EyeOff } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase/config';
import Link from 'next/link';

const signUpSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters').regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Please enter a valid email address'),
  phoneNumber: z.string().min(9, 'Phone number must be at least 9 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SignUpFormData = z.infer<typeof signUpSchema>;

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
    console.log('🔵 SIGNUP: Form submitted', { 
      email: data.email, 
      username: data.username,
      phoneNumber: data.phoneNumber 
    });
    
    try {
      setIsLoading(true);
      setUserEmail(data.email);
      
      console.log('🔵 SIGNUP: Calling Supabase signUp...');
      
      // Sign up the user with email confirmation
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            username: data.username,
            phone_number: data.phoneNumber,
          },
        },
      });

      console.log('🔵 SIGNUP: Auth response', { 
        hasUser: !!authData?.user,
        userId: authData?.user?.id,
        hasSession: !!authData?.session,
        error: signUpError?.message 
      });

      if (signUpError) {
        console.error('❌ SIGNUP ERROR:', signUpError);
        setError('root', {
          message: signUpError.message,
        });
        return;
      }

      if (authData.user) {
        console.log('🔵 SIGNUP: Creating user profile...');
        
        // Create user profile with all fields
        // Note: university_id will be null initially and set by admin later
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            email: data.email,
            first_name: data.firstName,
            last_name: data.lastName,
            phone_number: data.phoneNumber,
            role: 'employee', // Default role
            university_id: null, // Will be assigned by admin
          })
          .select()
          .single();

        if (profileError) {
          console.error('❌ PROFILE ERROR:', profileError);
          console.error('   Error details:', {
            message: profileError.message,
            details: profileError.details,
            hint: profileError.hint,
            code: profileError.code
          });
          // Continue anyway - user is created in auth
        } else {
          console.log('✅ PROFILE CREATED:', profileData);
        }

        // Check if email confirmation is required
        if (authData.session) {
          // No email confirmation required - redirect immediately
          console.log('✅ SIGNUP: Session created, redirecting...');
          router.push('/dashboard');
        } else {
          // Email confirmation required - show welcome message
          console.log('⚠️ SIGNUP: Email confirmation required');
          setShowWelcome(true);
        }
      }
    } catch (error) {
      console.error('❌ SIGNUP CATCH ERROR:', error);
      setError('root', {
        message: 'An error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
      console.log('🔵 SIGNUP: Process complete');
    }
  };

  // Show welcome message if email confirmation is required
  if (showWelcome) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="mt-8 bg-white rounded-lg shadow-lg p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
        </motion.div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Unipay! 🎉</h3>
        <p className="text-gray-600 mb-4">
          Thank you for creating your account, <span className="font-semibold">{userEmail}</span>!
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <Mail className="mx-auto h-8 w-8 text-blue-600 mb-2" />
          <p className="text-sm text-gray-700">
            <strong>Please check your email to confirm your account.</strong>
            <br />
            We've sent a confirmation link to verify your email address.
          </p>
        </div>
        <p className="text-sm text-gray-500 mb-6">
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
    >
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        <div className="rounded-md shadow-sm space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                {...register('firstName')}
                type="text"
                placeholder="First name"
                className="pl-10"
                error={errors.firstName?.message}
              />
            </div>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                {...register('lastName')}
                type="text"
                placeholder="Last name"
                className="pl-10"
                error={errors.lastName?.message}
              />
            </div>
          </div>

          <div className="relative">
            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              {...register('username')}
              type="text"
              placeholder="Username"
              className="pl-10"
              error={errors.username?.message}
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              {...register('email')}
              type="email"
              placeholder="Email address"
              className="pl-10"
              error={errors.email?.message}
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              {...register('phoneNumber')}
              type="tel"
              placeholder="Phone number"
              className="pl-10"
              error={errors.phoneNumber?.message}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="Password (min 6 characters)"
              className="pl-10 pr-10"
              error={errors.password?.message}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              {...register('confirmPassword')}
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm password"
              className="pl-10 pr-10"
              error={errors.confirmPassword?.message}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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

        <div>
          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isLoading}
          >
            Create account
          </Button>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              href="/signin"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              prefetch={true}
            >
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </motion.div>
  );
}

