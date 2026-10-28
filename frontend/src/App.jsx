import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import GuestRoute from './components/GuestRoute.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Profile from './pages/Profile.jsx';
import ComingSoon from './pages/ComingSoon.jsx';
import NotFound from './pages/NotFound.jsx';
import Services from './pages/Services.jsx';
import ExamsPage from './pages/services/ExamsPage.jsx';
import ScholarshipsPage from './pages/services/ScholarshipsPage.jsx';
import OpportunitiesPage from './pages/services/OpportunitiesPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />

        {/* Placeholder routes - real pages arrive in later phases. */}
        <Route path="explore-colleges" element={<ComingSoon title="Explore Colleges" />} />
        <Route path="courses" element={<ComingSoon title="Courses" />} />
        <Route path="career-guidance" element={<ComingSoon title="Career Guidance" />} />
        <Route path="about" element={<ComingSoon title="About Us" />} />

        {/* Services and sub-routes */}
        <Route path="services" element={<Services />} />
        <Route path="services/exams" element={<ExamsPage />} />
        <Route path="services/scholarships" element={<ScholarshipsPage />} />
        <Route path="services/opportunities" element={<OpportunitiesPage />} />

        <Route element={<GuestRoute />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

