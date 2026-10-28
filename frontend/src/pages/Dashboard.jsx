import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ShieldCheck, User } from 'lucide-react';
import Alert from '../components/ui/Alert.jsx';
import { Button, ButtonLink } from '../components/ui/Button.jsx';
import UserAvatar from '../components/UserAvatar.jsx';
import { useAuth } from '../context/AuthContext.jsx';

/** Minimal protected placeholder. The full student dashboard comes in a later phase. */
export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  const firstName = user?.full_name ? user.full_name.split(' ')[0] : 'Student';

  const handleLogout = async () => {
    setSigningOut(true);
    // Leave the protected page first; clearing the user while still on it would
    // trigger ProtectedRoute's redirect to /login instead of going Home.
    navigate('/', { replace: true });
    await logout();
  };

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="flex items-center gap-4">
        <UserAvatar user={user} size="lg" />
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight">Welcome, {firstName}</h1>
          <p className="mt-1 text-sm text-ink/75">{user?.email}</p>
        </div>
      </div>

      <Alert variant="success" className="mt-6">
        <span className="flex items-center gap-2 font-medium">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          You&rsquo;re signed in as {user?.email}.
        </span>
      </Alert>

      <div className="mt-6 rounded-2xl border border-ink/20 bg-ink/5 p-6">
        <h2 className="text-lg font-bold text-ink">Student Profile & Settings</h2>
        <p className="mt-1 text-ink/90">
          You can update your personal information, add or update your profile picture, change your password,
          or manage your account settings.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <ButtonLink to="/profile">
            <User className="h-4 w-4" aria-hidden="true" />
            Manage Profile
          </ButtonLink>
          <Button variant="secondary" onClick={handleLogout} loading={signingOut} loadingText="Signing out…">
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Log out
          </Button>
        </div>
      </div>
    </section>
  );
}
