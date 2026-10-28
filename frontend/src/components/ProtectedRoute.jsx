import { LoaderCircle } from 'lucide-react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function FullPageSpinner() {
  return (
    <div role="status" className="flex min-h-[50vh] items-center justify-center gap-3 text-ink">
      <LoaderCircle className="h-6 w-6 animate-spin" aria-hidden="true" />
      <span>Loading&hellip;</span>
    </div>
  );
}

/**
 * Keeps signed-out visitors away from private pages.
 * This is a convenience only - the backend independently rejects unauthenticated API calls.
 */
export default function ProtectedRoute() {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}
