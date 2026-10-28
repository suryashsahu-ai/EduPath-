import { Award, BookMarked, Briefcase, ArrowRight } from 'lucide-react';
import { ButtonLink } from '../components/ui/Button.jsx';

/** Service card data – icons, labels, descriptions, and their sub-routes. */
const SERVICES = [
  {
    id: 'exams',
    Icon: BookMarked,
    title: 'Government & Competitive Exams',
    subtitle: 'After 10th & 12th',
    description:
      'Navigate entrance exams like JEE, NEET, CLAT, NDA, and state-level tests. Get structured guidance on exam patterns, eligibility, important dates, and preparation strategies tailored for 10th and 12th pass students.',
    to: '/services/exams',
    cta: 'Explore Exams',
  },
  {
    id: 'scholarships',
    Icon: Award,
    title: 'Scholarships & Financial Support',
    subtitle: 'Merit & Need-Based Aid',
    description:
      'Discover national and state scholarships, minority grants, and fee-waiver schemes. Understand eligibility criteria, application windows, and required documents so financial barriers never hold you back.',
    to: '/services/scholarships',
    cta: 'Find Scholarships',
  },
  {
    id: 'opportunities',
    Icon: Briefcase,
    title: 'Internships & Job Opportunities',
    subtitle: 'Real-World Experience',
    description:
      'Explore internship programmes and entry-level openings aligned with your field of study. Build your résumé early with curated opportunities from government portals, PSUs, and industry partners.',
    to: '/services/opportunities',
    cta: 'View Opportunities',
  },
];

function ServiceCard({ service }) {
  const { Icon, title, subtitle, description, to, cta } = service;
  return (
    <article
      className="group flex h-full flex-col rounded-2xl border border-ink/15 bg-surface p-7 shadow-sm
                 transition-all duration-300 hover:-translate-y-1 hover:border-ink/30 hover:shadow-md"
      aria-labelledby={`service-title-${service.id}`}
    >
      {/* Icon badge */}
      <div
        className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl border-2 border-ink
                    bg-ink text-on-primary transition-transform duration-300 group-hover:scale-105"
        aria-hidden="true"
      >
        <Icon className="h-7 w-7" strokeWidth={1.75} />
      </div>

      {/* Heading block */}
      <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-ink/55">{subtitle}</p>
      <h2
        id={`service-title-${service.id}`}
        className="font-display text-xl font-bold leading-snug tracking-tight text-ink"
      >
        {title}
      </h2>

      {/* Divider */}
      <div className="my-4 h-px w-12 bg-ink/20 transition-all duration-300 group-hover:w-20" aria-hidden="true" />

      {/* Description */}
      <p className="flex-grow text-sm leading-relaxed text-ink/75">{description}</p>

      {/* CTA */}
      <div className="mt-7">
        <ButtonLink
          to={to}
          size="md"
          className="group/btn w-full justify-center gap-2"
          aria-label={`${cta} — ${title}`}
        >
          {cta}
          <ArrowRight
            className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-0.5"
            aria-hidden="true"
          />
        </ButtonLink>
      </div>
    </article>
  );
}

export default function Services() {
  return (
    <main>
      {/* Page hero */}
      <section className="mx-auto max-w-7xl px-4 pb-6 pt-14 sm:px-6 sm:pt-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-ink/50">What we offer</p>
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Our Services
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-ink/75">
            Everything a student needs — from cracking competitive exams to securing financial aid and landing
            their first opportunity — all in one place.
          </p>
        </div>
      </section>

      {/* Decorative separator */}
      <div className="mx-auto my-8 h-px max-w-xs bg-ink/15" aria-hidden="true" />

      {/* Cards grid */}
      <section
        aria-label="Service categories"
        className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 sm:pb-28 lg:px-8"
      >
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" role="list">
          {SERVICES.map((service) => (
            <li key={service.id} className="flex">
              <ServiceCard service={service} />
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
