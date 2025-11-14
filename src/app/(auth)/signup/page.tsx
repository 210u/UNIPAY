import { Metadata } from 'next';
import SignUpForm from './SignUpForm';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sign Up | University Payroll System',
  description: 'Create your account to access the university payroll system',
};

export default function SignUpPage() {
  return (
    <div className="w-full max-w-md p-0">
      <div className="text-center mb-4 pt-4">
        <h2 className="text-3xl font-bold text-[color:var(--color-text-primary)] mb-1">Sign Up</h2>
        <p className="text-[color:var(--color-text-secondary)] text-sm">Enter your personal data to create your account.</p>
      </div>

      <div className="flex flex-col space-y-2 mb-4">
        <button className="flex items-center justify-center space-x-2 w-full py-2 px-4 border border-[color:var(--color-border)] rounded-md text-[color:var(--color-text-primary)] bg-[color:var(--button-secondary-bg)] hover:bg-gray-100 transition-colors dark:hover:bg-gray-800">
          <img src="/images/google_logo.svg" alt="Google" width={20} height={20} className="block" />
          <span>Sign Up with Google</span>
        </button>
      </div>

      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[color:var(--color-border)]"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-gray-700 text-[color:var(--color-text-secondary)]">Or</span>
        </div>
      </div>
      <SignUpForm />
    </div>
  );
}



