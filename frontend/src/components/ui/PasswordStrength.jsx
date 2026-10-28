import { Check, Circle } from 'lucide-react';
import { getPasswordStrength } from '../../utils/validation.js';

export default function PasswordStrength({ password }) {
  const { score, label, rules } = getPasswordStrength(password);

  return (
    <div className="mt-3" data-testid="password-strength">
      {password && (
        <div className="mb-2">
          <div className="flex gap-1.5" aria-hidden="true">
            {[1, 2, 3, 4].map((segment) => (
              <span
                key={segment}
                className={`h-1.5 flex-1 rounded-full ${segment <= score ? 'bg-ink' : 'bg-ink/15'}`}
              />
            ))}
          </div>
          <p className="mt-1.5 text-sm font-semibold" aria-live="polite">
            Password strength: {label}
          </p>
        </div>
      )}
      <ul className="space-y-1 text-sm" aria-label="Password requirements">
        {rules.map((rule) => (
          <li key={rule.id} className={`flex items-center gap-2 ${rule.met ? 'font-medium' : 'text-ink/75'}`}>
            {rule.met ? (
              <Check className="h-4 w-4 text-success" aria-hidden="true" />
            ) : (
              <Circle className="h-4 w-4 text-ink/60" aria-hidden="true" />
            )}
            <span>
              {rule.label}
              <span className="sr-only">{rule.met ? ' (met)' : ' (not met yet)'}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
