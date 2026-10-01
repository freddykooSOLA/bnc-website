export default function SampleTile({ label }: { label: string }) {
  return (
    <div className="aspect-square rounded-xl bg-gradient-to-br from-primary to-primary-700 text-white flex items-center justify-center p-6">
      <div className="text-center">
        <p className="text-xs tracking-[0.2em] uppercase text-orange">Sample</p>
        <p className="font-heading font-bold text-lg mt-2">{label}</p>
      </div>
    </div>
  );
}
