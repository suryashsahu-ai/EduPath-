import Hero from '../components/Hero.jsx';
import { Award, BookMarked, Briefcase, ArrowRight } from 'lucide-react';
import { ButtonLink } from '../components/ui/Button.jsx';

/** Same service data as /services — displayed as a home-page preview section. */
const SERVICES = [
  {
    id: 'exams',
    Icon: BookMarked,
    title: 'Government & Competitive Exams',
    subtitle: 'After 10th & 12th',
    description:
      'Structured guidance on JEE, NEET, CLAT, NDA, and state-level tests — exam patterns, eligibility, key dates, and prep strategies.',
    to: '/services/exams',
    cta: 'Explore Exams',
  },
  {
    id: 'scholarships',
    Icon: Award,
    title: 'Scholarships & Financial Support',
    subtitle: 'Merit & Need-Based Aid',
    description:
      'Discover national and state scholarships, minority grants, and fee-waiver schemes so financial barriers never hold you back.',
    to: '/services/scholarships',
    cta: 'Find Scholarships',
  },
  {
    id: 'opportunities',
    Icon: Briefcase,
    title: 'Internships & Job Opportunities',
    subtitle: 'Real-World Experience',
    description:
      'Curated internship programmes and entry-level openings aligned with your field of study — build your résumé early.',
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
      aria-labelledby={`home-service-title-${service.id}`}
    >
      {/* Icon badge */}
      <div
        className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl border-2 border-ink
                    bg-ink text-on-primary transition-transform duration-300 group-hover:scale-105"
        aria-hidden="true"
      >
        <Icon className="h-7 w-7" strokeWidth={1.75} />
      </div>

      <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-ink/55">{subtitle}</p>
      <h3
        id={`home-service-title-${service.id}`}
        className="font-display text-xl font-bold leading-snug tracking-tight text-ink"
      >
        {title}
      </h3>

      <div className="my-4 h-px w-12 bg-ink/20 transition-all duration-300 group-hover:w-20" aria-hidden="true" />

      <p className="flex-grow text-sm leading-relaxed text-ink/75">{description}</p>

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

export default function Home() {
  return (
    <>
      {/* Hero section */}
      <Hero />

      {/* Services preview section */}
      <section
        id="services"
        aria-labelledby="home-services-heading"
        className="mx-auto max-w-7xl px-4 pb-20 pt-4 sm:px-6 sm:pb-28 lg:px-8"
      >
        {/* Section header */}
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-ink/50">What we offer</p>
          <h2
            id="home-services-heading"
            className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl"
          >
            Our Services
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink/70">
            Everything a student needs — exams, financial aid, and real-world opportunities — all in one place.
          </p>
        </div>

        {/* Cards */}
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" role="list">
          {SERVICES.map((service) => (
            <li key={service.id} className="flex">
              <ServiceCard service={service} />
            </li>
          ))}
        </ul>

        {/* Link to full services page */}
        <div className="mt-10 text-center">
          <ButtonLink to="/services" variant="secondary" size="md">
            View All Services →
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
