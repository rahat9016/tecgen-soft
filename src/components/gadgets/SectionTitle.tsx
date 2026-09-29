export default function SectionTitle({ title, highlight }: { title: string; highlight: string }) {
  return (
    <h2 className="text-2xl font-bold text-neutral-900 md:text-[28px]">
      {title} <span className="text-orange-500">{highlight}</span>
    </h2>
  );
}
