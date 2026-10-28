import { LoaderCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors duration-150 ' +
  'disabled:cursor-not-allowed disabled:opacity-60';

const VARIANTS = {
  // Dark ink background keeps the required #F1FAEE button text readable.
  primary: 'bg-ink text-on-primary hover:bg-ink/90 active:bg-ink/80',
  secondary: 'border-2 border-ink text-ink hover:bg-ink/10 active:bg-ink/15',
  danger: 'bg-danger text-on-primary hover:bg-danger/90 active:bg-danger/80',
  dangerSecondary: 'border-2 border-danger text-danger hover:bg-danger/10 active:bg-danger/15',
};

const SIZES = {
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
};

export function buttonClasses({ variant = 'primary', size = 'md', fullWidth = false, className = '' } = {}) {
  return [BASE, VARIANTS[variant], SIZES[size], fullWidth ? 'w-full' : '', className].filter(Boolean).join(' ');
}

export function Button({
  variant,
  size,
  fullWidth,
  loading = false,
  loadingText,
  disabled = false,
  className,
  type = 'button',
  children,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses({ variant, size, fullWidth, className })}
      {...props}
    >
      {loading && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {loading && loadingText ? loadingText : children}
    </button>
  );
}

export function ButtonLink({ to, variant, size, fullWidth, className, children, ...props }) {
  return (
    <Link to={to} className={buttonClasses({ variant, size, fullWidth, className })} {...props}>
      {children}
    </Link>
  );
}
