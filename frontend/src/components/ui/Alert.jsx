import { CircleAlert, CircleCheck, Info } from 'lucide-react';

const VARIANTS = {
  error: { box: 'border-danger/50 bg-danger/10', icon: 'text-danger', Icon: CircleAlert, role: 'alert' },
  success: { box: 'border-success/50 bg-success/10', icon: 'text-success', Icon: CircleCheck, role: 'status' },
  info: { box: 'border-ink/25 bg-ink/5', icon: 'text-ink', Icon: Info, role: 'status' },
};

export default function Alert({ variant = 'info', children, className = '' }) {
  const { box, icon, Icon, role } = VARIANTS[variant];
  return (
    <div role={role} className={`flex items-start gap-3 rounded-lg border p-3.5 text-sm text-ink ${box} ${className}`}>
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${icon}`} aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
