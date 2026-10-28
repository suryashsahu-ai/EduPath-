import { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Camera,
  CheckCircle2,
  KeyRound,
  LogOut,
  Mail,
  ShieldAlert,
  Trash2,
  Upload,
  User as UserIcon,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { changePassword as apiChangePassword } from '../services/auth.js';
import UserAvatar from '../components/UserAvatar.jsx';
import Alert from '../components/ui/Alert.jsx';
import { Button } from '../components/ui/Button.jsx';
import TextField from '../components/ui/TextField.jsx';
import PasswordField from '../components/ui/PasswordField.jsx';
import PasswordStrength from '../components/ui/PasswordStrength.jsx';
import { validateEmail, validateFullName, validateNewPassword } from '../utils/validation.js';

export default function Profile() {
  const { user, updateProfile, deleteAccount, logout } = useAuth();
  const navigate = useNavigate();

  // Tab or Section selection (default to all or unified view)
  const fileInputRef = useRef(null);

  // Profile Info state
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [infoSaving, setInfoSaving] = useState(false);
  const [infoSuccess, setInfoSuccess] = useState('');
  const [infoError, setInfoError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Avatar state
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [avatarSuccess, setAvatarSuccess] = useState('');
  const [avatarError, setAvatarError] = useState('');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordFieldErrors, setPasswordFieldErrors] = useState({});

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Logout state
  const [signingOut, setSigningOut] = useState(false);

  // Handle Photo selection and compression
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image is too large. Please select an image under 5MB.');
      return;
    }

    setAvatarError('');
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const img = new Image();
      img.onload = () => {
        // Resize image to max 400x400 to keep it lightweight and fast
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setAvatarPreview(dataUrl);
        saveAvatar(dataUrl);
      };
      img.src = loadEvent.target.result;
    };
    reader.readAsDataURL(file);
  };

  const saveAvatar = async (newAvatarUrl) => {
    setAvatarSaving(true);
    setAvatarSuccess('');
    setAvatarError('');
    try {
      await updateProfile({ avatar: newAvatarUrl || '' });
      setAvatarSuccess('Profile picture updated successfully!');
    } catch (err) {
      setAvatarError(err.message || 'Failed to update profile picture.');
    } finally {
      setAvatarSaving(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    await saveAvatar('');
  };

  // Handle Profile Info Update
  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setInfoSuccess('');
    setInfoError('');

    const errors = {};
    const nameErr = validateFullName(fullName);
    if (nameErr) errors.full_name = nameErr;

    const emailErr = validateEmail(email);
    if (emailErr) errors.email = emailErr;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    setInfoSaving(true);
    try {
      await updateProfile({
        fullName: fullName.trim(),
        email: email.trim(),
        bio: bio.trim(),
      });
      setInfoSuccess('Profile information updated successfully!');
    } catch (err) {
      if (err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      }
      setInfoError(err.message || 'Could not update profile.');
    } finally {
      setInfoSaving(false);
    }
  };

  // Handle Password Update
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    const errors = {};
    if (!currentPassword) {
      errors.current_password = 'Enter your current password.';
    }
    const newPassErr = validateNewPassword(newPassword);
    if (newPassErr) {
      errors.new_password = newPassErr;
    }
    if (newPassword !== confirmPassword) {
      errors.confirm_password = 'Passwords do not match.';
    }

    if (Object.keys(errors).length > 0) {
      setPasswordFieldErrors(errors);
      return;
    }
    setPasswordFieldErrors({});

    setPasswordSaving(true);
    try {
      await apiChangePassword({ currentPassword, newPassword });
      setPasswordSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      if (err.fieldErrors) {
        setPasswordFieldErrors(err.fieldErrors);
      }
      setPasswordError(err.message || 'Could not change password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    setSigningOut(true);
    navigate('/', { replace: true });
    await logout();
  };

  // Handle Delete Account
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setDeleteError('Please type "DELETE" exactly to confirm.');
      return;
    }

    setDeleting(true);
    setDeleteError('');
    try {
      navigate('/', { replace: true });
      await deleteAccount();
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete account. Please try again.');
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Top Breadcrumb & Actions */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <nav aria-label="Breadcrumb" className="mb-1 text-sm text-ink/70">
            <Link to="/dashboard" className="hover:underline">
              Dashboard
            </Link>{' '}
            / <span className="font-medium text-ink">My Profile</span>
          </nav>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Account & Profile
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={handleLogout}
            loading={signingOut}
            loadingText="Signing out…"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Log out
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Avatar & Summary */}
        <div className="space-y-6 lg:col-span-1">
          <section className="rounded-2xl border border-ink/15 bg-ink/5 p-6 text-center">
            <div className="relative mx-auto mb-4 inline-block">
              <UserAvatar
                user={{ ...user, avatar: avatarPreview }}
                size="xl"
                className="ring-4 ring-ink/10"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarSaving}
                title="Change profile picture"
                className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-ink text-on-primary shadow-md transition-transform hover:scale-105 active:scale-95 disabled:opacity-60"
              >
                <Camera className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Change picture</span>
              </button>
            </div>

            <h2 className="text-xl font-bold text-ink">{user?.full_name}</h2>
            <p className="text-sm text-ink/75">{user?.email}</p>
            {user?.bio && (
              <p className="mt-2 text-xs italic text-ink/70">&ldquo;{user.bio}&rdquo;</p>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="mt-5 flex flex-col gap-2">
              <Button
                variant="secondary"
                size="md"
                fullWidth
                onClick={() => fileInputRef.current?.click()}
                loading={avatarSaving}
                loadingText="Updating picture…"
              >
                <Upload className="h-4 w-4" aria-hidden="true" />
                Upload New Photo
              </Button>

              {avatarPreview && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={avatarSaving}
                  className="text-xs font-semibold text-danger hover:underline disabled:opacity-50"
                >
                  Remove Photo
                </button>
              )}
            </div>

            {avatarSuccess && (
              <p className="mt-3 text-xs font-medium text-success">{avatarSuccess}</p>
            )}
            {avatarError && <p className="mt-3 text-xs font-medium text-danger">{avatarError}</p>}

            <div className="mt-6 border-t border-ink/10 pt-4 text-left text-xs text-ink/65">
              <p>
                <strong>Member since:</strong>{' '}
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active user'}
              </p>
            </div>
          </section>

          {/* Quick Links Card */}
          <section className="rounded-2xl border border-ink/15 bg-ink/5 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-ink/70">
              Quick Navigation
            </h3>
            <ul className="mt-3 space-y-2 text-sm font-medium">
              <li>
                <Link
                  to="/dashboard"
                  className="block rounded-lg px-3 py-2 text-ink hover:bg-ink/10"
                >
                  Go to Dashboard
                </Link>
              </li>
              <li>
                <Link to="/services" className="block rounded-lg px-3 py-2 text-ink hover:bg-ink/10">
                  Explore Services
                </Link>
              </li>
              <li>
                <Link
                  to="/services/exams"
                  className="block rounded-lg px-3 py-2 text-ink hover:bg-ink/10"
                >
                  Entrance Exams
                </Link>
              </li>
            </ul>
          </section>
        </div>

        {/* Right Column: Update Info, Password, Danger Zone */}
        <div className="space-y-8 lg:col-span-2">
          {/* Card 1: Personal Information */}
          <section className="rounded-2xl border border-ink/15 bg-surface p-6 sm:p-8 shadow-xs">
            <div className="mb-6 flex items-center gap-3 border-b border-ink/10 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink/10 text-ink">
                <UserIcon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-ink">Personal Information</h2>
                <p className="text-sm text-ink/70">
                  Update your display name, contact email, and student profile.
                </p>
              </div>
            </div>

            {infoSuccess && (
              <Alert variant="success" className="mb-5">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {infoSuccess}
                </span>
              </Alert>
            )}

            {infoError && (
              <Alert variant="error" className="mb-5">
                {infoError}
              </Alert>
            )}

            <form onSubmit={handleUpdateInfo} noValidate className="space-y-4">
              <TextField
                id="profile-fullname"
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                error={fieldErrors.full_name}
                required
              />

              <TextField
                id="profile-email"
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={fieldErrors.email}
                hint="Your email is used for sign-in and notifications."
                required
              />

              <div>
                <label htmlFor="profile-bio" className="mb-1.5 block text-sm font-semibold text-ink">
                  Bio / Educational Goal
                </label>
                <textarea
                  id="profile-bio"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="e.g. Class 12th Student aspiring for JEE Advanced 2027"
                  className="w-full rounded-lg border border-ink/60 bg-surface px-3.5 py-2.5 text-base text-ink placeholder:text-ink/60 transition-colors hover:border-ink focus:border-ink focus:outline-hidden"
                  maxLength={300}
                />
                <p className="mt-1 text-xs text-ink/60">{bio.length}/300 characters</p>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  loading={infoSaving}
                  loadingText="Saving changes…"
                  variant="primary"
                >
                  Save Information
                </Button>
              </div>
            </form>
          </section>

          {/* Card 2: Security & Password */}
          <section className="rounded-2xl border border-ink/15 bg-surface p-6 sm:p-8 shadow-xs">
            <div className="mb-6 flex items-center gap-3 border-b border-ink/10 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink/10 text-ink">
                <KeyRound className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-ink">Change Password</h2>
                <p className="text-sm text-ink/70">
                  Ensure your account is protected with a strong, secure password.
                </p>
              </div>
            </div>

            {passwordSuccess && (
              <Alert variant="success" className="mb-5">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {passwordSuccess}
                </span>
              </Alert>
            )}

            {passwordError && (
              <Alert variant="error" className="mb-5">
                {passwordError}
              </Alert>
            )}

            <form onSubmit={handleUpdatePassword} noValidate className="space-y-4">
              <PasswordField
                id="current-password"
                label="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                error={passwordFieldErrors.current_password}
                autoComplete="current-password"
                required
              />

              <div>
                <PasswordField
                  id="new-password"
                  label="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  error={passwordFieldErrors.new_password}
                  hint="Must contain uppercase, lowercase and a digit (min 8 chars)."
                  autoComplete="new-password"
                  required
                />
                <PasswordStrength password={newPassword} className="mt-2" />
              </div>

              <PasswordField
                id="confirm-password"
                label="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={passwordFieldErrors.confirm_password}
                autoComplete="new-password"
                required
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  loading={passwordSaving}
                  loadingText="Updating password…"
                  variant="primary"
                >
                  Update Password
                </Button>
              </div>
            </form>
          </section>

          {/* Card 3: Danger Zone (Delete Account) */}
          <section className="rounded-2xl border-2 border-danger/40 bg-danger/5 p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-danger/10 text-danger">
                <ShieldAlert className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-danger">Danger Zone</h2>
                <p className="mt-1 text-sm text-ink/80">
                  Permanently delete your EduPath account and all associated profile information.
                  This action is irreversible and cannot be recovered.
                </p>

                <div className="mt-5">
                  <Button
                    variant="danger"
                    onClick={() => {
                      setDeleteConfirmText('');
                      setDeleteError('');
                      setDeleteModalOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Account Deletion Confirmation Modal */}
      {deleteModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-2xl border border-ink/20 bg-surface p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-ink/10">
              <div className="flex items-center gap-2 text-danger">
                <ShieldAlert className="h-5 w-5" aria-hidden="true" />
                <h3 id="delete-dialog-title" className="text-lg font-bold">
                  Delete Account Confirmation
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="rounded-lg p-1 text-ink/60 hover:bg-ink/10"
              >
                <X className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">Close modal</span>
              </button>
            </div>

            <p className="mt-4 text-sm text-ink/85">
              Are you sure you want to permanently delete your account (<strong>{user?.email}</strong>)?
              All your student progress, profile data, and saved preferences will be erased forever.
            </p>

            <div className="mt-4">
              <label htmlFor="confirm-delete-input" className="block text-xs font-semibold uppercase tracking-wider text-ink/75">
                Type <span className="font-bold text-danger">DELETE</span> to confirm:
              </label>
              <input
                id="confirm-delete-input"
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="mt-1.5 w-full rounded-lg border border-ink/60 bg-surface px-3 py-2 text-sm font-semibold tracking-wider text-ink focus:border-danger focus:outline-hidden"
              />
            </div>

            {deleteError && (
              <p className="mt-3 text-xs font-semibold text-danger">{deleteError}</p>
            )}

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-ink/10 pt-4">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setDeleteModalOpen(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={handleDeleteAccount}
                loading={deleting}
                loadingText="Deleting account…"
                disabled={deleteConfirmText !== 'DELETE'}
              >
                Permanently Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
