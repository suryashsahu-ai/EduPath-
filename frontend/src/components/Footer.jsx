import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import { NAV_LINKS } from './navigation.js';

const linkClass = 'rounded-sm text-on-primary/80 transition-colors hover:text-on-primary hover:underline';

export default function Footer() {
  return (
    <footer className="bg-footer text-on-primary">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <Logo />
            <p className="mt-4 max-w-md text-sm leading-relaxed text-on-primary/80">
              EduPath is a college discovery and career guidance platform, built to help students find the right
              college and courses and grow into industry-ready professionals.
            </p>
          </div>

          <nav aria-label="Footer quick links">
            <h2 className="text-sm font-semibold uppercase tracking-wider">Quick links</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Footer account links">
            <h2 className="text-sm font-semibold uppercase tracking-wider">Account</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link to="/login" className={linkClass}>
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className={linkClass}>
                  Register
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <p className="mt-10 border-t border-on-primary/15 pt-6 text-sm text-on-primary/70">
          &copy; {new Date().getFullYear()} EduPath. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
