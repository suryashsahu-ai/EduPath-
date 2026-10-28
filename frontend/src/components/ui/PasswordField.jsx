import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import TextField from './TextField.jsx';

export default function PasswordField(props) {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;

  return (
    <TextField
      {...props}
      type={visible ? 'text' : 'password'}
      endAdornment={
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label="Show password"
          aria-pressed={visible}
          className="rounded-md p-2 text-ink hover:bg-ink/10"
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </button>
      }
    />
  );
}
