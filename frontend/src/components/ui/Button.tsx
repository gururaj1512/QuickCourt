import { motion } from 'framer-motion';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  type = 'button',
  onClick,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-qc-accent text-white hover:bg-qc-accent/90 shadow-lg hover:shadow-xl';
      case 'secondary':
        return 'bg-qc-primary text-white hover:bg-qc-primary/90 shadow-lg hover:shadow-xl';
      case 'outline':
        return 'border-2 border-qc-primary text-qc-primary hover:bg-qc-primary hover:text-white';
      case 'ghost':
        return 'text-qc-text hover:bg-gray-100';
      default:
        return 'bg-qc-accent text-white hover:bg-qc-accent/90';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-4 py-2 text-sm';
      case 'md':
        return 'px-6 py-3 text-base';
      case 'lg':
        return 'px-8 py-4 text-lg';
      default:
        return 'px-6 py-3 text-base';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      <button
        type={type}
        disabled={disabled || loading}
        onClick={onClick}
        className={`
          ${getVariantStyles()}
          ${getSizeStyles()}
          rounded-qc-radius font-semibold transition-all duration-300
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-qc-accent/50
          ${className}
        `}
        {...props}
      >
        {loading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Loading...</span>
          </div>
        ) : (
          children
        )}
      </button>
    </motion.div>
  );
};

export default Button;
