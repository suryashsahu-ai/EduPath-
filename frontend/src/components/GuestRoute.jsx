import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { FullPageSpinner } from './ProtectedRoute.jsx';

/** Sends already-signed-in users away from the login/register pages. */
export default function GuestRoute() {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <FullPageSpinner />;
  if (user) return <Navigate to={location.state?.from?.pathname ?? '/dashboard'} replace />;
  return <Outlet />;
}
