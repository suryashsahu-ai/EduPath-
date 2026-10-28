export default function UserAvatar({ user, size = 'md', className = '' }) {
  const sizeClasses = {
    xs: 'h-7 w-7 text-xs',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-20 w-20 text-xl font-bold',
    xl: 'h-28 w-28 text-3xl font-bold',
  }[size] || 'h-10 w-10 text-sm';

  const initials = user?.full_name
    ? user.full_name
        .split(' ')
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.full_name || 'User profile'}
        className={`${sizeClasses} rounded-full object-cover border border-ink/20 shadow-xs shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses} rounded-full bg-ink text-on-primary flex items-center justify-center font-semibold tracking-wider select-none shadow-xs shrink-0 ${className}`}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

