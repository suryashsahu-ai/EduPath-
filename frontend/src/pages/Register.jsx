import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthCard from '../components/AuthCard.jsx';
import Alert from '../components/ui/Alert.jsx';
import { Button } from '../components/ui/Button.jsx';
import PasswordField from '../components/ui/PasswordField.jsx';
import PasswordStrength from '../components/ui/PasswordStrength.jsx';
import TextField from '../components/ui/TextField.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  validateConfirmPassword,
  validateEmail,
  validateFullName,
  validateNewPassword,
} from '../utils/validation.js';

// Backend field names -> form field names.
const API_FIELD_MAP = { full_name: 'fullName', email: 'email', password: 'password' };

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const formRef = useRef(null);
  const submittingRef = useRef(false);

  const [values, setValues] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
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
      fullName: validateFullName(values.fullName),
      email: validateEmail(values.email),
      password: validateNewPassword(values.password),
      confirmPassword: validateConfirmPassword(values.password, values.confirmPassword),
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
    const email = values.email.trim();
    try {
      await register({ fullName: values.fullName.trim(), email, password: values.password });
      navigate('/login', { replace: true, state: { registered: true, email } });
    } catch (error) {
      const serverFieldErrors = {};
      Object.entries(error.fieldErrors ?? {}).forEach(([apiField, message]) => {
        if (API_FIELD_MAP[apiField]) serverFieldErrors[API_FIELD_MAP[apiField]] = message;
      });
      if (error.status === 409) serverFieldErrors.email = error.message;

      if (Object.keys(serverFieldErrors).length > 0) {
        setErrors(serverFieldErrors);
        formRef.current?.elements.namedItem(Object.keys(serverFieldErrors)[0])?.focus();
      } else {
        setFormError(error.message);
      }
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Create Your EduPath Account"
      subtitle="Start exploring opportunities for your future."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold underline underline-offset-2 hover:no-underline">
            Sign in
          </Link>
        </>
      }
    >
      {formError && (
        <Alert variant="error" className="mb-5">
          {formError}
        </Alert>
      )}

      <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-5">
        <TextField
          id="register-name"
          name="fullName"
          label="Full name"
          autoComplete="name"
          value={values.fullName}
          onChange={handleChange}
          error={errors.fullName}
          disabled={submitting}
        />
        <TextField
          id="register-email"
          name="email"
          type="email"
          label="Email address"
          autoComplete="email"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
          disabled={submitting}
        />
        <div>
          <PasswordField
            id="register-password"
            name="password"
            label="Password"
            autoComplete="new-password"
            value={values.password}
            onChange={handleChange}
            error={errors.password}
            disabled={submitting}
          />
          <PasswordStrength password={values.password} />
        </div>
        <PasswordField
          id="register-confirm"
          name="confirmPassword"
          label="Confirm password"
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          disabled={submitting}
        />
        <Button type="submit" fullWidth size="lg" loading={submitting} loadingText="Creating account…">
          Create Account
        </Button>
      </form>
    </AuthCard>
  );
}
