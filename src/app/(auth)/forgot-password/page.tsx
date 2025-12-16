'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { resetPassword } from '../actions';

export default function ForgotPasswordPage() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Forgot your password?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Enter your email to receive a password reset link.
          </p>
        </div>
        <form className="mt-8 space-y-6" action={resetPassword}>
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                placeholder="Email address"
              />
            </div>
          </div>

          <div>
            <Button type="submit" className="group relative flex w-full justify-center">
              Send Reset Link
            </Button>
          </div>
        </form>
        {message && (
          <p className="mt-2 text-center text-sm text-red-600 dark:text-red-400">
            {message}
          </p>
        )}
        <div className="text-sm text-center">
          <Link href="/signin" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}