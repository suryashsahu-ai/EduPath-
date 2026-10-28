/** Shared card shell for the login and registration pages. */
export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-12 sm:py-16">
      <div className="rounded-2xl border border-ink/20 bg-ink/5 p-6 sm:p-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-ink/85">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
      {footer && <p className="mt-6 text-center text-sm">{footer}</p>}
    </div>
  );
}
