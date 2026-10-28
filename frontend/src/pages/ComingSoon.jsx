import { Hammer } from 'lucide-react';
import { ButtonLink } from '../components/ui/Button.jsx';

/** Placeholder for pages that are planned but not built yet. */
export default function ComingSoon({ title }) {
  return (
    <section className="mx-auto max-w-2xl px-4 py-20 text-center sm:py-28">
      <Hammer className="mx-auto h-10 w-10" aria-hidden="true" />
      <h1 className="mt-6 font-display text-4xl font-bold tracking-tight">{title}</h1>
      <p className="mt-4 text-lg text-ink/85">
        This section isn&rsquo;t available yet. We&rsquo;re building EduPath in phases, and this page is planned for a
        later one.
      </p>
      <div className="mt-8">
        <ButtonLink to="/">Back to Home</ButtonLink>
      </div>
    </section>
  );
}
