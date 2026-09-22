interface SectionHeaderProps {
  title: string;
  description: string;
}

export default function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <div className="mb-12">
      <h2 className="font-signage font-bold text-4xl text-[var(--ink)] mb-2">{title}</h2>
      <p className="text-[var(--ink-light)] text-lg">{description}</p>
    </div>
  );
}
