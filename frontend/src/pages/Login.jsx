import { useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthCard from '../components/AuthCard.jsx';
import Alert from '../components/ui/Alert.jsx';
import { Button } from '../components/ui/Button.jsx';
import PasswordField from '../components/ui/PasswordField.jsx';
import TextField from '../components/ui/TextField.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { validateEmail } from '../utils/validation.js';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const formRef = useRef(null);
  const submittingRef = useRef(false); // blocks double submits before React re-renders

  const justRegistered = Boolean(location.state?.registered);
  const redirectTo = location.state?.from?.pathname ?? '/dashboard';

  const [values, setValues] = useState({ email: location.state?.email ?? '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submittingRef.current) return;

    const fieldErrors = {
      email: validateEmail(values.email),
      password: values.password ? '' : 'Password is required.',
    };
    const firstInvalid = Object.keys(fieldErrors).find((name) => fieldErrors[name]);
    setErrors(fieldErrors);
    setFormError('');
    if (firstInvalid) {
      formRef.current?.elements.namedItem(firstInvalid)?.focus();
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    try {
      await login({ email: values.email.trim(), password: values.password });
      navigate(redirectTo, { replace: true });
    } catch (error) {
      if (error.fieldErrors?.email) setErrors({ email: error.fieldErrors.email });
      else setFormError(error.message);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Welcome Back"
      subtitle="Continue your journey toward the right education and career."
      footer={
        <>
          New to EduPath?{' '}
          <Link to="/register" className="font-semibold underline underline-offset-2 hover:no-underline">
            Create an account
          </Link>
        </>
      }
    >
      {justRegistered && (
        <Alert variant="success" className="mb-5">
          Your account has been created. Sign in to continue.
        </Alert>
      )}
      {formError && (
        <Alert variant="error" className="mb-5">
          {formError}
        </Alert>
      )}

      <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-5">
        <TextField
          id="login-email"
          name="email"
          type="email"
          label="Email address"
          autoComplete="email"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
          disabled={submitting}
        />
        <PasswordField
          id="login-password"
          name="password"
          label="Password"
          autoComplete="current-password"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
          disabled={submitting}
        />
        <Button type="submit" fullWidth size="lg" loading={submitting} loadingText="Signing in…">
          Sign In
        </Button>
      </form>
    </AuthCard>
  );
}
