import { Link } from 'react-router-dom';

/** Simple text-based wordmark. Links to the homepage. */
export default function Logo({ className = '', onClick }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      aria-label="EduPath home"
      className={`inline-flex items-baseline rounded-md font-display text-2xl tracking-tight ${className}`}
    >
      <span className="font-bold">Edu</span>
      <span className="font-normal">Path</span>
      <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
    </Link>
  );
}
