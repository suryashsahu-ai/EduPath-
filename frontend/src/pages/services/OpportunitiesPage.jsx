import { Briefcase, Hammer } from 'lucide-react';
import { ButtonLink } from '../../components/ui/Button.jsx';

export default function OpportunitiesPage() {
  return (
    <main>
      <section className="mx-auto max-w-2xl px-4 py-20 text-center sm:py-28">
        <div
          className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl
                      border-2 border-ink bg-ink text-on-primary"
          aria-hidden="true"
        >
          <Briefcase className="h-8 w-8" strokeWidth={1.75} />
        </div>

        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Internships &amp; Job Opportunities
        </h1>

        <div
          className="mx-auto my-6 flex items-center justify-center gap-3 text-ink/60"
          aria-hidden="true"
        >
          <div className="h-px w-12 bg-ink/20" />
          <Hammer className="h-5 w-5" />
          <div className="h-px w-12 bg-ink/20" />
        </div>

        <p className="text-lg leading-relaxed text-ink/75">
          Coming Soon — curated internship programmes and entry-level openings are on their way. We&apos;ll
          help you discover real-world experience aligned with your field of study.
        </p>

        <div className="mt-10">
          <ButtonLink to="/services" variant="secondary">
            ← Back to Services
          </ButtonLink>
        </div>
      </section>
    </main>
  );
}
