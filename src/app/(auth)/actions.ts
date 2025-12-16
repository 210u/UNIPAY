'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const signUp = async (formData: FormData) => {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const passwordConfirm = formData.get('passwordConfirm') as string;
  const supabaseServer = createServerSupabaseClient();

  if (password !== passwordConfirm) {
    return redirect('/signup?message=Passwords do not match');
  }

  const { error } = await supabaseServer.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`,
    },
  });

  if (error) {
    console.error('Sign Up Error:', error);
    return redirect('/signup?message=Could not authenticate user');
  }

  return redirect('/signup?message=Check email to verify account');
};

export const signIn = async (formData: FormData) => {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = createServerSupabaseClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Sign In Error:', error.message);
    return redirect('/signin?message=Could not authenticate user');
  }

  return redirect('/');
};

export const resetPassword = async (formData: FormData) => {
  const email = formData.get('email') as string;
  const supabase = createServerSupabaseClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/update-password`,
  });

  if (error) {
    console.error('Password Reset Error:', error.message);
    return redirect('/forgot-password?message=Error sending reset link.');
  }

  return redirect('/forgot-password?message=Password reset link sent to email.');
};

export const updatePassword = async (formData: FormData) => {
  const password = formData.get('password') as string;
  const passwordConfirm = formData.get('passwordConfirm') as string;
  const supabase = createServerSupabaseClient();

  if (password !== passwordConfirm) {
    return redirect('/update-password?message=Passwords do not match');
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    console.error('Update Password Error:', error.message);
    return redirect('/update-password?message=Error updating password.');
  }

  return redirect('/signin?message=Password updated successfully! Please sign in.');
};