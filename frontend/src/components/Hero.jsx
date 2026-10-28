import { BookOpen, Briefcase, Compass, GraduationCap, MapPin, Wallet } from 'lucide-react';
import { ButtonLink } from './ui/Button.jsx';

// Purely decorative: shows the kinds of things EduPath is being built to help students
// weigh. It contains no college data and makes no claims about available features.
const FACTORS = [
  { Icon: BookOpen, label: 'Course & specialization' },
  { Icon: Wallet, label: 'Budget & fees' },
  { Icon: MapPin, label: 'Location' },
  { Icon: Briefcase, label: 'Career readiness' },
];

function PathwayIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-md" aria-hidden="true">
      <div className="absolute -left-6 -top-6 h-32 w-32 rounded-full border-2 border-ink/15" />
      <div className="absolute -bottom-6 -right-4 h-24 w-24 rounded-2xl border-2 border-ink/15" />

      <div className="relative rounded-3xl border border-ink/20 bg-ink/5 p-5 sm:p-7">
        <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-ink/70">Your path, step by step</p>

        <ol className="relative space-y-3">
          <span className="absolute bottom-6 left-[1.4rem] top-6 w-px bg-ink/25" />
          {FACTORS.map(({ Icon, label }, index) => (
            <li key={label} className="relative flex items-center gap-4 rounded-xl border border-ink/20 bg-surface px-4 py-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-surface">
                <Icon className="h-4 w-4" />
              </span>
              <span className="font-medium">{label}</span>
              <span className="ml-auto text-sm font-semibold text-ink/70">0{index + 1}</span>
            </li>
          ))}
        </ol>

        <div className="mt-4 flex items-center gap-4 rounded-xl bg-ink px-4 py-4 text-on-primary">
          <GraduationCap className="h-7 w-7 shrink-0" />
          <div>
            <p className="font-display text-lg font-bold leading-tight">The right future</p>
            <p className="text-sm text-on-primary/80">Starts with the right choice.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-12">
        <div>
          <h1
            id="hero-heading"
            className="font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl"
          >
            <span className="block">Find the Right College.</span>
            <span className="block">Build the Right Future.</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/90">
            Discover colleges and courses that match your academic profile, budget, location, and career goals. Take
            the next step toward an industry-ready future with EduPath.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink to="/explore-colleges" size="lg">
              Find My College
            </ButtonLink>
            <ButtonLink to="/courses" variant="secondary" size="lg">
              Explore Courses
            </ButtonLink>
          </div>

          <p className="mt-8 flex items-center gap-2 text-sm font-medium text-ink/80">
            <Compass className="h-4 w-4" aria-hidden="true" />
            Your journey to the right education starts here.
          </p>
        </div>

        <PathwayIllustration />
      </div>
    </section>
  );
}
