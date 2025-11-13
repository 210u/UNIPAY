import { Metadata } from 'next';
import SignInForm from './SignInForm';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sign In | University Payroll System',
  description: 'Sign in to access the university payroll system',
};

export default function SignInPage() {
  return (
    <div className="w-full max-w-md p-0">
      <div className="text-center mb-6 pt-8">
        <h2 className="text-3xl font-bold text-[color:var(--color-text-primary)] mb-2">Sign In</h2>
        <p className="text-[color:var(--color-text-secondary)] text-sm">Enter your personal data to sign in to your account.</p>
      </div>

      <div className="flex flex-col space-y-3 mb-6">
        {/* Social Login Buttons */}
        <button className="flex items-center justify-center space-x-2 w-full py-2 px-4 border border-[color:var(--color-border)] rounded-md text-[color:var(--color-text-primary)] bg-[color:var(--button-secondary-bg)] hover:bg-gray-100 transition-colors dark:hover:bg-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-.016 5.059c1.983 0 3.616 1.599 3.616 3.559s-1.633 3.559-3.616 3.559-3.616-1.599-3.616-3.559 1.633-3.559 3.616-3.559zm0 8c-2.736 0-5.616 1.344-5.616 4v.441c0 1.104.896 2 2 2h7.232c1.104 0 2-.896 2-2v-.441c0-2.656-2.88-4-5.616-4z"/></svg>
          <span>Sign In with Google</span>
        </button>
        <button className="flex items-center justify-center space-x-2 w-full py-2 px-4 border border-[color:var(--color-border)] rounded-md text-[color:var(--color-text-primary)] bg-[color:var(--button-secondary-bg)] hover:bg-gray-100 transition-colors dark:hover:bg-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.372-12 12 0 5.309 3.437 9.795 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.03 3.633 17.03c-1.087-.744.084-.73.084-.73.287.02.438.14.438.14.24.457.694.39 1.144-.047 0 0 .84-.23 1.393-.45.093-.264.19-.48.293-.695C6.417 17.653 5.385 17.2 5.385 15.353c0-1.18.403-2.146.915-2.906-.113-.26-.492-1.393.11-2.903 0 0 .74-.236 2.427.915.69-.19 1.42-.284 2.15-.284.73 0 1.46.094 2.15.284 1.687-1.151 2.427-.915 2.427-.915.603 1.51.224 2.643.11 2.903.513.76.915 1.726.915 2.906 0 1.956-1.03 2.392-2.007 2.673.107.245.203.493.203.791C15.61 20.3 15.61 21 15.61 21.22c0 .32.21.693.834.577C20.563 21.795 24 17.309 24 12c0-6.628-5.373-12-12-12z"/></svg>
          <span>Sign In with Github</span>
        </button>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[color:var(--color-border)]"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white dark:bg-cardBg px-2 text-[color:var(--color-text-secondary)]">Or</span>
        </div>
        </div>
        <SignInForm />
    </div>
  );
}

