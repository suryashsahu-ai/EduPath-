import { CircleAlert } from 'lucide-react';

export default function TextField({
  id,
  label,
  error,
  hint,
  endAdornment,
  className = '',
  type = 'text',
  ...inputProps
}) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint && !error ? hintId : null, error ? errorId : null].filter(Boolean).join(' ');

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy || undefined}
          className={[
            'w-full rounded-lg border bg-surface px-3.5 py-2.5 text-base text-ink placeholder:text-ink/70',
            'transition-colors hover:border-ink',
            error ? 'border-2 border-danger' : 'border-ink/60',
            endAdornment ? 'pr-12' : '',
          ].join(' ')}
          {...inputProps}
        />
        {endAdornment && <div className="absolute inset-y-0 right-1 flex items-center">{endAdornment}</div>}
      </div>
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-sm text-ink/75">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1.5 flex items-start gap-1.5 text-sm font-medium text-danger">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
