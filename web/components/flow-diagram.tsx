import type { Step } from "@/content/pipeline";

/** Diagram alur satu langkah: kotak muncul berurutan, panah tergambar di antaranya (CSS di globals.css). */
export function FlowDiagram({ flow }: { flow: Step["flow"] }) {
  return (
    <ol data-reveal className="grid gap-0 lg:grid-flow-col lg:auto-cols-fr lg:items-stretch" aria-label="Diagram alur">
      {flow.map(([name, note], i) => (
        <li key={name} className="flex min-w-0 flex-col items-stretch lg:flex-row lg:items-center">
          {i > 0 && (
            <svg aria-hidden viewBox="0 0 40 24" className="mx-auto h-8 w-6 rotate-90 text-secondary lg:h-6 lg:w-10 lg:shrink-0 lg:rotate-0">
              <path className="flow-edge" pathLength={1} d="M2 12 H34 M27 5 L35 12 L27 19" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ "--i": i } as React.CSSProperties} />
            </svg>
          )}
          <div
            className={`flow-node min-w-0 flex-1 rounded-xl border p-4 ${i === flow.length - 1 ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"}`}
            style={{ "--i": i } as React.CSSProperties}
          >
            <p className="font-semibold">{name}</p>
            <p className={`mt-1 text-sm ${i === flow.length - 1 ? "text-primary-foreground" : "text-muted-foreground"}`}>{note}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
