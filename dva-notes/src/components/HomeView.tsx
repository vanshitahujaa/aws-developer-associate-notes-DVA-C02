import { allTopics, phaseLabels } from "../data";
import { domains, examMeta } from "../data/examInfo";
import type { View } from "./Sidebar";

export function HomeView({ setView }: { setView: (v: View) => void }) {
  const byPhase: Record<number, typeof allTopics> = {};
  allTopics.forEach((t) => {
    if (!byPhase[t.phase]) byPhase[t.phase] = [];
    byPhase[t.phase].push(t);
  });

  return (
    <div className="mx-auto pb-24 fade-up" style={{ maxWidth: "860px" }}>
      <header className="mb-7">
        <div
          className="text-[10px] font-semibold tracking-[0.18em] uppercase"
          style={{ color: "var(--accent)" }}
        >
          AWS Certified Developer · Associate
        </div>
        <h1 className="title mt-1.5">DVA-C02 Complete Notes</h1>
        <p
          className="mt-3 text-[16px] leading-relaxed max-w-[68ch]"
          style={{ color: "var(--text)" }}
        >
          Topic by topic, from the four exam domains down to the smallest
          distractor traps. Every page has: concept → how the question is
          phrased → most-likely root cause → case studies → interactive practice
          → gotchas recap.
        </p>
      </header>

      <section className="panel p-5 md:p-6">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {Object.entries(examMeta).map(([k, v]) => (
            <div key={k} className="panel-2 px-3 py-2.5">
              <div
                className="text-[10px] uppercase tracking-[0.16em]"
                style={{ color: "var(--text-muted)" }}
              >
                {k}
              </div>
              <div
                className="mt-0.5 text-sm font-medium"
                style={{ color: "var(--text-strong)" }}
              >
                {v}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-3 mt-5">
        {domains.map((d) => (
          <div key={d.name} className="panel p-5">
            <div className="flex items-center justify-between">
              <div
                className="font-semibold"
                style={{ color: "var(--text-strong)" }}
              >
                {d.name}
              </div>
              <div className="font-mono text-sm" style={{ color: "var(--accent)" }}>
                {d.weight}%
              </div>
            </div>
            <div
              className="text-xs mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              {d.rough}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {d.services.map((s) => (
                <span key={s} className="pill">
                  {s}
                </span>
              ))}
            </div>
            <div
              className="mt-3 h-1 w-full rounded-full overflow-hidden"
              style={{ background: "#1d212a" }}
            >
              <div
                className="h-full"
                style={{
                  width: `${d.weight}%`,
                  background:
                    "linear-gradient(90deg, var(--accent), rgba(255,164,27,0.5))",
                }}
              />
            </div>
          </div>
        ))}
      </section>

      <h2 className="title mt-10 mb-3" style={{ fontSize: "1.4rem" }}>
        Study Sequence
      </h2>
      <section className="grid md:grid-cols-2 gap-3">
        {Object.keys(byPhase)
          .map(Number)
          .sort((a, b) => a - b)
          .map((p) => (
            <div key={p} className="panel p-5">
              <div
                className="text-[10px] uppercase tracking-[0.16em] mb-2"
                style={{ color: "var(--text-muted)" }}
              >
                {phaseLabels[p]}
              </div>
              <div className="space-y-0.5">
                {byPhase[p].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setView({ kind: "topic", id: t.id })}
                    className="block w-full text-left text-[14px] py-1 px-2 rounded-md hover:bg-white/[0.03] transition"
                    style={{ color: "var(--text)" }}
                  >
                    <span
                      className="mr-2 font-mono text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {String(t.number).padStart(2, "0")}
                    </span>
                    {t.title}
                  </button>
                ))}
              </div>
            </div>
          ))}
      </section>

      <section className="panel p-6 mt-10">
        <div
          className="text-[10px] uppercase tracking-[0.18em] font-semibold mb-3"
          style={{ color: "var(--accent)" }}
        >
          Exam Day Strategy
        </div>
        <ul className="bullet-list text-[15px]">
          <li>130 min / 65 q = 2 min each — aim for 90s to leave buffer.</li>
          <li>Pass 1: answer confident questions; flag the rest.</li>
          <li>No penalty for guessing — never leave blank.</li>
          <li>
            Read the LAST sentence + qualifier first, then skim for keywords.
          </li>
          <li>For "Select TWO" verify count before submit.</li>
          <li>
            Target ≥ 80% on TutorialsDojo practice exams before booking.
          </li>
        </ul>
      </section>
    </div>
  );
}
