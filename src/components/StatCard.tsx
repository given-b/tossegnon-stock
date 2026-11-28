import CountUp from "./CountUp";

export default function StatCard({
  label, value, icon, tint,
}: {
  label: string;
  value: number;
  icon: string;
  tint: string;
}) {
  return (
    <div className="bg-white p-4">
      <div className={`mb-3 grid h-11 w-11 place-items-center rounded-2xl text-white shadow-md ${tint}`}>
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d={icon} />
        </svg>
      </div>
      <p className="text-xs uppercase tracking-wide text-stone-500">{label}</p>
      <p className="text-3xl font-semibold">
        <CountUp value={value} />
      </p>
    </div>
  );
}
