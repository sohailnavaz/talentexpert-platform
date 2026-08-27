export function Meteors({ count = 16 }: { count?: number }) {
  const meteors = Array.from({ length: count });
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {meteors.map((_, i) => {
        const left = Math.floor(Math.random() * 100);
        const delay = (Math.random() * 6).toFixed(2);
        const duration = (4 + Math.random() * 4).toFixed(2);
        return (
          <span
            key={i}
            className="absolute top-0 h-0.5 w-0.5 animate-meteor rounded-full bg-white shadow-[0_0_0_1px_#ffffff10] before:absolute before:top-1/2 before:h-px before:w-12 before:-translate-y-1/2 before:bg-gradient-to-r before:from-white before:to-transparent"
            style={{
              left: `${left}%`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
          />
        );
      })}
    </div>
  );
}
