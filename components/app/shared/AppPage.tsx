import type { ReactNode } from 'react';

interface AppPageProps {
  children: ReactNode;
  className?: string;
}

interface AppPageHeaderProps {
  action?: ReactNode;
  description: string;
  eyebrow?: string;
  meta?: ReactNode;
  title: string;
}

export function AppPage({ children, className = '' }: AppPageProps) {
  return <div className={`app-page ${className}`}>{children}</div>;
}

export function AppPageHeader({
  action,
  description,
  eyebrow = 'Workspace',
  meta,
  title,
}: AppPageHeaderProps) {
  return (
    <section className="surface-panel page-hero">
      <div className="min-w-0">
        <p className="page-kicker">{eyebrow}</p>
        <h1 className="page-title">{title}</h1>
        <p className="page-description">{description}</p>
        {meta ? <div className="mt-4 flex flex-wrap gap-2">{meta}</div> : null}
      </div>

      {action ? <div className="page-actions">{action}</div> : null}
    </section>
  );
}

export function AppPanel({ children, className = '' }: AppPageProps) {
  return <section className={`surface-panel ${className}`}>{children}</section>;
}
