export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="border-b border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
}
