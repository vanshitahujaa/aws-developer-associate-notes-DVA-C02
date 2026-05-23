import { allTopics, phaseLabels } from "../data";
import type { Topic } from "../data/types";

type View =
  | { kind: "home" }
  | { kind: "topic"; id: string }
  | { kind: "reference"; section: "keywords" | "confusables" | "limits" | "traps" | "qualifiers" | "exam" };

export function Sidebar({
  view,
  setView,
  search,
  setSearch,
}: {
  view: View;
  setView: (v: View) => void;
  search: string;
  setSearch: (s: string) => void;
}) {
  const grouped: Record<number, Topic[]> = {};
  allTopics.forEach((t) => {
    if (!grouped[t.phase]) grouped[t.phase] = [];
    grouped[t.phase].push(t);
  });

  const filtered = (topics: Topic[]) => {
    if (!search) return topics;
    const s = search.toLowerCase();
    return topics.filter(
      (t) =>
        t.title.toLowerCase().includes(s) ||
        t.blurb.toLowerCase().includes(s) ||
        t.id.toLowerCase().includes(s)
    );
  };

  const isActiveTopic = (id: string) => view.kind === "topic" && view.id === id;
  const isActiveRef = (s: string) =>
    view.kind === "reference" && view.section === s;

  return (
    <aside
      className="w-72 shrink-0 h-screen sticky top-0 overflow-y-auto p-4 border-r"
      style={{ borderColor: "var(--border)", background: "var(--bg-elev)" }}
    >
      <button
        onClick={() => setView({ kind: "home" })}
        className="text-left w-full group block mb-5"
      >
        <div className="text-[10px] font-semibold tracking-[0.18em] uppercase" style={{ color: "var(--accent)" }}>
          AWS Developer · Associate
        </div>
        <div className="text-base font-semibold mt-1" style={{ color: "var(--text-strong)" }}>
          DVA-C02 Notes
        </div>
        <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          Topic-by-topic · with case studies
        </div>
      </button>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search topics…"
        className="w-full px-3 py-2 text-sm rounded-md mb-4"
        style={{
          background: "var(--panel)",
          border: "1px solid var(--border)",
          color: "var(--text-strong)",
        }}
      />

      <nav className="space-y-5 pb-8">
        <div>
          <div className="px-1 text-[10px] uppercase tracking-[0.16em] mb-1.5" style={{ color: "var(--text-muted)" }}>
            Quick Reference
          </div>
          <div className="space-y-0.5">
            {[
              { key: "exam", label: "Exam Overview" },
              { key: "keywords", label: "Keyword → Service Map" },
              { key: "confusables", label: "Confusable Pairs" },
              { key: "limits", label: "Numbers & Limits" },
              { key: "traps", label: "Distractor Traps" },
              { key: "qualifiers", label: "MOST/LEAST Qualifiers" },
            ].map((r) => (
              <button
                key={r.key}
                onClick={() => setView({ kind: "reference", section: r.key as any })}
                className={`nav-item ${isActiveRef(r.key) ? "nav-active" : ""}`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {Object.keys(grouped)
          .map(Number)
          .sort((a, b) => a - b)
          .map((phase) => {
            const list = filtered(grouped[phase]);
            if (list.length === 0) return null;
            return (
              <div key={phase}>
                <div className="px-1 text-[10px] uppercase tracking-[0.16em] mb-1.5" style={{ color: "var(--text-muted)" }}>
                  {phaseLabels[phase]}
                </div>
                <div className="space-y-0.5">
                  {list.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setView({ kind: "topic", id: t.id })}
                      className={`nav-item ${isActiveTopic(t.id) ? "nav-active" : ""}`}
                    >
                      <span className="mr-2 text-[11px] font-mono" style={{ color: "var(--text-muted)" }}>
                        {String(t.number).padStart(2, "0")}
                      </span>
                      {t.title.split(" — ")[0]}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
      </nav>
    </aside>
  );
}

export type { View };
