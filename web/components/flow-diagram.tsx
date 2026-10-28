import type { Step } from "@/content/pipeline";

/** Diagram alur di pita biru tua: kotak dan panah muncul berurutan (reveal motion.dev, components/reveal.tsx). */
export function FlowDiagram({ flow }: { flow: Step["flow"] }) {
  const last = flow.length - 1;
  return (
    <ol data-reveal aria-label="Diagram alur" className="grid lg:grid-flow-col lg:auto-cols-fr">
      {flow.map(([name, note], i) => (
        <li key={name} className="flex min-w-0 flex-col lg:flex-row lg:items-stretch">
          {i > 0 && (
            <svg data-reveal-item aria-hidden viewBox="0 0 40 24" className="mx-auto h-8 w-6 shrink-0 rotate-90 self-center text-gold lg:h-6 lg:w-10 lg:rotate-0">
              <path d="M2 12 H34 M27 5 L35 12 L27 19" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          <div data-reveal-item className={`min-w-0 flex-1 rounded-xl p-4 ${i === last ? "bg-gold text-gold-foreground" : "bg-foreground text-primary-foreground"}`}>
            <p className="font-semibold">{name}</p>
            <p className="mt-1 text-sm">{note}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
