import { ICONS } from "@/components/icons";
import type { Step } from "@/content/pipeline";

/** Diagram alur di pita biru tua: kotak berikon dan panah muncul berurutan (reveal motion.dev, components/reveal.tsx). */
export function FlowDiagram({ flow }: { flow: Step["flow"] }) {
  const last = flow.length - 1;
  return (
    <ol data-reveal aria-label="Diagram alur" className="grid lg:grid-flow-col lg:auto-cols-fr">
      {flow.map(([name, note, icon], i) => {
        const Icon = ICONS[icon];
        const end = i === last;
        return (
          <li key={name} className="flex min-w-0 flex-col lg:flex-row lg:items-stretch">
            {i > 0 && (
              <svg data-reveal-item aria-hidden viewBox="0 0 40 24" className="mx-auto h-8 w-6 shrink-0 rotate-90 self-center text-gold lg:h-6 lg:w-10 lg:rotate-0">
                <path d="M2 12 H34 M27 5 L35 12 L27 19" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            <div
              data-reveal-item
              className={`flex min-w-0 flex-1 items-start gap-3 rounded-xl p-4 lg:flex-col ${end ? "bg-gold text-gold-foreground" : "bg-foreground text-primary-foreground"}`}
            >
              <span className={`grid size-11 shrink-0 place-items-center rounded-full ${end ? "bg-gold-foreground text-gold" : "bg-primary text-gold"}`}>
                <Icon aria-hidden className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block font-semibold">{name}</span>
                <span className="mt-1 block text-sm">{note}</span>
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
