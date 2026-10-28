import { ButtonLink } from '../components/ui/Button.jsx';

export default function NotFound() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-20 text-center sm:py-28">
      <p className="text-sm font-semibold uppercase tracking-widest text-ink/70">Error 404</p>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-4 text-lg text-ink/85">The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.</p>
      <div className="mt-8">
        <ButtonLink to="/">Back to Home</ButtonLink>
      </div>
    </section>
  );
}
