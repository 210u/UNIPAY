import { forwardRef, InputHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, type, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {label && (
          <label
            className="block text-sm font-medium text-[color:var(--color-text-primary)] mb-1"
            htmlFor={props.id}
          >
            {label}
          </label>
        )}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <input
            type={type}
            className={cn(
              'block w-full rounded-md px-4 py-2',
              'bg-inputBg neumorphic-inset text-textPrimary placeholder:text-inputPlaceholder',
              'focus:outline-none focus:ring-2 focus:ring-inputFocusRing',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'transition-shadow',
              error && 'focus:ring-red-500/20',
              className
            )}
            style={error ? undefined : { boxShadow: 'var(--neumorphic-shadow-inset)' }}
            ref={ref}
            {...props}
          />
        </motion.div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 text-sm text-red-500"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

