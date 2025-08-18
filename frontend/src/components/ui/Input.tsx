import { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  showPasswordToggle?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, showPasswordToggle = false, type = 'text', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const handlePasswordToggle = () => {
      setShowPassword(!showPassword);
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <div className="mb-2">
          <label className="block text-sm font-medium text-qc-text">
            {label}
          </label>
        </div>
        <div className="relative">
          <input
            ref={ref}
            type={showPasswordToggle && showPassword ? 'text' : type}
            className={`
              w-full px-4 py-3 bg-white border rounded-qc-radius
              focus:outline-none focus:ring-2 focus:ring-qc-accent/50 focus:border-transparent
              transition-all duration-300
              ${error ? 'border-red-300' : 'border-gray-200'}
              ${showPasswordToggle ? 'pr-12' : ''}
            `}
            {...props}
          />
          {showPasswordToggle && (
            <button
              type="button"
              onClick={handlePasswordToggle}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </motion.div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
